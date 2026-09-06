import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/config/site";
import { OCCASIONS } from "@/config/occasions";

const STATIC_PATHS = ["/", "/templates", "/occasions", "/pricing", "/legal/terms", "/legal/privacy"];

function localizedUrl(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE.url}${prefix}${path === "/" ? "" : path}` || SITE.url;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC_PATHS, ...OCCASIONS.map((o) => `/occasions/${o}`)];
  const now = new Date();
  return paths.map((path) => ({
    url: localizedUrl(routing.defaultLocale, path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/occasions/") ? 0.8 : 0.7,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
    },
  }));
}
