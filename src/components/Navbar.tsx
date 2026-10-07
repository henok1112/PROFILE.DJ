import React from 'react';
import { User, LogIn, LayoutDashboard } from 'lucide-react';
import { UserSession } from '../types/database';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  session: UserSession;
  userUsername?: string | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  session,
  userUsername,
  onSignOut,
}) => {
  const isLoggedIn = Boolean(session.user);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0e]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onNavigate('/')}
          className="text-lg font-display font-extrabold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer"
        >
          PROFILE.DJ
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onNavigate('/')}
            className={`hover:text-white transition-colors cursor-pointer ${
              currentPath === '/' ? 'text-white' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('/explore')}
            className={`hover:text-white transition-colors cursor-pointer ${
              currentPath === '/explore' ? 'text-white' : ''
            }`}
          >
            Explore
          </button>
          {isLoggedIn && userUsername && (
            <button
              onClick={() => onNavigate(`/${userUsername}`)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              My Public Link
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/auth')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/auth?mode=signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Create Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
