import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, X } from 'lucide-react';
import { getUserSavedPhysicalJobIds, unsaveJob } from '@/firebase/services/savedJobs';
import { getFogslyPhysicalJobById } from '@/firebase/services/fogslyPhysicalJobsService';
import { FogslyPhysicalJob } from '@/firebase/types/physicalJob';
import PhysicalFogJobCard from '@/components/PhysicalFogJobCard';
import PhysicalFogJobGlassCard from '@/components/PhysicalFogJobGlassCard';
import { toast } from 'react-hot-toast';
import { User } from '@/firebase/types/user';

interface SavedPhysicalJobsPageProps {
  navigate: (route: string) => void;
  currentUser: User | null;
}

const SavedPhysicalJobsPage: React.FC<SavedPhysicalJobsPageProps> = ({ navigate, currentUser }) => {
  const [savedJobs, setSavedJobs] = useState<FogslyPhysicalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get saved job IDs
        const savedJobIds = await getUserSavedPhysicalJobIds(currentUser.uid);

        if (savedJobIds.length === 0) {
          setSavedJobs([]);
          setIsLoading(false);
          return;
        }

        // Fetch full job details for each saved job
        const jobPromises = savedJobIds.map(jobId => getFogslyPhysicalJobById(jobId));
        const jobs = await Promise.all(jobPromises);

        // Filter out null values (deleted jobs) and only show active jobs
        const validJobs = jobs.filter((job): job is FogslyPhysicalJob => 
          job !== null && job.status === 'active'
        );

        setSavedJobs(validJobs);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        toast.error('Failed to load saved jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [currentUser, navigate]);

  const handleUnsave = async (jobId: string) => {
    if (!currentUser) return;

    setRemovingJobId(jobId);
    try {
      await unsaveJob(currentUser.uid, jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job removed from saved list');
    } catch (error) {
      console.error('Error unsaving job:', error);
      toast.error('Failed to remove job');
    } finally {
      setRemovingJobId(null);
    }
  };

  const navigateToJob = (jobId: string) => {
    navigate(`physical-job-details/${jobId}`);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Loading saved jobs...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-16 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('fog-jobs')}
            className="mb-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-all"
            style={{ color: 'var(--color-primary)' }}
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </motion.button>

          {/* Title Section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Bookmark className="w-8 h-8" fill="white" />
            </div>
            <div>
              <h1 className="text-5xl font-black" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                Saved Jobs
              </h1>
              <p className="text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Jobs Grid or Empty State */}
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {savedJobs.map((job, index) => (
              <div key={job.id} className="relative group">
                {/* Unsave Button Overlay */}
                <button
                  onClick={() => handleUnsave(job.id)}
                  disabled={removingJobId === job.id}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: 'white'
                  }}
                  title="Remove from saved"
                >
                  {removingJobId === job.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>

                {/* Job Card */}
                <PhysicalFogJobCard
                  job={job as any}
                  onClick={() => navigateToJob(job.id)}
                  formatDate={formatDate}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <PhysicalFogJobGlassCard className="text-center py-24" onClick={() => {}}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <Bookmark className="w-12 h-12" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
              No Saved Jobs Yet
            </h3>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Start saving jobs you're interested in to view them here later!
            </p>
            <button
              onClick={() => navigate('fog-jobs')}
              className="px-8 py-4 rounded-xl font-bold text-base text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Browse Jobs
            </button>
          </PhysicalFogJobGlassCard>
        )}
      </div>
    </motion.div>
  );
};

export default SavedPhysicalJobsPage;
