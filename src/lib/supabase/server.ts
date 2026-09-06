import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, isConfigured } from "@/lib/env";
import type { Database } from "./types";

/**
 * Request-scoped Supabase client for Server Components, Server Actions and Route Handlers.
 * Returns null when Supabase is not configured.
 */
export async function getSupabaseServerClient() {
  if (!isConfigured.supabase) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy
          // refreshes sessions, so this is safe to ignore.
        }
      },
    },
  });
}
