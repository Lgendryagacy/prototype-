import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Loader2, AlertCircle, Briefcase, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JobCard } from '../components/JobCard';
import { type Route } from '../types';
import { User as FirebaseUser } from '../firebase/types/user';
import { FogslyJob } from '../firebase/types/job';
import { getUserSavedJobs, SavedJob } from '../firebase/services/savedJobs';
import { getFogslyJobById } from '../firebase/services/fogslyJobsService';

interface SavedJobsPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  currentUser: FirebaseUser | null;
}

const SavedJobsPage: React.FC<SavedJobsPageProps> = ({ navigate, currentUser }) => {
  const [savedJobs, setSavedJobs] = useState<FogslyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateback = () => {
    navigate('find-work')
  };

  useEffect(() => {
    if (currentUser) {
      fetchSavedJobs();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchSavedJobs = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Get saved job references
      const savedJobRefs = await getUserSavedJobs(currentUser.uid);
      
      // Fetch full job details for each saved job
      const jobPromises = savedJobRefs.map(async (savedJob: SavedJob) => {
        try {
          const job = await getFogslyJobById(savedJob.jobId);
          return job;
        } catch (err) {
          console.error(`Error fetching job ${savedJob.jobId}:`, err);
          return null;
        }
      });

      const jobs = await Promise.all(jobPromises);
      
      // Filter out null values (jobs that couldn't be fetched or were deleted)
      const validJobs = jobs.filter((job): job is FogslyJob => job !== null);
      
      setSavedJobs(validJobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh saved jobs when returning from job detail
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        fetchSavedJobs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-[--color-bg-secondary] min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold text-[--color-text-primary] mb-2">
              Sign In Required
            </h1>
            <p className="text-[--color-text-secondary] mb-6">
              Please sign in to view your saved jobs.
            </p>
            <Button onClick={() => navigate('auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[--color-bg-secondary] min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-[--color-primary] mx-auto mb-4" />
              <p className="text-[--color-text-secondary]">Loading your saved jobs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[--color-bg-secondary] min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-[--color-text-primary] mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-[--color-text-secondary] mb-6">{error}</p>
            <Button onClick={fetchSavedJobs}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={navigateback}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-[--color-primary]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[--color-text-primary]">
              Saved Jobs
            </h1>
          </div>
          <p className="text-[--color-text-secondary] text-lg">
            {savedJobs.length === 0 
              ? 'You haven\'t saved any jobs yet' 
              : `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`
            }
          </p>
        </motion.div>

        {/* Jobs List */}
        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-12 text-center">
              <Briefcase className="w-20 h-20 mx-auto mb-6 text-[--color-text-secondary] opacity-50" />
              <h2 className="text-2xl font-bold text-[--color-text-primary] mb-3">
                No Saved Jobs Yet
              </h2>
              <p className="text-[--color-text-secondary] mb-6 max-w-md mx-auto">
                Start saving jobs you're interested in to easily find them later. 
                Click the bookmark icon on any job to save it.
              </p>
              <Button onClick={() => navigate('find-work')} size="lg">
                Browse Jobs
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {savedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <JobCard
                    job={job}
                    navigate={navigate}
                    currentUser={currentUser}
                    onSaveToggle={fetchSavedJobs}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Footer */}
        {savedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-[--color-text-secondary]">
              💡 Tip: Apply to jobs quickly by saving them for later review
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
