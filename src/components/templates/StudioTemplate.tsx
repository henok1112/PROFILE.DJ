import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { downloadVCard } from '../../lib/vcard';
import { db } from '../../lib/supabase';

interface StudioTemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare?: () => void;
  onOpenShareModal?: () => void;
  onLinkClick?: (platform: string) => void;
}

export const StudioTemplate: React.FC<StudioTemplateProps> = ({
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
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  const visibleLinks = socialLinks.filter((l) => l.is_visible);
  const visibleServices = services.filter((s) => s.is_visible !== false);
  const visiblePortfolio = portfolio.filter((p) => p.is_visible !== false);

  const handleOpenShare = onShare || onOpenShareModal || (() => {});

  const handleSaveContact = () => {
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'studio' });
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-white font-sans">
      {/* Studio Header Strip */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10 text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>STUDIO RECORD / {profile.username.toUpperCase()}</span>
        </div>
        <button
          onClick={handleOpenShare}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>SHARE</span>
        </button>
      </div>

      {/* Hero Studio Banner Card */}
      <div className="rounded-3xl bg-[#141518] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-900 shadow-xl">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-heading font-black text-3xl text-neutral-400">
                  {(profile.first_name?.[0] || profile.username[0] || 'S').toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-amber-400 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Independent Practice</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
              {displayName}
            </h1>

            {profile.headline && (
              <p className="mt-1 text-sm font-normal text-neutral-300">
                {profile.headline}
              </p>
            )}

            {(profile.location || profile.website) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-neutral-400 font-mono">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
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
                    <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 pt-5 border-t border-white/5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Contact Dock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          <button
            onClick={handleSaveContact}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold shadow-md transition-all cursor-pointer`}
          >
            <Download className="w-4 h-4" />
            <span>Save Contact</span>
          </button>

          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick('WhatsApp')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-emerald-400 transition-all`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          {profile.phone && (
            <a
              href={`tel:${profile.phone.trim()}`}
              onClick={() => handleLinkClick('Phone')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-white transition-all`}
            >
              <Phone className="w-4 h-4 text-neutral-300" />
              <span>Call</span>
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email.trim()}`}
              onClick={() => handleLinkClick('Email')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-white transition-all`}
            >
              <Mail className="w-4 h-4 text-neutral-300" />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>

      {/* Portfolio Showcase Forward (Top priority for Studio) */}
      {visiblePortfolio.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Selected Works & Case Studies
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">[{visiblePortfolio.length}]</span>
          </div>

          <div className="space-y-4">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#141518] border border-white/10 hover:border-amber-400/40 transition-all shadow-xl"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="mt-1 text-xs text-neutral-400 leading-relaxed max-w-md line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Matrix */}
      {visibleServices.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Studio Practice & Services
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">[{visibleServices.length}]</span>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl bg-[#141518] border border-white/10 overflow-hidden">
            {visibleServices.map((svc) => (
              <div key={svc.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{svc.title}</h4>
                  {svc.description && (
                    <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                      {svc.description}
                    </p>
                  )}
                </div>
                {svc.price && (
                  <span className="text-xs font-mono font-semibold text-amber-300 px-2.5 py-1 rounded bg-white/5 border border-white/10 shrink-0">
                    {svc.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links Chips */}
      {visibleLinks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Network Channels
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.platform)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
              >
                <SocialIcon platform={link.platform} className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                <span>{link.platform}</span>
                <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-amber-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPortfolio && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#141517] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black mb-4">
              <img
                src={selectedPortfolio.image_url}
                alt={selectedPortfolio.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-base font-bold text-white">{selectedPortfolio.title}</h3>
            {selectedPortfolio.description && (
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
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
                  <span>Open Project URL</span>
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

      {/* Studio Colophon */}
      <div className="mt-12 text-center text-[11px] font-mono text-neutral-500">
        PROFILE.DJ STUDIO ARCHITECTURE · VERIFIED
      </div>
    </div>
  );
};
