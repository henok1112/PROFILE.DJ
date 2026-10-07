import React from 'react';
import { Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#08090a] text-neutral-400 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="text-lg font-display font-extrabold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer"
          >
            PROFILE.DJ
          </button>
          <p className="mt-1 text-xs text-neutral-500 max-w-xs">
            Your profile. Your link. Your identity.
          </p>
          <p className="mt-2 text-[11px] text-neutral-600">
            Engineered for professionals in Djibouti and worldwide.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-neutral-400">
          <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer">
            Home
          </button>
          <button onClick={() => onNavigate('/explore')} className="hover:text-white transition-colors cursor-pointer">
            Explore
          </button>
          <button onClick={() => onNavigate('/auth')} className="hover:text-white transition-colors cursor-pointer">
            Sign In
          </button>
          <button onClick={() => onNavigate('/auth?mode=signup')} className="hover:text-white transition-colors cursor-pointer text-amber-400">
            Create Profile
          </button>
          <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
            Terms
          </button>
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[11px] border border-white/10 transition-colors"
            >
              <Database className="w-3 h-3 text-amber-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Database Status'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 gap-3">
        <span>© {new Date().getFullYear()} PROFILE.DJ. All rights reserved.</span>
        <span>Made with care for Djibouti & global creators.</span>
      </div>
    </footer>
  );
};
