/**
 * The link a visitor arrived through: `?ref=tt-couple` from a TikTok bio, or a gift's short id
 * from the "make your own" button at the end of every gift. It rides along to Stripe Checkout as
 * metadata, so revenue can be split by where people came from (scripts/revenue-by-ref.mjs).
 *
 * Held in memory only, never in a cookie or storage, so it needs no consent. It lasts until the
 * tab reloads, which covers the usual landing → editor → checkout visit.
 */
export const REF_PATTERN = /^[a-z0-9-]{1,40}$/;

let current: string | undefined;

export function rememberRef(search: string): void {
  const ref = new URLSearchParams(search).get("ref")?.trim().toLowerCase();
  if (ref && REF_PATTERN.test(ref)) current = ref;
}

export function currentRef(): string | undefined {
  return current;
}
