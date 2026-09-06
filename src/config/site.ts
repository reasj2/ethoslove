import { BRAND } from "./brand";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE = {
  name: BRAND.name,
  url: SITE_URL,
  /** Base path for shareable gift links. Keep short: it goes on QR codes. */
  giftPath: "/g",
  ogImage: "/og-default.png",
  twitterHandle: "@ethoslove",
} as const;

/** Length of the public short id on gift links (base58, ~52 bits of entropy). */
export const SHORT_ID_LENGTH = 9;

export const LIMITS = {
  free: { maxPhotos: 10, maxGifts: Infinity },
  premium: { maxPhotos: 20, maxGifts: Infinity },
  /** Client-side compression target before upload. */
  photoMaxBytes: 1.5 * 1024 * 1024,
  photoMaxEdgePx: 2048,
  audioMaxBytes: 12 * 1024 * 1024,
  videoMaxBytes: 60 * 1024 * 1024,
  messageMaxChars: 4000,
  captionMaxChars: 140,
  voiceNoteMaxSeconds: 20,
} as const;
