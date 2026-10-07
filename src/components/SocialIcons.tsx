import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Youtube, 
  Globe, 
  Send, 
  Github, 
  Phone, 
  MessageCircle, 
  Mail, 
  Share2,
  ExternalLink 
} from 'lucide-react';
import { SocialPlatform } from '../types/database';

interface SocialIconProps {
  platform: SocialPlatform | 'Email' | 'Phone' | 'WhatsApp';
  className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({ platform, className = 'w-5 h-5' }) => {
  switch (platform) {
    case 'Instagram':
      return <Instagram className={className} />;
    case 'LinkedIn':
      return <Linkedin className={className} />;
    case 'YouTube':
      return <Youtube className={className} />;
    case 'GitHub':
      return <Github className={className} />;
    case 'Telegram':
      return <Send className={className} />;
    case 'Website':
      return <Globe className={className} />;
    case 'Phone':
      return <Phone className={className} />;
    case 'WhatsApp':
      return <MessageCircle className={className} />;
    case 'Email':
      return <Mail className={className} />;
    case 'Facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'TikTok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76c-.3-.02-.6-.04-.89-.07z"/>
        </svg>
      );
    case 'X':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'Behance':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.992 3-3.69 0-5.734-2.584-5.734-6 0-3.525 2.191-6 5.631-6 3.75 0 5.419 2.664 5.228 6h-7.855c.07 1.586.994 3.003 2.766 3.003 1.29 0 2.22-.647 2.617-1.428l2.339 1.425zm-4.97-6.002c-.04-1.285-.826-2.128-2.15-2.128-1.391 0-2.138.86-2.298 2.128h4.448zm-11.756 6.002h-4v-14h4.743c3.486 0 5.257 1.472 5.257 3.992 0 1.545-.733 2.684-1.895 3.328 1.488.583 2.395 1.956 2.395 3.753 0 2.825-1.996 4.927-6.5 4.927zm-1-8h2.375c1.602 0 2.375-.724 2.375-1.928 0-1.156-.773-1.872-2.375-1.872h-2.375v3.8zm0 5.8h2.472c1.78 0 2.628-.809 2.628-2.146 0-1.299-.848-2.154-2.628-2.154h-2.472v4.3z"/>
        </svg>
      );
    case 'Dribbble':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm10.18 10.748c-.287-.044-2.607-.375-5.234.331-.22-.489-.452-.977-.7-1.458 3.593-1.464 4.965-3.326 5.097-3.513 1.258 1.34 2.053 3.093 2.147 5.033zm-4.321-7.142c-.171.218-1.54 1.957-5.004 3.33-1.635-3.033-3.411-5.59-3.57-5.815 1.44-.544 3.012-.843 4.655-.843 1.481 0 2.888.243 4.195.706zm-10.742 1.365c.162.228 1.921 2.753 3.562 5.753-2.112.63-4.992.935-7.854.963.633-2.83 2.222-5.266 4.453-6.942zm-5.074 9.029v-.22c2.721-.027 5.719-.347 7.962-.998.411.83.784 1.667 1.118 2.502-3.834 2.371-5.289 6.275-5.397 6.577-2.274-1.922-3.683-4.757-3.683-7.861zm10.223 9.771c.143-.377 1.559-3.953 5.373-6.196 1.328 3.364 1.83 6.326 1.892 6.744-1.604 1.057-3.526 1.681-5.595 1.681-.564 0-1.117-.046-1.67-.129zm8.563-3.076c-.08-.475-.589-3.315-1.873-6.559 2.38-.68 4.498-.389 4.777-.348-.124 2.658-1.196 5.071-2.904 6.907z"/>
        </svg>
      );
    default:
      return <ExternalLink className={className} />;
  }
};
