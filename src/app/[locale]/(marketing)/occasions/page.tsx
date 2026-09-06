import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OCCASIONS, OCCASION_META } from "@/config/occasions";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/occasions">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "occasions" });
  return { title: t("title") };
}

export default async function OccasionsIndexPage({ params }: PageProps<"/[locale]/occasions">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("occasions");
  return (
    <>
      <PageHeader title={t("title")} />
      <ul className="container-x grid grid-cols-2 gap-4 pb-24 sm:grid-cols-3 lg:grid-cols-4">
        {OCCASIONS.map((o) => (
          <li key={o}>
            <Link
              href={`/occasions/${o}`}
              className="group flex aspect-[4/3] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="text-3xl" aria-hidden="true">
                {OCCASION_META[o].emoji}
              </span>
              <span className="font-display text-xl">{t(o)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
