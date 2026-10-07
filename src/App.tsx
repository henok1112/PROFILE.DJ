import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { LegalPages } from './pages/LegalPages';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { auth, db } from './lib/supabase';
import { UserSession, Profile } from './types/database';
import { INITIAL_PROFILES } from './lib/defaultData';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [session, setSession] = useState<UserSession>({
    user: null,
  });

  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Sync Supabase Auth state directly
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChange(async (user, _session) => {
      setSession({
        user: user ? { id: user.id, email: user.email || '' } : null,
      });

      if (user) {
        try {
          const profile = await db.getProfileByUserId(user.id);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching profile for auth user:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Listen to browser popstate for smooth back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Identify route type with sanitized leading/trailing slashes, query params, hashes
  const cleanPath = currentPath.replace(/^\/+|\/+$/g, '').split('?')[0].split('#')[0];
  const normalizedRoute = cleanPath.toLowerCase();
  const isDashboardRoute = normalizedRoute === 'dashboard' || normalizedRoute.startsWith('dashboard/');
  const isKnownRoute = isDashboardRoute || ['explore', 'auth', 'signup', 'login', 'signin', 'onboarding', 'privacy', 'terms', ''].includes(normalizedRoute);
  const isPublicProfile = !isKnownRoute && cleanPath.length > 0;

  // Determine initial dashboard tab if on /dashboard/*
  const getDashboardTab = (): 'profile' | 'links' | 'services' | 'portfolio' | 'appearance' | 'analytics' | 'share' => {
    if (normalizedRoute.startsWith('dashboard/')) {
      const sub = normalizedRoute.replace('dashboard/', '');
      if (sub === 'templates' || sub === 'appearance') return 'appearance';
      if (sub === 'links') return 'links';
      if (sub === 'services') return 'services';
      if (sub === 'portfolio') return 'portfolio';
      if (sub === 'analytics') return 'analytics';
      if (sub === 'share') return 'share';
      if (sub === 'profile') return 'profile';
    }
    return 'profile';
  };

  const renderContent = () => {
    // While verifying existing session on app launch/refresh, avoid premature redirects or owner desync
    if (!authInitialized) {
      return (
        <div className="min-h-screen bg-[#0c0d0e] flex flex-col items-center justify-center text-white">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-3" />
          <span className="text-xs text-neutral-400 font-mono tracking-wider">Loading PROFILE.DJ…</span>
        </div>
      );
    }

    // 1. Public Profile route: e.g. /amina, /mohamed, /fatouma
    if (isPublicProfile) {
      return (
        <PublicProfilePage
          username={cleanPath}
          session={session}
          onNavigate={navigate}
        />
      );
    }

    // 2. Explore Profiles
    if (normalizedRoute === 'explore') {
      return (
        <ExplorePage
          onNavigate={navigate}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      );
    }

    // 3. Auth Page (Direct support for /auth, /signup, /login, /signin)
    if (normalizedRoute === 'auth' || normalizedRoute === 'signup' || normalizedRoute === 'login' || normalizedRoute === 'signin') {
      // If user is already authenticated, direct them to dashboard or onboarding
      if (session.user) {
        if (!userProfile) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }

      const isSignup = normalizedRoute === 'signup' || window.location.search.includes('mode=signup');
      return (
        <AuthPage
          initialMode={isSignup ? 'signup' : 'signin'}
          onSuccess={(mode) => {
            if (mode === 'signup') {
              navigate('/onboarding');
            } else {
              navigate('/dashboard');
            }
          }}
          onNavigate={navigate}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      );
    }

    // 4. Onboarding Page
    if (normalizedRoute === 'onboarding') {
      if (!session.user) {
        return (
          <AuthPage
            initialMode="signup"
            onSuccess={() => navigate('/onboarding')}
            onNavigate={navigate}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        );
      }
      return (
        <OnboardingPage
          session={session}
          onComplete={(username) => {
            navigate(`/${username}`);
          }}
          onNavigate={navigate}
        />
      );
    }

    // 5. Dashboard Page
    if (isDashboardRoute) {
      if (!session.user) {
        return (
          <AuthPage
            initialMode="signin"
            onSuccess={() => navigate('/dashboard')}
            onNavigate={navigate}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        );
      }
      return (
        <DashboardPage
          session={session}
          initialTab={getDashboardTab()}
          onNavigate={navigate}
          onSignOut={async () => {
            await auth.signOut();
            setUserProfile(null);
            navigate('/');
          }}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      );
    }

    // 6. Privacy & Terms
    if (cleanPath === 'privacy') {
      return <LegalPages type="privacy" onNavigate={navigate} />;
    }
    if (cleanPath === 'terms') {
      return <LegalPages type="terms" onNavigate={navigate} />;
    }

    // 7. Landing Page (Default '/')
    return (
      <LandingPage
        onNavigate={navigate}
        featuredProfile={INITIAL_PROFILES[0]}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar is displayed on general platform pages, but NOT on pure public digital business cards */}
      {!isPublicProfile && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          session={session}
          userUsername={userProfile?.username}
          onSignOut={async () => {
            await auth.signOut();
            setUserProfile(null);
            navigate('/');
          }}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer is displayed on general platform pages */}
      {!isPublicProfile && (
        <Footer
          onNavigate={navigate}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* Supabase Technical Setup & Schema Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
