import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/firebase/hooks/useAuth';
import { getUserApplications } from '@/firebase/services/physicalJobApplicationService';
import { PhysicalJobApplication } from '@/firebase/types/physicalJob';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { p } from 'framer-motion/client';

interface MyFogJobApplicationsPageProps {
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
  </div>
);

// ============== GLASS CARD ==============
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

// ============== STATUS BADGE ==============
const StatusBadge: React.FC<{ status: 'pending' | 'approved' | 'rejected' }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Approved',
          bg: 'bg-green-500/10',
          text_color: 'text-green-600 dark:text-green-400',
          border: 'border-green-500/20'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          bg: 'bg-red-500/10',
          text_color: 'text-red-600 dark:text-red-400',
          border: 'border-red-500/20'
        };
      default:
        return {
          icon: Clock,
          text: 'Pending',
          bg: 'bg-orange-500/10',
          text_color: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-500/20'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1.5 rounded-full ${config.bg} ${config.text_color} text-xs font-bold border ${config.border} flex items-center gap-1.5`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
};

// ============== APPLICATION CARD ==============
const ApplicationCard: React.FC<{ 
  application: PhysicalJobApplication; 
  navigate: (route: string) => void;
}> = ({ application, navigate }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <GlassCard className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Job Title & Status */}
          <div className="flex items-start gap-3 mb-3">
            <h3 
              className="text-xl font-black group-hover:text-[var(--color-primary)] transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {application.jobTitle}
            </h3>
            <StatusBadge status={application.status} />
          </div>

          {/* Application Details */}
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-2">
              <Briefcase size={16} />
              <span className="font-semibold">Applied via Fogsly</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Applied {formatDate(application.appliedAt)}</span>
            </div>
            {application.reviewedAt && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Reviewed {formatDate(application.reviewedAt)}</span>
              </div>
            )}
          </div>
          <div className='mt-4 '>
            {application.status == 'approved' && (
              <span className='bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-xl'>Congratulations! your application is approved by the company. The Team will contact you shortly.</span>
            )}
          </div>

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {application.skills.slice(0, 3).map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    color: 'var(--color-text-primary)' 
                  }}
                >
                  {skill}
                </span>
              ))}
              {application.skills.length > 3 && (
                <span 
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    color: 'var(--color-text-secondary)' 
                  }}
                >
                  +{application.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {application.status === 'rejected' && application.rejectionReason && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Reason: {application.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`physical-job-details/${application.jobId}`)}
            className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Eye size={16} />
            View Job
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

// ============== MAIN PAGE ==============
const MyFogJobApplicationsPage: React.FC<MyFogJobApplicationsPageProps> = ({ navigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<PhysicalJobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (authLoading) return;
      
      if (!user) {
        toast.error('Please log in to view your applications');
        navigate('auth');
        return;
      }

      setIsLoading(true);
      try {
        const userApps = await getUserApplications(user.uid);
        setApplications(userApps);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, authLoading, navigate]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app =>
        app.jobTitle?.toLowerCase().includes(query) ||
        app.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }

    return result;
  }, [applications, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
  }, [applications]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Loading your applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatedBackground />

      <div className="relative z-10 pt-4 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('fog-jobs')}
            className="mb-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Jobs</span>
          </motion.button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black mb-3" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              My Applications
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Track and manage all your job applications
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-6">
              <div className="text-4xl font-black mb-2" style={{ color: 'var(--color-primary)' }}>
                {stats.total}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                Total Applications
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-4xl font-black mb-2 text-orange-600 dark:text-orange-400">
                {stats.pending}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                Pending Review
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-4xl font-black mb-2 text-green-600 dark:text-green-400">
                {stats.approved}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                Approved
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-4xl font-black mb-2 text-red-600 dark:text-red-400">
                {stats.rejected}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                Rejected
              </div>
            </GlassCard>
          </div>

          {/* Filters & Search */}
          <GlassCard className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2" 
                  size={20} 
                  style={{ color: 'var(--color-text-tertiary)' }}
                />
                <input
                  type="text"
                  placeholder="Search by job title or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-6 py-3 rounded-xl border-2 font-bold focus:outline-none focus:ring-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                Showing {paginatedApplications.length} of {filteredApplications.length} applications
              </p>
            </div>
          </GlassCard>

          {/* Applications List */}
          {paginatedApplications.length === 0 ? (
            <GlassCard className="p-16 text-center">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {searchQuery || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Start applying to jobs to see them here'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={() => navigate('fog-jobs')}
                  className="px-8 py-4 rounded-xl font-bold text-base text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Browse Jobs
                </button>
              )}
            </GlassCard>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout">
                  {paginatedApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ApplicationCard application={application} navigate={navigate} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                            currentPage === page ? 'text-white' : ''
                          }`}
                          style={{
                            backgroundColor: currentPage === page ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                            color: currentPage === page ? 'white' : 'var(--color-text-primary)'
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyFogJobApplicationsPage;
