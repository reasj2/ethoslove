"use client";

import { AnimatePresence, motion } from "motion/react";
import type { GiftCountdown, GiftLocale } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import { useCountdown } from "./hooks/use-countdown";
import { giftString } from "./i18n";

export function Countdown({
  countdown,
  locale,
  tone = "light",
  className,
}: {
  countdown: GiftCountdown;
  locale: GiftLocale;
  tone?: "light" | "dark";
  className?: string;
}) {
  const parts = useCountdown(countdown.targetAt);
  const tiles: [number, string][] = [
    [parts.days, giftString(locale, "days")],
    [parts.hours, giftString(locale, "hours")],
    [parts.minutes, giftString(locale, "minutes")],
    [parts.seconds, giftString(locale, "seconds")],
  ];
  const dark = tone === "dark";

  return (
    <div className={cn("text-center", className)}>
      <p className={cn("text-[11px] font-medium tracking-[0.2em] uppercase", dark ? "text-white/60" : "text-black/50")}>
        {countdown.label ?? giftString(locale, "countdownTo")}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        {tiles.map(([value, label]) => (
          <div
            key={label}
            className={cn(
              "flex w-[4.2rem] flex-col items-center rounded-xl px-2 py-2.5",
              dark ? "bg-white/8 text-white" : "bg-black/[0.05] text-current",
            )}
          >
            <div className="relative h-8 overflow-hidden text-[1.65rem] leading-8 font-semibold tabular-nums" style={{ fontFamily: "var(--gift-font-display)" }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={value}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className="block"
                >
                  {String(value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className={cn("mt-1 text-[10px] tracking-wider uppercase", dark ? "text-white/55" : "text-black/45")}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
