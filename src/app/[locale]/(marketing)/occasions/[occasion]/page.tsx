import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OCCASIONS, isOccasion } from "@/config/occasions";
import { listManifests } from "@/templates/registry";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateGallery } from "@/components/templates/template-gallery";

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
        eyebrow={t("occasions.title")}
        title={t("occasions.for", { occasion: t(`occasions.${occasion}`) })}
        subtitle={t("templates.subtitle")}
      />
      <TemplateGallery manifests={listManifests()} initialOccasion={occasion} />
    </>
  );
}
