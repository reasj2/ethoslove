import { setRequestLocale } from "next-intl/server";

/** Recipient pages: no chrome at all. Templates own the full viewport. */
export default async function GiftLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="min-h-dvh bg-night text-paper">{children}</div>;
}
