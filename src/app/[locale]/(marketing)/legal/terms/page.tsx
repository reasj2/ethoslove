import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BRAND } from "@/config/brand";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata({ params }: Omit<PageProps<"/[locale]/legal/terms">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("terms") };
}

export default async function TermsPage({ params }: PageProps<"/[locale]/legal/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <>
      <PageHeader title={t("terms")} subtitle={t("lastUpdated", { date: "2026-09-06" })} />
      <article className="container-narrow prose-ethos pb-24">
        <h2>1. The service</h2>
        <p>
          {BRAND.name} lets you build a personalised web page (a &ldquo;gift&rdquo;) and share it with
          someone by link or QR code. Free templates carry a small {BRAND.name} footer. Paid templates
          are unlocked with a one-time payment and stay unlocked for your account.
        </p>
        <h2>2. Your account</h2>
        <p>
          You need an account to publish. Keep your sign-in email secure; anything published from your
          account is your responsibility.
        </p>
        <h2>3. Your content</h2>
        <p>
          You keep ownership of the photos, audio and words you upload. You grant us the licence needed to
          store, process and display them to the people you share a gift with. Do not upload content you do
          not have the right to use, or content that is unlawful, hateful or sexual in nature.
        </p>
        <h2>4. Payments</h2>
        <p>
          Purchases are one-time and processed by Stripe. Because unlocks are delivered immediately, they are
          not refundable except where required by law or where the product materially failed to work. Contact
          us and we will make it right.
        </p>
        <h2>5. Availability</h2>
        <p>
          Gift links are intended to be permanent. We may remove gifts that violate these terms or that have
          been reported as abusive.
        </p>
        <h2>6. Liability</h2>
        <p>
          The service is provided as-is. To the extent permitted by law, our liability is limited to the
          amount you paid us in the twelve months before a claim.
        </p>
        <h2>7. Contact</h2>
        <p>
          Questions: <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
        </p>
      </article>
    </>
  );
}
