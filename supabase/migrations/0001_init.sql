-- Ethos — initial schema
-- Conventions: snake_case, timestamptz everywhere, RLS on every table, public access
-- only through SECURITY DEFINER functions that return a deliberately narrow shape.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles (mirror of auth.users with app-level fields)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  name          text,
  locale        text not null default 'en' check (locale in ('en', 'es')),
  referral_code text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, locale)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when new.raw_user_meta_data ->> 'locale' in ('en', 'es') then new.raw_user_meta_data ->> 'locale' else 'en' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- gifts
-- ---------------------------------------------------------------------------
create type public.gift_status as enum ('draft', 'scheduled', 'live', 'archived');

create table public.gifts (
  id            uuid primary key default gen_random_uuid(),
  short_id      text not null unique,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  template_slug text not null,
  data          jsonb not null default '{}'::jsonb,
  status        public.gift_status not null default 'draft',
  is_premium    boolean not null default false,
  watermark     boolean not null default true,
  password_hash text,
  unlock_at     timestamptz,
  timezone      text,
  locale        text not null default 'en' check (locale in ('en', 'es')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index gifts_user_idx on public.gifts (user_id, created_at desc);
create index gifts_scheduled_idx on public.gifts (unlock_at) where status = 'scheduled';

create trigger gifts_updated_at before update on public.gifts
  for each row execute function public.set_updated_at();

alter table public.gifts enable row level security;

-- Owners can do everything. There is intentionally NO anon select policy: recipients read
-- through get_public_gift() which strips password_hash and enforces unlock time.
create policy "gifts: owner all" on public.gifts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- gift_assets
-- ---------------------------------------------------------------------------
create table public.gift_assets (
  id         uuid primary key default gen_random_uuid(),
  gift_id    uuid not null references public.gifts (id) on delete cascade,
  type       text not null check (type in ('photo', 'audio', 'video')),
  path       text not null,
  "order"    integer not null default 0,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index gift_assets_gift_idx on public.gift_assets (gift_id, "order");

alter table public.gift_assets enable row level security;

create policy "gift_assets: owner all" on public.gift_assets
  for all
  using (exists (select 1 from public.gifts g where g.id = gift_id and g.user_id = auth.uid()))
  with check (exists (select 1 from public.gifts g where g.id = gift_id and g.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- gift_views  (one row per open; unique viewers = distinct viewer_hash)
-- ---------------------------------------------------------------------------
create table public.gift_views (
  id          uuid primary key default gen_random_uuid(),
  gift_id     uuid not null references public.gifts (id) on delete cascade,
  viewer_hash text not null,
  opened_at   timestamptz not null default now(),
  watch_pct   smallint not null default 0 check (watch_pct between 0 and 100),
  device      text
);

create index gift_views_gift_idx on public.gift_views (gift_id, opened_at desc);

alter table public.gift_views enable row level security;

create policy "gift_views: owner read" on public.gift_views
  for select using (exists (select 1 from public.gifts g where g.id = gift_id and g.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- reactions
-- ---------------------------------------------------------------------------
create table public.reactions (
  id         uuid primary key default gen_random_uuid(),
  gift_id    uuid not null references public.gifts (id) on delete cascade,
  emoji      text not null check (char_length(emoji) between 1 and 16),
  text       text check (char_length(text) <= 1000),
  audio_path text,
  created_at timestamptz not null default now()
);

create index reactions_gift_idx on public.reactions (gift_id, created_at desc);

alter table public.reactions enable row level security;

create policy "reactions: owner read" on public.reactions
  for select using (exists (select 1 from public.gifts g where g.id = gift_id and g.user_id = auth.uid()));
create policy "reactions: owner delete" on public.reactions
  for delete using (exists (select 1 from public.gifts g where g.id = gift_id and g.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- purchases + template_unlocks
-- ---------------------------------------------------------------------------
create type public.purchase_status as enum ('pending', 'paid', 'refunded');

create table public.purchases (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  stripe_session_id        text unique,
  stripe_payment_intent_id text,
  product                  text not null,                 -- 'single' | 'pick3' | 'everything'
  template_slugs           text[] not null default '{}',  -- what the buyer picked
  amount                   integer not null,              -- minor units
  currency                 text not null default 'usd',
  status                   public.purchase_status not null default 'pending',
  created_at               timestamptz not null default now()
);

create index purchases_user_idx on public.purchases (user_id, created_at desc);

alter table public.purchases enable row level security;
create policy "purchases: owner read" on public.purchases for select using (auth.uid() = user_id);

-- template_slug = '*' means "Everything" (all current and future templates).
create table public.template_unlocks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  template_slug text not null,
  purchase_id   uuid references public.purchases (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (user_id, template_slug)
);

alter table public.template_unlocks enable row level security;
create policy "template_unlocks: owner read" on public.template_unlocks for select using (auth.uid() = user_id);

create or replace function public.has_template_unlock(p_user uuid, p_slug text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.template_unlocks
    where user_id = p_user and (template_slug = p_slug or template_slug = '*')
  );
$$;

-- ---------------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------------
create table public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid references public.profiles (id) on delete set null,
  gift_id          uuid references public.gifts (id) on delete set null,
  created_at       timestamptz not null default now()
);

alter table public.referrals enable row level security;
create policy "referrals: referrer read" on public.referrals for select using (auth.uid() = referrer_user_id);

-- ---------------------------------------------------------------------------
-- Public (recipient) access. All SECURITY DEFINER, all narrow.
-- ---------------------------------------------------------------------------

-- Returns null when the gift does not exist or is not shareable.
-- `data` is only included once the gift is unlocked AND the password (if any) matched.
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

revoke all on function public.get_public_gift(text, text) from public;
grant execute on function public.get_public_gift(text, text) to anon, authenticated, service_role;

-- Owner sets / clears the password. Hashing happens in the database so the plaintext
-- never has to be stored anywhere else.
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

revoke all on function public.set_gift_password(uuid, text) from public;
grant execute on function public.set_gift_password(uuid, text) to authenticated, service_role;

-- Recipient opened the gift. Returns the view id so progress can be reported later.
create or replace function public.record_gift_view(p_short_id text, p_viewer_hash text, p_device text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_gift_id uuid;
  v_view_id uuid;
begin
  select id into v_gift_id from public.gifts
  where short_id = p_short_id and status = 'live' and (unlock_at is null or unlock_at <= now());
  if v_gift_id is null then
    return null;
  end if;
  insert into public.gift_views (gift_id, viewer_hash, device)
  values (v_gift_id, left(p_viewer_hash, 64), left(p_device, 32))
  returning id into v_view_id;
  return v_view_id;
end $$;

revoke all on function public.record_gift_view(text, text, text) from public;
grant execute on function public.record_gift_view(text, text, text) to anon, authenticated, service_role;

create or replace function public.update_gift_view_progress(p_view_id uuid, p_pct integer)
returns void language sql security definer set search_path = public as $$
  update public.gift_views
  set watch_pct = greatest(watch_pct, least(100, greatest(0, p_pct)))
  where id = p_view_id;
$$;

revoke all on function public.update_gift_view_progress(uuid, integer) from public;
grant execute on function public.update_gift_view_progress(uuid, integer) to anon, authenticated, service_role;

-- Recipient reaction. Voice notes are uploaded by the server (rate limited) and the
-- resulting path is passed here.
create or replace function public.add_reaction(p_short_id text, p_emoji text, p_text text default null, p_audio_path text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_gift_id uuid;
  v_id      uuid;
begin
  select id into v_gift_id from public.gifts
  where short_id = p_short_id and status = 'live' and (unlock_at is null or unlock_at <= now());
  if v_gift_id is null then
    raise exception 'gift not available' using errcode = 'P0002';
  end if;
  insert into public.reactions (gift_id, emoji, text, audio_path)
  values (v_gift_id, p_emoji, nullif(left(p_text, 1000), ''), p_audio_path)
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.add_reaction(text, text, text, text) from public;
grant execute on function public.add_reaction(text, text, text, text) to anon, authenticated, service_role;

-- Owner-facing aggregate for the dashboard.
create or replace view public.gift_stats with (security_invoker = true) as
select
  g.id as gift_id,
  count(v.id)                        as opens,
  count(distinct v.viewer_hash)      as unique_viewers,
  coalesce(avg(v.watch_pct), 0)::int as avg_watch_pct,
  (select count(*) from public.reactions r where r.gift_id = g.id) as reactions,
  max(v.opened_at)                   as last_opened_at
from public.gifts g
left join public.gift_views v on v.gift_id = g.id
group by g.id;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gifts', 'gifts', false, 62914560, array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]),
  ('reactions', 'reactions', false, 5242880, array[
    'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav'
  ])
on conflict (id) do nothing;

-- Objects live at gifts/{gift_id}/{file}. Owners manage their own gift folders.
create policy "gifts bucket: owner manage" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'gifts'
    and exists (
      select 1 from public.gifts g
      where g.id::text = (storage.foldername(name))[1] and g.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'gifts'
    and exists (
      select 1 from public.gifts g
      where g.id::text = (storage.foldername(name))[1] and g.user_id = auth.uid()
    )
  );

-- Reactions are written by the server (service role). Owners may read/delete them.
create policy "reactions bucket: owner read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reactions'
    and exists (
      select 1 from public.gifts g
      where g.id::text = (storage.foldername(name))[1] and g.user_id = auth.uid()
    )
  );
