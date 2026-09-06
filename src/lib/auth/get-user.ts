import "server-only";

import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Current user for the request, or null. Memoised per request. */
export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

export const getCurrentProfile = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
});
