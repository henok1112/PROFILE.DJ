import React, { useState } from 'react';
import { Profile, SocialLink, Service, PortfolioItem } from '../../types/database';
import { MinimalTemplate } from './MinimalTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { CreatorTemplate } from './CreatorTemplate';
import { EditorialTemplate } from './EditorialTemplate';
import { CompactTemplate } from './CompactTemplate';
import { BentoTemplate } from './BentoTemplate';
import { StudioTemplate } from './StudioTemplate';
import { MonolithTemplate } from './MonolithTemplate';
import { ShareModal } from '../ShareModal';
import { getBackgroundClasses } from './themeHelper';
import { db } from '../../lib/supabase';

interface ProfileRendererProps {
  profile: Profile;
  socialLinks: SocialLink[];
  services: Service[];
  portfolio: PortfolioItem[];
  isPreview?: boolean;
}

export const ProfileRenderer: React.FC<ProfileRendererProps> = ({
  profile,
  socialLinks,
  services,
  portfolio,
  isPreview = false,
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const bgClasses = getBackgroundClasses(profile.background_style);
  const handleOpenShare = () => setIsShareOpen(true);
  const handleLinkClick = (platform: string) => {
    db.recordAnalyticsEvent(profile.id, 'link_click', { platform });
  };

  const renderTemplate = () => {
    switch (profile.template) {
      case 'professional':
        return (
          <ProfessionalTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'creator':
        return (
          <CreatorTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'editorial':
        return (
          <EditorialTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'compact':
        return (
          <CompactTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'bento':
        return (
          <BentoTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'studio':
        return (
          <StudioTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'monolith':
        return (
          <MonolithTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
      case 'minimal':
      default:
        return (
          <MinimalTemplate
            profile={profile}
            socialLinks={socialLinks}
            services={services}
            portfolio={portfolio}
            onShare={handleOpenShare}
            onLinkClick={handleLinkClick}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen w-full ${bgClasses} transition-colors duration-300 relative`}>
      {/* Template Component */}
      {renderTemplate()}

      {/* Share Modal */}
      <ShareModal
        profile={profile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
