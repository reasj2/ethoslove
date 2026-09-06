import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OCCASIONS, OCCASION_META, isOccasion } from "@/config/occasions";
import { PageHeader } from "@/components/shared/page-header";
import { PhaseNote } from "@/components/shared/phase-note";

export function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({ occasion }));
}

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/occasions/[occasion]">, "searchParams">): Promise<Metadata> {
  const { locale, occasion } = await params;
  if (!isOccasion(occasion)) return {};
  const t = await getTranslations({ locale, namespace: "occasions" });
  return { title: t("for", { occasion: t(occasion) }) };
}

export default async function OccasionPage({ params }: PageProps<"/[locale]/occasions/[occasion]">) {
  const { locale, occasion } = await params;
  if (!isOccasion(occasion)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        eyebrow={`${OCCASION_META[occasion].emoji} ${t("occasions.title")}`}
        title={t("occasions.for", { occasion: t(`occasions.${occasion}`) })}
      />
      <PhaseNote>{t("templates.phaseNote")}</PhaseNote>
    </>
  );
}
