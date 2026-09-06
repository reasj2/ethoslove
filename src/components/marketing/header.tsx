"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useScrolledPast } from "@/hooks/use-scrolled-past";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { LocaleSwitcher } from "./locale-switcher";
import { AuthStatus } from "./auth-status";

export function MarketingHeader() {
  const t = useTranslations();
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/templates", label: t("nav.templates") },
    { href: "/occasions", label: t("nav.occasions") },
    { href: "/pricing", label: t("nav.pricing") },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "bg-paper/80 shadow-[0_1px_0_0_var(--border)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/70"
          : "bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        {t("common.skipToContent")}
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
        <Link href="/" className="rounded-md" aria-label={t("common.brand")}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitcher />
          <AuthStatus />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild size="lg" className="h-10 rounded-full px-4">
            <Link href="/templates">{t("common.createGift")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" aria-label={t("common.openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm bg-paper">
              <SheetTitle className="sr-only">{t("common.openMenu")}</SheetTitle>
              <div className="flex h-full flex-col gap-6 pt-10">
                <Logo />
                <nav className="flex flex-col" aria-label="Mobile">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="font-display border-b border-border py-4 text-2xl"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3 pb-6">
                  <AuthStatus onNavigate={() => setOpen(false)} block />
                  <LocaleSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
