import type { GiftData } from "@/lib/gift/schema";
import type { TemplateManifest } from "@/templates/types";
import { isStoragePath } from "./assets";

export type Entitlement = {
  /** User owns this template (or Everything). */
  unlocked: boolean;
};

export type PublishDecision =
  | { ok: true; watermark: boolean; isPremium: boolean }
  | { ok: false; reason: "payment_required" | "not_ready"; problems?: string[] };

/**
 * Pure publish rules — unit tested, shared by the server action and the publish sheet.
 *
 * Free templates publish for free with a watermark. Any unlock (the template or "Everything")
 * removes the watermark and lifts limits. Premium templates need an unlock, full stop.
 */
export function decidePublish(
  manifest: TemplateManifest,
  data: GiftData,
  entitlement: Entitlement,
  options: { removeWatermark: boolean; schedule: boolean; password: boolean },
): PublishDecision {
  const problems = readinessProblems(manifest, data);
  if (problems.length > 0) return { ok: false, reason: "not_ready", problems };

  const needsUnlock =
    manifest.tier === "premium" || options.removeWatermark || options.schedule || options.password || data.photos.length > 10;

  if (needsUnlock && !entitlement.unlocked) return { ok: false, reason: "payment_required" };

  return { ok: true, watermark: !entitlement.unlocked, isPremium: manifest.tier === "premium" };
}

/** Human-readable blockers, keyed for translation on the client. */
export function readinessProblems(manifest: TemplateManifest, data: GiftData): string[] {
  const problems: string[] = [];
  if (!data.recipientName.trim()) problems.push("recipientName");
  if (!data.senderName.trim()) problems.push("senderName");
  if (!data.message.trim()) problems.push("message");
  if (data.photos.length < manifest.features.photos.min) problems.push("photosMin");
  if (data.photos.length > manifest.features.photos.max) problems.push("photosMax");
  if (data.photos.some((p) => !isStoragePath(p.url) && !p.url.startsWith("http"))) problems.push("uploadsPending");
  if (data.music?.source === "upload" && !isStoragePath(data.music.url) && !data.music.url.startsWith("http")) problems.push("uploadsPending");
  if (data.video && !isStoragePath(data.video.url) && !data.video.url.startsWith("http")) problems.push("uploadsPending");
  return Array.from(new Set(problems));
}
