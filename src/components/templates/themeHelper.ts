import { AccentColor, ButtonStyle, BackgroundStyle } from '../../types/database';

export function getAccentClasses(theme: AccentColor) {
  switch (theme) {
    case 'emerald':
      return {
        primaryBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
        primaryText: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/10',
        subtleBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        badge: 'text-emerald-400',
      };
    case 'blue':
      return {
        primaryBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
        primaryText: 'text-sky-400',
        border: 'border-sky-500/30',
        glow: 'shadow-sky-500/10',
        subtleBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        badge: 'text-sky-400',
      };
    case 'rose':
      return {
        primaryBg: 'bg-rose-500 hover:bg-rose-400 text-white',
        primaryText: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-500/10',
        subtleBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        badge: 'text-rose-400',
      };
    case 'violet':
      return {
        primaryBg: 'bg-purple-500 hover:bg-purple-400 text-white',
        primaryText: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/10',
        subtleBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        badge: 'text-purple-400',
      };
    case 'slate':
      return {
        primaryBg: 'bg-slate-200 hover:bg-white text-slate-900',
        primaryText: 'text-slate-300',
        border: 'border-slate-400/30',
        glow: 'shadow-slate-500/10',
        subtleBg: 'bg-slate-400/10 text-slate-200 border-slate-400/20',
        badge: 'text-slate-300',
      };
    case 'zinc':
      return {
        primaryBg: 'bg-zinc-200 hover:bg-white text-zinc-900',
        primaryText: 'text-zinc-300',
        border: 'border-zinc-400/30',
        glow: 'shadow-zinc-500/10',
        subtleBg: 'bg-zinc-400/10 text-zinc-200 border-zinc-400/20',
        badge: 'text-zinc-300',
      };
    case 'neutral':
      return {
        primaryBg: 'bg-neutral-100 hover:bg-white text-neutral-900',
        primaryText: 'text-neutral-300',
        border: 'border-neutral-400/30',
        glow: 'shadow-neutral-500/10',
        subtleBg: 'bg-neutral-400/10 text-neutral-200 border-neutral-400/20',
        badge: 'text-neutral-300',
      };
    case 'amber':
    default:
      return {
        primaryBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold',
        primaryText: 'text-amber-400',
        border: 'border-amber-400/30',
        glow: 'shadow-amber-400/10',
        subtleBg: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
        badge: 'text-amber-400',
      };
  }
}

export function getButtonRadius(buttonStyle: ButtonStyle) {
  switch (buttonStyle) {
    case 'pill':
      return 'rounded-full';
    case 'sharp':
      return 'rounded-none';
    case 'rounded':
    default:
      return 'rounded-xl';
  }
}

export function getBackgroundClasses(bgStyle: BackgroundStyle) {
  switch (bgStyle) {
    case 'dots':
      return 'bg-[#0b0c0e] [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px]';
    case 'card-glow':
      return 'bg-[#090a0c] [background:radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(120,119,198,0.12),transparent)]';
    case 'subtle-mesh':
      return 'bg-[#0c0d0f] [background:radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/60 via-[#0c0d0f] to-[#070809]';
    case 'clean':
    default:
      return 'bg-[#0c0d0e]';
  }
}
