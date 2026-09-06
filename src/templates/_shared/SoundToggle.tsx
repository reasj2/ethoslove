"use client";

import { Volume2, VolumeX } from "lucide-react";
import type { GiftLocale } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import type { GiftAudio } from "./hooks/use-gift-audio";
import { giftString } from "./i18n";

export function SoundToggle({ audio, locale, className }: { audio: GiftAudio; locale: GiftLocale; className?: string }) {
  if (!audio.hasMusic || !audio.playing) return null;
  return (
    <button
      type="button"
      onClick={audio.toggleMute}
      aria-label={giftString(locale, audio.muted ? "unmute" : "mute")}
      className={cn(
        "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-40 grid size-10 place-items-center rounded-full bg-black/35 text-white/90 backdrop-blur-md transition-colors hover:bg-black/50",
        className,
      )}
    >
      {audio.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
