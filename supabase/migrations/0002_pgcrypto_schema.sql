-- pgcrypto lives in the `extensions` schema on Supabase. Our SECURITY DEFINER functions pin
-- search_path to public for safety, so crypt()/gen_salt() must be schema-qualified.

create or replace function public.get_public_gift(p_short_id text, p_password text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  g          public.gifts%rowtype;
  v_unlocked boolean;
  v_needs_pw boolean;
  v_pw_ok    boolean;
begin
  select * into g from public.gifts
  where short_id = p_short_id and status in ('live', 'scheduled');
  if not found then
    return null;
  end if;

  v_unlocked := g.unlock_at is null or g.unlock_at <= now();
  v_needs_pw := g.password_hash is not null;
  v_pw_ok    := (not v_needs_pw)
                or (p_password is not null and g.password_hash = extensions.crypt(p_password, g.password_hash));

  return jsonb_build_object(
    'id',               g.id,
    'shortId',          g.short_id,
    'templateSlug',     g.template_slug,
    'locale',           g.locale,
    'status',           g.status,
    'unlockAt',         g.unlock_at,
    'timezone',         g.timezone,
    'watermark',        g.watermark,
    'unlocked',         v_unlocked,
    'requiresPassword', v_needs_pw,
    'passwordOk',       v_pw_ok,
    'recipientName',    g.data ->> 'recipientName',
    'senderName',       g.data ->> 'senderName',
    'data',             case when v_unlocked and v_pw_ok then g.data else null end
  );
end $$;

create or replace function public.set_gift_password(p_gift_id uuid, p_password text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.gifts
  set password_hash = case
    when p_password is null or length(trim(p_password)) = 0 then null
    else extensions.crypt(p_password, extensions.gen_salt('bf', 10))
  end
  where id = p_gift_id and user_id = auth.uid();
  if not found then
    raise exception 'gift not found or not owned' using errcode = '42501';
  end if;
end $$;
