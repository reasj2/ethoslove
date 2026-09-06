"use client";

import { motion } from "motion/react";
import type { GiftLocale } from "@/lib/gift/schema";
import { LogoMark } from "@/components/shared/logo";
import { giftString } from "./i18n";

export function LoadingScreen({
  recipientName,
  progress,
  locale,
}: {
  recipientName?: string;
  progress: number;
  locale: GiftLocale;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[60] flex flex-col items-center justify-center bg-night px-10 text-center text-paper"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="grain-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,rgba(232,96,76,0.16),transparent)]" />
      <motion.div
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <LogoMark className="size-14" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-8 max-w-xs text-[1.45rem] leading-snug italic"
        style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"opsz" 36, "SOFT" 60, "WONK" 1' }}
      >
        {recipientName ? giftString(locale, "loadingFor", { name: recipientName }) : giftString(locale, "loading")}
      </motion.p>
      <div className="mt-10 h-px w-28 overflow-hidden rounded bg-white/15" aria-hidden="true">
        <motion.div
          className="h-full bg-coral"
          initial={{ width: "8%" }}
          animate={{ width: `${Math.max(8, Math.round(progress * 100))}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}
