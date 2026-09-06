import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/logo";

export default async function AuthLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative flex min-h-dvh flex-col bg-paper">
      <div className="grain-overlay opacity-[0.05]" />
      <header className="container-x relative flex h-16 items-center border-b border-line sm:h-20">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 py-12">{children}</main>
    </div>
  );
}
