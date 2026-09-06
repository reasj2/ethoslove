"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";
import { GIFTS_BUCKET, REACTIONS_BUCKET } from "@/lib/gift/assets";

/** Deletes the account and everything under it. Rows cascade; storage is wiped explicitly. */
export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  const user = await getCurrentUser();
  if (!supabase || !admin || !user) return { ok: false, error: "unauthenticated" };

  const { data: gifts } = await admin.from("gifts").select("id").eq("user_id", user.id);
  for (const g of gifts ?? []) {
    for (const bucket of [GIFTS_BUCKET, REACTIONS_BUCKET]) {
      const { data: files } = await admin.storage.from(bucket).list(g.id, { limit: 500 });
      if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${g.id}/${f.name}`));
    }
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };
  await supabase.auth.signOut();
  return { ok: true };
}

export async function updateProfile(input: { name: string; locale: "en" | "es" }): Promise<{ ok: boolean }> {
  const supabase = await getSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false };
  const { error } = await supabase.from("profiles").update({ name: input.name.slice(0, 80) || null, locale: input.locale }).eq("id", user.id);
  return { ok: !error };
}
