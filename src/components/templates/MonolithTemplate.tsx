import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, ArrowRight } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { downloadVCard } from '../../lib/vcard';
import { db } from '../../lib/supabase';

interface MonolithTemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare?: () => void;
  onOpenShareModal?: () => void;
  onLinkClick?: (platform: string) => void;
}

export const MonolithTemplate: React.FC<MonolithTemplateProps> = ({
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
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'monolith' });
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
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-white font-sans">
      {/* Top Monolith Bar */}
      <div className="flex items-center justify-between pb-3 mb-8 border-b-2 border-white/20">
        <div className="font-mono text-xs tracking-widest uppercase font-bold text-white">
          PROFILE.DJ // {profile.username}
        </div>
        <button
          onClick={handleOpenShare}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Monolith Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Square Heavy-Border Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none border-2 border-white bg-neutral-900 shadow-2xl shrink-0 overflow-hidden">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading font-black text-3xl text-neutral-300">
                {(profile.first_name?.[0] || profile.username[0] || 'M').toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase leading-none">
              {displayName}
            </h1>
            {profile.headline && (
              <p className="mt-2 text-sm text-neutral-300 font-medium">
                {profile.headline}
              </p>
            )}

            {(profile.location || profile.website) && (
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono text-neutral-400">
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

        {/* Bio in Monolith Block */}
        {profile.bio && (
          <div className="p-4 bg-neutral-900 border border-white/15 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
            {profile.bio}
          </div>
        )}

        {/* Primary Monolith CTA Button */}
        <button
          onClick={handleSaveContact}
          className={`w-full py-3.5 px-4 ${accent.primaryBg} ${btnRadius} font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer`}
        >
          <Download className="w-4 h-4" />
          <span>Save Contact File (.VCF)</span>
        </button>

        {/* Tactile Communication Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick('WhatsApp')}
              className="flex items-center justify-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          {profile.phone && (
            <a
              href={`tel:${profile.phone.trim()}`}
              onClick={() => handleLinkClick('Phone')}
              className="flex items-center justify-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <Phone className="w-4 h-4 text-neutral-300" />
              <span>Call Direct</span>
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email.trim()}`}
              onClick={() => handleLinkClick('Email')}
              className="flex items-center justify-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <Mail className="w-4 h-4 text-neutral-300" />
              <span>Send Mail</span>
            </a>
          )}
        </div>
      </div>

      {/* Monolith Channels List */}
      {visibleLinks.length > 0 && (
        <div className="mt-12">
          <div className="pb-2 mb-3 border-b border-white/15 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-neutral-400">
            <span>// Verified Channels</span>
            <span>[{visibleLinks.length}]</span>
          </div>

          <div className="space-y-2">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.platform)}
                className="flex items-center justify-between p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-neutral-300 group-hover:text-white">
                    <SocialIcon platform={link.platform} className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs uppercase font-bold text-neutral-200 group-hover:text-white">
                    {link.platform}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Monolith Services */}
      {visibleServices.length > 0 && (
        <div className="mt-12">
          <div className="pb-2 mb-3 border-b border-white/15 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-neutral-400">
            <span>// Practice & Scopes</span>
            <span>[{visibleServices.length}]</span>
          </div>

          <div className="space-y-2.5">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className="p-4 bg-neutral-900 border border-white/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-mono text-xs uppercase font-bold text-white">{svc.title}</h4>
                  {svc.price && (
                    <span className="font-mono text-xs font-bold text-amber-300 px-2 py-0.5 bg-black border border-white/15">
                      {svc.price}
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-sans">
                    {svc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monolith Portfolio */}
      {visiblePortfolio.length > 0 && (
        <div className="mt-12">
          <div className="pb-2 mb-3 border-b border-white/15 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-neutral-400">
            <span>// Works Archive</span>
            <span>[{visiblePortfolio.length}]</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className="group cursor-pointer bg-neutral-900 border border-white/15 hover:border-white transition-all overflow-hidden"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-mono text-xs uppercase font-bold text-white group-hover:text-amber-300">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPortfolio && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div 
            className="relative w-full max-w-md bg-neutral-950 border border-white/20 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] bg-black mb-4 overflow-hidden border border-white/10">
              <img
                src={selectedPortfolio.image_url}
                alt={selectedPortfolio.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-mono text-sm font-bold uppercase text-white">{selectedPortfolio.title}</h3>
            {selectedPortfolio.description && (
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed font-sans">
                {selectedPortfolio.description}
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              {selectedPortfolio.project_url ? (
                <a
                  href={sanitizeUrl(selectedPortfolio.project_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-amber-400 font-bold uppercase hover:underline inline-flex items-center gap-1"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monolith Footer */}
      <div className="mt-14 pt-4 border-t-2 border-white/20 flex items-center justify-between font-mono text-[10px] uppercase text-neutral-500">
        <span>PROFILE.DJ // MONOLITH-V1</span>
        <span>STATUS: VERIFIED</span>
      </div>
    </div>
  );
};
