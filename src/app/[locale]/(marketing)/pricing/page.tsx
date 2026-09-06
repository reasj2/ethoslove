import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PhaseNote } from "@/components/shared/phase-note";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/pricing">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PhaseNote>{t("phaseNote")}</PhaseNote>
    </>
  );
}
