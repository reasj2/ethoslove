"use client";

import type { GiftData } from "@/lib/gift/schema";
import { isLocalRef } from "@/lib/gift/assets";
import type { EditorDraft } from "./types";

const KEY_PREFIX = "ethos:draft:";

export function draftKey(slug: string): string {
  return `${KEY_PREFIX}${slug}`;
}

/** Replace object URLs with idb refs so the draft survives reloads. */
export function serializeForLocal(draft: EditorDraft, assetRefs: Record<string, string | undefined>, byUrl: Record<string, string | undefined> = {}): string {
  const data: GiftData = {
    ...draft.data,
    photos: draft.data.photos.map((p) => ({ ...p, url: assetRefs[p.id] ?? p.url })),
    music:
      draft.data.music && draft.data.music.source === "upload"
        ? { ...draft.data.music, url: assetRefs[draft.data.music.trackId ?? ""] ?? draft.data.music.url }
        : draft.data.music,
    video: draft.data.video
      ? { url: byUrl[draft.data.video.url] ?? draft.data.video.url, poster: draft.data.video.poster ? (byUrl[draft.data.video.poster] ?? draft.data.video.poster) : undefined }
      : undefined,
  };
  return JSON.stringify({ ...draft, data });
}

export function readLocalDraft(slug: string): EditorDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EditorDraft;
    if (parsed.version !== 1 || parsed.slug !== slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalDraft(slug: string, serialized: string): void {
  try {
    localStorage.setItem(draftKey(slug), serialized);
  } catch {
    /* quota exceeded or private mode — the DB draft is the fallback when logged in */
  }
}

export function clearLocalDraft(slug: string): void {
  try {
    localStorage.removeItem(draftKey(slug));
  } catch {
    /* ignore */
  }
}

/** Ids of every local asset a draft references (for IndexedDB rehydration / pruning). */
export function localAssetIds(data: GiftData): string[] {
  const ids: string[] = [];
  for (const p of data.photos) if (isLocalRef(p.url)) ids.push(p.id);
  if (data.music?.source === "upload" && data.music.trackId && isLocalRef(data.music.url)) ids.push(data.music.trackId);
  if (data.video?.url.startsWith("idb:")) ids.push(data.video.url.slice(4));
  if (data.video?.poster?.startsWith("idb:")) ids.push(data.video.poster.slice(4));
  return ids;
}
