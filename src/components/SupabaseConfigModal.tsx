import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, Terminal, AlertTriangle, Key } from 'lucide-react';
import { isSupabaseConfigured, updateRuntimeSupabaseConfig } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState(() => localStorage.getItem('profile_dj_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('profile_dj_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- ================================================================
-- PROFILE.DJ - Complete Production Supabase Database Schema
-- Run in your Supabase SQL Editor
-- ================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE
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

create index if not exists idx_profiles_username on public.profiles(lower(username));
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_published on public.profiles(is_published);

-- Secure RPC for instant username availability check without leaking private fields
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

-- 2. SOCIAL LINKS TABLE
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

-- 3. SERVICES TABLE
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

-- 4. PORTFOLIO ITEMS TABLE
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

-- 5. ANALYTICS EVENTS TABLE
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  event_type text not null check (event_type in ('profile_view', 'link_click', 'contact_save', 'share')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_analytics_profile_event on public.analytics_events(profile_id, event_type);

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.analytics_events enable row level security;

-- Profiles Policies
create policy "Public can view published profiles" on public.profiles for select using (is_published = true);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = user_id);

-- Social Links Policies
create policy "Public can view visible social links" on public.social_links for select using (is_visible = true and exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.is_published = true));
create policy "Users can view own social links" on public.social_links for select using (exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.user_id = auth.uid()));
create policy "Users can insert own social links" on public.social_links for insert with check (exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.user_id = auth.uid()));
create policy "Users can update own social links" on public.social_links for update using (exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.user_id = auth.uid())) with check (exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.user_id = auth.uid()));
create policy "Users can delete own social links" on public.social_links for delete using (exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.user_id = auth.uid()));

-- Services Policies
create policy "Public can view visible services" on public.services for select using (is_visible = true and exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.is_published = true));
create policy "Users can view own services" on public.services for select using (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.user_id = auth.uid()));
create policy "Users can insert own services" on public.services for insert with check (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.user_id = auth.uid()));
create policy "Users can update own services" on public.services for update using (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.user_id = auth.uid())) with check (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.user_id = auth.uid()));
create policy "Users can delete own services" on public.services for delete using (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.user_id = auth.uid()));

-- Portfolio Policies
create policy "Public can view visible portfolio" on public.portfolio_items for select using (is_visible = true and exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.is_published = true));
create policy "Users can view own portfolio" on public.portfolio_items for select using (exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.user_id = auth.uid()));
create policy "Users can insert own portfolio" on public.portfolio_items for insert with check (exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.user_id = auth.uid()));
create policy "Users can update own portfolio" on public.portfolio_items for update using (exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.user_id = auth.uid())) with check (exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.user_id = auth.uid()));
create policy "Users can delete own portfolio" on public.portfolio_items for delete using (exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.user_id = auth.uid()));

-- Analytics Policies
create policy "Anyone can record analytics" on public.analytics_events for insert with check (exists (select 1 from public.profiles where profiles.id = analytics_events.profile_id and profiles.is_published = true));
create policy "Owners can view own analytics" on public.analytics_events for select using (exists (select 1 from public.profiles where profiles.id = analytics_events.profile_id and profiles.user_id = auth.uid()));

-- 7. STORAGE BUCKET & RLS
insert into storage.buckets (id, name, public) values ('profiles_media', 'profiles_media', true) on conflict (id) do nothing;
create policy "Public Access to Profile Media" on storage.objects for select using (bucket_id = 'profiles_media');
create policy "Users can upload own media" on storage.objects for insert with check (bucket_id = 'profiles_media' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own media" on storage.objects for update using (bucket_id = 'profiles_media' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own media" on storage.objects for delete using (bucket_id = 'profiles_media' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
`;

  const copySql = async () => {
    await navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyRuntimeConfig = () => {
    if (!manualUrl.trim() || !manualKey.trim()) {
      setSaveStatus('Please enter both Supabase URL and Anon Key');
      return;
    }
    if (!manualUrl.startsWith('https://')) {
      setSaveStatus('Supabase URL must start with https://');
      return;
    }
    updateRuntimeSupabaseConfig(manualUrl, manualKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#141517] border border-white/10 p-6 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Supabase Technical Audit & Setup</h3>
              <p className="text-xs text-neutral-400">
                {isSupabaseConfigured ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Connected to live Supabase backend
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Supabase credentials required for live DB & Auth
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Required variables card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200">Required Environment Variables:</span>
              <span className="text-[11px] font-mono text-neutral-400">.env</span>
            </div>
            <div className="font-mono bg-black/50 p-3 rounded-xl border border-white/5 text-[11px] text-amber-300 space-y-1">
              <div>VITE_SUPABASE_URL="https://your-project-id.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."</div>
            </div>
          </div>

          {/* Quick runtime connector */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-neutral-200">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Connect Live Supabase Project Now</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              You can connect your live Supabase database directly by pasting your Project URL and Anon Public Key below:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1Ni... (Anon Key)"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-amber-400"
              />
            </div>

            {saveStatus && (
              <p className="text-[11px] text-rose-400 font-medium">{saveStatus}</p>
            )}

            <button
              onClick={handleApplyRuntimeConfig}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Save & Connect Supabase
            </button>
          </div>

          {/* SQL Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>PostgreSQL Schema & Hardened RLS Script</span>
              </div>
              <button
                onClick={copySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded-2xl border border-white/10 text-neutral-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
              {sqlSchemaSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
