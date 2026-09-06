import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/logo";
import { PhaseNote } from "@/components/shared/phase-note";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/create/[templateSlug]">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "editor" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CreatePage({ params }: PageProps<"/[locale]/create/[templateSlug]">) {
  const { locale, templateSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("editor");
  return (
    <div>
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </header>
      <div className="container-x pt-10 pb-6">
        <h1 className="display-lg">{t("title")}</h1>
      </div>
      <PhaseNote>{t("phaseNote", { slug: templateSlug })}</PhaseNote>
    </div>
  );
}
