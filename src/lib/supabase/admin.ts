import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env, isConfigured } from "@/lib/env";
import type { Database } from "./types";

let admin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Service-role client. Bypasses RLS. Only use in trusted server code paths
 * (webhooks, public gift RPC wrappers, scheduled jobs). Never import from a client component.
 */
export function getSupabaseAdminClient() {
  if (!isConfigured.supabaseAdmin) return null;
  if (!admin) {
    admin = createClient<Database>(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
