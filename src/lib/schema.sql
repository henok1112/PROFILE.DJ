-- ================================================================
-- PROFILE.DJ - Complete Production Supabase Database Schema
-- Multi-User Digital Profile Platform
-- ================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  profile_photo_url text,
  cover_photo_url text,
  headline text not null default '',
  bio text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  website text not null default '',
  location text not null default '',
  theme text not null default 'amber',
  template text not null default 'minimal',
  button_style text not null default 'rounded',
  background_style text not null default 'subtle-mesh',
  is_published boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_format check (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
    and username not like '%--%'
  )
);

-- Performance and lookup indexes
create index if not exists idx_profiles_username on public.profiles(lower(username));
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_published on public.profiles(is_published);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);

-- SECURE USERNAME AVAILABILITY RPC FUNCTION
-- Enables instant availability checks without exposing private profile rows
create or replace function public.check_username_available(check_username text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_user text;
  is_taken boolean;
begin
  clean_user := lower(trim(check_username));
  if clean_user is null or length(clean_user) < 3 or length(clean_user) > 30 then
    return false;
  end if;

  if clean_user !~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$' or clean_user like '%--%' then
    return false;
  end if;

  -- Security Hardening: Reserved system routes and namespaces
  if clean_user in (
    'admin', 'administrator', 'api', 'app', 'auth', 'dashboard', 'login', 'logout',
    'signup', 'register', 'settings', 'profile', 'profiles', 'explore', 'help',
    'support', 'about', 'contact', 'privacy', 'terms', 'pricing', 'discover',
    'search', 'create', 'edit', 'new', 'share', 'onboarding'
  ) then
    return false;
  end if;

  select exists(
    select 1 from public.profiles
    where lower(username) = clean_user
  ) into is_taken;

  return not is_taken;
end;
$$;

grant execute on function public.check_username_available(text) to anon, authenticated;

-- 3. SOCIAL LINKS TABLE
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_social_links_profile on public.social_links(profile_id, display_order);

-- 4. SERVICES TABLE
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  price text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_services_profile on public.services(profile_id, display_order);

-- 5. PORTFOLIO ITEMS TABLE
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  image_url text not null,
  project_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_portfolio_items_profile on public.portfolio_items(profile_id, display_order);

-- 6. ANALYTICS EVENTS TABLE
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  event_type text not null check (event_type in ('profile_view', 'link_click', 'contact_save', 'share')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_analytics_profile_event on public.analytics_events(profile_id, event_type);
create index if not exists idx_analytics_created_at on public.analytics_events(profile_id, created_at desc);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.analytics_events enable row level security;

-- PROFILES POLICIES
-- Drop existing policies if re-running
drop policy if exists "Public can view published profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Public can view published profiles"
  on public.profiles for select
  using (is_published = true);

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- SOCIAL LINKS POLICIES
drop policy if exists "Public can view visible social links" on public.social_links;
drop policy if exists "Users can view own social links" on public.social_links;
drop policy if exists "Users can insert own social links" on public.social_links;
drop policy if exists "Users can update own social links" on public.social_links;
drop policy if exists "Users can delete own social links" on public.social_links;

create policy "Public can view visible social links"
  on public.social_links for select
  using (
    is_visible = true and
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.is_published = true
    )
  );

create policy "Users can view own social links"
  on public.social_links for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert own social links"
  on public.social_links for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can update own social links"
  on public.social_links for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete own social links"
  on public.social_links for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- SERVICES POLICIES
drop policy if exists "Public can view visible services" on public.services;
drop policy if exists "Users can view own services" on public.services;
drop policy if exists "Users can insert own services" on public.services;
drop policy if exists "Users can update own services" on public.services;
drop policy if exists "Users can delete own services" on public.services;

create policy "Public can view visible services"
  on public.services for select
  using (
    is_visible = true and
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.is_published = true
    )
  );

create policy "Users can view own services"
  on public.services for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert own services"
  on public.services for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can update own services"
  on public.services for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete own services"
  on public.services for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- PORTFOLIO POLICIES
drop policy if exists "Public can view visible portfolio" on public.portfolio_items;
drop policy if exists "Users can view own portfolio" on public.portfolio_items;
drop policy if exists "Users can insert own portfolio" on public.portfolio_items;
drop policy if exists "Users can update own portfolio" on public.portfolio_items;
drop policy if exists "Users can delete own portfolio" on public.portfolio_items;

create policy "Public can view visible portfolio"
  on public.portfolio_items for select
  using (
    is_visible = true and
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.is_published = true
    )
  );

create policy "Users can view own portfolio"
  on public.portfolio_items for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert own portfolio"
  on public.portfolio_items for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can update own portfolio"
  on public.portfolio_items for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete own portfolio"
  on public.portfolio_items for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- ANALYTICS EVENTS POLICIES
drop policy if exists "Anyone can record analytics on published profiles" on public.analytics_events;
drop policy if exists "Owners can view own analytics" on public.analytics_events;

create policy "Anyone can record analytics on published profiles"
  on public.analytics_events for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = analytics_events.profile_id
      and profiles.is_published = true
    )
  );

create policy "Owners can view own analytics"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = analytics_events.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- ================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ================================================================

insert into storage.buckets (id, name, public)
values ('profiles_media', 'profiles_media', true)
on conflict (id) do nothing;

drop policy if exists "Public Access to Profile Media" on storage.objects;
drop policy if exists "Users can upload own media" on storage.objects;
drop policy if exists "Users can update own media" on storage.objects;
drop policy if exists "Users can delete own media" on storage.objects;

-- Public object retrieval is served directly via Supabase public URLs (bucket is public = true).
-- Authenticated users can list and select their own uploaded objects in storage.objects.
create policy "Authenticated users can select own media"
  on storage.objects for select
  using (
    bucket_id = 'profiles_media' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can ONLY upload to their own user-scoped directory: profiles_media/<uid>/...
create policy "Users can upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'profiles_media' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own media"
  on storage.objects for update
  using (
    bucket_id = 'profiles_media' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'profiles_media' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Trigger to auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
