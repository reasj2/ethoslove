"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useScrolledPast } from "@/hooks/use-scrolled-past";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { LocaleSwitcher } from "./locale-switcher";
import { AuthStatus } from "./auth-status";

/** A floating pill of dark glass: it sits over the night-garden hero and the cream pages alike. */
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
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        {t("common.skipToContent")}
      </a>
      <div
        className={cn(
          "glass-forest mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full pr-2 pl-5 text-cream transition-shadow duration-300",
          scrolled && "shadow-[0_18px_50px_-22px_rgba(0,0,0,0.65)]",
        )}
      >
        <Link href="/" className="rounded-full" aria-label={t("common.brand")}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-cream/75 transition-colors hover:bg-white/10 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <LocaleSwitcher className="text-cream/80 hover:bg-white/10 hover:text-cream" />
          <AuthStatus tone="dark" />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Link href="/templates" className="inline-flex h-10 items-center rounded-full bg-cream px-4 text-sm font-semibold text-forest">
            {t("common.createGift")}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label={t("common.openMenu")} className="grid size-10 place-items-center rounded-full text-cream hover:bg-white/10">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm border-l-0 bg-forest text-cream">
              <SheetTitle className="sr-only">{t("common.openMenu")}</SheetTitle>
              <div className="flex h-full flex-col gap-6 px-2 pt-10">
                <Logo />
                <nav className="flex flex-col" aria-label="Mobile">
                  {nav.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="font-display border-b border-white/10 py-4 text-[1.75rem] text-cream">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3 pb-6">
                  <AuthStatus onNavigate={() => setOpen(false)} block tone="dark" />
                  <LocaleSwitcher className="text-cream/80 hover:bg-white/10 hover:text-cream" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
