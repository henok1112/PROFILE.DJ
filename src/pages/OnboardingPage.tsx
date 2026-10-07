import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  X, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Camera, 
  AlertCircle,
  AlertTriangle,
  Loader2,
  Layout
} from 'lucide-react';
import { db, isSupabaseConfigured } from '../lib/supabase';
import { UserSession, SocialPlatform, ProfileTemplate } from '../types/database';
import { PROFILE_TEMPLATES } from '../lib/templatesData';

interface OnboardingPageProps {
  session: UserSession;
  onComplete: (username: string) => void;
  onNavigate: (path: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ session, onComplete, onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;

  // Draft persistence key scoped to the logged-in user
  const draftKey = session.user ? `profile_dj_onboarding_${session.user.id}` : null;

  // Step 1: Name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2: Username
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    state: 'idle' | 'checking' | 'available' | 'taken' | 'error';
    message: string | null;
  }>({ state: 'idle', message: null });

  // Step 3: Profession / Headline
  const [headline, setHeadline] = useState('');

  // Step 4: Short bio
  const [bio, setBio] = useState('');

  // Step 5: Profile Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 6: Contact links
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(session.user?.email || '');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Step 7: Visual Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate>('minimal');

  // Final submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Restore draft if user refreshes mid-onboarding
  useEffect(() => {
    if (!draftKey) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.step) setStep(d.step);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.username) setUsername(d.username);
        if (d.headline) setHeadline(d.headline);
        if (d.bio) setBio(d.bio);
        if (d.photoUrl) setPhotoUrl(d.photoUrl);
        if (d.phone) setPhone(d.phone);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
        if (d.contactEmail) setContactEmail(d.contactEmail);
        if (d.website) setWebsite(d.website);
        if (d.instagram) setInstagram(d.instagram);
        if (d.facebook) setFacebook(d.facebook);
        if (d.tiktok) setTiktok(d.tiktok);
        if (d.linkedin) setLinkedin(d.linkedin);
        if (d.selectedTemplate) setSelectedTemplate(d.selectedTemplate);
      }
    } catch {}
  }, [draftKey]);

  // Persist draft on every step change or input
  useEffect(() => {
    if (!draftKey) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        step,
        firstName,
        lastName,
        username,
        headline,
        bio,
        photoUrl,
        phone,
        whatsapp,
        contactEmail,
        website,
        instagram,
        facebook,
        tiktok,
        linkedin,
        selectedTemplate,
      }));
    } catch {}
  }, [draftKey, step, firstName, lastName, username, headline, bio, photoUrl, phone, whatsapp, contactEmail, website, instagram, facebook, tiktok, linkedin, selectedTemplate]);

  // Real-time username check against Supabase profiles table
  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'idle', message: null });
      return;
    }

    const clean = username.toLowerCase().trim();
    if (clean.length < 3) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Username must be at least 3 characters.' });
      return;
    }

    if (clean.length > 30) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Username cannot exceed 30 characters.' });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(clean)) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Only lowercase letters, numbers, and hyphens are allowed.' });
      return;
    }

    if (clean.startsWith('-')) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Username cannot start with a hyphen.' });
      return;
    }

    if (clean.endsWith('-')) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Username cannot end with a hyphen.' });
      return;
    }

    if (clean.includes('--')) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      setUsernameStatus({ state: 'error', message: 'Username cannot contain consecutive hyphens.' });
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus({ state: 'checking', message: 'Checking availability…' });

    const timer = setTimeout(async () => {
      try {
        const res = await db.checkUsernameAvailable(clean);
        setIsCheckingUsername(false);
        if (res.isError) {
          setIsUsernameAvailable(false);
          setUsernameStatus({
            state: 'error',
            message: "⚠ We couldn't check availability right now. Please try again.",
          });
        } else if (res.available) {
          setIsUsernameAvailable(true);
          setUsernameStatus({
            state: 'available',
            message: '✓ This username is available',
          });
        } else {
          setIsUsernameAvailable(false);
          setUsernameStatus({
            state: 'taken',
            message: '✕ This username is already taken',
          });
        }
      } catch (err) {
        setIsCheckingUsername(false);
        setIsUsernameAvailable(false);
        setUsernameStatus({
          state: 'error',
          message: "⚠ We couldn't check availability right now. Please try again.",
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Handle Photo Upload
  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session.user) return;

    setUploadError(null);
    setIsUploadingPhoto(true);

    try {
      const url = await db.uploadMedia(file, 'avatars', session.user.id);
      setPhotoUrl(url);
    } catch (err: unknown) {
      console.error('Photo upload error:', err);
      setUploadError((err as Error).message || 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Final Submit to Supabase
  const handleFinalSubmit = async () => {
    if (!session.user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cleanUsername = username.toLowerCase().trim();
      const displayName = `${firstName} ${lastName}`.trim() || cleanUsername;

      // 1. Double check username availability right before insert
      const check = await db.checkUsernameAvailable(cleanUsername);
      if (!check.available) {
        setSubmitError(check.reason || 'Username was taken right before submission. Please pick another.');
        setStep(2);
        setIsSubmitting(false);
        return;
      }

      // 2. Insert to Supabase profiles table
      const newProfile = await db.createProfile({
        user_id: session.user.id,
        username: cleanUsername,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: displayName,
        profile_photo_url: photoUrl,
        cover_photo_url: null,
        headline: headline.trim() || 'Professional',
        bio: bio.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: contactEmail.trim() || session.user.email || '',
        website: website.trim(),
        location: 'Djibouti',
        theme: 'amber',
        template: selectedTemplate || 'minimal',
        button_style: 'rounded',
        background_style: 'subtle-mesh',
        is_published: false,
      });

      // 3. Insert social links if provided
      const linksToSave: { platform: SocialPlatform; url: string; display_order: number; is_visible: boolean }[] = [];
      let order = 0;

      if (instagram) linksToSave.push({ platform: 'Instagram', url: instagram, display_order: order++, is_visible: true });
      if (linkedin) linksToSave.push({ platform: 'LinkedIn', url: linkedin, display_order: order++, is_visible: true });
      if (tiktok) linksToSave.push({ platform: 'TikTok', url: tiktok, display_order: order++, is_visible: true });
      if (facebook) linksToSave.push({ platform: 'Facebook', url: facebook, display_order: order++, is_visible: true });
      if (website) linksToSave.push({ platform: 'Website', url: website, display_order: order++, is_visible: true });

      if (linksToSave.length > 0) {
        await db.saveSocialLinks(newProfile.id, linksToSave as any);
      }

      // Clear draft on successful completion
      if (draftKey) {
        sessionStorage.removeItem(draftKey);
      }

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setIsReady(true);
    } catch (err: unknown) {
      console.error('Failed to create profile:', err);
      setSubmitError((err as Error).message || 'Failed to save profile to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-white">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#141518] border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-display font-extrabold tracking-tight">Your profile has been created!</h2>
          <p className="mt-2 text-xs text-neutral-400">
            Saved as a private draft. You can preview it, customize further, and publish it when you're ready.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/10 text-center">
            <span className="text-xs text-neutral-400 block mb-1">Your personal link:</span>
            <span className="text-base font-mono font-bold text-amber-400">
              profile.dj/{username.toLowerCase().trim()}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onComplete(username.toLowerCase().trim())}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Preview My Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Go to Dashboard & Publish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-lg">
        {/* Step Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold text-white">PROFILE.DJ Onboarding</span>
          <span>Step {step} of {totalSteps}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-8">
          <div 
            className="h-full bg-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#141518] border border-white/10 shadow-2xl">
          {submitError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">What's your name?</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  This will be shown prominently on your digital card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">First name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Last name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hassan"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Username */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">Choose your username</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your custom link will be: <span className="font-mono text-amber-400">profile.dj/{username.toLowerCase().trim() || 'username'}</span>
                </p>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 select-none">
                    profile.dj/
                  </span>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full pl-24 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm font-mono text-white placeholder-neutral-500"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                    {usernameStatus.state === 'checking' && (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    )}
                    {usernameStatus.state === 'available' && (
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    )}
                    {usernameStatus.state === 'taken' && (
                      <X className="w-4 h-4 text-rose-400 stroke-[3]" />
                    )}
                    {usernameStatus.state === 'error' && (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>

                {/* Exact UI states required */}
                {usernameStatus.state === 'checking' && (
                  <p className="mt-2 text-xs text-amber-300 font-medium flex items-center gap-1.5 animate-pulse">
                    <span>Checking availability…</span>
                  </p>
                )}
                {usernameStatus.state === 'available' && (
                  <p className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <span>✓ This username is available</span>
                  </p>
                )}
                {usernameStatus.state === 'taken' && (
                  <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <span>✕ This username is already taken</span>
                  </p>
                )}
                {usernameStatus.state === 'error' && (
                  <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <span>{usernameStatus.message || "⚠ We couldn't check availability right now. Please try again."}</span>
                  </p>
                )}

                {/* Try demo usernames */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Try demo usernames:</span>
                  <div className="flex flex-wrap gap-2">
                    {['amina', 'fatouma', 'mohamed'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUsername(u)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        @{u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400 space-y-1">
                  <p>• 3–30 characters</p>
                  <p>• Lowercase letters, numbers, and hyphens only</p>
                  <p>• Verified in real-time against Supabase database</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Profession / Headline */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">What do you do?</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  A short professional title or headline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Profession / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Graphic Designer, Software Consultant, Architect"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500"
                />
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-neutral-400 block mb-2">Common examples:</span>
                <div className="flex flex-wrap gap-2">
                  {['Graphic Designer', 'Software Engineer', 'Photographer', 'Consultant', 'Content Creator', 'Architect'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setHeadline(s)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-neutral-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Bio */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">Tell people about yourself</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  A short bio introducing your skills, passions, or mission.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Short Bio</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Passionate about creating minimal design systems and digital products in Djibouti and beyond."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 outline-none text-sm text-white placeholder-neutral-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Photo */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <div>
                <h2 className="text-xl font-display font-bold">Add your profile photo</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload a crisp portrait stored directly in Supabase Storage.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-900 shadow-xl flex items-center justify-center mb-4 relative">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-10 h-10 text-neutral-500" />
                  )}
                </div>

                <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingPhoto ? 'Uploading to Supabase...' : photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoFile}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-500 mt-2">JPG, PNG or WebP up to 5MB</span>
              </div>
            </div>
          )}

          {/* STEP 6: Contact links */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-bold">Add your contact links</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  All fields are optional. People can connect with you directly.
                </p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">WhatsApp number</label>
                  <input
                    type="text"
                    placeholder="e.g. +253 77 12 34 56"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Phone number</label>
                  <input
                    type="text"
                    placeholder="e.g. +253 77 12 34 56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Public Email</label>
                  <input
                    type="email"
                    placeholder="e.g. you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Instagram</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">TikTok</label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@..."
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Facebook</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Template Choice */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">Choose your profile design</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Select your visual template. Templates control presentation only — all your profile details are preserved and you can change this anytime.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-neutral-900 shrink-0 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-black text-amber-400 text-sm">
                      {(firstName?.[0] || username?.[0] || 'P').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading font-extrabold text-white truncate">
                      {`${firstName} ${lastName}`.trim() || username}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                      Active: {PROFILE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {headline || 'Professional'} · profile.dj/{username}
                  </p>
                </div>
              </div>

              {/* 8 Template Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {PROFILE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400/30'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-neutral-400'
                            }`}>
                              {tmpl.number}
                            </span>
                            <span className="text-xs font-heading font-extrabold text-white">
                              {tmpl.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-300 font-medium">
                          {tmpl.tagline}
                        </p>
                        <p className="text-[10px] text-amber-400/90 mt-0.5">
                          Best for: {tmpl.bestFor}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !firstName.trim()) ||
                  (step === 2 && (!username.trim() || isCheckingUsername || isUsernameAvailable !== true || usernameStatus.state === 'error' || usernameStatus.state === 'taken'))
                }
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Saving to Supabase...' : 'Launch My Profile'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
