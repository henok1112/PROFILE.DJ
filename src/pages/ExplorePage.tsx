import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { Profile } from '../types/database';
import { db, isSupabaseConfigured } from '../lib/supabase';

interface ExplorePageProps {
  onNavigate: (path: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const published = await db.getPublishedProfiles();
        setProfiles(published);
      } catch (err) {
        console.error('Failed to load published profiles:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { id: 'all', label: 'All Profiles' },
    { id: 'design', label: 'Design & Creative' },
    { id: 'tech', label: 'Tech & Engineering' },
    { id: 'business', label: 'Business & Consulting' },
  ];

  const filtered = profiles.filter((p) => {
    // Only published profiles
    if (!p.is_published) return false;

    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (p.display_name || `${p.first_name} ${p.last_name}`).toLowerCase().includes(q);
    const usernameMatch = p.username.toLowerCase().includes(q);
    const headlineMatch = (p.headline || '').toLowerCase().includes(q);
    const locationMatch = (p.location || '').toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || usernameMatch || headlineMatch || locationMatch;
    if (!matchesSearch) return false;

    if (activeCategory === 'design') {
      return /design|creative|photo|art|visual|brand|ui|ux/i.test(p.headline + ' ' + p.bio);
    }
    if (activeCategory === 'tech') {
      return /developer|engineer|cloud|tech|code|software|full-stack|backend|frontend/i.test(p.headline + ' ' + p.bio);
    }
    if (activeCategory === 'business') {
      return /strategist|consult|business|founder|manager|executive|advisory/i.test(p.headline + ' ' + p.bio);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-white min-h-[80vh]">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
          Explore Profiles
        </h1>
        <p className="mt-3 text-sm text-neutral-400">
          Discover members of the PROFILE.DJ community in Djibouti and around the world.
        </p>

        {!isSupabaseConfigured && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <Database className="w-3.5 h-3.5" />
            <span>Showcase mode · Connect Supabase to browse live user records</span>
          </div>
        )}
      </div>

      {/* Search and Category Filter Bar */}
      <div className="max-w-xl mx-auto mb-10 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, headline, location, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400/50 outline-none text-sm text-white placeholder-neutral-500 transition-colors"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-md mx-auto">
          <p className="text-sm font-semibold text-neutral-300">No published profiles found</p>
          <p className="text-xs text-neutral-500 mt-1">Try another search term or clear filters</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate(`/${p.username}`)}
              className="group cursor-pointer rounded-3xl bg-[#141518]/90 border border-white/10 hover:border-amber-400/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shrink-0">
                    {p.profile_photo_url ? (
                      <img
                        src={p.profile_photo_url}
                        alt={p.display_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-neutral-400">
                        {p.first_name?.[0] || p.username[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {p.display_name || `${p.first_name} ${p.last_name}`.trim() || p.username}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs font-mono text-amber-400/90 truncate">
                      @{p.username}
                    </p>
                    {p.location && (
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0 text-neutral-500" />
                        <span>{p.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {p.headline && (
                  <p className="mt-4 text-xs font-medium text-neutral-300 line-clamp-2">
                    {p.headline}
                  </p>
                )}

                {p.bio && (
                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {p.bio}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-amber-300 transition-colors">
                <span>View Digital Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
