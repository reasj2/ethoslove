import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { viewerHash } from "@/lib/crypto";
import { isShortId } from "@/lib/gift/short-id";
import { rateLimit } from "@/lib/rate-limit";

function device(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh|Windows|Linux/i.test(ua)) return "desktop";
  return "other";
}

/** Records an open. Returns the view id so progress can be reported. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/gift/[shortId]/view">) {
  const { shortId } = await ctx.params;
  if (!isShortId(shortId)) return NextResponse.json({ ok: false }, { status: 404 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: false }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const ua = request.headers.get("user-agent") ?? "";
  if (!(await rateLimit(`view:${ip}`, { limit: 60, windowSeconds: 600 }))) return NextResponse.json({ ok: false }, { status: 429 });

  const { data, error } = await admin.rpc("record_gift_view", { p_short_id: shortId, p_viewer_hash: await viewerHash(ip, ua, shortId), p_device: device(ua) });
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, viewId: data });
}

const progressInput = z.object({ viewId: z.uuid(), pct: z.number().int().min(0).max(100) });

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/gift/[shortId]/view">) {
  const { shortId } = await ctx.params;
  if (!isShortId(shortId)) return NextResponse.json({ ok: false }, { status: 404 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: false }, { status: 503 });
  const parsed = progressInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await admin.rpc("update_gift_view_progress", { p_view_id: parsed.data.viewId, p_pct: parsed.data.pct });
  return NextResponse.json({ ok: true });
}
