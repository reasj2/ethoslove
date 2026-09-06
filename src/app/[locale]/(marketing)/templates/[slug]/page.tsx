import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PhaseNote } from "@/components/shared/phase-note";

export default async function TemplateDetailPage({ params }: PageProps<"/[locale]/templates/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("templates");
  return (
    <>
      <PageHeader eyebrow={t("title")} title={slug} />
      <PhaseNote>{t("phaseNote")}</PhaseNote>
    </>
  );
}
