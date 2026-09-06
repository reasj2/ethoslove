import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroPhone } from "@/components/marketing/hero-phone";
import { PhaseNote } from "@/components/shared/phase-note";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(70%_60%_at_20%_0%,rgba(244,199,195,0.55),transparent),radial-gradient(50%_50%_at_90%_10%,rgba(212,168,83,0.25),transparent)]" />
        <div className="container-x grid items-center gap-12 pt-12 pb-20 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:pb-28">
          <div className="max-w-2xl">
            <p className="text-eyebrow mb-5 text-coral">{t("eyebrow")}</p>
            <h1 className="display-hero">{t("headline")}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              {t("subheadline")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-glow">
                <Link href="/templates">
                  {t("cta")}
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-13 rounded-full px-6 text-base">
                <Link href="/templates">{t("secondaryCta")}</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{t("trust")}</p>
          </div>
          <HeroPhone />
        </div>
      </section>
      <PhaseNote>{t("scaffoldNote")}</PhaseNote>
    </>
  );
}
