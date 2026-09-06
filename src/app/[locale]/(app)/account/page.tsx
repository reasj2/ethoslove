import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/get-user";
import { NotConnected } from "@/components/app/not-connected";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/account">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="display-lg">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      {!isConfigured.supabase ? <NotConnected /> : null}
      {user ? (
        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">{t("profile")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("signedInAs", { email: user.email ?? "" })}</p>
        </section>
      ) : null}
    </div>
  );
}
