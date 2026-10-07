import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Profile, SocialLink, Service, PortfolioItem } from '../types/database';
import { INITIAL_PROFILES, INITIAL_SOCIAL_LINKS, INITIAL_SERVICES, INITIAL_PORTFOLIO } from './defaultData';

// 1. ENVIRONMENT CONFIGURATION
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime override via Setup Modal for easy live testing in AI Studio
function getRuntimeConfig(): { url: string; key: string } {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('profile_dj_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('profile_dj_supabase_key') || '' : '';

  const url = envSupabaseUrl || storedUrl;
  const key = envSupabaseAnonKey || storedKey;
  return { url, key };
}

const activeConfig = getRuntimeConfig();

export const isSupabaseConfigured = Boolean(
  activeConfig.url &&
  activeConfig.key &&
  activeConfig.url.startsWith('https://') &&
  !activeConfig.url.includes('placeholder') &&
  activeConfig.key.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(activeConfig.url, activeConfig.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function updateRuntimeSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('profile_dj_supabase_url', url.trim());
    localStorage.setItem('profile_dj_supabase_key', key.trim());
  } else {
    localStorage.removeItem('profile_dj_supabase_url');
    localStorage.removeItem('profile_dj_supabase_key');
  }
  window.location.reload();
}

// 2. URL SANITIZATION & SECURITY
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Disallow javascript: data: vbscript: etc.
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// 3. AUTHENTICATION SERVICE (Pure Supabase Auth)
export const auth = {
  async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to create accounts.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err: unknown) {
      return { user: null, session: null, error: err as Error };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sign in.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err: unknown) {
      return { user: null, session: null, error: err as Error };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  },

  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return { session: null, user: null };
    }
    const { data } = await supabase.auth.getSession();
    return { session: data.session, user: data.session?.user || null };
  },

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void {
    if (!isSupabaseConfigured || !supabase) {
      callback(null, null);
      return () => {};
    }

    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      callback(data.session?.user || null, data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  },
};

// 4. DATABASE & PROFILE ACCESS LAYER
export const db = {
  // Fetch a public or owned profile
  async getProfileByUsername(username: string): Promise<{ data: Profile | null; error: any }> {
    const cleanUsername = (username || '').replace(/^@/, '').replace(/\/+$/, '').toLowerCase().trim();
    if (!cleanUsername) return { data: null, error: null };

    if (isSupabaseConfigured && supabase) {
      console.log(`[Supabase Query] getProfileByUsername searching username: "${cleanUsername}"`);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      console.log(`[Supabase Response] getProfileByUsername for "${cleanUsername}":`, { data, error });

      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        return { data: null, error };
      }
      return { data: data as Profile | null, error: null };
    }

    // If Supabase is unconfigured, return demo preview profile if matching demo handles
    const demo = INITIAL_PROFILES.find(p => p.username.toLowerCase() === cleanUsername);
    return { data: demo || null, error: null };
  },

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    if (!userId) return null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile by user_id:', error);
        return null;
      }
      return data as Profile | null;
    }

    return null;
  },

  // Check username availability against REAL Supabase profiles table
  async checkUsernameAvailable(username: string, currentUserId?: string): Promise<{ available: boolean; isError?: boolean; reason?: string }> {
    const clean = (username || '').toLowerCase().trim();

    if (!clean || clean.length < 3) {
      return { available: false, isError: false, reason: 'Username must be at least 3 characters.' };
    }
    if (clean.length > 30) {
      return { available: false, isError: false, reason: 'Username cannot exceed 30 characters.' };
    }
    if (!/^[a-z0-9-]+$/.test(clean)) {
      return { available: false, isError: false, reason: 'Only lowercase letters, numbers, and hyphens are allowed.' };
    }
    if (clean.startsWith('-')) {
      return { available: false, isError: false, reason: 'Username cannot start with a hyphen.' };
    }
    if (clean.endsWith('-')) {
      return { available: false, isError: false, reason: 'Username cannot end with a hyphen.' };
    }
    if (clean.includes('--')) {
      return { available: false, isError: false, reason: 'Username cannot contain consecutive hyphens.' };
    }

    const reserved = [
      'admin', 'administrator', 'api', 'app', 'auth', 'dashboard', 'login', 'logout',
      'signup', 'register', 'settings', 'profile', 'profiles', 'explore', 'help',
      'support', 'about', 'contact', 'privacy', 'terms', 'pricing', 'discover',
      'search', 'create', 'edit', 'new', 'share', 'onboarding'
    ];
    if (reserved.includes(clean)) {
      return { available: false, isError: false, reason: '✕ This username is reserved by the system' };
    }

    if (isSupabaseConfigured && supabase) {
      // 1. Try secure Postgres RPC function first
      try {
        const { data: rpcAvailable, error: rpcError } = await supabase.rpc('check_username_available', {
          check_username: clean,
        });

        if (!rpcError && typeof rpcAvailable === 'boolean') {
          if (!rpcAvailable) {
            // Check if it belongs to current user
            if (currentUserId) {
              const { data: ownCheck } = await supabase
                .from('profiles')
                .select('user_id')
                .ilike('username', clean)
                .limit(1);
              if (ownCheck && ownCheck.length > 0 && ownCheck[0].user_id === currentUserId) {
                return { available: true, isError: false };
              }
            }
            return { available: false, isError: false, reason: '✕ This username is already taken' };
          }
          return { available: true, isError: false };
        }
      } catch {
        // Fall back to table query below if RPC is not provisioned
      }

      // 2. Direct table check on profiles
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, username')
          .ilike('username', clean)
          .limit(1);

        if (error) {
          console.error('Username check query error:', error);
          return {
            available: false,
            isError: true,
            reason: "⚠ We couldn't check availability right now. Please try again.",
          };
        }

        if (data && data.length > 0) {
          if (currentUserId && data[0].user_id === currentUserId) {
            return { available: true, isError: false };
          }
          return { available: false, isError: false, reason: '✕ This username is already taken' };
        }

        return { available: true, isError: false };
      } catch (err) {
        console.error('Username check error:', err);
        return {
          available: false,
          isError: true,
          reason: "⚠ We couldn't check availability right now. Please try again.",
        };
      }
    }

    // Demo showcase fallback when Supabase is running in local showcase mode
    const demo = INITIAL_PROFILES.find(p => p.username.toLowerCase() === clean);
    if (demo) {
      return { available: false, isError: false, reason: '✕ This username is already taken' };
    }
    return { available: true, isError: false };
  },

  // Explore: Query REAL published profiles only
  async getPublishedProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching published profiles:', error);
        return [];
      }
      return (data || []) as Profile[];
    }

    // In unconfigured state, show default showcase profiles
    return INITIAL_PROFILES.filter(p => p.is_published);
  },

  // Create Profile in Supabase
  async createProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please connect your Supabase project in Settings.');
    }

    const cleanUsername = profileData.username.toLowerCase().trim();

    // Prevent duplicate profile rows if profile already exists for this user_id
    const existing = await this.getProfileByUserId(profileData.user_id);
    if (existing) {
      return this.updateProfile(existing.id, {
        ...profileData,
        username: cleanUsername,
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...profileData,
        username: cleanUsername,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase profile insertion error:', error);
      throw error;
    }

    return data as Profile;
  },

  // Update Profile with RLS protection
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Supabase profile update error:', error);
      throw error;
    }

    return data as Profile;
  },

  // Social Links
  async getSocialLinks(profileId: string): Promise<SocialLink[]> {
    if (!profileId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching social links:', error);
        return [];
      }
      return (data || []) as SocialLink[];
    }

    return INITIAL_SOCIAL_LINKS.filter(l => l.profile_id === profileId);
  },

  async saveSocialLinks(profileId: string, links: Omit<SocialLink, 'profile_id'>[]): Promise<SocialLink[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Sanitize URLs before persisting
    const formatted = links.map((l, idx) => ({
      ...l,
      profile_id: profileId,
      url: sanitizeUrl(l.url),
      display_order: idx,
    }));

    // Clean delete existing links for this profile
    const { error: deleteError } = await supabase
      .from('social_links')
      .delete()
      .eq('profile_id', profileId);

    if (deleteError) {
      console.error('Error clearing old social links:', deleteError);
      throw deleteError;
    }

    if (formatted.length === 0) return [];

    const { data, error: insertError } = await supabase
      .from('social_links')
      .insert(formatted)
      .select();

    if (insertError) {
      console.error('Error inserting social links:', insertError);
      throw insertError;
    }

    return (data || []) as SocialLink[];
  },

  // Services
  async getServices(profileId: string): Promise<Service[]> {
    if (!profileId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }
      return (data || []) as Service[];
    }

    return INITIAL_SERVICES.filter(s => s.profile_id === profileId);
  },

  async saveServices(profileId: string, services: Omit<Service, 'profile_id'>[]): Promise<Service[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const formatted = services.map((s, idx) => ({
      ...s,
      profile_id: profileId,
      display_order: idx,
    }));

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('profile_id', profileId);

    if (deleteError) {
      console.error('Error clearing old services:', deleteError);
      throw deleteError;
    }

    if (formatted.length === 0) return [];

    const { data, error: insertError } = await supabase
      .from('services')
      .insert(formatted)
      .select();

    if (insertError) {
      console.error('Error inserting services:', insertError);
      throw insertError;
    }

    return (data || []) as Service[];
  },

  // Portfolio Items
  async getPortfolio(profileId: string): Promise<PortfolioItem[]> {
    if (!profileId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching portfolio items:', error);
        return [];
      }
      return (data || []) as PortfolioItem[];
    }

    return INITIAL_PORTFOLIO.filter(p => p.profile_id === profileId);
  },

  async savePortfolio(profileId: string, items: Omit<PortfolioItem, 'profile_id'>[]): Promise<PortfolioItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const formatted = items.map((item, idx) => ({
      ...item,
      profile_id: profileId,
      project_url: item.project_url ? sanitizeUrl(item.project_url) : '',
      display_order: idx,
    }));

    const { error: deleteError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('profile_id', profileId);

    if (deleteError) {
      console.error('Error clearing old portfolio items:', deleteError);
      throw deleteError;
    }

    if (formatted.length === 0) return [];

    const { data, error: insertError } = await supabase
      .from('portfolio_items')
      .insert(formatted)
      .select();

    if (insertError) {
      console.error('Error inserting portfolio items:', insertError);
      throw insertError;
    }

    return (data || []) as PortfolioItem[];
  },

  // Supabase Storage upload with file validation and user-scoping
  async uploadMedia(file: File, folder: 'avatars' | 'covers' | 'portfolio', userId: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase Storage is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to upload media.');
    }

    if (!userId) {
      throw new Error('User authentication is required to upload media.');
    }

    // 1. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds the 5MB limit. Please upload a smaller image.');
    }

    // 2. Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid image format. Supported formats: JPG, PNG, WebP, GIF.');
    }

    // 3. User-scoped storage path adhering to RLS: profiles_media/<userId>/<folder>/<timestamp>_<cleanName>
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanBase = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20);
    const fileName = `${userId}/${folder}/${Date.now()}_${cleanBase}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles_media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profiles_media')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public URL for uploaded media.');
    }

    return data.publicUrl;
  },

  // Analytics event recording
  async recordAnalyticsEvent(profileId: string, eventType: 'profile_view' | 'link_click' | 'contact_save' | 'share', metadata: Record<string, any> = {}): Promise<void> {
    if (!isSupabaseConfigured || !supabase || !profileId) return;

    try {
      await supabase
        .from('analytics_events')
        .insert([{
          profile_id: profileId,
          event_type: eventType,
          metadata,
        }]);
    } catch (err) {
      // Non-blocking telemetry
      console.warn('Analytics event record skipped:', err);
    }
  },

  // Owner analytics query
  async getProfileAnalytics(profileId: string): Promise<{ views: number; clicks: number; contactSaves: number; shares: number }> {
    if (!isSupabaseConfigured || !supabase || !profileId) {
      return { views: 0, clicks: 0, contactSaves: 0, shares: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type')
        .eq('profile_id', profileId);

      if (error || !data) return { views: 0, clicks: 0, contactSaves: 0, shares: 0 };

      const stats = { views: 0, clicks: 0, contactSaves: 0, shares: 0 };
      data.forEach(evt => {
        if (evt.event_type === 'profile_view') stats.views++;
        else if (evt.event_type === 'link_click') stats.clicks++;
        else if (evt.event_type === 'contact_save') stats.contactSaves++;
        else if (evt.event_type === 'share') stats.shares++;
      });
      return stats;
    } catch {
      return { views: 0, clicks: 0, contactSaves: 0, shares: 0 };
    }
  },
};
