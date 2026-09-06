"use client";

import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import type { TemplateManifest } from "@/templates/types";
import { TemplateCard } from "@/components/templates/template-card";

export function TemplateStrip({ manifests }: { manifests: TemplateManifest[] }) {
  const t = useTranslations("home.templates");
  const locale = useLocale() as GiftLocale;
  const free = manifests.filter((m) => m.tier === "free").length;
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container-x mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-eyebrow text-coral">{t("eyebrow")}</p>
          <h2 className="display-xl mt-3">{t("title", { free })}</h2>
          <p className="mt-4 text-lg text-ink-soft">{t("blurb")}</p>
        </div>
        <Link href="/templates" className="group flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:border-ink">
          {t("all")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {manifests.map((m, i) => (
          <div key={m.slug} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
            <TemplateCard manifest={m} index={i} />
          </div>
        ))}
        <Link href="/templates" className="flex w-[280px] shrink-0 snap-start flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-border text-center sm:w-[320px]">
          <span className="font-display text-3xl italic">{t("moreTitle")}</span>
          <span className="mt-2 max-w-[14rem] text-sm text-muted-foreground">{t("moreBlurb", { name: locale === "es" ? "Cine de cumpleaños" : "Birthday Cinema" })}</span>
        </Link>
      </div>
    </section>
  );
}
