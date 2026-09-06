/**
 * Single source of truth for brand identity.
 * Change the name here and it propagates everywhere (metadata, emails, watermark, QR).
 */
export const BRAND = {
  name: "Ethos",
  legalName: "Ethos Love",
  tagline: {
    en: "Gifts that open like a story.",
    es: "Regalos que se abren como una historia.",
  },
  domain: "ethoslove.com",
  supportEmail: "hello@ethoslove.com",
  socials: {
    tiktok: "https://www.tiktok.com/@ethoslove",
    instagram: "https://www.instagram.com/ethoslove",
    youtube: "https://www.youtube.com/@ethoslove",
  },
  /** Shown on free-tier gifts. Keep it short; it is the viral hook. */
  watermark: {
    en: "Made with Ethos",
    es: "Hecho con Ethos",
  },
} as const;

export type Brand = typeof BRAND;
