import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { auth, isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot' | 'reset';
  onSuccess: (mode: 'signin' | 'signup') => void;
  onNavigate: (path: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onSuccess,
  onNavigate,
  onOpenSupabaseModal,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      setError('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!email.trim() || (!password && mode !== 'forgot')) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const { user, session, error: signUpError } = await auth.signUp(email, password);
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // If email confirmation is required by user's Supabase project
        if (user && !session) {
          setSuccessMsg('Account created! Please check your email for the confirmation link, or sign in if email confirmation is disabled in your Supabase project.');
          setLoading(false);
          return;
        }

        onSuccess('signup');
      } else if (mode === 'signin') {
        const { session, error: signInError } = await auth.signIn(email, password);
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
        if (session) {
          onSuccess('signin');
        }
      } else if (mode === 'forgot') {
        const { error: resetError } = await auth.resetPassword(email);
        if (resetError) {
          setError(resetError.message);
        } else {
          setSuccessMsg('Password recovery link has been sent to your email address.');
        }
        setLoading(false);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('/')}
            className="text-2xl font-display font-extrabold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer"
          >
            PROFILE.DJ
          </button>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
            {mode === 'signup' && 'Create your account'}
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            {mode === 'signup' && 'Claim your username and launch your verified digital profile.'}
            {mode === 'signin' && 'Manage your profile, links, services, and appearance.'}
            {mode === 'forgot' && 'Enter your account email to receive a recovery link.'}
          </p>
        </div>

        {/* Unconfigured Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-300 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>Supabase Configuration Required</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Real user authentication requires <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
            </p>
            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="w-full mt-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Configure Supabase Connection
              </button>
            )}
          </div>
        )}

        {/* Auth Card */}
        <div className="p-8 rounded-3xl bg-[#141518] border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500 transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>
                {loading ? 'Connecting...' : mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Sign In' : 'Send Recovery Link'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-xs text-neutral-400 pt-4 border-t border-white/5">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
