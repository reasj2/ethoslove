import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function GiftDetailPage({ params }: PageProps<"/[locale]/dashboard/gift/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="display-lg">{id}</h1>
      <p className="mt-2 text-muted-foreground">{t("phaseNote")}</p>
    </div>
  );
}
