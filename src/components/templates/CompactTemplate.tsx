import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, ShieldCheck, Layers, Briefcase, Image as ImageIcon } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { downloadVCard } from '../../lib/vcard';
import { db } from '../../lib/supabase';

interface CompactTemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare?: () => void;
  onOpenShareModal?: () => void;
  onLinkClick?: (platform: string) => void;
}

export const CompactTemplate: React.FC<CompactTemplateProps> = ({
  profile,
  socialLinks,
  services,
  portfolio,
  onShare,
  onOpenShareModal,
  onLinkClick,
}) => {
  const accent = getAccentClasses(profile.theme);
  const btnRadius = getButtonRadius(profile.button_style);
  const [activeSection, setActiveSection] = useState<'links' | 'services' | 'portfolio'>('links');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  const visibleLinks = socialLinks.filter((l) => l.is_visible);
  const visibleServices = services.filter((s) => s.is_visible !== false);
  const visiblePortfolio = portfolio.filter((p) => p.is_visible !== false);

  const handleOpenShare = onShare || onOpenShareModal || (() => {});

  const handleSaveContact = () => {
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'compact' });
    downloadVCard(profile);
  };

  const handleLinkClick = (platform: string) => {
    if (onLinkClick) {
      onLinkClick(platform);
    }
  };

  const sanitizeUrl = (url: string): string => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '#';
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const displayName = profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username;

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-8 md:py-14 text-white font-sans">
      {/* Compact Digital Card Container */}
      <div className="relative rounded-[28px] bg-[#121316] border border-white/15 p-6 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Top Metallic Sheen Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar with brand and share */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-neutral-400 text-[11px]">
            <span className="text-amber-400 font-semibold">PROFILE.DJ</span>
            <span>/</span>
            <span>{profile.username}</span>
          </div>

          <button
            onClick={handleOpenShare}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Share Profile & QR"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Card Header */}
        <div className="flex items-center gap-4 py-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-900 shadow-lg">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-heading font-black text-2xl text-neutral-400">
                  {(profile.first_name?.[0] || profile.username[0] || 'C').toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#121316] p-0.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-white truncate">
              {displayName}
            </h1>
            {profile.headline && (
              <p className="mt-0.5 text-xs sm:text-sm font-normal text-neutral-300 line-clamp-2">
                {profile.headline}
              </p>
            )}

            {(profile.location || profile.website) && (
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[11px] text-neutral-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.website && (
                  <a
                    href={sanitizeUrl(profile.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick('Website')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Globe className="w-3 h-3 text-neutral-500" />
                    <span className="truncate max-w-[120px]">{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Short Bio */}
        {profile.bio && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-5 pt-3 border-t border-white/5">
            {profile.bio}
          </p>
        )}

        {/* 1-Tap Quick Action Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            onClick={handleSaveContact}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 ${accent.primaryBg} ${btnRadius} text-[11px] font-semibold transition-all cursor-pointer`}
          >
            <Download className="w-4 h-4" />
            <span>Save</span>
          </button>

          {profile.whatsapp ? (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick('WhatsApp')}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 ${btnRadius} text-[11px] font-semibold transition-all`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-white/[0.02] border border-white/5 text-neutral-600 ${btnRadius} text-[11px] opacity-40`}>
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </div>
          )}

          {profile.phone ? (
            <a
              href={`tel:${profile.phone.trim()}`}
              onClick={() => handleLinkClick('Phone')}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white ${btnRadius} text-[11px] font-semibold transition-all`}
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          ) : (
            <div className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-white/[0.02] border border-white/5 text-neutral-600 ${btnRadius} text-[11px] opacity-40`}>
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </div>
          )}

          {profile.email ? (
            <a
              href={`mailto:${profile.email.trim()}`}
              onClick={() => handleLinkClick('Email')}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white ${btnRadius} text-[11px] font-semibold transition-all`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
          ) : (
            <div className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 bg-white/[0.02] border border-white/5 text-neutral-600 ${btnRadius} text-[11px] opacity-40`}>
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </div>
          )}
        </div>

        {/* Segmented Switcher for Content Panes */}
        <div className="flex items-center p-1 bg-black/40 rounded-xl mb-4 border border-white/5">
          <button
            onClick={() => setActiveSection('links')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSection === 'links'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Links ({visibleLinks.length})</span>
          </button>

          {visibleServices.length > 0 && (
            <button
              onClick={() => setActiveSection('services')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSection === 'services'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Services ({visibleServices.length})</span>
            </button>
          )}

          {visiblePortfolio.length > 0 && (
            <button
              onClick={() => setActiveSection('portfolio')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSection === 'portfolio'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Work ({visiblePortfolio.length})</span>
            </button>
          )}
        </div>

        {/* Section 1: Links */}
        {activeSection === 'links' && (
          <div className="space-y-2">
            {visibleLinks.length === 0 ? (
              <p className="text-center py-6 text-xs text-neutral-500">No social links added yet</p>
            ) : (
              visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={sanitizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.platform)}
                  className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
                      <SocialIcon platform={link.platform} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                      {link.platform}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                </a>
              ))
            )}
          </div>
        )}

        {/* Section 2: Services */}
        {activeSection === 'services' && (
          <div className="space-y-2.5">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white">{svc.title}</h4>
                  {svc.price && (
                    <span className="text-[11px] font-mono font-semibold text-amber-300 px-2 py-0.5 rounded bg-white/5 border border-white/10 shrink-0">
                      {svc.price}
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
                    {svc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section 3: Portfolio */}
        {activeSection === 'portfolio' && (
          <div className="grid grid-cols-2 gap-2.5">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className="group cursor-pointer rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <h4 className="text-[11px] font-semibold text-white truncate group-hover:text-amber-300">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPortfolio && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div 
            className="relative w-full max-w-sm bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black mb-3">
              <img
                src={selectedPortfolio.image_url}
                alt={selectedPortfolio.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-sm font-bold text-white">{selectedPortfolio.title}</h3>
            {selectedPortfolio.description && (
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                {selectedPortfolio.description}
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              {selectedPortfolio.project_url ? (
                <a
                  href={sanitizeUrl(selectedPortfolio.project_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
                >
                  <span>Open Project</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="mt-6 text-center text-[11px] text-neutral-500 font-mono">
        PROFILE.DJ SMART CARD · VERIFIED
      </div>
    </div>
  );
};
