import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function GiftReactPage({ params }: PageProps<"/[locale]/g/[shortId]/react">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gift");
  return (
    <div className="flex min-h-dvh items-center justify-center px-8 text-center text-paper/70">
      <p>{t("phaseNote")}</p>
    </div>
  );
}
