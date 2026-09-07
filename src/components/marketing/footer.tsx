import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/config/brand";
import { OCCASIONS } from "@/config/occasions";
import { Logo } from "@/components/shared/logo";
import { LocaleSwitcher } from "./locale-switcher";

export async function MarketingFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="font-display mt-4 text-xl leading-snug text-ink-soft italic">{t("footer.blurb")}</p>
        </div>
        <FooterColumn title={t("footer.product")}>
          <FooterLink href="/templates">{t("nav.templates")}</FooterLink>
          <FooterLink href="/pricing">{t("nav.pricing")}</FooterLink>
          <FooterLink href="/occasions">{t("nav.occasions")}</FooterLink>
        </FooterColumn>
        <FooterColumn title={t("nav.occasions")}>
          {OCCASIONS.slice(0, 6).map((o) => (
            <FooterLink key={o} href={`/occasions/${o}`}>
              {t(`occasions.${o}`)}
            </FooterLink>
          ))}
        </FooterColumn>
        <FooterColumn title={t("footer.company")}>
          <FooterLink href="/legal/terms">{t("footer.terms")}</FooterLink>
          <FooterLink href="/legal/privacy">{t("footer.privacy")}</FooterLink>
          <li>
            <a href={`mailto:${BRAND.supportEmail}`} className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-ink">
              {t("footer.contact")}
            </a>
          </li>
        </FooterColumn>
      </div>
      <div className="container-x text-mono-meta flex flex-col items-start justify-between gap-4 border-t border-line py-6 text-muted-foreground sm:flex-row sm:items-center">
        <p>{t("footer.rights", { year })}</p>
        <div className="flex items-center gap-5">
          <p className="hidden sm:block">{t("footer.madeWith")}</p>
          <LocaleSwitcher className="h-8 text-xs" />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-eyebrow mb-4 text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
