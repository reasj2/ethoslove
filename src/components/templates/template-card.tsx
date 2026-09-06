"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import type { TemplateManifest } from "@/templates/types";
import { GiftRenderer } from "@/templates/_shared/GiftRenderer";
import { cn } from "@/lib/utils";

/**
 * Gallery card. Poster at rest, the captured preview video plays on hover,
 * and "Try the live demo" mounts the real template inside the card.
 */
export function TemplateCard({ manifest, index = 0 }: { manifest: TemplateManifest; index?: number }) {
  const locale = useLocale() as GiftLocale;
  const t = useTranslations();
  const [live, setLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    const v = videoRef.current;
    if (!v || live) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  const pause = () => videoRef.current?.pause();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 110, damping: 18, delay: (index % 3) * 0.08 }}
      className="group flex flex-col"
    >
      <div
        className="relative aspect-[390/600] overflow-hidden rounded-[1.6rem] border border-border bg-night shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-y-1 group-hover:shadow-lift"
        onMouseEnter={play}
        onMouseLeave={pause}
      >
        {live ? (
          <div className="absolute inset-0">
            <GiftRenderer slug={manifest.slug} mode="demo" demoLocale={locale} />
          </div>
        ) : (
          <>
            <img
              src={manifest.thumbnail.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {manifest.thumbnail.webm ? (
              <video
                ref={videoRef}
                src={manifest.thumbnail.webm}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : null}
            <button
              type="button"
              onClick={() => {
                pause();
                setLive(true);
              }}
              className="absolute inset-0 flex items-end justify-center pb-6"
              aria-label={`${t("templates.tryDemo")}: ${manifest.name[locale]}`}
            >
              <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors group-hover:bg-white/25">
                <Play className="size-3.5 fill-current" />
                {t("templates.tryDemo")}
              </span>
            </button>
          </>
        )}
        <span
          className={cn(
            "pointer-events-none absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur",
            manifest.tier === "free" ? "bg-white/85 text-ink" : "bg-gold text-ink",
          )}
        >
          {manifest.tier === "free" ? t("common.free") : t("common.premium")}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="font-display text-xl leading-tight">{manifest.name[locale]}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{manifest.tagline[locale]}</p>
        </div>
        <Link
          href={`/templates/${manifest.slug}`}
          className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
        >
          {t("templates.details")}
        </Link>
      </div>
    </motion.article>
  );
}
