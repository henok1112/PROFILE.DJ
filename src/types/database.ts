export type ProfileTemplate = 
  | 'minimal' 
  | 'professional' 
  | 'creator' 
  | 'editorial' 
  | 'compact' 
  | 'bento' 
  | 'studio' 
  | 'monolith';

export type AccentColor = 
  | 'amber' 
  | 'emerald' 
  | 'blue' 
  | 'rose' 
  | 'violet' 
  | 'neutral' 
  | 'slate' 
  | 'zinc';

export type ButtonStyle = 'rounded' | 'pill' | 'sharp';

export type BackgroundStyle = 'clean' | 'subtle-mesh' | 'dots' | 'card-glow';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  headline: string;
  bio: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  location: string;
  theme: AccentColor;
  template: ProfileTemplate;
  button_style: ButtonStyle;
  background_style: BackgroundStyle;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type SocialPlatform = 
  | 'Instagram' 
  | 'TikTok' 
  | 'Facebook' 
  | 'LinkedIn' 
  | 'YouTube' 
  | 'X' 
  | 'Telegram' 
  | 'Website'
  | 'GitHub'
  | 'WhatsApp'
  | 'Behance'
  | 'Dribbble';

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: SocialPlatform;
  url: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface Service {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  price?: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface PortfolioItem {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  image_url: string;
  project_url?: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
}
