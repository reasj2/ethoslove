import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const handleI18n = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gift links (/g/abc123) are shared across languages and printed on QR codes.
  // They must never redirect based on the viewer's browser language: rewrite them
  // to the default locale segment and let the page render in the sender's locale.
  if (pathname === "/g" || pathname.startsWith("/g/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${pathname}`;
    const response = NextResponse.rewrite(url);
    return refreshSupabaseSession(request, response);
  }

  const response = handleI18n(request);
  return refreshSupabaseSession(request, response);
}

export const config = {
  // Skip API routes, auth callbacks, Next internals and any file with an extension.
  matcher: ["/((?!api|auth|_next|_vercel|monitoring|.*\\..*).*)"],
};
