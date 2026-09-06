"use client";

import { Heart, RotateCcw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { GiftData } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import { giftString } from "./i18n";

export function EndScreen({
  data,
  tone = "dark",
  onReact,
  onMakeOne,
  onReplay,
  className,
}: {
  data: GiftData;
  tone?: "light" | "dark";
  onReact?: () => void;
  onMakeOne?: () => void;
  onReplay?: () => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dark = tone === "dark";
  const { locale } = data;

  return (
    <div className={cn("flex flex-col items-center px-6 text-center", className)}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        className="relative grid size-20 place-items-center rounded-full"
        style={{ background: "rgba(var(--gift-accent-rgb), 0.14)" }}
      >
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="size-9" style={{ color: "var(--gift-accent)", fill: "var(--gift-accent)" }} />
        </motion.div>
      </motion.div>

      <p className="mt-7 text-[1.6rem] leading-tight italic" style={{ fontFamily: "var(--gift-font-display)" }}>
        {giftString(locale, "theEnd")}
      </p>
      <p className={cn("mt-2 text-sm", dark ? "text-white/60" : "text-black/50")}>
        {giftString(locale, "madeBy", { sender: data.senderName, recipient: data.recipientName })}
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {data.showReactionCta && onReact ? (
          <motion.button
            type="button"
            onClick={onReact}
            whileTap={{ scale: 0.97 }}
            className="flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-lg"
            style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}
          >
            <Heart className="size-4" />
            {giftString(locale, "sendReaction", { sender: data.senderName })}
          </motion.button>
        ) : null}
        {onMakeOne ? (
          <button
            type="button"
            onClick={onMakeOne}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full border text-[15px] font-medium",
              dark ? "border-white/20 text-white hover:bg-white/10" : "border-black/15 text-current hover:bg-black/5",
            )}
          >
            <Sparkles className="size-4" />
            {giftString(locale, "makeOne")}
          </button>
        ) : null}
        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className={cn("flex h-11 items-center justify-center gap-2 text-sm", dark ? "text-white/60 hover:text-white" : "text-black/50 hover:text-black")}
          >
            <RotateCcw className="size-4" />
            {giftString(locale, "replay")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
