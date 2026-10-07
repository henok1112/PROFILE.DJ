import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink } from 'lucide-react';
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

export const MinimalTemplate: React.FC<TemplateProps> = ({
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

  const handleSaveContact = () => {
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'minimal' });
    downloadVCard(profile);
  };

  const handleLinkClick = (platform: string) => {
    db.recordAnalyticsEvent(profile.id, 'link_click', { platform });
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-14 text-white">
      {/* Top Floating Action Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">profile.dj</span>
          <span className="text-neutral-600">/</span>
          <span className={`text-xs font-semibold ${accent.primaryText}`}>{profile.username}</span>
        </div>
        <button
          onClick={onShare}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} transition-colors text-neutral-300 hover:text-white`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {/* Large Profile Photo */}
        <div className="relative mb-5">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-900 flex items-center justify-center">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.display_name || profile.username}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback avatar icon
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-3xl font-display font-bold text-neutral-400">
                {(profile.first_name?.[0] || profile.username[0] || 'P').toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Name & Headline */}
        <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white">
          {profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username}
        </h1>

        {profile.headline && (
          <p className="mt-1.5 text-sm md:text-base font-normal text-neutral-300 max-w-md">
            {profile.headline}
          </p>
        )}

        {/* Location & Website meta */}
        {(profile.location || profile.website) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-neutral-400">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{profile.location}</span>
              </div>
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
          <p className="mt-4 text-xs md:text-sm text-neutral-400 leading-relaxed max-w-md text-center">
            {profile.bio}
          </p>
        )}

        {/* Primary Contact Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-6">
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

          <button
            onClick={handleSaveContact}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold transition-all cursor-pointer`}
          >
            <Download className="w-4 h-4" />
            <span>Save Contact</span>
          </button>
        </div>
      </div>

      {/* Social Links List */}
      {visibleLinks.length > 0 && (
        <div className="mt-8 space-y-2">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Links</p>
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={sanitizeUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link.platform)}
              className={`flex items-center justify-between p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 ${btnRadius} transition-all group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
                  <SocialIcon platform={link.platform} className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                  {link.platform}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
            </a>
          ))}
        </div>
      )}

      {/* Services Section */}
      {visibleServices.length > 0 && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Services</p>
          <div className="space-y-3">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className={`p-4 bg-white/[0.03] border border-white/10 ${btnRadius}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{svc.title}</h4>
                  {svc.price && (
                    <span className="text-xs font-semibold text-neutral-300 whitespace-nowrap px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {svc.price}
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                    {svc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {visiblePortfolio.length > 0 && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Portfolio</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className={`group cursor-pointer overflow-hidden bg-white/[0.03] border border-white/10 ${btnRadius} hover:border-white/20 transition-all`}
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
                  <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Item Detail Lightbox Modal */}
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

      {/* Footer Branding */}
      <div className="mt-14 pt-6 border-t border-white/10 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span>Created with</span>
          <span className="font-semibold text-neutral-400">PROFILE.DJ</span>
          <span>· Claim your link</span>
        </a>
      </div>
    </div>
  );
};
