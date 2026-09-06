"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { LIMITS } from "@/config/site";

const S = {
  en: {
    record: "Record a voice note",
    stop: "Stop",
    play: "Play",
    pause: "Pause",
    delete: "Delete",
    denied: "Microphone blocked — you can still send text.",
    seconds: "s",
  },
  es: {
    record: "Grabar una nota de voz",
    stop: "Parar",
    play: "Escuchar",
    pause: "Pausar",
    delete: "Borrar",
    denied: "Micrófono bloqueado. Puedes enviar texto igualmente.",
    seconds: "s",
  },
};

export function VoiceRecorder({
  locale,
  value,
  onChange,
  maxSeconds = LIMITS.voiceNoteMaxSeconds,
  tone = "dark",
}: {
  locale: "en" | "es";
  value: Blob | null;
  /** `seconds` is the recorded length, handy for showing a duration without decoding. */
  onChange: (b: Blob | null, seconds?: number) => void;
  maxSeconds?: number;
  /** dark = on the reaction sheet; light = inside the editor. */
  tone?: "dark" | "light";
}) {
  const t = S[locale] ?? S.en;
  const light = tone === "light";
  const elapsed = useRef(0);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [denied, setDenied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number>(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const supported =
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      audio.current?.pause();
    },
    [],
  );

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        // Strip ";codecs=opus": storage buckets and extension lookups want the bare type.
        onChange(
          new Blob(chunks.current, { type: (rec.mimeType || "audio/webm").split(";")[0] }),
          elapsed.current,
        );
        setRecording(false);
        window.clearInterval(timer.current);
      };
      rec.start(250);
      recorder.current = rec;
      setRecording(true);
      setSeconds(0);
      elapsed.current = 0;
      timer.current = window.setInterval(() => {
        setSeconds((s) => {
          elapsed.current = s + 1;
          if (s + 1 >= maxSeconds) rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setDenied(true);
    }
  };

  const stop = () => recorder.current?.state === "recording" && recorder.current.stop();

  const togglePlay = () => {
    if (!value) return;
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      return;
    }
    const a = new Audio(URL.createObjectURL(value));
    a.onended = () => setPlaying(false);
    a.play().catch(() => setPlaying(false));
    audio.current = a;
    setPlaying(true);
  };

  if (!supported) return null;
  if (denied)
    return (
      <p className={light ? "text-xs text-muted-foreground" : "text-xs text-white/50"}>
        {t.denied}
      </p>
    );

  if (value && !recording) {
    return (
      <div
        className={
          light
            ? "flex items-center gap-2 rounded-full bg-ink/5 p-1.5 pr-3"
            : "flex items-center gap-2 rounded-full bg-white/8 p-1.5 pr-3"
        }
      >
        <button
          type="button"
          onClick={togglePlay}
          className={
            light
              ? "grid size-9 place-items-center rounded-full bg-ink text-paper"
              : "grid size-9 place-items-center rounded-full bg-white text-night"
          }
          aria-label={playing ? t.pause : t.play}
        >
          {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
        <span className={light ? "flex-1 text-sm text-ink-soft" : "flex-1 text-sm text-white/80"}>
          {seconds}
          {t.seconds}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className={
            light
              ? "grid size-8 place-items-center rounded-full text-ink-soft hover:text-ink"
              : "grid size-8 place-items-center rounded-full text-white/60 hover:text-white"
          }
          aria-label={t.delete}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      data-testid="voice-record"
      className={
        light
          ? "flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-paper text-sm text-ink hover:border-ink/40"
          : "flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-sm text-white/85"
      }
    >
      {recording ? (
        <>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="size-2.5 rounded-full bg-coral"
          />
          {t.stop} · {seconds}
          {t.seconds} / {maxSeconds}
          {t.seconds}
          <Square className="size-3.5" />
        </>
      ) : (
        <>
          <Mic className="size-4" />
          {t.record}
        </>
      )}
    </button>
  );
}
