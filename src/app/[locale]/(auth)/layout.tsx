import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/logo";

export default async function AuthLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative flex min-h-dvh flex-col bg-[radial-gradient(60%_50%_at_10%_0%,rgba(244,199,195,0.5),transparent),radial-gradient(40%_40%_at_100%_100%,rgba(212,168,83,0.22),transparent)]">
      <header className="container-x flex h-16 items-center sm:h-20">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">{children}</main>
    </div>
  );
}
