"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { PhoneFrame } from "@/components/shared/phone-frame";
import { LogoMark } from "@/components/shared/logo";

/**
 * Placeholder hero phone. Phase 6 swaps the screen for a muxed 15s template demo.
 * For now it shows the branded loading state every recipient sees first.
 */
export function HeroPhone() {
  const t = useTranslations("home");
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 1.1, delay: 0.15 }}
      className="relative mx-auto w-[260px] sm:w-[300px] lg:w-[330px]"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <PhoneFrame width={330} className="!w-full">
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#3a2a26_0%,#141110_60%)] px-8 text-center text-paper">
            <div className="grain-overlay" />
            <motion.div
              animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <LogoMark className="size-14" />
            </motion.div>
            <p
              className="font-display mt-8 text-[1.35rem] leading-snug italic"
              style={{ fontVariationSettings: '"opsz" 36, "SOFT" 60, "WONK" 1' }}
            >
              {t("phoneCaption")}
            </p>
            <div className="mt-10 h-px w-24 overflow-hidden rounded bg-paper/15">
              <motion.div
                className="h-full w-1/2 bg-coral"
                animate={reduce ? undefined : { x: ["-100%", "220%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </PhoneFrame>
      </motion.div>
      {/* Warm glow behind the device */}
      <div className="pointer-events-none absolute inset-0 -z-10 translate-y-10 scale-110 rounded-full bg-[radial-gradient(closest-side,rgba(232,96,76,0.28),transparent)] blur-2xl" />
    </motion.div>
  );
}
