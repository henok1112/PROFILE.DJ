import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, ExternalLink, ShieldCheck, Briefcase } from 'lucide-react';
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

export const ProfessionalTemplate: React.FC<TemplateProps> = ({
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
    db.recordAnalyticsEvent(profile.id, 'contact_save', { template: 'professional' });
    downloadVCard(profile);
  };

  const handleLinkClick = (platform: string) => {
    db.recordAnalyticsEvent(profile.id, 'link_click', { platform });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 md:py-12 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">profile.dj</span>
          <span className="text-neutral-600">/</span>
          <span className={`text-xs font-semibold ${accent.primaryText}`}>{profile.username}</span>
        </div>
        <button
          onClick={onShare}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} transition-colors text-neutral-200 hover:text-white`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Card</span>
        </button>
      </div>

      {/* Main Executive Profile Card */}
      <div className={`p-6 md:p-8 bg-[#141518]/90 border border-white/10 ${btnRadius} shadow-2xl backdrop-blur-md relative overflow-hidden`}>
        {/* Subtle accent corner glow */}
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${profile.theme === 'emerald' ? 'from-emerald-500/10' : profile.theme === 'blue' ? 'from-sky-500/10' : 'from-amber-500/10'} to-transparent pointer-events-none rounded-tr-3xl`} />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          {/* Avatar with status */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/15 bg-neutral-900 shadow-xl flex items-center justify-center">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.display_name || profile.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-display font-bold text-neutral-300">
                  {(profile.first_name?.[0] || profile.username[0] || 'P').toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#141518] p-1 rounded-full">
              <div className="bg-emerald-500 text-black p-0.5 rounded-full" title="Verified Digital Profile">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
                {profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username}
              </h1>
            </div>

            {profile.headline && (
              <p className={`mt-1 text-sm font-normal text-neutral-300`}>
                {profile.headline}
              </p>
            )}

            {/* Location & Website */}
            {(profile.location || profile.website) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2.5 text-xs text-neutral-400">
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
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-5 text-xs md:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4">
            {profile.bio}
          </p>
        )}

        {/* Direct Action Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          <button
            onClick={handleSaveContact}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 ${accent.primaryBg} ${btnRadius} text-xs font-semibold shadow-lg transition-all cursor-pointer`}
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
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>Call</span>
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email.trim()}`}
              onClick={() => handleLinkClick('Email')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 ${btnRadius} text-xs font-semibold text-neutral-200 hover:text-white transition-all`}
            >
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>

      {/* Social Links Cards */}
      {visibleLinks.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Connect & Channels</h3>
            <span className="text-[11px] text-neutral-500">{visibleLinks.length} Links</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.platform)}
                className={`flex items-center justify-between p-3 bg-[#141518]/70 hover:bg-[#1b1d22] border border-white/10 ${btnRadius} transition-all group`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors shrink-0">
                    <SocialIcon platform={link.platform} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                    {link.platform}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {visibleServices.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Services & Offerings</h3>
            <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
          </div>

          <div className="space-y-2.5">
            {visibleServices.map((svc) => (
              <div
                key={svc.id}
                className={`p-4 bg-[#141518]/70 border border-white/10 ${btnRadius} hover:border-white/20 transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{svc.title}</h4>
                  {svc.price && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-200 shrink-0">
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

      {/* Portfolio Showcase */}
      {visiblePortfolio.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Selected Work</h3>
            <span className="text-[11px] text-neutral-500">{visiblePortfolio.length} Projects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visiblePortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                className={`group cursor-pointer overflow-hidden bg-[#141518]/70 border border-white/10 ${btnRadius} hover:border-white/20 transition-all flex flex-col`}
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.project_url && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-white">
                      <span>View case study</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
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
            className="relative w-full max-w-lg bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-5"
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
            <h3 className="text-base font-semibold text-white">{selectedPortfolio.title}</h3>
            {selectedPortfolio.description && (
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                {selectedPortfolio.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/10">
              {selectedPortfolio.project_url ? (
                <a
                  href={selectedPortfolio.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-medium ${accent.primaryText} hover:underline`}
                >
                  <span>Open External Link</span>
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
      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span>Created with</span>
          <span className="font-semibold text-neutral-400">PROFILE.DJ</span>
          <span>· Digital Identity Platform</span>
        </a>
      </div>
    </div>
  );
};
