import { setRequestLocale } from "next-intl/server";
import { listManifests } from "@/templates/registry";
import { Hero } from "@/components/marketing/home/hero";
import { TemplateStrip } from "@/components/marketing/home/template-strip";
import { Reactions } from "@/components/marketing/home/reactions";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { OccasionsIndex } from "@/components/marketing/home/occasions-index";
import { PricingTeaser } from "@/components/marketing/home/pricing-teaser";
import { Faq } from "@/components/marketing/home/faq";
import { FinalCta } from "@/components/marketing/home/final-cta";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TemplateStrip manifests={listManifests()} />
      <Reactions />
      <HowItWorks />
      <OccasionsIndex />
      <PricingTeaser locale={locale} />
      <Faq />
      <FinalCta />
    </>
  );
}
