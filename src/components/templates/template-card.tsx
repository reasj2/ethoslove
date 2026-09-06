"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: (index % 3) * 0.06 }}
      className="group flex flex-col"
    >
      <div
        className="relative aspect-[390/600] overflow-hidden rounded-lg border border-line bg-night shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-y-1 group-hover:shadow-lift"
        onMouseEnter={play}
        onMouseLeave={pause}
      >
        {live ? (
          <div className="absolute inset-0">
            <GiftRenderer slug={manifest.slug} mode="demo" demoLocale={locale} />
          </div>
        ) : (
          <>
            <img src={manifest.thumbnail.poster} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
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
              className="absolute inset-0 flex items-end justify-center pb-5"
              aria-label={`${t("templates.tryDemo")}: ${manifest.name[locale]}`}
            >
              <span className="flex items-center gap-2 rounded-full bg-paper/90 px-3.5 py-2 text-[13px] font-medium text-ink backdrop-blur transition-colors group-hover:bg-paper">
                <Play className="size-3 fill-current" />
                {t("templates.tryDemo")}
              </span>
            </button>
          </>
        )}
        <span
          className={cn(
            "text-eyebrow pointer-events-none absolute top-3 left-3 rounded-sm px-2 py-1",
            manifest.tier === "free" ? "bg-paper text-ink" : "bg-ink text-paper",
          )}
        >
          {manifest.tier === "free" ? t("common.free") : t("common.premium")}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-mono-meta text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="font-display truncate text-[1.35rem] leading-tight">{manifest.name[locale]}</h3>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{manifest.tagline[locale]}</p>
        </div>
        <Link
          href={`/templates/${manifest.slug}`}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {t("templates.details")}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
