import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PhaseNote } from "@/components/shared/phase-note";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/templates">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templates" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function TemplatesPage({ params }: PageProps<"/[locale]/templates">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("templates");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PhaseNote>{t("phaseNote")}</PhaseNote>
    </>
  );
}
