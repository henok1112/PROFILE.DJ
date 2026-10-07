import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { SocialIcon } from '../SocialIcons';
import { downloadVCard } from '../../lib/vcard';
import { getAccentClasses, getButtonRadius } from './themeHelper';
import { db, sanitizeUrl } from '../../lib/supabase';

interface TemplateProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  onShare: () => void;
  onLinkClick?: (platform: string) => void;
}

export const CreatorTemplate: React.FC<TemplateProps> = ({
  profile,
  socialLinks,
  services,
  portfolio,
  onShare,
}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const accent = getAccentClasses(profile.theme);
  const btnRadius = getButtonRadius(profile.button_style);

  const visibleLinks = socialLinks.filter(l => l.is_visible);
  const visibleServices = services.filter(s => s.is_visible);
  const visiblePortfolio = portfolio.filter(p => p.is_visible);

  const featuredItem = visiblePortfolio[0] || null;

  const handleSaveContact = () => {
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'creator' });
    downloadVCard(profile);
  };

  const handleLinkClick = (platform: string) => {
    db.recordAnalyticsEvent(profile.id, 'link_click', { platform });
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-12 text-white">
      {/* Visual Cover Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-neutral-900">
        {profile.cover_photo_url ? (
          <img
            src={profile.cover_photo_url}
            alt="Cover visual"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-900/40 via-purple-900/30 to-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/30 to-transparent" />

        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold tracking-wider text-neutral-300">
            PROFILE.DJ / {profile.username}
          </div>
          <button
            onClick={onShare}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors text-white"
            title="Share profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-10">
        {/* Creator Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full p-1 bg-[#0c0d0e] shadow-2xl relative">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-neutral-900 flex items-center justify-center">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.display_name || profile.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-display font-bold text-neutral-300">
                  {(profile.first_name?.[0] || profile.username[0] || 'C').toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 p-1 rounded-full bg-amber-400 text-black shadow-lg">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
            </div>
          </div>

          <h1 className="mt-3 text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white">
            {profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username}
          </h1>

          {profile.headline && (
            <p className="mt-1 text-xs md:text-sm font-normal text-neutral-300">
              {profile.headline}
            </p>
          )}

          {/* Location & Website */}
          {(profile.location || profile.website) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-neutral-400">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  {profile.location}
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
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-xs md:text-sm text-neutral-300 leading-relaxed max-w-md">
              {profile.bio}
            </p>
          )}

          {/* Social Channels Row */}
          {visibleLinks.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={sanitizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.platform)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white transition-all group"
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} className="w-4 h-4 text-neutral-300 group-hover:text-amber-400 transition-colors" />
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          )}

          {/* Primary Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-5">
            <button
              onClick={handleSaveContact}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold shadow-lg transition-all cursor-pointer`}
            >
              <Download className="w-4 h-4" />
              <span>Contact</span>
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
          </div>
        </div>

        {/* Featured Showcase Item Spotlight */}
        {featuredItem && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Featured Spotlight
              </span>
            </div>

            <div
              onClick={() => setSelectedPortfolio(featuredItem)}
              className={`group cursor-pointer relative overflow-hidden bg-neutral-900 border border-white/15 ${btnRadius} shadow-xl`}
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={featuredItem.image_url}
                  alt={featuredItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {featuredItem.title}
                </h3>
                {featuredItem.description && (
                  <p className="mt-1 text-xs text-neutral-300 line-clamp-2">
                    {featuredItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Gallery */}
        {visiblePortfolio.length > 1 && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">Portfolio & Works</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {visiblePortfolio.slice(1).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPortfolio(item)}
                  className={`group cursor-pointer overflow-hidden bg-neutral-900 border border-white/10 ${btnRadius} hover:border-white/20 transition-all`}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services / Booking */}
        {visibleServices.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">Services & Booking</h3>
            <div className="space-y-2.5">
              {visibleServices.map((svc) => (
                <div
                  key={svc.id}
                  className={`p-3.5 bg-white/[0.04] border border-white/10 ${btnRadius}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white">{svc.title}</h4>
                    {svc.price && (
                      <span className="text-xs font-medium text-amber-300">{svc.price}</span>
                    )}
                  </div>
                  {svc.description && (
                    <p className="mt-1 text-[11px] text-neutral-400">{svc.description}</p>
                  )}
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
              <h3 className="text-base font-semibold text-white">{selectedPortfolio.title}</h3>
              {selectedPortfolio.description && (
                <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed">
                  {selectedPortfolio.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                {selectedPortfolio.project_url ? (
                  <a
                    href={selectedPortfolio.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs font-medium ${accent.primaryText} hover:underline`}
                  >
                    <span>Visit Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold text-neutral-400">PROFILE.DJ</span>
            <span>· Create your own</span>
          </a>
        </div>
      </div>
    </div>
  );
};
