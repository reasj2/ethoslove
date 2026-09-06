/**
 * The client IP for rate limiting. Vercel's proxy sets x-vercel-forwarded-for and x-real-ip from
 * the connecting socket; the left-most x-forwarded-for entry can be typed by the client, so it is
 * only used as a last resort and then from the right (the hop closest to us).
 */
export function clientIp(headers: Headers): string {
  const trusted = headers.get("x-vercel-forwarded-for") ?? headers.get("x-real-ip");
  if (trusted) return trusted.split(",")[0].trim() || "anon";
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
    return hops[hops.length - 1] ?? "anon";
  }
  return "anon";
}
