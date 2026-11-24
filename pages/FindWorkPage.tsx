import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Briefcase, FileText, Send, Bookmark, ArrowLeft } from 'lucide-react';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserFreelanceRequest } from '../firebase/services/freelanceRequests';
import { getUserPendingJobRequestsCount } from '../firebase/services/jobRequestService';
import { getUserJobsCount } from '../firebase/services/fogslyJobsService';
import { getApprovedFreelancerByUserId, getAllActiveFreelancers, ApprovedFreelancer } from '../firebase/services/approvedFreelancers';
import { getAllCategories } from '../firebase/services/categoryService';
import { countFreelancerProposals } from '../firebase/services/jobProposals';
import { getUserSavedJobIds } from '../firebase/services/savedJobs';
import { getUserProfile } from '../firebase/services/userService';
import LatestJobs from '@/components/LatestJobs';
import TrustAndSecurity from '../components/TrustAndSecurity';
import CTA from '../components/CTA';

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
        top: '-10%',
        left: '10%'
      }}
      animate={{
        x: [0, 50, -30, 40, 0],
        y: [0, -50, 30, 20, 0],
        scale: [1, 1.1, 0.9, 1.05, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        top: '20%',
        right: '15%'
      }}
      animate={{
        x: [0, -40, 30, -20, 0],
        y: [0, 40, -30, 20, 0],
        scale: [1, 0.9, 1.1, 0.95, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
    <motion.div
      className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
        bottom: '10%',
        left: '20%'
      }}
      animate={{
        x: [0, 30, -40, 25, 0],
        y: [0, -30, 40, -15, 0],
        scale: [1, 1.05, 0.9, 1.1, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
    />
  </div>
);

interface GigWithProfile extends ApprovedFreelancer {
  profileImage?: string;
  verified?: boolean;
}

const FindWorkPage = ({ navigate, isLoggedIn = false }: { navigate: (route: Route, context?: any) => void; isLoggedIn?: boolean }) => {
  const { user: currentUser } = useAuth();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // User status states
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [approvedJobsCount, setApprovedJobsCount] = useState(0);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasActiveGig, setHasActiveGig] = useState(false);
  const [hasApplications, setHasApplications] = useState(false);
  const [hasSavedJobs, setHasSavedJobs] = useState(false);

  // Data states
  const [categories, setCategories] = useState<string[]>([]);
  const [topFreelancers, setTopFreelancers] = useState<GigWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Check for pending request status
  const checkPendingRequest = async () => {
    if (!currentUser) return false;
    try {
      const request = await getUserFreelanceRequest(currentUser.uid);
      return request?.requestStatus === 'pending';
    } catch (error) {
      console.error('Error checking request status:', error);
      return false;
    }
  };

  // Fetch user status and data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn && currentUser) {
        setLoading(true);
        try {
          // Fetch all user status data in parallel
          const [
            pendingCount,
            approvedCount,
            request,
            approvedFreelancer,
            proposalStats,
            savedJobIds,
            allCategories
          ] = await Promise.all([
            getUserPendingJobRequestsCount(currentUser.uid),
            getUserJobsCount(currentUser.uid),
            getUserFreelanceRequest(currentUser.uid),
            getApprovedFreelancerByUserId(currentUser.uid),
            countFreelancerProposals(currentUser.uid),
            getUserSavedJobIds(currentUser.uid),
            getAllCategories()
          ]);

          setPendingJobsCount(pendingCount);
          setApprovedJobsCount(approvedCount);
          setHasPendingRequest(request?.requestStatus === 'pending');
          setHasActiveGig(approvedFreelancer?.status === 'active');
          setHasApplications(proposalStats.total > 0);
          setHasSavedJobs(savedJobIds.length > 0);
          setCategories(allCategories);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Fetch categories even when not logged in
        const fetchCategories = async () => {
          try {
            const allCategories = await getAllCategories();
            setCategories(allCategories);
          } catch (error) {
            console.error('Error fetching categories:', error);
          }
        };
        fetchCategories();
      }
    };

    fetchUserData();
  }, [isLoggedIn, currentUser]);

  // Restore scroll position when returning from detail pages
  useEffect(() => {
    const shouldReturnToJobs = sessionStorage.getItem('return-to-find-work-jobs');
    const shouldReturnToGigs = sessionStorage.getItem('return-to-find-work-gigs');

    if (shouldReturnToJobs === 'true') {
      // Remove the marker
      sessionStorage.removeItem('return-to-find-work-jobs');

      // Scroll to jobs section after a short delay to ensure content is loaded
      setTimeout(() => {
        const jobsSection = document.getElementById('jobs-anchor');
        if (jobsSection) {
          jobsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else if (shouldReturnToGigs === 'true') {
      // Remove the marker
      sessionStorage.removeItem('return-to-find-work-gigs');

      // Scroll to gigs section after a short delay to ensure content is loaded
      setTimeout(() => {
        const gigsSection = document.getElementById('gigs-anchor');
        if (gigsSection) {
          gigsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, []);

  // Fetch all active freelancers for showcase
  useEffect(() => {
    const fetchAllFreelancers = async () => {
      try {
        const activeGigs = await getAllActiveFreelancers();

        // Fetch user profiles for all freelancers
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
            return { userId, name: 'User', image: undefined };
          }
        });

        const profiles = await Promise.all(profilePromises);
        const profileMap = new Map(profiles.map(p => [p.userId, { name: p.name, image: p.image }]));

        const gigsWithProfiles: GigWithProfile[] = activeGigs.map(gig => ({
          ...gig,
          profileImage: profileMap.get(gig.userId)?.image,
          verified: false
        }));

        setTopFreelancers(gigsWithProfiles);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      }
    };

    fetchAllFreelancers();
  }, []);

  // Handle search
  const handleSearch = () => {
    setCategoryFilter(selectedCategory);

    // Scroll to jobs section
    const jobsSection = document.getElementById('jobs-anchor');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Create initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showHireButton = !isLoggedIn || pendingJobsCount < 1;

  return (
    <div className="relative bg-[--color-bg-base] min-h-screen theme-transition overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Glass Card Styles */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.6s;
          pointer-events: none;
        }
        .glass-card:hover::before {
          left: 100%;
        }
        .dark .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.3);
        }
        .desert .glass-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .glass-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12),
                      0 0 20px rgba(59, 130, 246, 0.08);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .dark .glass-card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(59, 130, 246, 0.1);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .floating {
          animation: floatAnim 6s ease-in-out infinite;
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative z-10 space-y-8 animate-fade-in pb-20">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-8 pb-16 text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="container mx-auto px-4"
          >
            <span className="text-7xl mb-6 block drop-shadow-2xl">💼</span>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-[--color-text-primary]">
              Find Work. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-accent]">
                Build Trust. Get Paid.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-[--color-text-secondary] max-w-3xl mx-auto mb-12 font-medium opacity-80">
              Explore verified freelance jobs matched to your skills on a global freelance marketplace. Work with confidence using secure payments, transparent profiles, and trusted freelance opportunities designed for long-term growth.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto backdrop-blur-xl bg-[--color-card]/70 rounded-3xl md:rounded-full p-3 md:p-2.5 mb-12 shadow-2xl flex items-center border-2 border-[--color-border] flex-col md:flex-row gap-3 md:gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 md:px-6 w-full">
                <Search className="text-[--color-text-secondary] flex-shrink-0" size={22} />
                <input
                  type="text"
                  placeholder="Search job title or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-transparent py-3 md:py-3.5 text-base md:text-lg font-medium outline-none text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50"
                />
              </div>
              <div className="w-full md:w-64 flex-shrink-0 px-2">
                <SearchableSelect
                  options={['All Categories', ...categories]}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  className="w-full h-12 bg-[--color-bg-secondary]/50 text-[--color-text-primary] border-[--color-border] rounded-xl"
                />
              </div>
              <Button
                size="lg"
                className="w-full md:w-auto px-10 py-3.5 font-bold shadow-lg hover:-translate-y-0.5 transition-all rounded-xl md:rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {isLoggedIn && hasPendingRequest && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 font-bold"
                  onClick={() => navigate('freelancer-request-status')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Check Gig Request
                </Button>
              )}

              {isLoggedIn && hasActiveGig && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 font-bold"
                  onClick={() => navigate('manage-gigs')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Manage Gigs
                </Button>
              )}

              {isLoggedIn && hasApplications && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 font-bold"
                  onClick={() => navigate('my-applications')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  My Applications
                </Button>
              )}

              {isLoggedIn && hasSavedJobs && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 font-bold"
                  onClick={() => navigate('saved-jobs')}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved Jobs
                </Button>
              )}

              {showHireButton ? (
                <Button
                  size="lg"
                  className="px-14 py-6 font-bold text-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '9999px'
                  }}
                  onClick={() => navigate('post-job')}
                  disabled={loading}
                >
                  Hire a Freelancer
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="px-14 py-6 font-bold text-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '9999px'
                  }}
                  onClick={() => navigate('job-requests-status')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Request Status ({pendingJobsCount} Pending)
                </Button>
              )}

              <Button
                size="lg"
                className="px-14 py-6 font-bold text-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px'
                }}
                onClick={() => navigate('become-freelancer')}
              >
                Start Freelancing
              </Button>

              {isLoggedIn && approvedJobsCount > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 font-bold"
                  onClick={() => navigate('manage-jobs')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Manage Jobs ({approvedJobsCount})
                </Button>
              )}
            </div>
          </motion.div>
        </section>

        {/* Latest Jobs Section */}
        <section id="jobs-anchor" className="container mx-auto px-4">
          <LatestJobs
            navigate={navigate}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter || selectedCategory}
          />
        </section>

        {/* Elite Freelancers Section - Show all freelancers */}
        <section id="gigs-anchor" className="bg-[--color-bg-secondary] py-24">
          {topFreelancers.length > 0 && (
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black tracking-tighter mb-4 text-[--color-text-primary]">Elite Freelancers</h2>
                <p className="text-xl text-[--color-text-secondary] max-w-2xl mx-auto">Vetted experts currently available for hire</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topFreelancers.map(talent => (
                  <motion.div
                    key={talent.id}
                    whileHover={{ y: -8 }}
                    className="glass-card p-10 rounded-[48px] bg-[--color-card] cursor-pointer"
                    onClick={() => {
                      if (talent.id) {
                        // Set sessionStorage marker to return to gigs section
                        sessionStorage.setItem('return-to-find-work-gigs', 'true');
                        // Create a slug from the title and ID
                        const slug = `${talent.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${talent.id}`;
                        navigate('gig-detail', { gigId: talent.id, slug: slug });
                      } else {
                        console.error('No ID found for talent:', talent);
                      }
                    }}
                  >
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        {talent.profileImage ? (
                          <img
                            src={talent.profileImage}
                            alt={talent.userName}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-3xl font-semibold text-[--color-text-secondary]">
                            {getInitials(talent.userName || talent.title)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-[--color-text-primary]">
                          {talent.userName} {talent.verified && '✔️'}
                        </h4>
                        <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">{talent.title}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 pb-8 border-b border-[--color-border]">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide opacity-40 text-[--color-text-secondary]">Rate</p>
                        <p className="text-xl font-bold text-[--color-text-primary]">PKR {talent.hourlyRate}/hr</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold uppercase tracking-wide opacity-40 text-[--color-text-secondary]">Rating</p>
                        <p className="text-xl font-bold text-[--color-text-primary]">⭐ {talent.averageRating ? talent.averageRating.toFixed(1) : '5.0'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {talent.skills.slice(0, 3).map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-semibold uppercase tracking-wide">
                          {s}
                        </span>
                      ))}
                    </div>

                    <Button className="w-full h-12 rounded-2xl font-bold uppercase tracking-wide text-xs">
                      View Profile
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Trust and Security */}
        {/* <TrustAndSecurity /> */}

        {/* CTA Section */}
        {/* <CTA
          title="Start Today — Work Smarter with Fogsly Freelance."
          description="Whether you're looking to hire top talent or find your next opportunity, Fogsly is where work gets done."
          primaryButtonText="Hire Now"
          secondaryButtonText={hasPendingRequest ? "Request Pending" : "Start Freelancing"}
          onPrimaryClick={() => navigate('post-job')}
          onSecondaryClick={() => {
            if (hasPendingRequest) {
              navigate('freelancer-request-status');
            } else {
              navigate('become-freelancer');
            }
          }}
          secondaryButtonDisabled={hasPendingRequest}
        /> */}
      </div>
    </div>
  );
};

export default FindWorkPage;
