"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { GiftLocale, GiftVideo as GiftVideoData } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import { giftString } from "./i18n";

/**
 * The sender's clip. Autoplays muted when scrolled into view (that's the only autoplay
 * browsers allow); one tap turns the sound on. Reduced motion: poster + a play button.
 */
export function GiftVideo({ video, locale, className, rounded = "rounded-2xl" }: { video: GiftVideoData; locale: GiftLocale; className?: string; rounded?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().then(() => setPlaying(true)).catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const toggleSound = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
  };

  return (
    <div className={cn("relative overflow-hidden bg-black", rounded, className)}>
      <video ref={ref} src={video.url} poster={video.poster} muted={muted} loop playsInline preload="metadata" className="block h-full w-full object-cover" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      {!playing ? (
        <button type="button" onClick={toggleSound} className="absolute inset-0 grid place-items-center bg-black/25" aria-label={giftString(locale, "playClip")}>
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-night shadow-lg">
            <Play className="ml-0.5 size-6 fill-current" />
          </span>
        </button>
      ) : (
        <button type="button" onClick={toggleSound} className="absolute right-3 bottom-3 flex h-9 items-center gap-1.5 rounded-full bg-black/55 px-3 text-xs font-medium text-white backdrop-blur" aria-label={giftString(locale, muted ? "tapForSound" : "mute")}>
          {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          {muted ? giftString(locale, "tapForSound") : null}
        </button>
      )}
    </div>
  );
}
