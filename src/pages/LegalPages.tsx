import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-white min-h-[80vh]">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
        <Shield className="w-4 h-4" />
        <span>Legal Documentation</span>
      </div>

      <h1 className="text-3xl font-display font-extrabold tracking-tight mb-8">
        {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
      </h1>

      <div className="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans border-t border-white/10 pt-6">
        {type === 'privacy' ? (
          <>
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Information We Collect</h2>
              <p>
                PROFILE.DJ collects user-provided information such as your name, email address, chosen username, professional headline, biography, contact avenues (phone, WhatsApp, public email), social links, and uploaded profile or portfolio media.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2">2. How We Use Your Data</h2>
              <p>
                We use your data solely to host, publish, and display your public digital business card at your chosen URL (profile.dj/yourname) and to allow you to manage your presence via your authenticated dashboard. We do not sell your personal data to third parties.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Storage & Security</h2>
              <p>
                Your account authentication and database records are securely protected with Supabase PostgreSQL Row Level Security (RLS). You retain full rights to update or delete your information at any time.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Terms of Use</h2>
              <p>
                By registering for an account on PROFILE.DJ, you agree to these Terms. PROFILE.DJ provides a digital profile platform for professionals, creators, and businesses in Djibouti and worldwide.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Usernames & Identity</h2>
              <p>
                Usernames are allocated on a first-come, first-served basis. You may not claim usernames to impersonate another person, trademark, or entity without authorization.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Content Guidelines</h2>
              <p>
                You are responsible for any portfolio work, descriptions, or external links you publish on your digital profile card. Prohibited content includes harmful or illegal material.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
