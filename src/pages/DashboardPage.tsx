import React, { useState, useEffect } from 'react';
import { 
  User, 
  Link2, 
  Briefcase, 
  Image as ImageIcon, 
  Palette, 
  Share2, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Check, 
  ExternalLink, 
  Camera, 
  Upload, 
  QrCode, 
  Download, 
  LogOut, 
  Sparkles,
  Smartphone,
  Settings,
  Database,
  AlertCircle,
  BarChart3,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { 
  Profile, 
  SocialLink, 
  Service, 
  PortfolioItem, 
  UserSession, 
  SocialPlatform, 
  ProfileTemplate, 
  AccentColor, 
  ButtonStyle, 
  BackgroundStyle 
} from '../types/database';
import { db, isSupabaseConfigured, sanitizeUrl } from '../lib/supabase';
import { SocialIcon } from '../components/SocialIcons';
import { downloadVCard } from '../lib/vcard';
import { ProfileRenderer } from '../components/templates/ProfileRenderer';
import { ShareModal } from '../components/ShareModal';
import { TemplateGallery } from '../components/TemplateGallery';

interface DashboardPageProps {
  session: UserSession;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  onOpenSupabaseModal: () => void;
  initialTab?: 'profile' | 'links' | 'services' | 'portfolio' | 'appearance' | 'analytics' | 'share';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  session,
  onNavigate,
  onSignOut,
  onOpenSupabaseModal,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'services' | 'portfolio' | 'appearance' | 'analytics' | 'share'>(initialTab);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [analytics, setAnalytics] = useState<{ views: number; clicks: number; contactSaves: number; shares: number }>({ views: 0, clicks: 0, contactSaves: 0, shares: 0 });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);

  // Username customization state
  const [usernameInput, setUsernameInput] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    state: 'idle' | 'checking' | 'available' | 'taken' | 'error';
    message: string | null;
  }>({ state: 'idle', message: null });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Load user profile & related data directly from Supabase
  useEffect(() => {
    async function loadData() {
      if (!session.user) return;
      setLoading(true);
      setErrorMessage(null);

      try {
        const userProfile = await db.getProfileByUserId(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
          setUsernameInput(userProfile.username);
          const [links, svcs, port, stats] = await Promise.all([
            db.getSocialLinks(userProfile.id),
            db.getServices(userProfile.id),
            db.getPortfolio(userProfile.id),
            db.getProfileAnalytics(userProfile.id),
          ]);
          setSocialLinks(links);
          setServices(svcs);
          setPortfolio(port);
          setAnalytics(stats);
        } else {
          setProfile(null);
        }
      } catch (err: unknown) {
        console.error('Failed to load profile data:', err);
        setErrorMessage((err as Error).message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session.user]);

  // Real-time username validation when user types in Dashboard
  useEffect(() => {
    if (!profile) return;
    const clean = usernameInput.toLowerCase().trim();

    if (!clean) {
      setUsernameStatus({ state: 'error', message: 'Username cannot be empty.' });
      return;
    }

    if (clean === profile.username.toLowerCase()) {
      setUsernameStatus({ state: 'idle', message: 'Current username' });
      setIsCheckingUsername(false);
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus({ state: 'error', message: 'Username must be at least 3 characters.' });
      return;
    }

    if (clean.length > 30) {
      setUsernameStatus({ state: 'error', message: 'Username cannot exceed 30 characters.' });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(clean)) {
      setUsernameStatus({ state: 'error', message: 'Only lowercase letters, numbers, and hyphens are allowed.' });
      return;
    }

    if (clean.startsWith('-') || clean.endsWith('-')) {
      setUsernameStatus({ state: 'error', message: 'Username cannot start or end with a hyphen.' });
      return;
    }

    if (clean.includes('--')) {
      setUsernameStatus({ state: 'error', message: 'Username cannot contain consecutive hyphens.' });
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus({ state: 'checking', message: 'Checking availability…' });

    const timer = setTimeout(async () => {
      try {
        const res = await db.checkUsernameAvailable(clean, profile.user_id);
        setIsCheckingUsername(false);
        if (res.available) {
          setUsernameStatus({ state: 'available', message: '✓ This username is available' });
        } else {
          setUsernameStatus({ state: 'taken', message: res.reason || '✕ This username is already taken' });
        }
      } catch {
        setIsCheckingUsername(false);
        setUsernameStatus({ state: 'error', message: "Couldn't verify availability. Please try again." });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [usernameInput, profile?.username, profile?.user_id]);

  const handleUpdateUsername = async () => {
    if (!profile) return;
    const clean = usernameInput.toLowerCase().trim();
    if (clean === profile.username.toLowerCase()) return;

    setIsUpdatingUsername(true);
    setErrorMessage(null);

    try {
      const check = await db.checkUsernameAvailable(clean, profile.user_id);
      if (!check.available) {
        setErrorMessage(check.reason || 'This username is already taken.');
        setIsUpdatingUsername(false);
        return;
      }

      const updated = await db.updateProfile(profile.id, { username: clean });
      setProfile(updated);
      showSuccessNotice(`Username changed to @${clean}`);
      setUsernameStatus({ state: 'idle', message: 'Current username' });
    } catch (err: unknown) {
      console.error('Failed to update username:', err);
      setErrorMessage((err as Error).message || 'Failed to update username.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const showSuccessNotice = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 2500);
  };

  // Save profile updates to Supabase
  const handleSaveProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const updated = await db.updateProfile(profile.id, updates);
      setProfile(updated);
      showSuccessNotice('Profile changes saved successfully');
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      setErrorMessage((err as Error).message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !session.user) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const url = await db.uploadMedia(file, 'avatars', session.user.id);
      await handleSaveProfile({ profile_photo_url: url });
      showSuccessNotice('Profile photo uploaded');
    } catch (err: unknown) {
      console.error('Failed to upload avatar:', err);
      setErrorMessage((err as Error).message || 'Failed to upload photo.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !session.user) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const url = await db.uploadMedia(file, 'covers', session.user.id);
      await handleSaveProfile({ cover_photo_url: url });
      showSuccessNotice('Cover banner uploaded');
    } catch (err: unknown) {
      console.error('Failed to upload cover:', err);
      setErrorMessage((err as Error).message || 'Failed to upload cover.');
    } finally {
      setSaving(false);
    }
  };

  // Social Links handlers
  const handleAddSocialLink = async () => {
    if (!profile) return;
    const newLink: SocialLink = {
      id: `link-${Date.now()}`,
      profile_id: profile.id,
      platform: 'Instagram',
      url: 'https://instagram.com/',
      display_order: socialLinks.length,
      is_visible: true,
    };
    const updated = [...socialLinks, newLink];
    setSocialLinks(updated);
    try {
      await db.saveSocialLinks(profile.id, updated as any);
      showSuccessNotice('Link added');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to add link');
    }
  };

  const handleUpdateSocialLink = async (index: number, updates: Partial<SocialLink>) => {
    if (!profile) return;
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], ...updates };
    setSocialLinks(updated);
    try {
      await db.saveSocialLinks(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save link changes');
    }
  };

  const handleDeleteSocialLink = async (index: number) => {
    if (!profile) return;
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
    try {
      await db.saveSocialLinks(profile.id, updated as any);
      showSuccessNotice('Link deleted');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to delete link');
    }
  };

  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    if (!profile) return;
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === socialLinks.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSocialLinks(updated);
    try {
      await db.saveSocialLinks(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to reorder links');
    }
  };

  // Services handlers
  const handleAddService = async () => {
    if (!profile) return;
    const newSvc: Service = {
      id: `srv-${Date.now()}`,
      profile_id: profile.id,
      title: 'New Service Offering',
      description: 'Clear description of what clients receive.',
      price: '$150',
      display_order: services.length,
      is_visible: true,
    };
    const updated = [...services, newSvc];
    setServices(updated);
    try {
      await db.saveServices(profile.id, updated as any);
      showSuccessNotice('Service added');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to add service');
    }
  };

  const handleUpdateService = async (index: number, updates: Partial<Service>) => {
    if (!profile) return;
    const updated = [...services];
    updated[index] = { ...updated[index], ...updates };
    setServices(updated);
    try {
      await db.saveServices(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save service changes');
    }
  };

  const handleDeleteService = async (index: number) => {
    if (!profile) return;
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    try {
      await db.saveServices(profile.id, updated as any);
      showSuccessNotice('Service deleted');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to delete service');
    }
  };

  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    if (!profile) return;
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...services];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setServices(updated);
    try {
      await db.saveServices(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to reorder services');
    }
  };

  // Portfolio handlers
  const handleAddPortfolioItem = async () => {
    if (!profile) return;
    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      profile_id: profile.id,
      title: 'New Project Showcase',
      description: 'Brief overview of the project and your contributions.',
      image_url: '/src/assets/images/portfolio_branding_1791201654227.jpg',
      project_url: '',
      display_order: portfolio.length,
      is_visible: true,
    };
    const updated = [...portfolio, newItem];
    setPortfolio(updated);
    try {
      await db.savePortfolio(profile.id, updated as any);
      showSuccessNotice('Portfolio item added');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to add portfolio item');
    }
  };

  const handleUpdatePortfolio = async (index: number, updates: Partial<PortfolioItem>) => {
    if (!profile) return;
    const updated = [...portfolio];
    updated[index] = { ...updated[index], ...updates };
    setPortfolio(updated);
    try {
      await db.savePortfolio(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save portfolio changes');
    }
  };

  const handleDeletePortfolio = async (index: number) => {
    if (!profile) return;
    const updated = portfolio.filter((_, i) => i !== index);
    setPortfolio(updated);
    try {
      await db.savePortfolio(profile.id, updated as any);
      showSuccessNotice('Portfolio item removed');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to delete portfolio item');
    }
  };

  const handleMovePortfolio = async (index: number, direction: 'up' | 'down') => {
    if (!profile) return;
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === portfolio.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...portfolio];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPortfolio(updated);
    try {
      await db.savePortfolio(profile.id, updated as any);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to reorder portfolio');
    }
  };

  const handlePortfolioImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !session.user) return;
    setErrorMessage(null);
    try {
      const url = await db.uploadMedia(file, 'portfolio', session.user.id);
      await handleUpdatePortfolio(index, { image_url: url });
      showSuccessNotice('Portfolio image uploaded');
    } catch (err: unknown) {
      console.error('Failed to upload portfolio image:', err);
      setErrorMessage((err as Error).message || 'Failed to upload portfolio image.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-3" />
        <span className="text-xs text-neutral-400 font-mono">Loading dashboard...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display">Create Your Profile First</h2>
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
          You are signed in as <span className="font-mono text-neutral-300">{session.user?.email}</span>. Complete onboarding to create your custom URL and digital card.
        </p>
        <button
          onClick={() => onNavigate('/onboarding')}
          className="mt-6 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
        >
          Launch Profile Onboarding
        </button>
      </div>
    );
  }

  const platforms: SocialPlatform[] = [
    'Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'X', 'Telegram', 'Website', 'GitHub', 'Behance', 'Dribbble'
  ];

  const accentColors: { id: AccentColor; label: string; bg: string }[] = [
    { id: 'amber', label: 'Gold Amber', bg: 'bg-amber-400' },
    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-400' },
    { id: 'blue', label: 'Azure Blue', bg: 'bg-sky-400' },
    { id: 'rose', label: 'Rose Red', bg: 'bg-rose-400' },
    { id: 'violet', label: 'Royal Violet', bg: 'bg-purple-400' },
    { id: 'slate', label: 'Cool Slate', bg: 'bg-slate-300' },
    { id: 'zinc', label: 'Warm Zinc', bg: 'bg-zinc-300' },
    { id: 'neutral', label: 'Pure Neutral', bg: 'bg-neutral-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-white min-h-[85vh]">
      {/* Notifications */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold tracking-tight">Dashboard</h1>
            <button
              onClick={() => handleSaveProfile({ is_published: !profile.is_published })}
              title={profile.is_published ? "Click to set profile to Draft" : "Click to Publish profile to the web"}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                profile.is_published 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${profile.is_published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{profile.is_published ? 'Published (Live)' : 'Draft (Click to Publish)'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
            <span>Live URL:</span>
            <button
              onClick={() => onNavigate(`/${profile.username}`)}
              className="text-amber-400 font-mono hover:underline flex items-center gap-1 font-semibold"
            >
              <span>profile.dj/{profile.username}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showLivePreview
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-white/5 border-white/10 text-neutral-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'Hide Preview' : 'Mobile Preview'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share & QR</span>
          </button>

          <button
            onClick={() => onNavigate(`/${profile.username}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onSignOut}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs & Content vs. Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center Area: Tab Navigation & Form Editors */}
        <div className={(showLivePreview && activeTab !== 'appearance') ? 'lg:col-span-7' : 'lg:col-span-12'}>
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile & Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'links' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Links ({socialLinks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'services' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Services ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'portfolio' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Portfolio ({portfolio.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'appearance' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('share')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'share' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* TAB 1: Profile & Bio */}
          {activeTab === 'profile' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">General Information</h3>
                  <p className="text-xs text-neutral-400">Update your public details and direct contact avenues.</p>
                </div>
              </div>

              {/* Photos upload row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 shrink-0 relative">
                    {profile.profile_photo_url ? (
                      <img src={profile.profile_photo_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold font-display text-neutral-500">
                        {profile.username[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Profile Photo</label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{saving ? 'Uploading...' : 'Upload Avatar'}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Cover Banner Photo */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 shrink-0">
                    {profile.cover_photo_url ? (
                      <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Cover Banner</label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{saving ? 'Uploading...' : 'Upload Cover'}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Username & Custom Link row */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-semibold text-white">
                      PROFILE.DJ Handle & Public URL
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Your unique handle on PROFILE.DJ. Changing this updates your custom URL and ID card.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-semibold self-start sm:self-auto">
                    profile.dj/{profile.username}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 select-none">
                      profile.dj/
                    </span>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="username"
                      className="w-full pl-24 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-amber-400"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                      {isCheckingUsername && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                      {!isCheckingUsername && usernameStatus.state === 'available' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                      {!isCheckingUsername && usernameStatus.state === 'taken' && <X className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      isUpdatingUsername ||
                      isCheckingUsername ||
                      usernameInput.trim().toLowerCase() === profile.username.toLowerCase() ||
                      usernameStatus.state !== 'available'
                    }
                    onClick={handleUpdateUsername}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                  >
                    <span>{isUpdatingUsername ? 'Updating…' : 'Save Handle'}</span>
                  </button>
                </div>

                {usernameStatus.message && (
                  <p className={`text-[11px] font-medium pt-0.5 ${
                    usernameStatus.state === 'taken' || usernameStatus.state === 'error'
                      ? 'text-rose-400' 
                      : usernameStatus.state === 'available'
                      ? 'text-emerald-400'
                      : 'text-neutral-400'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Direct contact fields */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Direct Contact Channels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+253 77 12 34 56"
                      value={profile.whatsapp}
                      onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+253 77 12 34 56"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Public Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Website</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="Djibouti City, Djibouti"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => handleSaveProfile(profile)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Social Links */}
          {activeTab === 'links' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Social & Digital Channels</h3>
                  <p className="text-xs text-neutral-400">Reorder, hide, or add your social profiles.</p>
                </div>
                <button
                  onClick={handleAddSocialLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  No social links added yet. Click "Add Link" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300 shrink-0">
                          <SocialIcon platform={link.platform} className="w-4 h-4" />
                        </div>
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(idx, { platform: e.target.value as SocialPlatform })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none"
                        >
                          {platforms.map((p) => (
                            <option key={p} value={p} className="bg-neutral-900 text-white">
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={link.url}
                          placeholder="https://..."
                          onChange={(e) => handleUpdateSocialLink(idx, { url: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateSocialLink(idx, { is_visible: !link.is_visible })}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            link.is_visible ? 'bg-white/5 border-white/10 text-neutral-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                          title={link.is_visible ? 'Visible' : 'Hidden'}
                        >
                          {link.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleMoveLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-neutral-300"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleMoveLink(idx, 'down')}
                          disabled={idx === socialLinks.length - 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-neutral-300"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSocialLink(idx)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Services */}
          {activeTab === 'services' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Services & Offerings</h3>
                  <p className="text-xs text-neutral-400">List freelance, consulting, or corporate services.</p>
                </div>
                <button
                  onClick={handleAddService}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  No services added yet. Click "Add Service" to highlight what you do.
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((svc, idx) => (
                    <div
                      key={svc.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={svc.title}
                          placeholder="Service Title (e.g. Brand Identity)"
                          onChange={(e) => handleUpdateService(idx, { title: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-white outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={svc.price || ''}
                          placeholder="Rate (e.g. From $500)"
                          onChange={(e) => handleUpdateService(idx, { price: e.target.value })}
                          className="w-32 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-neutral-200 outline-none"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleUpdateService(idx, { is_visible: !svc.is_visible })}
                            className={`p-1.5 rounded-lg border text-xs ${
                              svc.is_visible ? 'bg-white/5 border-white/10 text-neutral-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                          >
                            {svc.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleMoveService(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 text-neutral-300"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveService(idx, 'down')}
                            disabled={idx === services.length - 1}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 text-neutral-300"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={svc.description}
                        placeholder="Detailed description of deliverables..."
                        onChange={(e) => handleUpdateService(idx, { description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-300 outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Portfolio & Showcase</h3>
                  <p className="text-xs text-neutral-400">Add visuals, project titles, and case study links.</p>
                </div>
                <button
                  onClick={handleAddPortfolioItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {portfolio.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  No portfolio items added yet. Click "Add Project" to display your work.
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row gap-4"
                    >
                      {/* Image Thumbnail & Upload */}
                      <div className="w-full md:w-40 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative shrink-0 group">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[11px] text-white cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 mb-1" />
                          <span>Change Image</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => handlePortfolioImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Content Form */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.title}
                            placeholder="Project Title"
                            onChange={(e) => handleUpdatePortfolio(idx, { title: e.target.value })}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-white outline-none focus:border-amber-400"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdatePortfolio(idx, { is_visible: !item.is_visible })}
                              className={`p-1.5 rounded-lg border text-xs ${
                                item.is_visible ? 'bg-white/5 border-white/10 text-neutral-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}
                            >
                              {item.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleMovePortfolio(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 text-neutral-300"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMovePortfolio(idx, 'down')}
                              disabled={idx === portfolio.length - 1}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 text-neutral-300"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(idx)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={item.description}
                          placeholder="Project summary, role, or impact..."
                          onChange={(e) => handleUpdatePortfolio(idx, { description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-300 outline-none focus:border-amber-400 resize-none"
                        />

                        <input
                          type="text"
                          value={item.project_url || ''}
                          placeholder="Project URL (e.g. https://behance.net/...)"
                          onChange={(e) => handleUpdatePortfolio(idx, { project_url: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-400 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Appearance & Visual Identity Studio */}
          {activeTab === 'appearance' && (
            <TemplateGallery
              profile={profile}
              socialLinks={socialLinks}
              services={services}
              portfolio={portfolio}
              onSaveProfile={handleSaveProfile}
              saving={saving}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onViewLiveProfile={() => onNavigate(`/${profile.username}`)}
            />
          )}

          {/* TAB 6: Analytics */}
          {activeTab === 'analytics' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Profile Engagement</h3>
                <p className="text-xs text-neutral-400">Real anonymous engagement events logged in Supabase database.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-2xl font-bold font-mono text-amber-400">{analytics.views}</span>
                  <span className="text-xs text-neutral-400 block mt-1">Profile Views</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{analytics.clicks}</span>
                  <span className="text-xs text-neutral-400 block mt-1">Link Clicks</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-2xl font-bold font-mono text-sky-400">{analytics.contactSaves}</span>
                  <span className="text-xs text-neutral-400 block mt-1">vCard Downloads</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-2xl font-bold font-mono text-purple-400">{analytics.shares}</span>
                  <span className="text-xs text-neutral-400 block mt-1">Shares & QR Scans</span>
                </div>
              </div>

              {analytics.views === 0 && analytics.clicks === 0 && analytics.contactSaves === 0 && analytics.shares === 0 && (
                <div className="text-center py-6 text-neutral-400 text-xs bg-white/[0.02] border border-white/5 rounded-2xl">
                  No activity yet.
                </div>
              )}

              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Note: PROFILE.DJ strictly protects privacy. No IP addresses or visitor identities are stored.
              </p>
            </div>
          )}

          {/* TAB 7: Settings & Share */}
          {activeTab === 'share' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-6">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Profile Visibility & Database Status</h3>
                <p className="text-xs text-neutral-400">Control public visibility and inspect backend integration.</p>
              </div>

              {/* Share Card Box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Your Public Digital URL</span>
                  <div className="text-base font-mono font-bold text-amber-400">
                    profile.dj/{profile.username}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Open QR & Share</span>
                  </button>
                  <button
                    onClick={() => downloadVCard(profile)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download vCard</span>
                  </button>
                </div>
              </div>

              {/* Publishing Status Toggle */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Publish Profile to Public Web</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {profile.is_published 
                      ? `Anyone can view your profile at profile.dj/${profile.username}`
                      : 'Draft mode: Only you can view your profile while signed in.'
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleSaveProfile({ is_published: !profile.is_published })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    profile.is_published 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-700'
                  }`}
                >
                  {profile.is_published ? 'Published (Public)' : 'Draft (Hidden)'}
                </button>
              </div>

              {/* Supabase backend status */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Supabase PostgreSQL & Storage</h4>
                    <p className="text-xs text-neutral-400">
                      {isSupabaseConfigured ? 'Connected to live Supabase project' : 'Unconfigured environment'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSupabaseModal}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Connection & Schema
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Interactive Live Mobile Preview */}
        {showLivePreview && activeTab !== 'appearance' && (
          <div className="lg:col-span-5 sticky top-24 self-start">
            <div className="rounded-[40px] p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/15 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[32px] overflow-hidden bg-black border border-white/10 max-h-[750px] overflow-y-auto">
                <ProfileRenderer
                  profile={profile}
                  socialLinks={socialLinks}
                  services={services}
                  portfolio={portfolio}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {profile && (
        <ShareModal
          profile={profile}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onPublish={() => handleSaveProfile({ is_published: true })}
        />
      )}

      {/* Fullscreen Live Preview Modal */}
      {isFullscreenPreviewOpen && profile && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 animate-fade-in"
          onClick={() => setIsFullscreenPreviewOpen(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0c0d0e] rounded-3xl border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-50 bg-[#0c0d0e]/95 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-400">PREVIEWING TEMPLATE:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded">
                  {profile.template}
                </span>
              </div>
              <button
                onClick={() => setIsFullscreenPreviewOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <ProfileRenderer
              profile={profile}
              socialLinks={socialLinks}
              services={services}
              portfolio={portfolio}
              isPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
