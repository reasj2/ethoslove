"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { EnvelopeColors, GiftBoxColors } from "./looks";

const EASE = [0.22, 1, 0.36, 1] as const;

function SealMark({ mark }: { mark: "heart" | "star" }) {
  return mark === "heart" ? (
    <path d="M12 20.5s-7-4.3-9-8.6C1.6 8.8 3.2 5 6.8 5c1.9 0 3.4 1 5.2 3.1C13.8 6 15.3 5 17.2 5c3.6 0 5.2 3.8 3.8 6.9-2 4.3-9 8.6-9 8.6Z" fill="rgba(255,255,255,.88)" />
  ) : (
    <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7Z" fill="rgba(255,255,255,.9)" />
  );
}

/**
 * An envelope whose flap folds open and a letter slides out. Layering is the whole trick:
 * the flap sits on top of the pocket while closed, then drops behind the letter once it has
 * swung past vertical, so the letter can rise out in front of it.
 */
export function Envelope({ colors, opening }: { colors: EnvelopeColors; opening: boolean }) {
  const [flapBehind, setFlapBehind] = useState(false);
  useEffect(() => {
    if (!opening) return;
    const id = window.setTimeout(() => setFlapBehind(true), 260);
    return () => window.clearTimeout(id);
  }, [opening]);

  return (
    <div className="relative w-full" style={{ aspectRatio: "1.45 / 1", perspective: "900px" }}>
      {/* Inside back of the envelope. */}
      <div className="absolute inset-0 rounded-[3%]" style={{ background: colors.inner, boxShadow: "0 3cqw 6cqw -2cqw rgba(60,20,30,.28)" }} />

      <motion.div
        className="absolute inset-x-[8%] top-[8%] h-[84%] rounded-[3%]"
        style={{ background: colors.letter, zIndex: 5, boxShadow: "0 .6cqw 1.6cqw rgba(0,0,0,.12)" }}
        initial={false}
        animate={opening ? { opacity: 1, y: "-58%" } : { opacity: 0, y: "0%" }}
        transition={{ opacity: { delay: 0.28, duration: 0.2 }, y: { delay: 0.42, duration: 0.7, ease: EASE } }}
      >
        <div className="absolute inset-x-[14%] top-[18%] space-y-[7%]">
          {[88, 100, 72, 94].map((w, i) => (
            <div key={i} className="h-[0.7cqw] rounded-full" style={{ width: `${w}%`, background: "rgba(120,90,90,.16)" }} />
          ))}
        </div>
      </motion.div>

      {/* Front pocket: two side folds and the bottom fold. */}
      <svg viewBox="0 0 145 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ zIndex: 6 }} aria-hidden="true">
        <path d="M0 3 L0 97 Q0 100 3 100 L72.5 54 Z" fill={colors.body} />
        <path d="M145 3 L145 97 Q145 100 142 100 L72.5 54 Z" fill={colors.body} />
        <path d="M0 100 L72.5 50 L145 100 Z" fill={colors.body} />
        <path d="M0 100 L72.5 50 L145 100" fill="none" stroke="rgba(0,0,0,.07)" strokeWidth=".6" />
        <path d="M0 100 L72.5 50 L145 100 Z" fill="url(#pocket-shade)" />
        <defs>
          <linearGradient id="pocket-shade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".18" />
            <stop offset="1" stopColor="#000" stopOpacity=".06" />
          </linearGradient>
        </defs>
      </svg>

      {/* The flap, with the wax seal on its tip. Two faces so the inside shows once it is open. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[62%]"
        style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d", zIndex: flapBehind ? 1 : 7 }}
        initial={false}
        animate={{ rotateX: opening ? 180 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <svg viewBox="0 0 145 62" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ backfaceVisibility: "hidden" }} aria-hidden="true">
          <path d="M0 0 H145 L76 58 Q72.5 61 69 58 Z" fill={colors.flap} />
          <path d="M0 0 L69 58 Q72.5 61 76 58 L145 0" fill="none" stroke="rgba(0,0,0,.06)" strokeWidth=".7" />
        </svg>
        <svg viewBox="0 0 145 62" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }} aria-hidden="true">
          <path d="M0 0 H145 L76 58 Q72.5 61 69 58 Z" fill={colors.inner} />
        </svg>
        <div
          className="absolute left-1/2 top-[94%] grid aspect-square w-[21%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{
            backfaceVisibility: "hidden",
            background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${colors.seal} 70%, white), ${colors.seal} 55%, color-mix(in srgb, ${colors.seal} 75%, black))`,
            boxShadow: "0 .8cqw 1.6cqw rgba(0,0,0,.25), inset 0 -.6cqw 1cqw rgba(0,0,0,.2)",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-[44%]" aria-hidden="true">
            <SealMark mark={colors.mark} />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

/** A gift box whose lid lifts off in a little burst of light. */
export function GiftBox({ colors, opening }: { colors: GiftBoxColors; opening: boolean }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 0.92" }}>
      <motion.div
        className="absolute inset-x-[10%] top-[26%] h-[40%] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,236,170,.95), rgba(255,236,170,0))" }}
        initial={false}
        animate={opening ? { opacity: 1, scale: 1.6 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      />
      <div
        className="absolute inset-x-[10%] bottom-0 h-[64%] rounded-[5%]"
        style={{ background: `linear-gradient(180deg, ${colors.body}, color-mix(in srgb, ${colors.body} 88%, black))`, boxShadow: "0 3cqw 6cqw -2cqw rgba(60,20,30,.3)" }}
      >
        <div className="absolute inset-y-0 left-1/2 w-[17%] -translate-x-1/2" style={{ background: colors.ribbon }} />
        <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: "rgba(0,0,0,.07)" }} />
      </div>
      <motion.div
        className="absolute inset-x-[4%] top-[20%] h-[20%]"
        initial={false}
        animate={opening ? { y: "-190%", rotate: -16, opacity: 0 } : { y: "0%", rotate: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: EASE, opacity: { delay: 0.45, duration: 0.3 } }}
      >
        <div className="absolute inset-0 rounded-[6%]" style={{ background: `linear-gradient(180deg, ${colors.lid}, color-mix(in srgb, ${colors.lid} 90%, black))`, boxShadow: "0 1cqw 2cqw rgba(0,0,0,.14)" }} />
        <div className="absolute inset-y-0 left-1/2 w-[15.5%] -translate-x-1/2" style={{ background: colors.ribbon }} />
        <svg viewBox="0 0 120 70" className="absolute bottom-[78%] left-1/2 w-[46%] -translate-x-1/2" aria-hidden="true">
          <path d="M58 44 C40 8 6 10 12 38 C16 58 44 54 58 46Z" fill={colors.ribbon} />
          <path d="M62 44 C80 8 114 10 108 38 C104 58 76 54 62 46Z" fill={colors.ribbon} />
          <path d="M58 44 C44 20 22 20 22 36" stroke="rgba(0,0,0,.14)" strokeWidth="3" fill="none" />
          <path d="M62 44 C76 20 98 20 98 36" stroke="rgba(0,0,0,.14)" strokeWidth="3" fill="none" />
          <rect x="51" y="36" width="18" height="18" rx="6" fill={colors.ribbon} stroke="rgba(0,0,0,.12)" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );
}
