import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoMark } from "@/components/shared/logo";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

export default async function GiftPage({ params }: PageProps<"/[locale]/g/[shortId]">) {
  const { locale, shortId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gift");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <LogoMark className="size-14" />
      <p className="font-display mt-8 text-2xl italic">{t("loading")}</p>
      <p className="mt-6 max-w-xs text-sm text-paper/60">
        {t("phaseNote")} <span className="font-mono">{shortId}</span>
      </p>
    </div>
  );
}
