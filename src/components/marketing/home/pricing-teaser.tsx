import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { stripeReady } from "@/lib/stripe/server";
import { currencyFor } from "@/lib/pricing/products";
import { listManifests } from "@/templates/registry";
import { PricingCards } from "@/components/pricing/pricing-cards";

export async function PricingTeaser({ locale }: { locale: string }) {
  const t = await getTranslations("pricing");
  const user = await getCurrentUser();
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10 max-w-xl">
          <p className="text-eyebrow text-coral">{t("eyebrow")}</p>
          <h2 className="display-xl mt-3">{t("title")}</h2>
          <p className="mt-4 text-lg text-ink-soft">{t("subtitle")}</p>
        </div>
        <PricingCards currency={currencyFor(locale === "es" ? "ES" : "US")} manifests={listManifests()} authed={Boolean(user)} paymentsEnabled={stripeReady()} />
      </div>
    </section>
  );
}
