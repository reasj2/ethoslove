import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  PRODUCTS,
  formatAmount,
  isProductId,
  unlocksFor,
  type Currency,
} from "@/lib/pricing/products";
import { notifyReceipt, notifyWelcome } from "@/lib/email/notify";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Fulfilment = {
  ok: boolean;
  reason?: string;
  userId?: string;
  email?: string;
  createdUser?: boolean;
};
import { getManifest } from "@/templates/registry";

/**
 * Marks a purchase paid and grants unlocks. Idempotent: safe to call from the webhook
 * AND from the success page (whichever lands first). Only trusts data verified with Stripe.
 */
export async function fulfilCheckoutSession(session: Stripe.Checkout.Session): Promise<Fulfilment> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "not_configured" };
  if (session.payment_status !== "paid") return { ok: false, reason: "unpaid" };

  const purchaseId = session.metadata?.purchase_id ?? session.client_reference_id;
  const product = session.metadata?.product;
  const slugs = (session.metadata?.template_slugs ?? "").split(",").filter(Boolean);
  if (!purchaseId || !product || !isProductId(product))
    return { ok: false, reason: "bad_metadata" };
  if (session.metadata?.guest === "1")
    return fulfilGuest(admin, session, purchaseId, product, slugs);

  const userId = session.metadata?.user_id;
  if (!userId) return { ok: false, reason: "bad_metadata" };

  const { data: purchase } = await admin
    .from("purchases")
    .select("id, status, user_id")
    .eq("id", purchaseId)
    .single();
  if (!purchase || purchase.user_id !== userId) return { ok: false, reason: "purchase_mismatch" };
  if (purchase.status === "paid") return { ok: true, userId };

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  await admin
    .from("purchases")
    .update({
      status: "paid",
      stripe_payment_intent_id: paymentIntent,
      stripe_session_id: session.id,
    })
    .eq("id", purchaseId);

  const rows = unlocksFor(product, slugs).map((template_slug) => ({
    user_id: userId,
    template_slug,
    purchase_id: purchaseId,
  }));
  const { error } = await admin
    .from("template_unlocks")
    .upsert(rows, { onConflict: "user_id,template_slug", ignoreDuplicates: true });
  if (error) return { ok: false, reason: error.message };
  const currency = (session.currency ?? "usd") as Currency;
  const amount = session.amount_total ?? PRODUCTS[product].amounts[currency] ?? 0;
  const labels: Record<string, string> = {
    single: "One template",
    pick3: "Pick three",
    everything: "Everything",
  };
  const unlockNames =
    product === "everything"
      ? ["All templates, current and future"]
      : slugs.map((s) => getManifest(s)?.name.en ?? s);
  void notifyReceipt(
    userId,
    labels[product] ?? product,
    formatAmount(amount, currency),
    unlockNames,
  ).catch(() => {});
  return { ok: true, userId };
}

type Admin = SupabaseClient<Database>;
const LABELS: Record<string, string> = {
  single: "One template",
  pick3: "Pick three",
  everything: "Everything",
};

/**
 * Guest checkout: the buyer paid before having an account. Find or create the user from the
 * email Stripe collected, record the paid purchase under it and grant the unlocks. Safe to run
 * from both the webhook and the success page; the purchase id is fixed in the session metadata.
 */
async function fulfilGuest(
  admin: Admin,
  session: Stripe.Checkout.Session,
  purchaseId: string,
  product: "single" | "pick3" | "everything",
  slugs: string[],
): Promise<Fulfilment> {
  const email = session.customer_details?.email?.trim().toLowerCase();
  if (!email) return { ok: false, reason: "no_email" };
  const locale = session.metadata?.locale === "es" ? "es" : "en";

  const { data: existing } = await admin
    .from("purchases")
    .select("id, status, user_id")
    .eq("id", purchaseId)
    .maybeSingle();
  if (existing?.status === "paid") return { ok: true, userId: existing.user_id, email };

  const { userId, created } = await findOrCreateUser(admin, email, locale);
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  const currency = (session.currency ?? "usd") as Currency;
  const amount = session.amount_total ?? PRODUCTS[product].amounts[currency] ?? 0;
  const { error: purchaseErr } = await admin
    .from("purchases")
    .upsert(
      {
        id: purchaseId,
        user_id: userId,
        product,
        template_slugs: product === "everything" ? [] : slugs,
        amount,
        currency,
        status: "paid",
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntent,
      },
      { onConflict: "id" },
    );
  if (purchaseErr) return { ok: false, reason: purchaseErr.message };

  const rows = unlocksFor(product, slugs).map((template_slug) => ({
    user_id: userId,
    template_slug,
    purchase_id: purchaseId,
  }));
  const { error } = await admin
    .from("template_unlocks")
    .upsert(rows, { onConflict: "user_id,template_slug", ignoreDuplicates: true });
  if (error) return { ok: false, reason: error.message };

  const unlockNames =
    product === "everything"
      ? ["All templates, current and future"]
      : slugs.map((s) => getManifest(s)?.name.en ?? s);
  if (created) void notifyWelcome(email, locale).catch(() => {});
  void notifyReceipt(
    userId,
    LABELS[product] ?? product,
    formatAmount(amount, currency),
    unlockNames,
  ).catch(() => {});
  return { ok: true, userId, email, createdUser: created };
}

async function findOrCreateUser(
  admin: Admin,
  email: string,
  locale: "en" | "es",
): Promise<{ userId: string; created: boolean }> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (profile) return { userId: profile.id, created: false };
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { locale },
  });
  if (data?.user) return { userId: data.user.id, created: true };
  // Lost a race with the other fulfilment path, or the auth user exists without a profile yet.
  const { data: again } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (again) return { userId: again.id, created: false };
  throw new Error(error?.message ?? "user_create_failed");
}

export async function revokePurchaseByPaymentIntent(paymentIntentId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const { data: purchase } = await admin
    .from("purchases")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (!purchase) return;
  await admin.from("purchases").update({ status: "refunded" }).eq("id", purchase.id);
  await admin.from("template_unlocks").delete().eq("purchase_id", purchase.id);
}
