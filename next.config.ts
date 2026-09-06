import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/**" }]
        : []),
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/**" },
    ],
  },
  // Three.js and GSAP ship ESM that Turbopack handles fine; keep sharp server-only.
  serverExternalPackages: ["sharp"],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        {
          key: "Permissions-Policy",
          // Templates need mic (Birthday Cinema), motion (Jar, Constellations), gyroscope.
          value: "camera=(), microphone=(self), geolocation=(), accelerometer=(self), gyroscope=(self)",
        },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
