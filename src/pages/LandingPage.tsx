import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Share2, 
  MessageCircle, 
  ShieldCheck, 
  Palette, 
  Briefcase, 
  Users, 
  ExternalLink,
  QrCode,
  Smartphone,
  Globe2,
  Check
} from 'lucide-react';
import { Profile, ProfileTemplate } from '../types/database';
import { PROFILE_TEMPLATES } from '../lib/templatesData';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  featuredProfile: Profile;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, featuredProfile }) => {
  const [activeTemplatePreview, setActiveTemplatePreview] = useState<ProfileTemplate>('professional');

  const useCases = [
    { title: 'Professionals', desc: 'Share your executive credentials, company role, and contact points in one seamless tap.' },
    { title: 'Freelancers', desc: 'Put your rate card, design services, and client testimonials right into client hands.' },
    { title: 'Creators', desc: 'Direct your community across YouTube, TikTok, Instagram, and brand deals with zero friction.' },
    { title: 'Consultants', desc: 'Enable quick WhatsApp scheduling, direct phone calls, and vCard downloads on the fly.' },
    { title: 'Job Seekers', desc: 'Stand out from generic resumes with a live interactive portfolio and verified contact link.' },
    { title: 'Small Businesses', desc: 'A clean digital presence for your local store, restaurant, or boutique in Djibouti and beyond.' },
    { title: 'Students', desc: 'Showcase projects, research, GitHub repositories, and academic accomplishments.' },
    { title: 'Service Providers', desc: 'Architects, photographers, developers, and stylists eager to book new local clients.' },
  ];

  return (
    <div className="w-full text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
          {/* Left Column: Value Proposition */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-amber-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Digital Business Card for Djibouti & Beyond</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white text-balance leading-[1.08]">
              Your profile.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
                Your link.
              </span><br />
              Your identity.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl text-balance">
              Create a beautiful digital profile, share your contact information, showcase your work, and connect with anyone through one simple link.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => onNavigate('/auth?mode=signup')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all shadow-lg hover:shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/explore')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Profiles</span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Quick feature highlights */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom profile.dj/yourname URL</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR code sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-Tap WhatsApp & Call</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Digital Profile Card Preview */}
          <div className="flex-1 w-full max-w-md">
            <div className="relative mx-auto">
              {/* Outer phone/device styling */}
              <div className="p-2 sm:p-3 rounded-[36px] bg-gradient-to-b from-white/15 to-white/5 border border-white/15 shadow-2xl backdrop-blur-xl">
                {/* Template switch toggle inside preview */}
                <div className="flex items-center gap-1 mb-2.5 p-1 bg-black/40 rounded-xl overflow-x-auto no-scrollbar">
                  {PROFILE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setActiveTemplatePreview(tmpl.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeTemplatePreview === tmpl.id
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>

                {/* Inner Mockup Card */}
                <div className="bg-[#121316] rounded-[28px] border border-white/10 p-5 overflow-hidden text-left relative">
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                      <span className="text-amber-400">profile.dj</span>
                      <span>/</span>
                      <span className="text-white font-medium">amina</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 bg-neutral-800 shrink-0">
                      <img
                        src="/src/assets/images/amina_avatar_1791203166115.jpg"
                        alt="Amina Hassan"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">Amina Hassan</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-amber-400 font-medium">Creative Designer</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Djibouti City, Djibouti</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
                    Crafting thoughtful digital interfaces, design systems, and visual identities for forward-thinking brands.
                  </p>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 mt-4">
                    <div className="py-2 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </div>
                    <div className="py-2 px-2 rounded-lg bg-white/5 border border-white/10 text-center text-[11px] font-medium text-neutral-200 flex items-center justify-center gap-1">
                      <span>Call</span>
                    </div>
                    <div className="py-2 px-2 rounded-lg bg-amber-400 text-slate-950 font-semibold text-center text-[11px] flex items-center justify-center gap-1">
                      <span>vCard</span>
                    </div>
                  </div>

                  {/* Work Snapshot */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                      <span>Featured Work</span>
                      <span className="text-amber-400 font-mono">2026</span>
                    </div>
                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                      <img
                        src="/src/assets/images/portfolio_branding_1791201654227.jpg"
                        alt="Meridian Branding"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Live link click to open Amina's actual profile */}
                  <button
                    onClick={() => onNavigate('/amina')}
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Live Demo Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 border-t border-white/10 bg-[#0e0f12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2">How It Works</h2>
            <p className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">
              Launch your identity in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <span className="text-4xl font-display font-black text-amber-400/40">01</span>
                <h3 className="text-xl font-bold text-white mt-4">Create</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Build your digital profile in minutes. Claim your unique username, add your bio, profession, and photo.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-neutral-500 font-mono">
                profile.dj/yourname
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <span className="text-4xl font-display font-black text-amber-400/40">02</span>
                <h3 className="text-xl font-bold text-white mt-4">Customize</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Choose your visual identity from 8 premium designs: Minimal, Professional, Creator, Editorial, Compact, Bento, Studio, or Monolith.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-neutral-500 font-mono">
                8 signature templates
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <span className="text-4xl font-display font-black text-amber-400/40">03</span>
                <h3 className="text-xl font-bold text-white mt-4">Share</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Get your personal link and share it anywhere. Instantly present your QR code, send via WhatsApp, or let people download your vCard.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-neutral-500 font-mono">
                QR · WhatsApp · vCard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Premium Templates Showcase Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 border-t border-white/10 bg-[#0c0d0f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2 font-mono">
              Eight Signature Designs
            </h2>
            <p className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
              Every identity has its own aesthetic
            </p>
            <p className="mt-3 text-sm text-neutral-400">
              Switch between 8 genuinely distinct layouts in one tap. Your links, services, contact channels, and portfolio stay perfectly in place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROFILE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-amber-400/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-amber-400">
                      {tmpl.number}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                      {tmpl.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-heading font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-300 mt-1">
                    {tmpl.tagline}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span className="truncate">{tmpl.bestFor.split(',')[0]}</span>
                  <span className="text-amber-400/80">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2">Designed For Everyone</h2>
            <p className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">
              One link for everything you want people to know about you.
            </p>
            <p className="mt-3 text-sm text-neutral-400">
              Whether you are meeting clients at a café in Djibouti or collaborating internationally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <h3 className="text-base font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Showcase Banner */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/10 bg-[#0e0f12]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-neutral-900 to-[#121316] border border-white/10">
          <div>
            <span className="text-xs font-semibold text-amber-400">Live Profiles Directory</span>
            <h3 className="text-2xl font-bold text-white mt-1">Discover inspiring profiles created on PROFILE.DJ</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Browse top designers, consultants, creators, and developers already connecting with one link.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/explore')}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Explore Directory →
          </button>
        </div>
      </section>

      {/* Strong Bottom CTA Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white text-balance leading-tight">
            Claim your personal link before someone else does.
          </h2>
          <p className="mt-4 text-base text-neutral-300 max-w-lg mx-auto text-balance">
            Join hundreds of professionals, creatives, and businesses using PROFILE.DJ as their permanent digital business card.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/auth?mode=signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all shadow-xl hover:shadow-amber-400/20 cursor-pointer"
            >
              Create Your Profile Now
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Browse Directory
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
