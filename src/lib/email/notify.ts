import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/config/site";
import { sendEmail } from "./send";
import { GiftOpenedEmail, GiftPublishedEmail, GiftUnlockedEmail, ReactionEmail, ReceiptEmail, WelcomeEmail } from "@/emails/templates";

type L = "en" | "es";

async function ownerOf(giftId: string): Promise<{ email: string; locale: L; recipientName: string; shortId: string } | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const { data: gift } = await admin.from("gifts").select("user_id, locale, short_id, data").eq("id", giftId).single();
  if (!gift) return null;
  const { data: profile } = await admin.from("profiles").select("email, locale").eq("id", gift.user_id).single();
  if (!profile?.email) return null;
  const data = gift.data as { recipientName?: string } | null;
  return { email: profile.email, locale: (profile.locale === "es" ? "es" : "en") as L, recipientName: data?.recipientName ?? "", shortId: gift.short_id };
}

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;

export async function notifyWelcome(email: string, locale: L) {
  return sendEmail({ to: email, subject: locale === "es" ? "Bienvenido a Ethos" : "Welcome to Ethos", react: WelcomeEmail({ locale, siteUrl: site() }) });
}

export async function notifyPublished(giftId: string, scheduledFor?: string) {
  const owner = await ownerOf(giftId);
  if (!owner) return;
  const url = `${site()}${SITE.giftPath}/${owner.shortId}`;
  return sendEmail({
    to: owner.email,
    subject: owner.locale === "es" ? `Tu regalo para ${owner.recipientName} está ${scheduledFor ? "programado" : "publicado"}` : `Your gift for ${owner.recipientName} is ${scheduledFor ? "scheduled" : "live"}`,
    react: GiftPublishedEmail({ locale: owner.locale, recipientName: owner.recipientName, url, scheduledFor }),
  });
}

/** Only for the first open of a gift; later opens are dashboard-only. */
export async function notifyFirstOpen(giftId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const { count } = await admin.from("gift_views").select("id", { count: "exact", head: true }).eq("gift_id", giftId);
  if ((count ?? 0) !== 1) return;
  const owner = await ownerOf(giftId);
  if (!owner) return;
  return sendEmail({
    to: owner.email,
    subject: owner.locale === "es" ? `${owner.recipientName} ha abierto tu regalo` : `${owner.recipientName} opened your gift`,
    react: GiftOpenedEmail({ locale: owner.locale, recipientName: owner.recipientName, dashboardUrl: `${site()}/dashboard/gift/${giftId}` }),
  });
}

export async function notifyReaction(giftId: string, emoji: string, text: string | null, hasAudio: boolean) {
  const owner = await ownerOf(giftId);
  if (!owner) return;
  return sendEmail({
    to: owner.email,
    subject: `${emoji} ${owner.locale === "es" ? `${owner.recipientName} te ha enviado una reacción` : `${owner.recipientName} sent you a reaction`}`,
    react: ReactionEmail({ locale: owner.locale, recipientName: owner.recipientName, emoji, text, hasAudio, dashboardUrl: `${site()}/dashboard/gift/${giftId}` }),
  });
}

export async function notifyUnlocked(giftId: string) {
  const owner = await ownerOf(giftId);
  if (!owner) return;
  return sendEmail({
    to: owner.email,
    subject: owner.locale === "es" ? `Tu regalo para ${owner.recipientName} ya está abierto` : `Your gift for ${owner.recipientName} just unlocked`,
    react: GiftUnlockedEmail({ locale: owner.locale, recipientName: owner.recipientName, url: `${site()}${SITE.giftPath}/${owner.shortId}` }),
  });
}

export async function notifyReceipt(userId: string, productLabel: string, amountLabel: string, unlocks: string[]) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const { data: profile } = await admin.from("profiles").select("email, locale").eq("id", userId).single();
  if (!profile?.email) return;
  const locale: L = profile.locale === "es" ? "es" : "en";
  return sendEmail({ to: profile.email, subject: locale === "es" ? `Recibo de Ethos: ${productLabel}` : `Your Ethos receipt: ${productLabel}`, react: ReceiptEmail({ locale, productLabel, amountLabel, unlocks, dashboardUrl: `${site()}/account` }) });
}
