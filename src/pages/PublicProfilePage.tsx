import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { Profile, SocialLink, Service, PortfolioItem, UserSession } from '../types/database';
import { ProfileRenderer } from '../components/templates/ProfileRenderer';
import { Lock, ArrowLeft, Search, EyeOff, LayoutDashboard, Globe, AlertCircle, RefreshCw } from 'lucide-react';

interface PublicProfilePageProps {
  username: string;
  session: UserSession;
  onNavigate: (path: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ username, session, onNavigate }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnpublished, setIsUnpublished] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const cleanUsername = (username || '').replace(/^@/, '').replace(/\/+$/, '').toLowerCase().trim();

  const loadProfile = async () => {
    setLoading(true);
    setIsUnpublished(false);
    setIsNotFound(false);
    setErrorMessage(null);

    // Basic format check
    if (!/^[a-z0-9-]{3,30}$/.test(cleanUsername)) {
      setIsNotFound(true);
      setLoading(false);
      return;
    }

    try {
      console.log(`[PublicProfilePage] Loading public profile for "${cleanUsername}"...`);
      const { data: p, error } = await db.getProfileByUsername(cleanUsername);

      // If Supabase returned an explicit query error (network issue, server error, etc.)
      if (error) {
        console.error('[PublicProfilePage] Supabase error fetching profile:', error);
        setErrorMessage(error.message || 'Unable to connect to the database. Please try again.');
        setLoading(false);
        return;
      }

      // If no profile was returned by the query
      if (!p) {
        console.log(`[PublicProfilePage] Profile query returned null for "${cleanUsername}". Checking if username is registered...`);
        // Check if the username is taken in Supabase (which means it exists, but is unpublished/restricted by RLS)
        const check = await db.checkUsernameAvailable(cleanUsername);
        
        if (!check.available && !check.isError) {
          // The username exists in the profiles table, but the public SELECT query didn't return it
          // This confirms the profile is unpublished (is_published = false)
          console.log(`[PublicProfilePage] Username "${cleanUsername}" exists in database, but is unpublished.`);
          setIsUnpublished(true);
          setLoading(false);
          return;
        }

        // The username does not exist in the database
        console.log(`[PublicProfilePage] Username "${cleanUsername}" does not exist in database.`);
        setIsNotFound(true);
        setLoading(false);
        return;
      }

      // Profile was found!
      const isOwner = Boolean(session.user && session.user.id === p.user_id);

      // Check if unpublished and viewer is NOT the owner
      if (!p.is_published && !isOwner) {
        setIsUnpublished(true);
        setProfile(p);
        setLoading(false);
        return;
      }

      setProfile(p);
      document.title = `${p.display_name || p.username} | PROFILE.DJ`;

      const [links, svcs, port] = await Promise.all([
        db.getSocialLinks(p.id),
        db.getServices(p.id),
        db.getPortfolio(p.id),
      ]);

      setSocialLinks(links);
      setServices(svcs);
      setPortfolio(port);

      // Record anonymous page view for published profiles
      if (p.is_published) {
        db.recordAnalyticsEvent(p.id, 'profile_view', { path: `/${cleanUsername}` });
      }
    } catch (err: unknown) {
      console.error('[PublicProfilePage] Unexpected error loading profile:', err);
      setErrorMessage((err as Error).message || 'An unexpected error occurred while loading this profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [cleanUsername, session.user?.id]);

  // Handle owner publishing directly from the owner preview banner
  const handlePublishNow = async () => {
    if (!profile) return;
    setIsPublishing(true);
    try {
      const updated = await db.updateProfile(profile.id, { is_published: true });
      setProfile(updated);
      setIsUnpublished(false);
    } catch (err) {
      console.error('Failed to publish profile:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
        <span className="text-xs text-neutral-400 font-mono tracking-wider">Loading profile.dj/{cleanUsername}...</span>
      </div>
    );
  }

  // 1. Connection or Database Error Screen (not 404!)
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#141518] border border-red-500/20 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-display font-bold tracking-tight">
            Connection Issue
          </h2>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={loadProfile}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Profile is unpublished and viewer is NOT owner
  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#141518] border border-white/10 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-display font-bold tracking-tight">
            Profile is Private
          </h2>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            The profile <span className="font-mono text-neutral-300">@{cleanUsername}</span> is currently unpublished by its owner.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              Explore Profiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Profile Not Found (404)
  if (isNotFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#141518] border border-white/10 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-display font-bold tracking-tight">
            Profile Not Found
          </h2>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            The profile <span className="font-mono text-neutral-300">@{cleanUsername}</span> does not exist on PROFILE.DJ. Please verify the URL or explore our directory.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              Explore Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(session.user && session.user.id === profile.user_id);

  return (
    <div className="relative">
      {/* Owner preview banner if profile is unpublished */}
      {isOwner && !profile.is_published && (
        <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>Unpublished Draft Mode — Only you can see this profile right now.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishNow}
              disabled={isPublishing}
              className="flex items-center gap-1.5 px-3 py-1 bg-black text-amber-400 rounded-lg text-[11px] font-bold hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing…' : 'Publish to Web'}</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1 px-2.5 py-1 bg-black/10 text-slate-950 border border-black/20 rounded-lg text-[11px] font-semibold hover:bg-black/20 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      )}

      <ProfileRenderer
        profile={profile}
        socialLinks={socialLinks}
        services={services}
        portfolio={portfolio}
        isPreview={false}
      />
    </div>
  );
};
