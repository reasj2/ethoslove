import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { notifyWelcome } from "./notify";

/** Sends the welcome email once, right after the profile row is created by the auth trigger. */
export async function welcomeIfNew(supabase: SupabaseClient<Database>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;
  const { data: profile } = await supabase.from("profiles").select("created_at, locale").eq("id", user.id).maybeSingle();
  if (!profile) return;
  const ageMs = Date.now() - new Date(profile.created_at).getTime();
  if (ageMs > 2 * 60 * 1000) return;
  await notifyWelcome(user.email, profile.locale === "es" ? "es" : "en");
}
