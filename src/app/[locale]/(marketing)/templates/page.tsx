import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isOccasion } from "@/config/occasions";
import { listManifests } from "@/templates/registry";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateGallery } from "@/components/templates/template-gallery";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/templates">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templates" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function TemplatesPage({ params, searchParams }: PageProps<"/[locale]/templates">) {
  const { locale } = await params;
  const { occasion } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("templates");
  const initial = typeof occasion === "string" && isOccasion(occasion) ? occasion : undefined;
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TemplateGallery manifests={listManifests()} initialOccasion={initial} />
    </>
  );
}
