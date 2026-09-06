import { setRequestLocale } from "next-intl/server";

/** The editor is full-bleed: no marketing chrome, always light. */
export default async function EditorLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="min-h-dvh bg-paper">{children}</div>;
}
