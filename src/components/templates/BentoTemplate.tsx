import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, ShieldCheck, QrCode, ArrowUpRight } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { downloadVCard } from '../../lib/vcard';
import { db } from '../../lib/supabase';

interface BentoTemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare?: () => void;
  onOpenShareModal?: () => void;
  onLinkClick?: (platform: string) => void;
}

export const BentoTemplate: React.FC<BentoTemplateProps> = ({
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
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'bento' });
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
      {/* Top Status Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-neutral-400 text-[11px]">ACTIVE IDENTITY</span>
        </div>
        <button
          onClick={handleOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Bento Modular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3.5">
        {/* Card 1: Main Identity Hero (Spans 4 columns on md) */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-[#141518] border border-white/10 flex flex-col justify-between shadow-xl">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shadow-md">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-heading font-black text-2xl text-neutral-400">
                    {(profile.first_name?.[0] || profile.username[0] || 'B').toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#141518] p-0.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                @{profile.username}
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white truncate">
                {displayName}
              </h1>
              {profile.headline && (
                <p className="mt-1 text-xs sm:text-sm font-normal text-neutral-300">
                  {profile.headline}
                </p>
              )}
            </div>
          </div>

          {(profile.location || profile.website) && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400">
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

        {/* Card 2: Save Contact & QR Bento Tile (Spans 2 columns on md) */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-neutral-900 to-[#17181c] border border-white/10 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>VCARD</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>

          <div className="my-3">
            <span className="text-xs text-neutral-400 block mb-0.5">Quick Save</span>
            <h4 className="text-sm font-bold text-white leading-snug">Add to Contacts</h4>
          </div>

          <button
            onClick={handleSaveContact}
            className={`w-full py-2.5 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer`}
          >
            <Download className="w-4 h-4" />
            <span>Save Contact</span>
          </button>
        </div>

        {/* Card 3: Bio Tile (Full width on md if bio exists) */}
        {profile.bio && (
          <div className="md:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141518] border border-white/10 shadow-lg">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">About</span>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Card 4: Direct Communication Channels (Spans 3 cols) */}
        <div className="md:col-span-3 p-5 rounded-3xl bg-[#141518] border border-white/10 flex flex-col justify-between shadow-lg space-y-3">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Fast Reach</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick('WhatsApp')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {profile.phone && (
              <a
                href={`tel:${profile.phone.trim()}`}
                onClick={() => handleLinkClick('Phone')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-semibold transition-colors"
              >
                <Phone className="w-4 h-4 text-neutral-300" />
                <span>Direct Call</span>
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email.trim()}`}
                onClick={() => handleLinkClick('Email')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-semibold transition-colors col-span-1 sm:col-span-2"
              >
                <Mail className="w-4 h-4 text-neutral-300" />
                <span className="truncate">{profile.email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Card 5: Social Channels Grid (Spans 3 cols) */}
        <div className="md:col-span-3 p-5 rounded-3xl bg-[#141518] border border-white/10 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            <span>Social Handles</span>
            <span>[{visibleLinks.length}]</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.platform)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SocialIcon platform={link.platform} className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" />
                  <span className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                    {link.platform}
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-amber-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Card 6: Services Bento Tiles (Spans 6 cols) */}
        {visibleServices.length > 0 && (
          <div className="md:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141518] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Services & Capabilities
              </span>
              <span className="text-[11px] font-mono text-neutral-500">[{visibleServices.length}]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleServices.map((svc) => (
                <div
                  key={svc.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white">{svc.title}</h4>
                    {svc.price && (
                      <span className="text-[10px] font-mono font-semibold text-amber-300 px-2 py-0.5 rounded bg-white/5 border border-white/10 shrink-0">
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
          </div>
        )}

        {/* Card 7: Portfolio Bento Visuals (Spans 6 cols) */}
        {visiblePortfolio.length > 0 && (
          <div className="md:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141518] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Selected Work
              </span>
              <span className="text-[11px] font-mono text-neutral-500">[{visiblePortfolio.length}]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {visiblePortfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPortfolio(item)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 hover:border-white/25 transition-all"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-white truncate group-hover:text-amber-300">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
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
            className="relative w-full max-w-md bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4"
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

      {/* Bento Footer */}
      <div className="mt-12 text-center text-[11px] font-mono text-neutral-500">
        PROFILE.DJ BENTO GRID · VERIFIED RECORD
      </div>
    </div>
  );
};
