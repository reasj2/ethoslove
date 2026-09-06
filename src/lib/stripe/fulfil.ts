import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS, formatAmount, isProductId, unlocksFor, type Currency } from "@/lib/pricing/products";
import { notifyReceipt } from "@/lib/email/notify";
import { getManifest } from "@/templates/registry";

/**
 * Marks a purchase paid and grants unlocks. Idempotent: safe to call from the webhook
 * AND from the success page (whichever lands first). Only trusts data verified with Stripe.
 */
export async function fulfilCheckoutSession(session: Stripe.Checkout.Session): Promise<{ ok: boolean; reason?: string }> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "not_configured" };
  if (session.payment_status !== "paid") return { ok: false, reason: "unpaid" };

  const purchaseId = session.client_reference_id ?? session.metadata?.purchase_id;
  const userId = session.metadata?.user_id;
  const product = session.metadata?.product;
  const slugs = (session.metadata?.template_slugs ?? "").split(",").filter(Boolean);
  if (!purchaseId || !userId || !product || !isProductId(product)) return { ok: false, reason: "bad_metadata" };

  const { data: purchase } = await admin.from("purchases").select("id, status, user_id").eq("id", purchaseId).single();
  if (!purchase || purchase.user_id !== userId) return { ok: false, reason: "purchase_mismatch" };
  if (purchase.status === "paid") return { ok: true };

  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  await admin.from("purchases").update({ status: "paid", stripe_payment_intent_id: paymentIntent, stripe_session_id: session.id }).eq("id", purchaseId);

  const rows = unlocksFor(product, slugs).map((template_slug) => ({ user_id: userId, template_slug, purchase_id: purchaseId }));
  const { error } = await admin.from("template_unlocks").upsert(rows, { onConflict: "user_id,template_slug", ignoreDuplicates: true });
  if (error) return { ok: false, reason: error.message };
  const currency = (session.currency ?? "usd") as Currency;
  const amount = session.amount_total ?? PRODUCTS[product].amounts[currency] ?? 0;
  const labels: Record<string, string> = { single: "One template", pick3: "Pick three", everything: "Everything" };
  const unlockNames = product === "everything" ? ["All templates, current and future"] : slugs.map((s) => getManifest(s)?.name.en ?? s);
  void notifyReceipt(userId, labels[product] ?? product, formatAmount(amount, currency), unlockNames).catch(() => {});
  return { ok: true };
}

export async function revokePurchaseByPaymentIntent(paymentIntentId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const { data: purchase } = await admin.from("purchases").select("id").eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
  if (!purchase) return;
  await admin.from("purchases").update({ status: "refunded" }).eq("id", purchase.id);
  await admin.from("template_unlocks").delete().eq("purchase_id", purchase.id);
}
