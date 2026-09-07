import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

/**
 * Lets recipients add a gift to their home screen and open it full-bleed, no browser bars:
 * the best way to screen-record or screenshot a gift in 9:16.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.tagline.en,
    start_url: "/",
    display: "standalone",
    background_color: "#14110e",
    theme_color: "#f6f1e8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
