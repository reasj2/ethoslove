"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEditor } from "@/lib/editor/store";
import { LIBRARY_TRACKS, TRACK_MOODS, type TrackMood } from "@/lib/editor/music-library";
import { LIMITS } from "@/config/site";
import { cn } from "@/lib/utils";
import { Field, SectionHeader, Segmented } from "../field";
import { Waveform } from "../waveform";

type Mode = "none" | "library" | "upload";

export function MusicSection() {
  const t = useTranslations("editor.music");
  const tS = useTranslations("editor.sections.music");
  const music = useEditor((s) => s.data.music);
  const setLibraryTrack = useEditor((s) => s.setLibraryTrack);
  const setUploadedMusic = useEditor((s) => s.setUploadedMusic);
  const setMusicStart = useEditor((s) => s.setMusicStart);
  const clearMusic = useEditor((s) => s.clearMusic);
  const [mode, setMode] = useState<Mode>(music ? music.source : "none");
  const [mood, setMood] = useState<TrackMood | "all">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const togglePreview = (id: string, url: string, startAt = 0) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const a = new Audio(url);
    a.currentTime = startAt;
    a.volume = 0.9;
    a.onended = () => setPlayingId(null);
    a.play().catch(() => setPlayingId(null));
    audioRef.current = a;
    setPlayingId(id);
  };

  const tracks = LIBRARY_TRACKS.filter((tr) => mood === "all" || tr.mood === mood);

  return (
    <section>
      <SectionHeader n={tS("n")} title={tS("title")} blurb={tS("blurb")} />
      <Segmented
        ariaLabel={tS("title")}
        value={mode}
        onChange={(m) => {
          setMode(m);
          if (m === "none") clearMusic();
        }}
        options={[
          { value: "none", label: t("none") },
          { value: "library", label: t("library") },
          { value: "upload", label: t("upload") },
        ]}
      />

      {mode === "library" ? (
        <div className="mt-5">
          <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {(["all", ...TRACK_MOODS] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMood(m)} className={cn("h-8 shrink-0 rounded-full border px-3 text-xs", mood === m ? "border-ink bg-ink text-paper" : "border-border bg-card")}>
                {m === "all" ? "·" : t(`mood.${m}`)}
              </button>
            ))}
          </div>
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
            {tracks.map((tr) => {
              const selected = music?.source === "library" && music.trackId === tr.id;
              return (
                <li key={tr.id} className={cn("flex items-center gap-3 px-3 py-2.5", selected && "bg-accent/60")}>
                  <button type="button" onClick={() => togglePreview(tr.id, tr.url)} aria-label={playingId === tr.id ? t("previewStop") : t("previewPlay")} className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper">
                    {playingId === tr.id ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                  </button>
                  <button type="button" onClick={() => setLibraryTrack(selected ? null : tr)} className="flex min-w-0 flex-1 flex-col items-start text-left">
                    <span className="text-sm font-medium">{tr.title}</span>
                    <span className="text-xs text-muted-foreground">{tr.note} · {t(`mood.${tr.mood}`)}</span>
                  </button>
                  <span className={cn("size-4 rounded-full border", selected ? "border-coral bg-coral" : "border-border")} aria-hidden="true" />
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{t("licenseNote")}</p>
        </div>
      ) : null}

      {mode === "upload" ? (
        <div className="mt-5">
          {music?.source === "upload" ? (
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <Music2 className="size-4 text-coral" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{music.title}</span>
                <button type="button" onClick={() => togglePreview("upload", music.url, music.startAt)} className="grid size-8 place-items-center rounded-full bg-ink text-paper" aria-label={t("previewPlay")}>
                  {playingId === "upload" ? <Pause className="size-3.5" /> : <Play className="ml-0.5 size-3.5" />}
                </button>
                <button type="button" onClick={clearMusic} className="grid size-8 place-items-center rounded-full hover:bg-ink/5" aria-label={t("none")}>
                  <X className="size-4" />
                </button>
              </div>
              <Field label={`${t("startAt")} · ${formatTime(music.startAt ?? 0)}`} className="mt-3">
                <Waveform url={music.url} startAt={music.startAt ?? 0} duration={180} onSeek={setMusicStart} />
              </Field>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center hover:border-ink/40">
              <Upload className="size-5 text-coral" />
              <span className="mt-3 text-sm font-medium">{t("upload")}</span>
              <span className="mt-1 text-xs text-muted-foreground">{t("uploadHint", { mb: Math.round(LIMITS.audioMaxBytes / 1024 / 1024) })}</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav,.mp3,.m4a"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size <= LIMITS.audioMaxBytes) void setUploadedMusic(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : null}

      {mode === "library" && music?.source === "library" ? (
        <Field label={`${t("startAt")} · ${formatTime(music.startAt ?? 0)}`} className="mt-4">
          <Waveform url={music.url} startAt={music.startAt ?? 0} duration={48} onSeek={setMusicStart} />
        </Field>
      ) : null}
    </section>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}
