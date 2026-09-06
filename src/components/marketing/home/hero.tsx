"use client";

import { useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OCCASIONS } from "@/config/occasions";
import { PhoneFrame } from "@/components/shared/phone-frame";
import { LogoMark } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

/**
 * Hero: an editorial 12-column grid. Real product footage in a phone that tilts toward the
 * cursor, a handwritten envelope behind it, and a slow ticker of occasions underneath.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tAll = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-9, 9]), { stiffness: 80, damping: 18 });
  const ticker = [...OCCASIONS, ...OCCASIONS].map((o) => tAll(`occasions.${o}`));

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
      className="relative overflow-hidden border-b border-line"
    >
      <div className="container-x grid items-center gap-14 pt-12 pb-14 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-20">
        <div className="lg:col-span-7">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-eyebrow text-ink-soft">
            {t("eyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.05 }}
            className="display-hero mt-6 max-w-[11ch] text-balance"
          >
            {t("h1a")} <em className="text-coral">{t("h1b")}</em> {t("h1c")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            {t("sub")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button asChild size="lg" className="h-13 rounded-full px-7 text-base">
              <Link href="/templates">
                {t("cta")}
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
            <Link href="/demo/the-letter" className="group inline-flex items-center gap-3 text-base font-medium text-ink">
              <span className="grid size-10 place-items-center rounded-full border border-ink transition-colors group-hover:bg-ink group-hover:text-paper">
                <Play className="ml-0.5 size-3.5 fill-current" />
              </span>
              {t("demo")}
            </Link>
          </motion.div>
          <p className="mt-4 text-sm text-muted-foreground">{t("ctaNote")}</p>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {(["free", "noAccount", "once", "langs"] as const).map((k) => (
              <div key={k} className="bg-paper px-4 py-4">
                <dt className="font-display text-[2rem] leading-none tracking-tight">{t(`facts.${k}.a`)}</dt>
                <dd className="text-mono-meta mt-2 text-muted-foreground">{t(`facts.${k}.b`)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[480px] lg:col-span-5 lg:justify-self-end">
          {/* The envelope beside the phone: the free template, in paper. */}
          <motion.div
            initial={{ opacity: 0, rotate: -12, y: 20 }}
            animate={{ opacity: 1, rotate: -7, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.35 }}
            aria-hidden="true"
            className="absolute bottom-24 left-0 z-0 hidden w-[230px] rounded-sm border border-line bg-[#fbf7ef] p-5 shadow-lift sm:block"
          >
            <p className="font-hand text-[2rem] leading-none text-ink">{t("card.to")}</p>
            <p className="font-hand mt-2 text-xl text-ink-soft">{t("card.from")}</p>
            <div className="mt-8 h-px w-full bg-line" />
            <div className="mt-2 h-px w-2/3 bg-line" />
            <LogoMark className="absolute right-4 bottom-4 size-9 rotate-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.15 }}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
            className="relative z-10 mx-auto w-[270px] sm:mr-2 sm:ml-auto sm:w-[300px] lg:w-[310px]"
          >
            <PhoneFrame width={310} className="!w-full">
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
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 18 }}
              aria-hidden="true"
              className="text-mono-meta absolute -right-3 bottom-24 flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 shadow-soft"
            >
              <span className="size-1.5 rounded-full bg-moss" />
              {t("card.opened")}
            </motion.div>
          </motion.div>
          <p className="mt-5 text-center text-xs text-muted-foreground sm:text-right">{t("caption")}</p>
        </div>
      </div>

      <div className="overflow-hidden border-t border-line py-3" aria-hidden="true">
        <div className="animate-ticker flex w-max items-center gap-8 whitespace-nowrap pl-8">
          {ticker.map((label, i) => (
            <span key={i} className="font-display flex items-center gap-8 text-[1.35rem] italic text-ink-soft">
              {label}
              <span className="size-1.5 rounded-full bg-coral" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
