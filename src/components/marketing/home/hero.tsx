"use client";

import { useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PhoneFrame } from "@/components/shared/phone-frame";
import { Button } from "@/components/ui/button";

/** Hero: real product footage in a phone that tilts toward the cursor. No blobs, no glass. */
export function Hero() {
  const t = useTranslations("home.hero");
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 80, damping: 18 });

  return (
    <section
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || e.pointerType !== "mouse") return;
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative overflow-hidden border-b border-border"
    >
      <div className="container-x grid items-center gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pt-24 lg:pb-24">
        <div className="max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-eyebrow text-coral">
            {t("eyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.05 }}
            className="display-hero mt-5"
          >
            {t("h1a")}{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 italic">{t("h1b")}</span>
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1 h-[0.32em] w-full" aria-hidden="true">
                <motion.path
                  d="M4 16 C 60 6, 120 20, 180 10 S 270 8, 296 14"
                  fill="none"
                  stroke="var(--brand-coral)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </span>{" "}
            {t("h1c")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            {t("sub")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-glow">
              <Link href="/templates">
                {t("cta")}
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-13 rounded-full px-5 text-base">
              <Link href="/demo/the-letter">
                <Play className="size-4 fill-current" data-icon="inline-start" />
                {t("demo")}
              </Link>
            </Button>
          </motion.div>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-5 text-sm sm:grid-cols-4">
            {(["free", "noAccount", "once", "langs"] as const).map((k) => (
              <div key={k}>
                <dt className="font-medium text-ink">{t(`facts.${k}.a`)}</dt>
                <dd className="text-muted-foreground">{t(`facts.${k}.b`)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.15 }}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
          className="relative mx-auto w-[280px] sm:w-[320px] lg:w-[340px]"
        >
          <PhoneFrame width={340} className="!w-full">
            <video
              className="h-full w-full object-cover"
              src="/templates/the-letter/preview.webm"
              poster="/templates/the-letter/poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t("videoAlt")}
            />
          </PhoneFrame>
          <p className="mt-4 text-center text-xs text-muted-foreground">{t("caption")}</p>
        </motion.div>
      </div>
    </section>
  );
}
