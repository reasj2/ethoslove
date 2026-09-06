import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyUnlocked } from "@/lib/email/notify";

/**
 * Backstop for scheduled gifts: flips any whose unlock time passed to live and emails the
 * sender. Recipients never wait on it (the public RPC checks unlock_at itself and the gift
 * page promotes on first open). Vercel Hobby only allows daily crons, so vercel.json runs it
 * once a day; on Pro you can switch the schedule back to every few minutes.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data: due } = await admin.from("gifts").select("id").eq("status", "scheduled").lte("unlock_at", new Date().toISOString()).limit(200);
  let flipped = 0;
  for (const g of due ?? []) {
    const { error } = await admin.from("gifts").update({ status: "live" }).eq("id", g.id).eq("status", "scheduled");
    if (!error) {
      flipped += 1;
      await notifyUnlocked(g.id).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true, flipped });
}
