import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Users, Trash2, Plus, Pause, Play, CheckCircle, Search, ArrowLeft } from 'lucide-react';
import { onAuthStateChange } from '@/firebase/services/authService';
import { getUserPhysicalJobs, updatePhysicalJobStatus } from '@/firebase/services/fogslyPhysicalJobsService';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  company_name: string;
  company_logo: string;
  industry: string;
  job_title: string;
  category: string;
  job_type: string;
  experience_level: string;
  employment_type: string;
  country: string;
  city: string;
  salary_min: number;
  salary_max: number;
  posted_date: string;
  status: 'active' | 'paused' | 'closed';
  applicant_count: number;
  verified: boolean;
}

interface ManagePhysicalJobsPageProps {
  navigate: (route: string) => void;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    className={`bg-[var(--color-card)] backdrop-blur-[20px] border border-[var(--color-border)] rounded-[24px] shadow-lg transition-all duration-400 ${className}`}
  >
    {children}
  </motion.div>
);

const ManagePhysicalJobsPage: React.FC<ManagePhysicalJobsPageProps> = ({ navigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ jobId: string; jobTitle: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [pauseConfirm, setPauseConfirm] = useState<{ jobId: string; jobTitle: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        navigate('auth');
        return;
      }

      try {
        const jobs = await getUserPhysicalJobs(user.uid);

        const formattedJobs: Job[] = jobs.map(job => ({
          id: job.id,
          company_name: job.company_name,
          company_logo: job.company_logo || '',
          industry: job.industry,
          job_title: job.job_title,
          category: job.category,
          job_type: job.job_type,
          experience_level: job.experience_level,
          employment_type: job.employment_type,
          country: job.country,
          city: job.city,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          posted_date: job.posted_date.toISOString(),
          status: job.status as 'active' | 'paused' | 'closed',
          applicant_count: job.applicant_count,
          verified: job.verified
        }));

        setUserJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching user jobs:', error);
        toast.error('Failed to load your jobs');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-[var(--color-success-icon)]';
      case 'paused':
        return 'bg-orange-100 dark:bg-orange-900/30 desert:bg-orange-50 text-orange-700 dark:text-orange-300 desert:text-orange-800 border-orange-200 dark:border-orange-800 desert:border-orange-300';
      case 'closed':
        return 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]';
      default:
        return 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]';
    }
  };

  const handleDelete = (jobId: string, jobTitle: string) => {
    setDeleteConfirm({ jobId, jobTitle });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      setIsDeleting(true);
      try {
        await updatePhysicalJobStatus(deleteConfirm.jobId, 'closed');
        setUserJobs(userJobs.filter(job => job.id !== deleteConfirm.jobId));
        toast.success('Job deleted successfully');
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'paused' | 'closed', reason?: string) => {
    setUpdatingJobId(jobId);
    try {
      await updatePhysicalJobStatus(jobId, newStatus, reason);
      setUserJobs(userJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      toast.success(`Job ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'closed'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return userJobs.filter(job => {
      // Status filter
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          job.job_title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
          job.city.toLowerCase().includes(query) ||
          job.country.toLowerCase().includes(query) ||
          job.industry.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [userJobs, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Loading...</div>
      </div>
    );
  }

  const navigateback = () => {
    navigate('fog-jobs');
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={navigateback}
          className="inline-flex items-center gap-2 px-4 py-2 mb-2 text-sm font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
        {/* Header */}
        <GlassCard className="p-14 mb-14">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="text-6xl font-black mb-4" style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                Manage Your Jobs
              </h2>
              <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                View, edit, and manage all your job postings
              </p>
            </div>
            <button
              onClick={() => navigate('post-physical-job')}
              className="px-9 py-5 rounded-2xl font-bold text-base bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 whitespace-nowrap flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </button>
          </div>
        </GlassCard>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search jobs by title, company, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'closed')}
              className="px-6 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Showing {filteredJobs.length} of {userJobs.length} jobs
          </div>
        </GlassCard>

        {/* Job Cards Grid */}
        {filteredJobs.length === 0 ? (
          <GlassCard className="p-14 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {userJobs.length === 0 ? 'No Jobs Posted Yet' : 'No Matching Jobs Found'}
            </h3>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              {userJobs.length === 0
                ? 'Start by posting your first job to see it appear here'
                : 'Try adjusting your search or filters'
              }
            </p>
            {userJobs.length === 0 && (
              <button
                onClick={() => navigate('post-physical-job')}
                className="px-9 py-5 rounded-2xl font-bold text-base bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Post Your First Job
              </button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Company Logo */}

                      {job.company_logo ? (
                        <div className="w-20 h-20 rounded-2xl p-1 shadow-md" style={{ backgroundColor: 'var(--color-card)' }}>
                          <img
                            src={job.company_logo}
                            alt={job.company_name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl p-1 shadow-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
                          <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
                            {job.company_name.charAt(0)}
                          </div>
                        </div>
                      )}

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              {job.job_title}
                            </h3>
                            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                              {job.company_name}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                              {job.city}, {job.country} • {job.employment_type} • {job.experience_level}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(job.status)}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                            {job.verified && (
                              <span className="text-blue-500 text-2xl" title="Verified">✓</span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mb-6">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {job.applicant_count} Applicants
                            </span>
                          </div>
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Posted {formatDate(job.posted_date)}
                          </div>
                          <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                            PKR {job.salary_min.toLocaleString()} - PKR {job.salary_max.toLocaleString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <div className="relative">
                            <select
                              value={job.status}
                              onChange={(e) => handleStatusChange(job.id, e.target.value as 'active' | 'paused' | 'closed')}
                              disabled={updatingJobId === job.id}
                              className="px-4 py-2 rounded-xl font-bold text-sm border-2 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)'
                              }}
                            >
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="closed">Closed</option>
                            </select>
                            {updatingJobId === job.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-xl">
                                <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => navigate(`physical-job-applicants/${job.id}`)}
                            className="px-5 py-2 rounded-xl font-bold text-sm border-2 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                            style={{
                              borderColor: 'var(--color-primary)',
                              color: 'var(--color-primary)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Users className="w-4 h-4" />
                            View Applicants
                          </button>

                          {job.status !== 'closed' && (
                            <button
                              onClick={() => navigate(`edit-physical-job/${job.id}`)}
                              className="px-5 py-2 rounded-xl font-bold text-sm border-2 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                          )}

                          {/* <button
                            onClick={() => handleDelete(job.id, job.job_title)}
                            className="px-5 py-2 rounded-xl font-bold text-sm border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[3000] p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-[var(--color-card)] backdrop-blur-[20px] border border-[var(--color-border)] rounded-[32px] p-14 max-w-lg w-full text-center shadow-2xl"
              >
                <div className="text-5xl mb-7">⚠️</div>
                <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Delete Job?
                </h3>
                <p className="text-lg mb-9 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Are you sure you want to delete <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>"{deleteConfirm.jobTitle}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-base border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-base bg-red-500 text-white hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.25)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManagePhysicalJobsPage;
