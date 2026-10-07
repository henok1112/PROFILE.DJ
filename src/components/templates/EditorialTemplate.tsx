import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, Quote, Sparkles } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { downloadVCard } from '../../lib/vcard';
import { db } from '../../lib/supabase';

interface EditorialTemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare?: () => void;
  onOpenShareModal?: () => void;
  onLinkClick?: (platform: string) => void;
}

export const EditorialTemplate: React.FC<EditorialTemplateProps> = ({
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
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'editorial' });
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
      {/* Editorial Folio Header */}
      <div className="flex items-center justify-between pb-3 mb-8 border-b border-white/15 text-[11px] font-mono tracking-widest uppercase text-neutral-400">
        <span>PROFILE.DJ · ISSUE N°01</span>
        <span>{profile.location || 'EAST AFRICA / GLOBAL'}</span>
        <button
          onClick={handleOpenShare}
          className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Share profile"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Editorial Header: Split Portrait & Identity */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Framed Rectangular Editorial Photo */}
          <div className="relative shrink-0">
            <div className="w-32 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-heading font-black text-4xl text-neutral-400">
                  {(profile.first_name?.[0] || profile.username[0] || 'E').toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-amber-400">
              ID #{profile.username}
            </span>
          </div>

          {/* Name & Typography Statement */}
          <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-1">
              Featured Profile
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white leading-tight">
              {displayName}
            </h1>
            {profile.headline && (
              <p className="mt-2 text-sm sm:text-base text-neutral-300 font-medium italic">
                "{profile.headline}"
              </p>
            )}

            {/* Location & Website */}
            {(profile.location || profile.website) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs text-neutral-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.location && profile.website && <span className="text-neutral-700">·</span>}
                {profile.website && (
                  <a
                    href={sanitizeUrl(profile.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick('Website')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Globe className="w-3 h-3 text-neutral-500" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio as an Editorial Statement */}
        {profile.bio && (
          <div className="relative p-5 sm:p-6 rounded-2xl bg-white/[0.02] border-l-2 border-amber-400 border-y border-r border-white/5">
            <Quote className="w-5 h-5 text-amber-400/40 mb-2" />
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Action Dock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            onClick={handleSaveContact}
            className={`flex items-center justify-center gap-1.5 py-3 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold shadow-md transition-all cursor-pointer`}
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
              className={`flex items-center justify-center gap-1.5 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-emerald-400 transition-all`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          {profile.phone && (
            <a
              href={`tel:${profile.phone.trim()}`}
              onClick={() => handleLinkClick('Phone')}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-white transition-all`}
            >
              <Phone className="w-4 h-4 text-neutral-300" />
              <span>Call Direct</span>
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email.trim()}`}
              onClick={() => handleLinkClick('Email')}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-white transition-all`}
            >
              <Mail className="w-4 h-4 text-neutral-300" />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>

      {/* Editorial Index: Social Links */}
      {visibleLinks.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Index / Channels
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">[{visibleLinks.length}]</span>
          </div>

          <div className="divide-y divide-white/5 border-y border-white/10">
            {visibleLinks.map((link, idx) => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.platform)}
                className="group flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-500 group-hover:text-amber-400 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                    <SocialIcon platform={link.platform} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                    {link.platform}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 group-hover:text-neutral-300">
                  <span>Explore</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {visibleServices.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Repertoire / Offerings
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">[{visibleServices.length}]</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{svc.title}</h4>
                  {svc.description && (
                    <p className="mt-1 text-xs text-neutral-400 leading-relaxed max-w-md">
                      {svc.description}
                    </p>
                  )}
                </div>
                {svc.price && (
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded bg-white/5 border border-white/10 text-amber-300 shrink-0 self-start sm:self-center">
                    {svc.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Showcase */}
      {visiblePortfolio.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono">
              Catalog / Selected Work
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">[{visiblePortfolio.length}]</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all bg-white/[0.02]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
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
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-black mb-4">
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

      {/* Editorial Colophon Footer */}
      <div className="mt-16 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span>PROFILE.DJ VERIFIED CARD</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </div>
  );
};
