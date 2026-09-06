import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyUnlocked } from "@/lib/email/notify";

/**
 * Flips a scheduled gift to live once its unlock time has passed. Called from the recipient
 * page on first open, so nobody waits on the cron (Vercel Hobby only allows daily crons).
 * The conditional update makes it safe to call concurrently; only the winner sends the email.
 */
export async function promoteScheduledGift(giftId: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("gifts")
    .update({ status: "live" })
    .eq("id", giftId)
    .eq("status", "scheduled")
    .lte("unlock_at", new Date().toISOString())
    .select("id");
  const flipped = (data?.length ?? 0) > 0;
  if (flipped) void notifyUnlocked(giftId).catch(() => {});
  return flipped;
}
