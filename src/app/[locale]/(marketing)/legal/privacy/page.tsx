import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BRAND } from "@/config/brand";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/legal/privacy">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacy") };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/legal/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <>
      <PageHeader title={t("privacy")} subtitle={t("lastUpdated", { date: "2026-09-06" })} />
      <article className="container-narrow prose-ethos pb-24">
        <h2>What we collect from senders</h2>
        <p>
          Your email address, the content you add to a gift, purchase records (handled by Stripe; we never see
          card numbers) and basic product analytics used to improve the service.
        </p>
        <h2>What we collect from recipients</h2>
        <p>
          Nothing that identifies you. When a gift is opened we record an anonymous, hashed identifier, the
          device type and how far the gift was watched so the sender can see it was received. If you send a
          reaction, the emoji, text or voice note you choose is delivered to the sender only.
        </p>
        <h2>Cookies</h2>
        <p>
          Strictly necessary cookies keep you signed in and remember your language. Analytics cookies are only
          set with your consent.
        </p>
        <h2>Retention</h2>
        <p>
          Gifts stay online until you delete them. Deleting your account deletes your gifts, uploads and
          reactions within 30 days.
        </p>
        <h2>Your rights</h2>
        <p>
          You can export or delete your data from your account page at any time, or email us at{" "}
          <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
        </p>
      </article>
    </>
  );
}
