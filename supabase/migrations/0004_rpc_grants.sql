-- Public-facing RPCs are only ever called from the server with the service role, behind the
-- API routes that rate-limit, validate emoji/text and hash viewers. Granting them to anon let
-- anyone with the publishable key brute-force gift passwords, spam reactions and forge views.
revoke execute on function public.get_public_gift(text, text) from anon, authenticated;
revoke execute on function public.record_gift_view(text, text, text) from anon, authenticated;
revoke execute on function public.update_gift_view_progress(uuid, integer) from anon, authenticated;
revoke execute on function public.add_reaction(text, text, text, text) from anon, authenticated;

-- Entitlement lookups: a signed-in user may only ask about themselves.
create or replace function public.has_template_unlock(p_user uuid, p_slug text)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() <> p_user then
    return false;
  end if;
  return exists (
    select 1 from public.template_unlocks
    where user_id = p_user and (template_slug = p_slug or template_slug = '*')
  );
end $$;
revoke all on function public.has_template_unlock(uuid, text) from public, anon;
grant execute on function public.has_template_unlock(uuid, text) to authenticated, service_role;

-- Owners set passwords through a server action with their own session; anon never needs this.
revoke execute on function public.set_gift_password(uuid, text) from anon;
