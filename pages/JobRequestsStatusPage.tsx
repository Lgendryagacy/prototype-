import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle, Briefcase, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';
import { type Route } from '../types';
import { auth } from '../firebase/config';
import { getUserJobRequests } from '../firebase/services/jobRequestService';
import { JobRequest } from '../firebase/types/job';
import { toast, ToastContainer } from 'react-toastify';

interface JobRequestsStatusPageProps {
  navigate: (route: Route, context?: any) => void;
  isLoggedIn?: boolean;
}

const JobRequestsStatusPage = ({ navigate, isLoggedIn = false }: JobRequestsStatusPageProps) => {
  const [loading, setLoading] = useState(true);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);

  useEffect(() => {
    const fetchJobRequests = async () => {
      if (!isLoggedIn || !auth.currentUser) {
        toast.error('Please login to view job requests');
        navigate('auth');
        return;
      }

      try {
        setLoading(true);
        const requests = await getUserJobRequests(auth.currentUser.uid);
        setJobRequests(requests);
      } catch (error) {
        console.error('Error fetching job requests:', error);
        toast.error('Failed to load job requests');
      } finally {
        setLoading(false);
      }
    };

    fetchJobRequests();
  }, [isLoggedIn, navigate]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          gradientFrom: '#f59e0b',
          gradientTo: '#fbbf24',
          text: 'PENDING',
          bgClass: 'bg-yellow-500/10',
          borderClass: 'border-yellow-500/30',
          textClass: 'text-yellow-600 dark:text-yellow-500'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          gradientFrom: '#10b981',
          gradientTo: '#34d399',
          text: 'APPROVED',
          bgClass: 'bg-green-500/10',
          borderClass: 'border-green-500/30',
          textClass: 'text-green-600 dark:text-green-500'
        };
      case 'rejected':
        return {
          icon: XCircle,
          gradientFrom: '#ef4444',
          gradientTo: '#f87171',
          text: 'REJECTED',
          bgClass: 'bg-red-500/10',
          borderClass: 'border-red-500/30',
          textClass: 'text-red-600 dark:text-red-500'
        };
      default:
        return {
          icon: Clock,
          gradientFrom: '#6b7280',
          gradientTo: '#9ca3af',
          text: 'UNKNOWN',
          bgClass: 'bg-gray-500/10',
          borderClass: 'border-gray-500/30',
          textClass: 'text-gray-600 dark:text-gray-500'
        };
    }
  };

  if (loading) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: 'var(--color-primary)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Loading job requests...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.button
            onClick={() => navigate('find-work')}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '2px solid var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'var(--color-card)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Find Work
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10 mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                  }}
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white">My Job Requests</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Track the status of your job postings</p>
                </div>
              </div>
            </div>

            {/* Job Requests List */}
            {jobRequests.length === 0 ? (
              <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`
                  }}
                >
                  <Briefcase className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Job Requests Yet</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  You haven't posted any job requests yet
                </p>
                <button
                  onClick={() => navigate('post-job')}
                  className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                    }}
                  />
                  <span className="relative z-10">Post Your First Job</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobRequests.map((job, index) => {
                  const statusConfig = getStatusConfig(job.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-8 hover:border-blue-500/30 dark:hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${statusConfig.gradientFrom}, ${statusConfig.gradientTo})`
                            }}
                          >
                            <StatusIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                              {job.jobTitle}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                              {job.jobDescription}
                            </p>
                          </div>
                        </div>

                        <span
                          className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap"
                          style={{
                            background: `linear-gradient(135deg, ${statusConfig.gradientFrom}20, ${statusConfig.gradientTo}20)`,
                            border: `2px solid ${statusConfig.gradientFrom}50`,
                            color: statusConfig.gradientFrom
                          }}
                        >
                          {statusConfig.text}
                        </span>
                      </div>

                      {/* Categories */}
                      {job.categories.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                            Categories
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.categories.map(cat => (
                              <span
                                key={cat}
                                className="px-3 py-1 rounded-lg text-sm font-semibold"
                                style={{
                                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                                  color: 'white'
                                }}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Skills Required</p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map(skill => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-lg text-sm font-semibold"
                                style={{
                                  background: `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                                  border: `1px solid var(--color-primary)`,
                                  color: 'var(--color-primary)'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                            }}
                          >
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {job.budgetType === 'quote' ? 'Quote' : `${job.budgetCurrency} ${job.budgetAmount?.toLocaleString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                            }}
                          >
                            <Briefcase className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                              {job.budgetType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                            }}
                          >
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {job.submittedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {job.status === 'rejected' && job.rejectionReason && (
                        <div className="p-4 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, #ef444420, #f8717120)',
                            border: '2px solid #ef444450'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, #ef4444, #f87171)`
                              }}
                            >
                              <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">Rejection Reason</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {job.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Messages */}
                      {job.status === 'pending' && (
                        <div className="p-4 rounded-2xl mt-4"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f620, #60a5fa20)',
                            border: '2px solid #3b82f650'
                          }}
                        >
                          <p className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium">
                            ⏳ Your job request is awaiting admin approval
                          </p>
                        </div>
                      )}

                      {job.status === 'approved' && (
                        <div className="p-4 rounded-2xl mt-4"
                          style={{
                            background: 'linear-gradient(135deg, #10b98120, #34d39920)',
                            border: '2px solid #10b98150'
                          }}
                        >
                          <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
                            ✅ Your job has been approved and is now live!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default JobRequestsStatusPage;
