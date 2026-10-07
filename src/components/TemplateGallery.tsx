import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Save, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Palette, 
  Layers, 
  ArrowRight,
  Eye,
  Radio,
  Download,
  Mail,
  MapPin,
  ExternalLink as LinkIcon,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { 
  Profile, 
  SocialLink, 
  Service, 
  PortfolioItem, 
  ProfileTemplate, 
  AccentColor, 
  ButtonStyle, 
  BackgroundStyle 
} from '../types/database';
import { PROFILE_TEMPLATES } from '../lib/templatesData';
import { ProfileRenderer } from './templates/ProfileRenderer';

interface TemplateGalleryProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onSaveProfile: (updates: Partial<Profile>) => Promise<void>;
  saving?: boolean;
  onOpenShareModal?: () => void;
  onViewLiveProfile?: () => void;
}

const ACCENT_COLORS: { id: AccentColor; label: string; bg: string; border: string }[] = [
  { id: 'amber', label: 'Warm Amber', bg: 'bg-amber-400', border: 'border-amber-400' },
  { id: 'emerald', label: 'Emerald Mint', bg: 'bg-emerald-400', border: 'border-emerald-400' },
  { id: 'blue', label: 'Electric Blue', bg: 'bg-sky-400', border: 'border-sky-400' },
  { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-400', border: 'border-rose-400' },
  { id: 'violet', label: 'Royal Violet', bg: 'bg-purple-400', border: 'border-purple-400' },
  { id: 'neutral', label: 'Pure Neutral', bg: 'bg-neutral-200', border: 'border-neutral-200' },
  { id: 'slate', label: 'Cool Slate', bg: 'bg-slate-300', border: 'border-slate-300' },
  { id: 'zinc', label: 'Deep Zinc', bg: 'bg-zinc-300', border: 'border-zinc-300' },
];

/**
 * High-fidelity miniature visual preview for each template card
 * displaying fictional demo data: Amina Hassan, Creative Director, amina@example.com
 */
const TemplateCardVisualPreview: React.FC<{ templateId: ProfileTemplate }> = ({ templateId }) => {
  switch (templateId) {
    case 'minimal':
      return (
        <div className="w-full h-44 rounded-xl bg-[#0d0e11] border border-white/10 p-3 flex flex-col items-center justify-between text-center select-none overflow-hidden relative">
          <div className="w-full flex justify-end">
            <span className="text-[9px] font-mono text-neutral-500">profile.dj/amina</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 -mt-1">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-neutral-800 flex items-center justify-center shadow-lg">
              <span className="text-sm font-heading font-extrabold text-amber-400">AH</span>
            </div>
            <div>
              <p className="text-xs font-heading font-extrabold text-white tracking-tight">Amina Hassan</p>
              <p className="text-[10px] text-neutral-400">Creative Director</p>
              <p className="text-[9px] text-amber-400/80 font-mono mt-0.5">amina@example.com</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full justify-center">
            <span className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 text-[9px] font-bold">
              Save Contact
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[9px]">
              Email
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[9px]">
              Share
            </span>
          </div>
        </div>
      );

    case 'professional':
      return (
        <div className="w-full h-44 rounded-xl bg-[#111215] border border-white/10 p-3 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[9px] font-mono text-neutral-400">
            <span className="text-amber-400 font-bold">PROFILE.DJ VERIFIED</span>
            <span className="text-emerald-400 font-semibold">● ACTIVE</span>
          </div>

          <div className="flex items-center gap-2.5 my-1">
            <div className="w-11 h-11 rounded-xl border border-white/20 bg-neutral-800 flex items-center justify-center shrink-0">
              <span className="text-xs font-heading font-black text-white">AH</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-bold text-white truncate">Amina Hassan</p>
              <p className="text-[10px] text-neutral-300 truncate">Creative Director</p>
              <p className="text-[9px] text-neutral-400 truncate font-mono">amina@example.com</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-semibold">
            <span className="p-1 rounded-md bg-amber-400 text-slate-950 font-bold truncate">Save</span>
            <span className="p-1 rounded-md bg-white/5 border border-white/10 text-white truncate">Email</span>
            <span className="p-1 rounded-md bg-white/5 border border-white/10 text-white truncate">WhatsApp</span>
            <span className="p-1 rounded-md bg-white/5 border border-white/10 text-white truncate">Call</span>
          </div>

          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-[9px]">
            <span className="text-neutral-300 truncate">Executive Brand Direction</span>
            <span className="text-amber-400 font-mono font-bold">$180</span>
          </div>
        </div>
      );

    case 'creator':
      return (
        <div className="w-full h-44 rounded-xl bg-[#0f1013] border border-white/10 flex flex-col justify-between select-none overflow-hidden relative">
          {/* Top Banner Gradient */}
          <div className="h-14 w-full bg-gradient-to-r from-amber-500/40 via-purple-600/40 to-blue-500/30 flex items-start justify-end p-2 relative">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-white/10">
              Creator Spotlight
            </span>
          </div>

          <div className="px-3 -mt-6 flex items-end gap-2.5">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-black flex items-center justify-center shrink-0 shadow-xl">
              <span className="text-xs font-heading font-extrabold text-amber-400">AH</span>
            </div>
            <div className="pb-0.5">
              <p className="text-xs font-heading font-extrabold text-white leading-tight">Amina Hassan</p>
              <p className="text-[10px] text-neutral-300">Creative Director</p>
            </div>
          </div>

          <div className="px-3 py-1 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-neutral-300">
              @amina
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-neutral-300">
              Instagram
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-neutral-300">
              YouTube
            </span>
          </div>

          <div className="px-3 pb-2.5 grid grid-cols-2 gap-1.5">
            <div className="h-6 rounded-md bg-white/10 border border-white/5 flex items-center justify-center text-[9px] text-neutral-300">
              Visual Direction
            </div>
            <div className="h-6 rounded-md bg-white/10 border border-white/5 flex items-center justify-center text-[9px] text-neutral-300">
              Brand Identity
            </div>
          </div>
        </div>
      );

    case 'editorial':
      return (
        <div className="w-full h-44 rounded-xl bg-[#121316] border border-white/10 p-3 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/15 text-[8px] font-mono tracking-widest uppercase text-neutral-400">
            <span>PROFILE.DJ · ISSUE N°01</span>
            <span>GLOBAL</span>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="w-10 h-14 rounded border border-white/30 bg-neutral-900 flex items-center justify-center shrink-0 shadow-md">
              <span className="text-xs font-serif font-bold text-neutral-300">AH</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold block">
                Featured Profile
              </span>
              <p className="text-xs font-heading font-extrabold text-white truncate">Amina Hassan</p>
              <p className="text-[10px] text-neutral-300 italic truncate">
                "Directing timeless visual identities."
              </p>
            </div>
          </div>

          <div className="space-y-1 text-[9px] font-mono">
            <div className="flex items-center justify-between py-0.5 border-b border-white/5">
              <span className="text-amber-400 font-bold">01</span>
              <span className="text-neutral-300">Editorial Brand Portfolio</span>
              <span className="text-neutral-500">↗</span>
            </div>
            <div className="flex items-center justify-between py-0.5 border-b border-white/5">
              <span className="text-amber-400 font-bold">02</span>
              <span className="text-neutral-300">Creative Consultation</span>
              <span className="text-neutral-500">↗</span>
            </div>
          </div>
        </div>
      );

    case 'compact':
      return (
        <div className="w-full h-44 rounded-xl bg-[#131418] border border-white/10 p-3 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] font-mono text-neutral-400">
            <span className="text-amber-400 font-semibold">DIGITAL PROFILE</span>
            <span>/amina</span>
          </div>

          <div className="flex items-center gap-2.5 my-1">
            <div className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-800 flex items-center justify-center shrink-0">
              <span className="text-xs font-heading font-bold text-white">AH</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-bold text-white truncate">Amina Hassan</p>
              <p className="text-[10px] text-neutral-300 truncate">Creative Director</p>
              <p className="text-[9px] text-neutral-400 truncate font-mono">amina@example.com</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-semibold text-center">
            <span className="py-1 rounded-lg bg-amber-400 text-slate-950 font-bold">Save</span>
            <span className="py-1 rounded-lg bg-white/5 border border-white/10 text-white">Email</span>
            <span className="py-1 rounded-lg bg-white/5 border border-white/10 text-white">Message</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded-lg bg-white/[0.03] border border-white/10 text-[9px]">
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Links</span>
            <span className="px-2 py-0.5 text-neutral-400">Services</span>
            <span className="px-2 py-0.5 text-neutral-400">Portfolio</span>
          </div>
        </div>
      );

    case 'bento':
      return (
        <div className="w-full h-44 rounded-xl bg-[#0e0f12] border border-white/10 p-2.5 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mb-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> ACTIVE
            </span>
            <span>BENTO GRID</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 flex-1">
            {/* Tile 1: Hero */}
            <div className="col-span-2 p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-amber-400 bg-black flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-400">AH</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-heading font-extrabold text-white truncate">Amina Hassan</p>
                <p className="text-[9px] text-neutral-300 truncate">Creative Director</p>
              </div>
            </div>

            {/* Tile 2: Action */}
            <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/30 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-mono text-amber-300">vCard</span>
              <span className="text-[9px] font-bold text-white mt-0.5">SAVE</span>
            </div>

            {/* Tile 3: Social */}
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-around text-[9px] text-neutral-300">
              <span>Instagram</span>
              <span>·</span>
              <span>Behance</span>
            </div>

            {/* Tile 4: Scope */}
            <div className="col-span-2 p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-[9px] text-neutral-300">
              <span className="truncate">Design Capabilities</span>
              <span className="text-amber-400 font-mono text-[8px]">PRO</span>
            </div>
          </div>
        </div>
      );

    case 'studio':
      return (
        <div className="w-full h-44 rounded-xl bg-[#121417] border border-white/10 p-3 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] font-mono text-neutral-400">
            <span className="text-amber-400 font-semibold">STUDIO RECORD // AH</span>
            <span>PRACTICE</span>
          </div>

          <div className="flex items-center gap-2.5 my-1">
            <div className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-900 flex items-center justify-center shrink-0">
              <span className="text-xs font-heading font-extrabold text-white">AH</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[8px] font-mono text-amber-400 uppercase tracking-wider block">
                Independent Practice
              </span>
              <p className="text-xs font-heading font-extrabold text-white truncate">Amina Hassan</p>
              <p className="text-[10px] text-neutral-300 truncate">Creative Director</p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <span className="text-[8px] font-mono text-neutral-400 uppercase block">Selected Projects</span>
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-white truncate">Brand System 2026</span>
              <span className="text-amber-400 font-mono text-[8px]">VIEW ↗</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500 pt-1 border-t border-white/5">
            <span>EAST AFRICA / GLOBAL</span>
            <span>CONTACT READY</span>
          </div>
        </div>
      );

    case 'monolith':
      return (
        <div className="w-full h-44 rounded-xl bg-[#09090b] border-2 border-white/20 p-3 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between pb-1 border-b-2 border-white/20 text-[9px] font-mono uppercase font-bold text-white tracking-widest">
            <span>PROFILE.DJ // AMINA</span>
            <span>08</span>
          </div>

          <div className="flex items-start gap-2.5 my-1">
            <div className="w-10 h-10 rounded-none border-2 border-white bg-black flex items-center justify-center shrink-0">
              <span className="text-xs font-mono font-black text-white">AH</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono font-black text-white uppercase tracking-tight truncate">
                AMINA HASSAN
              </p>
              <p className="text-[9px] font-mono text-neutral-300 uppercase truncate">
                CREATIVE DIRECTOR
              </p>
              <p className="text-[8px] font-mono text-amber-400 truncate">
                AMINA@EXAMPLE.COM
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="py-1 px-2 rounded-none bg-white text-black font-mono font-black text-[9px] uppercase tracking-wider text-center">
              + SAVE CONTACT
            </div>
            <div className="py-1 px-2 rounded-none border border-white/30 text-white font-mono text-[8px] uppercase tracking-wider text-center">
              VIEW MONOLITH WORK
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  profile,
  socialLinks,
  services,
  portfolio,
  onSaveProfile,
  saving = false,
  onOpenShareModal,
  onViewLiveProfile,
}) => {
  // Staged appearance state for real-time interactive preview
  const [stagedTemplate, setStagedTemplate] = useState<ProfileTemplate>(profile.template);
  const [stagedTheme, setStagedTheme] = useState<AccentColor>(profile.theme);
  const [stagedButtonStyle, setStagedButtonStyle] = useState<ButtonStyle>(profile.button_style);
  const [stagedBgStyle, setStagedBgStyle] = useState<BackgroundStyle>(profile.background_style);

  // Viewport mode: mobile phone or desktop canvas
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('mobile');

  // Category filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'minimal' | 'executive' | 'creative' | 'modular'>('all');

  // Success toast message
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync staged state when profile prop changes
  useEffect(() => {
    setStagedTemplate(profile.template);
    setStagedTheme(profile.theme);
    setStagedButtonStyle(profile.button_style);
    setStagedBgStyle(profile.background_style);
  }, [profile.template, profile.theme, profile.button_style, profile.background_style]);

  // Check if staged customization differs from saved profile
  const hasChanges = 
    stagedTemplate !== profile.template ||
    stagedTheme !== profile.theme ||
    stagedButtonStyle !== profile.button_style ||
    stagedBgStyle !== profile.background_style;

  // Selected template definition
  const currentStagedDefinition = PROFILE_TEMPLATES.find((t) => t.id === stagedTemplate) || PROFILE_TEMPLATES[0];

  // Filter templates by category
  const filteredTemplates = PROFILE_TEMPLATES.filter((tmpl) => {
    if (activeCategory === 'minimal') return tmpl.id === 'minimal' || tmpl.id === 'editorial';
    if (activeCategory === 'executive') return tmpl.id === 'professional' || tmpl.id === 'compact';
    if (activeCategory === 'creative') return tmpl.id === 'creator' || tmpl.id === 'studio';
    if (activeCategory === 'modular') return tmpl.id === 'bento' || tmpl.id === 'monolith';
    return true;
  });

  // Handle Save
  const handleSave = async () => {
    await onSaveProfile({
      template: stagedTemplate,
      theme: stagedTheme,
      button_style: stagedButtonStyle,
      background_style: stagedBgStyle,
    });
    setSaveToast(`✓ Saved! Profile presentation updated to ${currentStagedDefinition.name}.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Handle direct Apply of a template
  const handleApplyTemplate = async (templateId: ProfileTemplate) => {
    setStagedTemplate(templateId);
    await onSaveProfile({
      template: templateId,
      theme: stagedTheme,
      button_style: stagedButtonStyle,
      background_style: stagedBgStyle,
    });
    const def = PROFILE_TEMPLATES.find(t => t.id === templateId);
    setSaveToast(`✓ Template applied! Your public profile now uses ${def?.name || templateId}.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Handle Reset to saved
  const handleReset = () => {
    setStagedTemplate(profile.template);
    setStagedTheme(profile.theme);
    setStagedButtonStyle(profile.button_style);
    setStagedBgStyle(profile.background_style);
  };

  // Preview profile object with staged styling and user's genuine profile content
  const previewProfile: Profile = {
    ...profile,
    template: stagedTemplate,
    theme: stagedTheme,
    button_style: stagedButtonStyle,
    background_style: stagedBgStyle,
  };

  return (
    <div className="space-y-8">
      {/* Visual Identity Workflow Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-400/[0.08] via-white/[0.03] to-white/[0.01] border border-amber-400/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Visual Identity Studio
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-300 font-medium">
                8 Distinct Designs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
              Choose & Customize Your Profile Design
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Templates control presentation only. Changing your template never resets or alters your name, photo, bio, phone, WhatsApp, links, services, or portfolio data.
            </p>
          </div>

          {/* Quick Publish & Live Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onSaveProfile({ is_published: !profile.is_published })}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                profile.is_published
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{profile.is_published ? 'Published (Live)' : 'Draft (Private)'}</span>
            </button>

            {onViewLiveProfile && (
              <button
                type="button"
                onClick={onViewLiveProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
              >
                <span>Live View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share & QR</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Step Process Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 01</span>
            <span className="font-semibold text-white mt-0.5">Choose Design</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 02</span>
            <span className="font-semibold text-white mt-0.5">Preview Live</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 03</span>
            <span className="font-semibold text-white mt-0.5">Customize</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 04</span>
            <span className="font-semibold text-white mt-0.5">Save Changes</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 05</span>
            <span className="font-semibold text-white mt-0.5">Publish & Share</span>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Side-by-Side or Responsive Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Template Catalog & Customizer Controls */}
        <div className="xl:col-span-7 space-y-6">
          {/* Section 1: Template Selection Filter */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-heading font-extrabold text-white">
                  1. Choose a Design ({PROFILE_TEMPLATES.length} Styles)
                </h3>
                <p className="text-xs text-neutral-400">
                  Each card shows an actual visual preview with demo content (Amina Hassan, Creative Director).
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === 'all' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All (8)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('minimal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === 'minimal' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Minimal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('executive')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === 'executive' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Executive
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('creative')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === 'creative' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Creative
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('modular')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === 'modular' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Modular
                </button>
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTemplates.map((tmpl) => {
                const isStaged = stagedTemplate === tmpl.id;
                const isLive = profile.template === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    className={`group relative p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isStaged
                        ? 'bg-amber-400/[0.08] border-amber-400 shadow-xl shadow-amber-400/5 ring-2 ring-amber-400/30'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      {/* Card Header: Number, Name, Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isStaged ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-neutral-300'
                            }`}
                          >
                            {tmpl.number}
                          </span>
                          <h4 className="text-sm font-heading font-extrabold text-white group-hover:text-amber-300 transition-colors">
                            {tmpl.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isLive && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                              Saved Live
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                            {tmpl.badge}
                          </span>
                        </div>
                      </div>

                      {/* Tagline & Best For */}
                      <p className="text-xs font-semibold text-neutral-200">
                        {tmpl.tagline}
                      </p>
                      <p className="text-[11px] text-amber-400/90 mt-0.5">
                        Best for: {tmpl.bestFor}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                        {tmpl.description}
                      </p>

                      {/* REAL VISUAL DESIGN PREVIEW WITH FICTIONAL DEMO CONTENT */}
                      <div className="my-3.5">
                        <TemplateCardVisualPreview templateId={tmpl.id} />
                      </div>

                      {/* Features bullets */}
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-neutral-400 font-mono">
                        {tmpl.features.slice(0, 2).map((feat, i) => (
                          <div key={i} className="flex items-center gap-1 truncate">
                            <span className="text-amber-400">·</span>
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions: Preview & Use This Template */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStagedTemplate(tmpl.id);
                          const el = document.getElementById('template-live-preview-section');
                          if (el && window.innerWidth < 1280) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isStaged
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isStaged ? 'Previewing' : 'Preview'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleApplyTemplate(tmpl.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isLive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md'
                        }`}
                      >
                        {isLive ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <span>Use this template</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Customization Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-heading font-extrabold text-white">
                  2. Customize Appearance & Canvas
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Refine accent colors, button curvature, and canvas patterns with live visual feedback.
              </p>
            </div>

            {/* Accent Color Palette */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                Accent Theme Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setStagedTheme(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      stagedTheme === c.id
                        ? 'bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md'
                        : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0`} />
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                Button Geometry
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['rounded', 'pill', 'sharp'] as ButtonStyle[]).map((bs) => (
                  <button
                    key={bs}
                    type="button"
                    onClick={() => setStagedButtonStyle(bs)}
                    className={`py-2 px-3 border text-xs capitalize font-semibold transition-all cursor-pointer ${
                      bs === 'pill' ? 'rounded-full' : bs === 'sharp' ? 'rounded-none' : 'rounded-xl'
                    } ${
                      stagedButtonStyle === bs
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                        : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {bs}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                Background Canvas Texture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['subtle-mesh', 'dots', 'clean', 'card-glow'] as BackgroundStyle[]).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setStagedBgStyle(bg)}
                    className={`p-2 rounded-xl border text-xs capitalize transition-all text-center font-semibold cursor-pointer ${
                      stagedBgStyle === bg
                        ? 'bg-white/15 border-white text-white font-bold'
                        : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {bg.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Save & Status Confirmation Bar */}
          <div className="p-5 rounded-2xl bg-[#17181c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  Content Preservation Guarantee
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                All profile text, photos, services, portfolio, and contact numbers remain completely untouched.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Revert to current saved database settings"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-400/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving to Database...' : 'Save & Apply Design'}</span>
              </button>
            </div>
          </div>

          {/* Success Notification Banner */}
          {saveToast && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Device Preview */}
        <div id="template-live-preview-section" className="xl:col-span-5 sticky top-24 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#141518] border border-white/10 shadow-2xl space-y-4">
            {/* Preview Header & Viewport Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Live Profile Preview
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    {currentStagedDefinition.name}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Testing with @{profile.username} profile content
                </p>
              </div>

              {/* Viewport Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-amber-400 text-slate-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Mobile Viewport (380px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-amber-400 text-slate-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Canvas Viewport"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Device Viewport Frame */}
            <div className="flex justify-center w-full">
              {viewportMode === 'mobile' ? (
                /* Mobile Phone Mockup */
                <div className="w-[360px] sm:w-[380px] h-[680px] rounded-[44px] bg-[#0c0d0e] border-[8px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
                  {/* Phone Speaker Notch */}
                  <div className="h-6 bg-neutral-900 flex items-center justify-center shrink-0 z-20 border-b border-white/5">
                    <div className="w-16 h-3 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="w-3 h-1 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Scrollable Live Screen */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <ProfileRenderer
                      profile={previewProfile}
                      socialLinks={socialLinks}
                      services={services}
                      portfolio={portfolio}
                      isPreview={true}
                    />
                  </div>

                  {/* Mobile Home Bar */}
                  <div className="h-5 bg-neutral-950 flex items-center justify-center shrink-0 z-20">
                    <div className="w-28 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              ) : (
                /* Canvas / Expanded Card View */
                <div className="w-full h-[680px] rounded-2xl bg-[#0c0d0e] border border-white/10 overflow-y-auto custom-scrollbar shadow-2xl relative">
                  <ProfileRenderer
                    profile={previewProfile}
                    socialLinks={socialLinks}
                    services={services}
                    portfolio={portfolio}
                    isPreview={true}
                  />
                </div>
              )}
            </div>

            {/* Preview Information & Quick Save */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-white/5">
              <span>
                Theme: <strong className="text-white capitalize">{stagedTheme}</strong> · Style: <strong className="text-white capitalize">{stagedButtonStyle}</strong>
              </span>

              {hasChanges && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Save this design
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
