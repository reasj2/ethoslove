"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { GiftLocale, GiftSurprise } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import { useShake } from "./hooks/use-shake";
import { giftString } from "./i18n";

const HOLD_MS = 1100;

export function SurpriseReveal({
  surprise,
  locale,
  tone = "light",
  onReveal,
  className,
}: {
  surprise: GiftSurprise;
  locale: GiftLocale;
  tone?: "light" | "dark";
  onReveal?: () => void;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRaf = useRef(0);
  const reduce = useReducedMotion();
  const dark = tone === "dark";

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal?.();
  };

  const shake = useShake(reveal, { enabled: surprise.reveal === "shake" && !revealed });

  const startHold = (e: PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const startedAt = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / HOLD_MS);
      setHoldProgress(p);
      if (p >= 1) reveal();
      else holdRaf.current = requestAnimationFrame(tick);
    };
    holdRaf.current = requestAnimationFrame(tick);
  };
  const endHold = () => {
    cancelAnimationFrame(holdRaf.current);
    if (!revealed) setHoldProgress(0);
  };
  useEffect(() => () => cancelAnimationFrame(holdRaf.current), []);

  const ringLength = 2 * Math.PI * 26;

  return (
    <div className={cn("text-center", className)}>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="gate" exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }} className="flex flex-col items-center gap-3">
            {surprise.reveal === "hold" ? (
              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerCancel={endHold}
                onPointerLeave={endHold}
                onContextMenu={(e) => e.preventDefault()}
                className="relative grid size-20 touch-none place-items-center rounded-full select-none"
                style={{ background: "rgba(var(--gift-accent-rgb), 0.12)" }}
                aria-label={giftString(locale, "holdToReveal")}
              >
                <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden="true">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(var(--gift-accent-rgb),0.25)" strokeWidth="3" />
                  <circle
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    stroke="var(--gift-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={ringLength}
                    strokeDashoffset={ringLength * (1 - holdProgress)}
                  />
                </svg>
                <motion.span
                  animate={{ scale: holdProgress > 0 ? 1 + holdProgress * 0.25 : [1, 1.08, 1] }}
                  transition={holdProgress > 0 ? { duration: 0 } : { duration: 1.8, repeat: Infinity }}
                  className="text-2xl"
                >
                  🎁
                </motion.span>
              </button>
            ) : surprise.reveal === "shake" && shake.supported ? (
              <motion.button
                type="button"
                onClick={shake.needsPermission ? shake.requestPermission : undefined}
                animate={reduce ? undefined : { rotate: [0, -8, 8, -6, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.4 }}
                className="grid size-20 place-items-center rounded-full text-3xl"
                style={{ background: "rgba(var(--gift-accent-rgb), 0.12)" }}
                aria-label={giftString(locale, "shakeToReveal")}
              >
                📱
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={reveal}
                whileTap={{ scale: 0.92 }}
                animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="grid size-20 place-items-center rounded-full text-3xl"
                style={{ background: "rgba(var(--gift-accent-rgb), 0.12)" }}
                aria-label={giftString(locale, "tapToReveal")}
              >
                🎁
              </motion.button>
            )}
            <p className={cn("text-sm", dark ? "text-white/70" : "text-black/55")}>
              {surprise.reveal === "hold"
                ? giftString(locale, "holdToReveal")
                : surprise.reveal === "shake" && shake.supported
                  ? shake.needsPermission
                    ? giftString(locale, "enableMotion")
                    : giftString(locale, "shakeToReveal")
                  : giftString(locale, "tapToReveal")}
            </p>
            {surprise.reveal === "shake" && shake.supported ? (
              <button type="button" onClick={reveal} className={cn("text-xs underline underline-offset-4", dark ? "text-white/50" : "text-black/40")}>
                {giftString(locale, "orTap")}
              </button>
            ) : null}
          </motion.div>
        ) : (
          <motion.div key="text" className="relative mx-auto max-w-sm">
            {!reduce ? <Burst /> : null}
            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(10px)", letterSpacing: "0.08em" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "0em" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[1.35rem] leading-snug"
              style={{ fontFamily: "var(--gift-font-display)" }}
            >
              {surprise.text}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Burst() {
  const dots = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {dots.map((i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute size-1.5 rounded-full"
            style={{ background: "var(--gift-accent)" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * 90, y: Math.sin(angle) * 60, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}
