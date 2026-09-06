import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getStripe } from "@/lib/stripe/server";
import { fulfilCheckoutSession } from "@/lib/stripe/fulfil";
import { getCurrentUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  const { session_id, return: back } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const user = await getCurrentUser();
  const stripe = getStripe();

  let state: "paid" | "pending" | "error" = "error";
  if (stripe && user && typeof session_id === "string") {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.metadata?.user_id === user.id) {
        const result = await fulfilCheckoutSession(session);
        state = result.ok ? "paid" : session.payment_status === "unpaid" ? "pending" : "error";
      }
    } catch {
      state = "error";
    }
  }
  const returnTo = typeof back === "string" && back.startsWith("/") ? back : "/dashboard";

  return (
    <div className="container-narrow flex flex-col items-center py-24 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-moss/10">
        <Check className="size-7 text-moss" />
      </div>
      <h1 className="display-lg mt-6">{t(`${state}.title`)}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t(`${state}.detail`)}</p>
      <Button asChild className="mt-8 h-12 rounded-full px-6">
        <Link href={returnTo}>{t("continue")}</Link>
      </Button>
    </div>
  );
}
