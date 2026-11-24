import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Briefcase, FileText, Send, Bookmark } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';
import { SearchableSelect } from './ui/SearchableSelect';
import { auth } from '../firebase/config';
import { getUserPendingJobRequestsCount } from '../firebase/services/jobRequestService';
import { getUserJobsCount } from '../firebase/services/fogslyJobsService';
import { getUserFreelanceRequest } from '../firebase/services/freelanceRequests';
import { getApprovedFreelancerByUserId } from '../firebase/services/approvedFreelancers';
import { getAllCategories } from '../firebase/services/categoryService';
import { countFreelancerProposals } from '../firebase/services/jobProposals';
import { getUserSavedJobIds } from '../firebase/services/savedJobs';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';


interface FreelanceHeroProps {
  navigate: (route: Route) => void;
  isLoggedIn?: boolean;
  onSearch?: (query: string, category: string) => void;
}

const FreelanceHero = ({ navigate, isLoggedIn = false, onSearch }: FreelanceHeroProps) => {
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [approvedJobsCount, setApprovedJobsCount] = useState(0);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasActiveGig, setHasActiveGig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hasApplications, setHasApplications] = useState(false);
  const [hasSavedJobs, setHasSavedJobs] = useState(false);

  useEffect(() => {
    const checkPendingJobs = async () => {
      if (isLoggedIn && auth.currentUser) {
        setLoading(true);
        try {
          const count = await getUserPendingJobRequestsCount(auth.currentUser.uid);
          setPendingJobsCount(count);

          // Check if user has any approved jobs
          const approvedCount = await getUserJobsCount(auth.currentUser.uid);
          setApprovedJobsCount(approvedCount);

          // Check for pending freelancer request
          const request = await getUserFreelanceRequest(auth.currentUser.uid);
          setHasPendingRequest(request?.requestStatus === 'pending');

          // Check for active approved freelancer gig
          const approvedFreelancer = await getApprovedFreelancerByUserId(auth.currentUser.uid);
          setHasActiveGig(approvedFreelancer?.status === 'active');

          // Check if user has any job applications
          const proposalStats = await countFreelancerProposals(auth.currentUser.uid);
          setHasApplications(proposalStats.total > 0);

          // Check if user has any saved jobs
          const savedJobIds = await getUserSavedJobIds(auth.currentUser.uid);
          setHasSavedJobs(savedJobIds.length > 0);
        } catch (error) {
          console.error('Error fetching pending jobs count:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkPendingJobs();
  }, [isLoggedIn]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedCategory);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const showHireButton = !isLoggedIn || pendingJobsCount < 1;
  return (
    <section className="relative pt-10 pb-10 bg-[--color-bg-secondary] border-b border-[--color-border]">
      <div className="container mx-auto px-4 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-[--color-text-primary] hover:text-[--color-primary] transition-colors mb-4 text-sm md:text-base ml-0 sm:ml-0 lg:ml-6"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium">Go Back </span>
        </motion.button>
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-[--color-text-primary]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Find The Right Talent. Get Work Done Securely.
          </motion.h1>

          <motion.p
            className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Access a global pool of vetted professionals for any project, backed by secure escrow payments and our robust dispute resolution system.
          </motion.p>

          <motion.div
            className="max-w-2xl mx-auto bg-[--color-card] p-2 rounded-lg shadow-md border border-[--color-border] flex flex-col sm:flex-row items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or description..."
                className="w-full h-12 bg-transparent pl-10 pr-4 text-[--color-text-primary] focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="w-full sm:w-64 flex-shrink-0">
              <SearchableSelect
                options={['All Categories', ...categories]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="All Categories"
                className="w-full"
              />
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 flex-shrink-0"
              onClick={handleSearch}
            >
              Search
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >

            {isLoggedIn && hasPendingRequest && (
              <Button size="lg" variant="outline" onClick={() => navigate('freelancer-request-status')}>
                <FileText className="w-4 h-4 mr-2" />
                Check Gig Request
              </Button>
            )}

            {isLoggedIn && hasActiveGig && (
              <Button size="lg" variant="outline" onClick={() => navigate('manage-gigs')}>
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Gigs
              </Button>
            )}

            {isLoggedIn && hasApplications && (
              <Button size="lg" variant="outline" onClick={() => navigate('my-applications')}>
                <Send className="w-4 h-4 mr-2" />
                My Applications
              </Button>
            )}

            {isLoggedIn && hasSavedJobs && (
              <Button size="lg" variant="outline" onClick={() => navigate('saved-jobs')}>
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Jobs
              </Button>
            )}

            {showHireButton ? (
              <Button size="lg" variant="default" onClick={() => navigate('post-job')} disabled={loading}>
                Hire a Freelancer
              </Button>
            ) : (
              <Button size="lg" variant="default" onClick={() => navigate('job-requests-status')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Request Status ({pendingJobsCount} Pending)
              </Button>
            )}

            <Button size="lg" variant="default" onClick={() => navigate('become-freelancer')}>
              Start Freelancing
            </Button>


            {isLoggedIn && approvedJobsCount > 0 && (
              <Button size="lg" variant="outline" onClick={() => navigate('manage-jobs')}>
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Jobs ({approvedJobsCount})
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FreelanceHero;