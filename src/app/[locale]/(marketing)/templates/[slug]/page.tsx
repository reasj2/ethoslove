import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Maximize2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import { OCCASION_META } from "@/config/occasions";
import { TEMPLATE_SLUGS, getManifest } from "@/templates/registry";
import { Button } from "@/components/ui/button";
import { TemplatePhonePreview } from "@/components/templates/template-phone-preview";

export function generateStaticParams() {
  return TEMPLATE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/templates/[slug]">, "searchParams">): Promise<Metadata> {
  const { locale, slug } = await params;
  const manifest = getManifest(slug);
  if (!manifest) return {};
  const l = locale as GiftLocale;
  return { title: manifest.name[l], description: manifest.description[l] };
}

export default async function TemplateDetailPage({ params }: PageProps<"/[locale]/templates/[slug]">) {
  const { locale, slug } = await params;
  const manifest = getManifest(slug);
  if (!manifest) notFound();
  setRequestLocale(locale);
  const l = locale as GiftLocale;
  const t = await getTranslations();

  const featureList: [boolean, string][] = [
    [true, t("templates.featurePhotos", { max: manifest.features.photos.max })],
    [manifest.features.music, t("templates.featureMusic")],
    [manifest.features.captions, t("templates.featureCaptions")],
    [manifest.features.countdown, t("templates.featureCountdown")],
    [manifest.features.surprise, t("templates.featureSurprise")],
    [manifest.features.video, t("templates.featureVideo")],
  ];

  return (
    <div className="container-x grid gap-12 pt-10 pb-24 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16 lg:pt-16">
      <div className="lg:sticky lg:top-24">
        <TemplatePhonePreview slug={manifest.slug} locale={l} />
        <p className="mt-4 text-center text-xs text-muted-foreground">{t("templates.previewHint")}</p>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={manifest.tier === "free" ? "rounded-full bg-ink/8 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase" : "rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase"}>
            {manifest.tier === "free" ? t("common.free") : t("common.premium")}
          </span>
          {manifest.styles.map((s) => (
            <span key={s} className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t(`templates.style.${s}`)}
            </span>
          ))}
        </div>
        <h1 className="display-xl mt-5">{manifest.name[l]}</h1>
        <p className="mt-3 text-xl text-ink-soft">{manifest.tagline[l]}</p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">{manifest.description[l]}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full px-6 text-base shadow-glow">
            <Link href={`/create/${manifest.slug}`}>
              {t("templates.useTemplate")}
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6 text-base">
            <Link href={`/demo/${manifest.slug}`}>
              <Maximize2 className="size-4" data-icon="inline-start" />
              {t("templates.fullscreenDemo")}
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("common.noSubscription")}</p>

        <h2 className="text-eyebrow mt-12 mb-4 text-ink-soft">{t("templates.included")}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {featureList.map(([on, label]) => (
            <li key={label} className={on ? "flex items-center gap-2 text-sm" : "flex items-center gap-2 text-sm text-muted-foreground/60 line-through"}>
              <Check className={on ? "size-4 text-coral" : "size-4 opacity-30"} />
              {label}
            </li>
          ))}
        </ul>

        <h2 className="text-eyebrow mt-10 mb-4 text-ink-soft">{t("templates.perfectFor")}</h2>
        <ul className="flex flex-wrap gap-2">
          {manifest.occasions.map((o) => (
            <li key={o}>
              <Link
                href={`/occasions/${o}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-ink/40"
              >
                <span aria-hidden="true">{OCCASION_META[o].emoji}</span>
                {t(`occasions.${o}`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
