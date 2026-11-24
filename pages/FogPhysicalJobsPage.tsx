import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FogslyPhysicalJob } from '@/firebase/types/physicalJob';
import { 
  getUserPendingPhysicalJobRequestsCount, 
  getActivePhysicalJobs,
  getUniqueJobCountries,
  getUniqueJobCategories 
} from '@/firebase/services/physicalJobRequestService';
import { getUserPhysicalJobs } from '@/firebase/services/fogslyPhysicalJobsService';
import { getUserApplications } from '@/firebase/services/physicalJobApplicationService';
import { getUserSavedPhysicalJobIds } from '@/firebase/services/savedJobs';
import { auth } from '@/firebase/config';
import FogPhysicalJobsHome from '@/components/FogPhysicalJobsHome';
import { JobCardSkeleton } from '@/components/common/FeedSkeletons';

interface FogPhysicalJobsPageProps {
  navigate: (route: string) => void;
}

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

// ============== MAIN PAGE ==============
const FogPhysicalJobsPage: React.FC<FogPhysicalJobsPageProps> = ({ navigate }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [userJobsCount, setUserJobsCount] = useState(0);
  const [userApplicationsCount, setUserApplicationsCount] = useState(0);
  const [userSavedJobsCount, setUserSavedJobsCount] = useState(0);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    country: '',
    category: '',
    experience: '',
    sort: 'newest'
  });

  // Fetch available countries and categories on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [countries, categories] = await Promise.all([
          getUniqueJobCountries(),
          getUniqueJobCategories()
        ]);
        setAvailableCountries(countries);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch pending requests count, user jobs count, and user applications count
  useEffect(() => {
    const fetchUserCounts = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const [pendingCount, userJobs, userApplications, savedJobIds] = await Promise.all([
            getUserPendingPhysicalJobRequestsCount(user.uid),
            getUserPhysicalJobs(user.uid),
            getUserApplications(user.uid),
            getUserSavedPhysicalJobIds(user.uid)
          ]);
          
          setPendingRequestsCount(pendingCount);
          setUserJobsCount(userJobs.length);
          setUserApplicationsCount(userApplications.length);
          setUserSavedJobsCount(savedJobIds.length);
        } catch (error) {
          console.error('Error fetching user counts:', error);
        }
      }
    };

    fetchUserCounts();
  }, []);

  // Fetch jobs from Firebase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch jobs with current filters
        const fetchedJobs = await getActivePhysicalJobs({
          country: filters.country || undefined,
          category: filters.category || undefined,
          experienceLevel: filters.experience || undefined,
          sortBy: filters.sort as 'newest' | 'salary-high' | 'salary-low',
          limitCount: 100
        });
        
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [filters]); // Re-fetch when filters change

  // Filter and search jobs (client-side search only, filters already applied server-side)
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search (client-side for search query)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.job_title?.toLowerCase().includes(query) ||
        job.company_name?.toLowerCase().includes(query) ||
        job.category?.toLowerCase().includes(query) ||
        job.city?.toLowerCase().includes(query) ||
        job.country?.toLowerCase().includes(query) ||
        (Array.isArray(job.required_skills) 
          ? job.required_skills.some((skill: string) => skill.toLowerCase().includes(query))
          : job.required_skills?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [jobs, searchQuery]);

  const formatDate = (dateValue: any): string => {
    let date: Date;
    
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return 'Recently';
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const navigateToJob = (jobId: string) => {
    navigate(`physical-job-details/${jobId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatedBackground />
      
      <div className="relative z-10">
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <JobCardSkeleton key={n} />
              ))}
            </div>
          </div>
        ) : (
          <FogPhysicalJobsHome
            jobs={filteredJobs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            navigateToJob={navigateToJob}
            navigate={navigate}
            formatDate={formatDate}
            pendingRequestsCount={pendingRequestsCount}
            availableCountries={availableCountries}
            availableCategories={availableCategories}
            userJobsCount={userJobsCount}
            userApplicationsCount={userApplicationsCount}
            userSavedJobsCount={userSavedJobsCount}
          />
        )}
      </div>
    </div>
  );
};

export default FogPhysicalJobsPage;