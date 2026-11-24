import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar, Eye, Loader, X, Users, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { getJobApplications, updateApplicationStatus } from '@/firebase/services/physicalJobApplicationService';
import { getFogslyPhysicalJobById } from '@/firebase/services/fogslyPhysicalJobsService';
import { PhysicalJobApplication } from '@/firebase/types/physicalJob';
import { toast } from 'react-hot-toast';

interface PhysicalJobApplicantsPageProps {
  navigate: (route: string) => void;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    className={`backdrop-blur-[20px] rounded-[24px] shadow-lg transition-all duration-400 ${className}`}
    style={{
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)'
    }}
  >
    {children}
  </motion.div>
);

const PhysicalJobApplicantsPage: React.FC<PhysicalJobApplicantsPageProps> = ({ navigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<PhysicalJobApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [jobTitle, setJobTitle] = useState('Loading...');
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<PhysicalJobApplication | null>(null);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<PhysicalJobApplication | null>(null);

  useEffect(() => {
    // Extract job ID from URL path
    const path = window.location.pathname;
    const match = path.match(/physical-job-applicants\/([^/]+)/);
    if (match && match[1]) {
      setJobId(match[1]);
    }
  }, []);

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('auth');
        return;
      }

      if (!jobId) return;

      setIsLoading(true);
      try {
        // Fetch job details
        const job = await getFogslyPhysicalJobById(jobId);
        if (job) {
          setJobTitle(job.job_title);
        } else {
          toast.error('Job not found');
          navigate('manage-physical-jobs');
          return;
        }

        // Fetch applications for this job
        const apps = await getJobApplications(jobId);
        setApplications(apps);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId, user, authLoading, navigate]);

  const filteredApplicants = useMemo(() => {
    if (filterStatus === 'all') return applications;
    return applications.filter(app => app.status === filterStatus);
  }, [applications, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200/50 dark:border-orange-800/50';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-800/50';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50';
      default:
        return '';
    }
  };

  const handleApprove = async (application: PhysicalJobApplication) => {
    if (!user) return;
    
    setUpdatingAppId(application.id);
    try {
      const result = await updateApplicationStatus(
        application.id,
        'approved',
        undefined,
        user.uid
      );
      
      if (result.success) {
        // Update local state
        setApplications(applications.map(app =>
          app.id === application.id
            ? { ...app, status: 'approved', reviewedAt: new Date(), reviewedBy: user.uid }
            : app
        ));
        toast.success('Application approved successfully!');
      } else {
        toast.error(result.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleReject = async () => {
    if (!user || !showRejectModal) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setUpdatingAppId(showRejectModal.id);
    try {
      const result = await updateApplicationStatus(
        showRejectModal.id,
        'rejected',
        rejectionReason,
        user.uid
      );
      
      if (result.success) {
        // Update local state
        setApplications(applications.map(app =>
          app.id === showRejectModal.id
            ? {
                ...app,
                status: 'rejected',
                rejectionReason,
                reviewedAt: new Date(),
                reviewedBy: user.uid
              }
            : app
        ));
        toast.success('Application rejected');
        setShowRejectModal(null);
        setRejectionReason('');
      } else {
        toast.error(result.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statsCounts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('manage-physical-jobs')}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-all"
          style={{ color: 'var(--color-primary)' }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Manage Jobs
        </motion.button>

        {/* Header */}
        <GlassCard className="p-10 mb-10">
          <h1 className="text-5xl font-black mb-3" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
           Manage your Job Applicantions
          </h1>
          <p className="text-xl mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {jobTitle}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>{statsCounts.total}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Total</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
              <div className="text-3xl font-black text-orange-700 dark:text-orange-300">{statsCounts.pending}</div>
              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">Pending</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <div className="text-3xl font-black text-green-700 dark:text-green-300">{statsCounts.approved}</div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">Approved</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <div className="text-3xl font-black text-red-700 dark:text-red-300">{statsCounts.rejected}</div>
              <div className="text-sm font-semibold text-red-600 dark:text-red-400">Rejected</div>
            </div>
          </div>
        </GlassCard>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                filterStatus === status
                  ? 'bg-[var(--color-primary)] text-white shadow-lg'
                  : 'bg-[var(--color-card)] border-2 border-[var(--color-border)]'
              }`}
              style={filterStatus !== status ? { color: 'var(--color-text-primary)' } : {}}
            >
              {status === 'all' ? 'All Applicants' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <GlassCard className="p-14 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No Applicants Found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {filterStatus === 'all' ? 'No one has applied yet' : `No ${filterStatus.toLowerCase()} applicants`}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredApplicants.map((applicant, index) => (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Applicant Avatar */}
                      <div className="flex-shrink-0">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {applicant.applicant_name.charAt(0)}
                        </div>
                      </div>

                      {/* Applicant Details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              {applicant.applicant_name}
                            </h3>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <Mail className="w-4 h-4" />
                                {applicant.applicantEmail}
                              </div>
                              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <Phone className="w-4 h-4" />
                                {applicant.applicant_phone}
                              </div>
                              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <MapPin className="w-4 h-4" />
                                {applicant.applicant_city}, {applicant.applicant_country}
                              </div>
                              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <Calendar className="w-4 h-4" />
                                Applied {formatDate(applicant.appliedAt)}
                              </div>
                            </div>
                          </div>

                                 {/* Skills */}
                        <div className="">
                          <div className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Skills:</div>
                          <div className="flex flex-wrap gap-2">
                            {applicant.skills.map(skill => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-lg text-xs font-bold"
                                style={{
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  color: 'var(--color-primary)'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          {/* Resume Indicator */}
                          {applicant.resume_url && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Resume Attached</span>
                            </div>
                          )}
                        </div>

                          {/* Status Badge */}
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(applicant.status)}`}>
                            {applicant.status}
                          </span>
                        </div>

                        {/* Cover Letter */}
                        {/* <div className="mb-6">
                          <div className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Cover Letter:</div>
                          <p className="text-sm leading-relaxed p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                            {applicant.cover_letter}
                          </p>
                        </div> */}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedApplication(applicant)}
                            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {/* Approve Button - Only for pending applications */}
                          {applicant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(applicant)}
                                disabled={updatingAppId === applicant.id}
                                className="px-6 py-3 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingAppId === applicant.id ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => setShowRejectModal(applicant)}
                                disabled={updatingAppId === applicant.id}
                                className="px-6 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}

                          {/* Show rejection reason if rejected */}
                          {applicant.status === 'rejected' && applicant.rejectionReason && (
                            <div className="w-full mt-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                              <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-1">Rejection Reason:</p>
                              <p className="text-sm text-red-600 dark:text-red-400">{applicant.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedApplication(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                  Application Details
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
                </button>
              </div>

              {/* Application Content */}
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedApplication.applicant_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedApplication.applicantEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedApplication.applicant_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</p>
                      <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedApplication.applicant_city}, {selectedApplication.applicant_country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-lg text-sm font-bold"
                        style={{
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    Cover Letter
                  </h3>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                </div>

                {/* Resume Link */}
                {selectedApplication.resume_url && (
                  <div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Resume/CV
                    </h3>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-900 dark:text-blue-100">Resume Attached</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Click to view or download</p>
                        </div>
                      </div>
                      <a
                        href={selectedApplication.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Resume
                      </a>
                    </div>
                  </div>
                )}

                {/* Application Status & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Applied Date</p>
                    <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatDate(selectedApplication.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">Rejection Reason:</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowRejectModal(null);
            setRejectionReason('');
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl"
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                  Reject Application
                </h2>
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
                </button>
              </div>

              {/* Rejection Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this application..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  style={{ color: 'var(--color-text-primary)' }}
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={updatingAppId === showRejectModal.id || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingAppId === showRejectModal.id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PhysicalJobApplicantsPage;
