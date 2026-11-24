import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { type Route } from '../types';
import { getAllActiveFreelancers, ApprovedFreelancer } from '../firebase/services/approvedFreelancers';
import { getUserProfile } from '../firebase/services/userService';

interface GigWithProfile extends ApprovedFreelancer {
  profileImage?: string;
  verified?: boolean;
}

interface ActiveGigsProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  searchQuery?: string;
  categoryFilter?: string;
  limit?: number;
}

const ActiveGigs = ({ navigate, searchQuery = '', categoryFilter = '', limit }: ActiveGigsProps) => {
  const [gigs, setGigs] = useState<GigWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCache, setProfileCache] = useState<Map<string, { name: string; image?: string }>>(new Map());

  // Fetch all active gigs on mount and when filters change
  useEffect(() => {
    fetchGigs();
  }, [searchQuery, categoryFilter]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const activeGigs = await getAllActiveFreelancers();
        
        // Fetch user profiles in parallel (batch processing for speed)
        const userIds = [...new Set(activeGigs.map(gig => gig.userId))];
        const profilePromises = userIds.map(async (userId) => {
          try {
            const profile = await getUserProfile(userId);
            return {
              userId,
              name: profile?.name || profile?.email?.split('@')[0] || 'User',
              image: profile?.avatarUrl
            };
          } catch (error) {
            console.error(`Error fetching profile for ${userId}:`, error);
            return { userId, name: 'User', image: undefined };
          }
        });

        const profiles = await Promise.all(profilePromises);
        const newCache = new Map(profiles.map(p => [p.userId, { name: p.name, image: p.image }]));
        setProfileCache(newCache);

        // Attach profile data to gigs
        const gigsWithProfiles: GigWithProfile[] = activeGigs.map(gig => ({
          ...gig,
          profileImage: newCache.get(gig.userId)?.image,
          verified: false // You can add verified logic here if needed
        }));

        setGigs(gigsWithProfiles);
      } catch (error) {
        console.error('Error fetching active gigs:', error);
      } finally {
        setLoading(false);
      }
    };

  // Filter gigs based on search and category (memoized for performance)
  const filteredGigs = useMemo(() => {
    let filtered = gigs;

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(gig => 
        gig.title.toLowerCase().includes(query) ||
        gig.bio.toLowerCase().includes(query) ||
        gig.skills.some(skill => skill.toLowerCase().includes(query)) ||
        gig.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter.trim() && categoryFilter !== 'All Categories') {
      const category = categoryFilter.toLowerCase().trim();
      filtered = filtered.filter(gig => 
        gig.categories.some(cat => cat.toLowerCase() === category)
      );
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [gigs, searchQuery, categoryFilter, limit]);

  // Create initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle view profile click
  const handleViewProfile = (gig: GigWithProfile) => {
    const slug = `${gig.title.toLowerCase().replace(/\s+/g, '-')}-${gig.id}`;
    navigate('gig-detail', { gigId: gig.id, slug }, { name: gig.title });
  };

  if (loading) {
    return (
      <section>
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-[--color-text-primary]">Active Gigs</h2>
          <p className="text-[--color-text-secondary] font-medium opacity-60">Loading freelancers...</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[--color-primary] border-r-transparent border-b-[--color-primary] border-l-transparent mx-auto mb-4"></div>
            <p className="text-[--color-text-secondary] font-medium">Loading active gigs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (filteredGigs.length === 0) {
    return (
      <section>
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-[--color-text-primary]">Active Gigs</h2>
          <p className="text-[--color-text-secondary] font-medium opacity-60">Vetted freelancers ready to work</p>
        </div>
        <div className="text-center py-20 glass-card rounded-[40px] border border-[--color-border]">
          <div className="text-6xl mb-6">👥</div>
          <h3 className="text-2xl font-black mb-4 text-[--color-text-primary]">No Freelancers Found</h3>
          <p className="text-[--color-text-secondary] font-medium max-w-md mx-auto">
            {searchQuery || categoryFilter
              ? 'No freelancers match your criteria. Try adjusting your filters.'
              : 'No active gigs available at the moment.'}
          </p>
          <p className="text-sm text-[--color-text-secondary] mt-4 opacity-60">Check back soon for new talent!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-[--color-text-primary]">
            Active Gigs {filteredGigs.length > 0 && `(${filteredGigs.length})`}
          </h2>
          <p className="text-[--color-text-secondary] font-medium opacity-60">Vetted freelancers ready to work</p>
        </div>
        {limit && filteredGigs.length >= limit && (
          <Button variant="link" className="font-black uppercase text-xs tracking-widest">
            Browse all <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGigs.map((gig, index) => (
          <motion.div
            key={gig.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
            whileHover={{ y: -8 }}
          >
            <Card
              className="glass-card p-8 rounded-[48px] cursor-pointer group h-full border-[--color-border] bg-[--color-card] flex flex-col"
              onClick={() => handleViewProfile(gig)}
            >
              <div className="flex flex-col items-center text-center flex-1">
                <div className="relative mb-6">
                  {gig.profileImage ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] animate-pulse" id={`loader-${gig.id}`}></div>
                      <img
                        src={gig.profileImage}
                        alt={gig.userName}
                        className="w-24 h-24 rounded-full object-cover bg-[--color-bg-tertiary] transition-opacity duration-300 shadow-xl"
                        loading="lazy"
                        onLoad={(e) => {
                          const loader = document.getElementById(`loader-${gig.id}`);
                          if (loader) loader.style.display = 'none';
                          e.currentTarget.classList.remove('opacity-0');
                          e.currentTarget.classList.add('opacity-100');
                        }}
                        onError={(e) => {
                          const loader = document.getElementById(`loader-${gig.id}`);
                          if (loader) {
                            loader.classList.remove('animate-pulse');
                            loader.innerHTML = `<div class="w-24 h-24 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-4xl font-bold text-[--color-text-secondary]">${getInitials(profileCache.get(gig.userId)?.name || gig.userName || gig.title)}</div>`;
                          }
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-4xl font-bold text-[--color-text-secondary] shadow-xl">
                      {getInitials(profileCache.get(gig.userId)?.name || gig.userName || gig.title)}
                    </div>
                  )}
                  {gig.verified && (
                    <ShieldCheck className="absolute bottom-1 right-1 w-6 h-6 text-blue-500 fill-white dark:fill-slate-800" />
                  )}
                </div>

                <h3 className="font-black text-xl text-[--color-text-primary] line-clamp-1 mb-2 group-hover:text-blue-500 transition-colors">
                  {profileCache.get(gig.userId)?.name || gig.userName}
                </h3>

                <p className="text-[--color-text-secondary] text-sm font-bold uppercase tracking-widest line-clamp-1 mb-4">{gig.title}</p>

                <div className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-[--color-border] w-full">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-40 text-[--color-text-secondary] mb-1">Rate</p>
                    <p className="text-lg font-black text-[--color-text-primary]">PKR {gig.hourlyRate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-40 text-[--color-text-secondary] mb-1">Rating</p>
                    <p className="text-lg font-black text-[--color-text-primary]">⭐ {gig.averageRating ? gig.averageRating.toFixed(1) : '5.0'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {gig.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {s}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-[--color-text-secondary] opacity-60 mt-auto">
                  {gig.totalJobs || 0} completed jobs
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[--color-border]">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all"
                  onClick={(e) => { e.stopPropagation(); handleViewProfile(gig); }}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ActiveGigs;
