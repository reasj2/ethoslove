"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { GiftData, GiftLocale, GiftPhoto } from "@/lib/gift/schema";
import type { TemplateManifest } from "@/templates/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { GIFTS_BUCKET, buildStoragePath, extensionForMime, isLocalRef, isStoragePath, storageObjectKey } from "@/lib/gift/assets";
import { ensureDraft, saveDraft, signAssetUrls } from "@/app/actions/gift";
import type { LibraryTrack } from "./music-library";
import type { AssetRecord, EditorDraft, SaveState, ScheduleSettings } from "./types";
import { deleteBlob, getBlob, putBlob } from "./blob-store";
import { processImageFile, transformImage } from "./image";
import { localAssetIds, readLocalDraft, serializeForLocal, writeLocalDraft } from "./persistence";

const LOCAL_DEBOUNCE = 350;
const REMOTE_DEBOUNCE = 1800;

export type EditorState = {
  slug: string;
  manifest: TemplateManifest | null;
  data: GiftData;
  giftId: string | null;
  shortId: string | null;
  status: "draft" | "scheduled" | "live";
  schedule: ScheduleSettings;
  password: string;
  removeWatermark: boolean;
  assets: Record<string, AssetRecord>;
  hydrated: boolean;
  authed: boolean;
  userId: string | null;
  save: SaveState;
  savedAt: number | null;
  dirty: boolean;

  init: (args: { slug: string; manifest: TemplateManifest; initial: GiftData; authed: boolean; userId: string | null; remote?: RemoteGift | null }) => Promise<void>;
  setAuth: (authed: boolean, userId: string | null) => void;
  patch: (p: Partial<GiftData>) => void;
  patchFields: (p: Record<string, unknown>) => void;
  setSchedule: (p: Partial<ScheduleSettings>) => void;
  setPassword: (v: string) => void;
  setRemoveWatermark: (v: boolean) => void;

  addPhotos: (files: File[]) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
  movePhoto: (from: number, to: number) => void;
  updatePhoto: (id: string, p: Partial<GiftPhoto>) => void;
  editPhoto: (id: string, opts: { rotate?: 0 | 90 | 180 | 270; crop?: { x: number; y: number; width: number; height: number } }) => Promise<void>;

  setLibraryTrack: (track: LibraryTrack | null) => void;
  setUploadedMusic: (file: File) => Promise<void>;
  setMusicStart: (seconds: number) => void;
  clearMusic: () => void;

  ensureRemote: () => Promise<string | null>;
  uploadPending: () => Promise<void>;
  syncNow: () => Promise<boolean>;
  serializedForServer: () => GiftData;
  markPublished: (shortId: string, status: "live" | "scheduled") => void;
};

export type RemoteGift = {
  id: string;
  shortId: string;
  status: "draft" | "scheduled" | "live";
  data: GiftData;
  unlockAt: string | null;
  timezone: string | null;
  hasPassword: boolean;
};

let localTimer: number | undefined;
let remoteTimer: number | undefined;

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function assetRefs(state: Pick<EditorState, "assets">): Record<string, string | undefined> {
  const refs: Record<string, string | undefined> = {};
  for (const a of Object.values(state.assets)) refs[a.id] = a.storagePath ?? (a.local ? `idb:${a.id}` : undefined);
  return refs;
}

export const useEditor = create<EditorState>((set, get) => {
  const persistLocal = () => {
    window.clearTimeout(localTimer);
    localTimer = window.setTimeout(() => {
      const s = get();
      if (!s.hydrated) return;
      const draft: EditorDraft = {
        version: 1,
        slug: s.slug,
        data: s.data,
        giftId: s.giftId,
        shortId: s.shortId,
        status: s.status,
        schedule: s.schedule,
        password: s.password,
        removeWatermark: s.removeWatermark,
        updatedAt: Date.now(),
      };
      writeLocalDraft(draftScope(s.slug, s.giftId), serializeForLocal(draft, assetRefs(s)));
      if (!s.authed || !s.giftId) set({ save: s.authed ? "saving" : "offline", savedAt: Date.now() });
    }, LOCAL_DEBOUNCE);
  };

  const persistRemote = () => {
    window.clearTimeout(remoteTimer);
    remoteTimer = window.setTimeout(() => void get().syncNow(), REMOTE_DEBOUNCE);
  };

  const touch = () => {
    set({ dirty: true });
    persistLocal();
    // Signed in: sync to the server. The first sync creates the draft row, which is what
    // lets uploads start — so this must run even before a giftId exists.
    if (get().authed) persistRemote();
  };

  const uploadAsset = async (id: string) => {
    const s = get();
    const asset = s.assets[id];
    const supabase = getSupabaseBrowserClient();
    if (!asset || !s.giftId || !s.authed || !supabase || asset.storagePath || asset.status === "uploading") return;
    const blob = await getBlob(id);
    if (!blob) return;
    set((st) => ({ assets: { ...st.assets, [id]: { ...st.assets[id], status: "uploading", progress: 0.2 } } }));
    const ext = extensionForMime(blob.type);
    const path = buildStoragePath(s.giftId, id, ext);
    const { error } = await supabase.storage
      .from(GIFTS_BUCKET)
      .upload(storageObjectKey(path), blob, { contentType: blob.type, upsert: true, cacheControl: "31536000" });
    if (error) {
      set((st) => ({ assets: { ...st.assets, [id]: { ...st.assets[id], status: "error", error: error.message, progress: 0 } } }));
      return;
    }
    set((st) => ({ assets: { ...st.assets, [id]: { ...st.assets[id], status: "uploaded", storagePath: path, progress: 1 } } }));
    persistLocal();
    persistRemote();
  };

  return {
    slug: "",
    manifest: null,
    data: null as unknown as GiftData,
    giftId: null,
    shortId: null,
    status: "draft",
    schedule: { enabled: false, timezone: "UTC" },
    password: "",
    removeWatermark: false,
    assets: {},
    hydrated: false,
    authed: false,
    userId: null,
    save: "idle",
    savedAt: null,
    dirty: false,

    async init({ slug, manifest, initial, authed, userId, remote }) {
      const timezone = defaultTimezone();
      let data = initial;
      let assets: Record<string, AssetRecord> = {};
      let giftId: string | null = remote?.id ?? null;
      let shortId: string | null = remote?.shortId ?? null;
      let status: EditorState["status"] = remote?.status ?? "draft";
      let schedule: ScheduleSettings = { enabled: false, timezone };
      let password = "";
      let removeWatermark = false;

      const local = readLocalDraft(draftScope(slug, giftId));

      if (remote) {
        // Editing something already in the database: storage paths need signed URLs for preview.
        data = remote.data;
        const paths = [
          ...remote.data.photos.map((p) => p.url).filter(isStoragePath),
          ...(remote.data.music?.source === "upload" && isStoragePath(remote.data.music.url) ? [remote.data.music.url] : []),
        ];
        const signed = paths.length ? await signAssetUrls(paths) : { ok: true as const, data: {} as Record<string, string> };
        const map = signed.ok ? signed.data : {};
        data = {
          ...data,
          photos: data.photos.map((p) => ({ ...p, url: map[p.url] ?? p.url })),
          music: data.music && data.music.source === "upload" ? { ...data.music, url: map[data.music.url] ?? data.music.url } : data.music,
        };
        for (const p of remote.data.photos) {
          if (isStoragePath(p.url)) assets[p.id] = { id: p.id, kind: "photo", local: false, storagePath: p.url, status: "uploaded", progress: 1 };
        }
        if (remote.data.music?.source === "upload" && remote.data.music.trackId && isStoragePath(remote.data.music.url)) {
          assets[remote.data.music.trackId] = { id: remote.data.music.trackId, kind: "audio", local: false, storagePath: remote.data.music.url, status: "uploaded", progress: 1 };
        }
        if (remote.unlockAt) schedule = { enabled: true, unlockAt: remote.unlockAt, timezone: remote.timezone ?? timezone };
        removeWatermark = !remote.data.watermark;
        // A newer local draft for the same gift wins (the user kept editing offline).
        if (local && local.updatedAt > Date.now() - 1000 * 60 * 60 * 24 * 7) {
          const rehydrated = await rehydrate(local, assets);
          data = rehydrated.data;
          assets = rehydrated.assets;
          schedule = local.schedule;
          password = local.password;
          removeWatermark = local.removeWatermark;
        }
      } else if (local) {
        const rehydrated = await rehydrate(local, {});
        data = rehydrated.data;
        assets = rehydrated.assets;
        giftId = local.giftId;
        shortId = local.shortId;
        status = local.status;
        schedule = local.schedule.timezone ? local.schedule : { ...local.schedule, timezone };
        password = local.password;
        removeWatermark = local.removeWatermark;
      }

      set({ slug, manifest, data, assets, giftId, shortId, status, schedule, password, removeWatermark, authed, userId, hydrated: true, save: authed && giftId ? "saved" : local ? "offline" : "idle", dirty: false });
      if (authed && giftId) void get().uploadPending();
    },

    setAuth(authed, userId) {
      set({ authed, userId });
      if (authed && get().giftId) void get().uploadPending();
    },

    patch(p) {
      set((s) => ({ data: { ...s.data, ...p } }));
      touch();
    },
    patchFields(p) {
      set((s) => ({ data: { ...s.data, fields: { ...(s.data.fields as Record<string, unknown>), ...p } } }));
      touch();
    },
    setSchedule(p) {
      set((s) => ({ schedule: { ...s.schedule, ...p } }));
      touch();
    },
    setPassword(v) {
      set({ password: v });
      touch();
    },
    setRemoveWatermark(v) {
      set({ removeWatermark: v });
      touch();
    },

    async addPhotos(files) {
      const { manifest, data } = get();
      const max = manifest?.features.photos.max ?? 20;
      const accepted = files.slice(0, Math.max(0, max - data.photos.length));
      await Promise.all(
        accepted.map(async (file) => {
          const id = nanoid(10);
          set((s) => ({ assets: { ...s.assets, [id]: { id, kind: "photo", local: false, status: "processing", progress: 0 } } }));
          try {
            const { blob, width, height } = await processImageFile(file);
            await putBlob(id, blob);
            const objectUrl = URL.createObjectURL(blob);
            set((s) => ({
              assets: { ...s.assets, [id]: { ...s.assets[id], objectUrl, local: true, status: "local", mime: blob.type, bytes: blob.size } },
              data: { ...s.data, photos: [...s.data.photos, { id, url: objectUrl, width, height, caption: "", alt: file.name.replace(/\.[^.]+$/, "") }] },
            }));
            touch();
            void uploadAsset(id);
          } catch (e) {
            set((s) => ({ assets: { ...s.assets, [id]: { ...s.assets[id], status: "error", error: (e as Error).message } } }));
          }
        }),
      );
    },

    async removePhoto(id) {
      const asset = get().assets[id];
      if (asset?.objectUrl) URL.revokeObjectURL(asset.objectUrl);
      set((s) => {
        const assets = { ...s.assets };
        delete assets[id];
        return { assets, data: { ...s.data, photos: s.data.photos.filter((p) => p.id !== id) } };
      });
      await deleteBlob(id);
      touch();
    },

    movePhoto(from, to) {
      set((s) => {
        const photos = [...s.data.photos];
        const [item] = photos.splice(from, 1);
        photos.splice(to, 0, item);
        return { data: { ...s.data, photos } };
      });
      touch();
    },

    updatePhoto(id, p) {
      set((s) => ({ data: { ...s.data, photos: s.data.photos.map((ph) => (ph.id === id ? { ...ph, ...p } : ph)) } }));
      touch();
    },

    async editPhoto(id, opts) {
      const asset = get().assets[id];
      const blob = asset?.local ? await getBlob(id) : await fetch(get().data.photos.find((p) => p.id === id)!.url).then((r) => r.blob());
      if (!blob) return;
      const { blob: out, width, height } = await transformImage(blob, opts);
      await putBlob(id, out);
      if (asset?.objectUrl) URL.revokeObjectURL(asset.objectUrl);
      const objectUrl = URL.createObjectURL(out);
      set((s) => ({
        assets: { ...s.assets, [id]: { ...s.assets[id], objectUrl, local: true, storagePath: undefined, status: "local", mime: out.type, bytes: out.size } },
        data: { ...s.data, photos: s.data.photos.map((ph) => (ph.id === id ? { ...ph, url: objectUrl, width, height } : ph)) },
      }));
      touch();
      void uploadAsset(id);
    },

    setLibraryTrack(track) {
      get().clearMusic();
      if (track) set((s) => ({ data: { ...s.data, music: { source: "library", url: track.url, trackId: track.id, title: track.title, startAt: 0 } } }));
      touch();
    },

    async setUploadedMusic(file) {
      get().clearMusic();
      const id = nanoid(10);
      const mime = file.type || "audio/mpeg";
      await putBlob(id, file);
      const objectUrl = URL.createObjectURL(file);
      set((s) => ({
        assets: { ...s.assets, [id]: { id, kind: "audio", local: true, objectUrl, mime, bytes: file.size, status: "local", progress: 0 } },
        data: { ...s.data, music: { source: "upload", url: objectUrl, trackId: id, title: file.name.replace(/\.[^.]+$/, ""), startAt: 0 } },
      }));
      touch();
      void uploadAsset(id);
    },

    setMusicStart(seconds) {
      set((s) => (s.data.music ? { data: { ...s.data, music: { ...s.data.music, startAt: Math.max(0, seconds) } } } : {}));
      touch();
    },

    clearMusic() {
      const s = get();
      const id = s.data.music?.source === "upload" ? s.data.music.trackId : undefined;
      if (id) {
        const asset = s.assets[id];
        if (asset?.objectUrl) URL.revokeObjectURL(asset.objectUrl);
        void deleteBlob(id);
      }
      set((st) => {
        const assets = { ...st.assets };
        if (id) delete assets[id];
        return { assets, data: { ...st.data, music: undefined } };
      });
      touch();
    },

    async ensureRemote() {
      const s = get();
      if (!s.authed) return null;
      if (s.giftId) return s.giftId;
      const result = await ensureDraft({ templateSlug: s.slug, locale: s.data.locale as GiftLocale });
      if (!result.ok) {
        set({ save: "error" });
        return null;
      }
      set({ giftId: result.data.giftId, shortId: result.data.shortId });
      persistLocal();
      await get().uploadPending();
      return result.data.giftId;
    },

    async uploadPending() {
      const s = get();
      if (!s.authed || !s.giftId) return;
      const pending = Object.values(s.assets).filter((a) => a.local && !a.storagePath && a.status !== "uploading");
      await Promise.all(pending.map((a) => uploadAsset(a.id)));
    },

    async syncNow() {
      const s = get();
      if (!s.authed || !s.hydrated) return false;
      const giftId = s.giftId ?? (await get().ensureRemote());
      if (!giftId) return false;
      set({ save: "saving" });
      const result = await saveDraft({ giftId, data: get().serializedForServer() });
      set({ save: result.ok ? "saved" : "error", savedAt: Date.now(), dirty: result.ok ? false : get().dirty });
      return result.ok;
    },

    serializedForServer() {
      const s = get();
      if (!s.data) return s.data;
      const refs = assetRefs(s);
      return {
        ...s.data,
        photos: s.data.photos.map((p) => ({ ...p, url: refs[p.id] ?? (isLocalRef(p.url) ? `idb:${p.id}` : p.url) })),
        music:
          s.data.music && s.data.music.source === "upload" && s.data.music.trackId
            ? { ...s.data.music, url: refs[s.data.music.trackId] ?? `idb:${s.data.music.trackId}` }
            : s.data.music,
      };
    },

    markPublished(shortId, status) {
      set({ shortId, status, dirty: false, save: "saved", savedAt: Date.now() });
      persistLocal();
    },
  };
});

export function draftScope(slug: string, giftId: string | null): string {
  return giftId ? `${slug}:${giftId}` : slug;
}

/** Turn a stored draft (idb refs) back into previewable object URLs. Drops photos whose blob is gone. */
async function rehydrate(local: EditorDraft, existing: Record<string, AssetRecord>) {
  const assets: Record<string, AssetRecord> = { ...existing };
  const ids = localAssetIds(local.data);
  const blobs = new Map<string, Blob>();
  await Promise.all(
    ids.map(async (id) => {
      const b = await getBlob(id);
      if (b) blobs.set(id, b);
    }),
  );
  const photos = local.data.photos
    .map((p) => {
      if (isStoragePath(p.url)) {
        assets[p.id] = { id: p.id, kind: "photo", local: false, storagePath: p.url, status: "uploaded", progress: 1 };
        return p;
      }
      const blob = blobs.get(p.id);
      if (!blob) return null;
      const objectUrl = URL.createObjectURL(blob);
      assets[p.id] = { ...(assets[p.id] ?? { id: p.id, kind: "photo", progress: 0 }), id: p.id, kind: "photo", local: true, objectUrl, mime: blob.type, bytes: blob.size, status: assets[p.id]?.storagePath ? "uploaded" : "local" };
      return { ...p, url: objectUrl };
    })
    .filter((p): p is GiftPhoto => p !== null);

  let music = local.data.music;
  if (music?.source === "upload" && music.trackId) {
    if (isStoragePath(music.url)) {
      assets[music.trackId] = { id: music.trackId, kind: "audio", local: false, storagePath: music.url, status: "uploaded", progress: 1 };
    } else {
      const blob = blobs.get(music.trackId);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        assets[music.trackId] = { id: music.trackId, kind: "audio", local: true, objectUrl, mime: blob.type, bytes: blob.size, status: "local", progress: 0 };
        music = { ...music, url: objectUrl };
      } else music = undefined;
    }
  }
  return { data: { ...local.data, photos, music }, assets };
}

/** Preview data: whatever the store has, with a non-empty recipient so templates render. */
export function previewData(data: GiftData, fallbackName: string): GiftData {
  return { ...data, recipientName: data.recipientName || fallbackName, senderName: data.senderName || "—" };
}

/** Signed-URL-free storage paths for photos that are uploaded; used by the publish sheet. */
export function readyForPublish(state: EditorState): boolean {
  return Object.values(state.assets).every((a) => a.status === "uploaded" || (!a.local && Boolean(a.storagePath)));
}
