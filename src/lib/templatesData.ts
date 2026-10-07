import { ProfileTemplate } from '../types/database';

export interface TemplateDefinition {
  id: ProfileTemplate;
  number: string;
  name: string;
  tagline: string;
  bestFor: string;
  description: string;
  badge: string;
  features: string[];
}

export const PROFILE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'minimal',
    number: '01',
    name: 'Minimal',
    tagline: 'Ultra-clean, quiet, timeless',
    bestFor: 'Designers, freelancers, and minimalists',
    description: 'Generous whitespace, centered hierarchy, large portrait, and quiet Apple-like simplicity without unnecessary decoration.',
    badge: 'Popular',
    features: ['Centered circular portrait', 'Clean 4-button dock', 'Uncluttered typography', 'Subtle border lines'],
  },
  {
    id: 'professional',
    number: '02',
    name: 'Professional',
    tagline: 'Modern executive business identity',
    bestFor: 'Consultants, business owners, agencies, and advisors',
    description: 'Structured executive header, verified profile shield, comprehensive direct contact actions, and structured service scopes.',
    badge: 'Executive',
    features: ['Structured profile card', 'Verified digital badge', '4-channel action hub', 'Structured service scopes'],
  },
  {
    id: 'creator',
    number: '03',
    name: 'Creator',
    tagline: 'Visual-first and social-focused',
    bestFor: 'Content creators, photographers, artists, and influencers',
    description: 'Dynamic cover visual, avatar with glowing status ring, prominent social channel tiles, and featured work spotlight.',
    badge: 'Social First',
    features: ['Cover banner backdrop', 'Spotlight work showcase', 'Prominent social chips', 'Dynamic avatar ring'],
  },
  {
    id: 'editorial',
    number: '04',
    name: 'Editorial',
    tagline: 'High-fashion & architectural magazine',
    bestFor: 'Architects, authors, creative directors, and stylists',
    description: 'Framed rectangular portrait, pullout quote-styled bio, numbered channel index (01, 02, 03), and sophisticated publication typography.',
    badge: 'Magazine',
    features: ['Rectangular framed photo', 'Quote pullout bio', 'Numbered index catalog', 'Hairline divider rules'],
  },
  {
    id: 'compact',
    number: '05',
    name: 'Compact',
    tagline: 'Sleek digital identity profile',
    bestFor: 'Mobile-first networking, tech founders, and professionals',
    description: 'Compact mobile-first layout with quick contact actions and segmented Links, Services, and Portfolio tabs for fast browsing.',
    badge: 'Compact',
    features: ['Pocket card container', '1-tap quick action row', 'Segmented tab switcher', 'Zero-scroll efficiency'],
  },
  {
    id: 'bento',
    number: '06',
    name: 'Bento Grid',
    tagline: 'Modern asymmetric architecture',
    bestFor: 'Modern tech professionals, multi-hyphenates, and developers',
    description: 'Asymmetric modular grid of high-contrast tiles, dedicated vCard badge, interactive contact widgets, and visual bento cards.',
    badge: 'Trending',
    features: ['Asymmetrical bento tiles', 'Dedicated vCard badge', 'Modular capabilities', 'Interactive quick widgets'],
  },
  {
    id: 'studio',
    number: '07',
    name: 'Studio',
    tagline: 'Creative agency & portfolio-forward',
    bestFor: 'Design studios, boutique consultancies, and visual artists',
    description: 'Full-bleed slate header, independent practice status badge, case study gallery front and center, and fee matrix.',
    badge: 'Agency',
    features: ['Studio header banner', 'Portfolio-forward showcase', 'Practice & capabilities', 'Terminal colophon footer'],
  },
  {
    id: 'monolith',
    number: '08',
    name: 'Monolith',
    tagline: 'Brutalist luxury & heavy contrast',
    bestFor: 'Industrial designers, tech leaders, and bold brands',
    description: 'Deep carbon tone, heavy square framed portrait, punchy uppercase typography, and full-bleed tactile action blocks.',
    badge: 'Modernist',
    features: ['Square heavy-border photo', 'Punchy uppercase headers', 'Full-width action block', 'Tactile bordered rows'],
  },
];
