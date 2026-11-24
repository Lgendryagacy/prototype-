import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import Modal from '../../ui/Modal';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Briefcase,
  DollarSign,
  Tag,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  RotateCcw,
  ChevronDown,
  FileText,
  PlayCircle,
  PauseCircle,
  XOctagon,
  Users
} from 'lucide-react';
import { 
  getAllJobRequests, 
  approveJobRequest, 
  rejectJobRequest,
  getJobRequestsStats
} from '../../../firebase/services/jobRequestService';
import { JobRequest, JobRequestStatus, FogslyJobStatus, FogslyJob } from '../../../firebase/types/job';
import { toast } from 'react-hot-toast';
import { getFogslyJobByRequestId, updateFogslyJobStatus, getAllFogslyJobs } from '../../../firebase/services/fogslyJobsService';
import { getJobProposals } from '../../../firebase/services/jobProposals';

type TabType = 'requests' | 'active-jobs';

const JobManagementView = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  
  // Job Requests state
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobRequestStatus | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Job status tracking for approved jobs - maps JobRequest ID to {fogslyJobId, status}
  const [approvedJobsStatus, setApprovedJobsStatus] = useState<Record<string, { fogslyJobId: string; status: FogslyJobStatus }>>({});
  
  // Pagination for job requests
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  
  // Active Jobs state
  const [activeJobs, setActiveJobs] = useState<FogslyJob[]>([]);
  const [filteredActiveJobs, setFilteredActiveJobs] = useState<FogslyJob[]>([]);
  const [activeJobsLoading, setActiveJobsLoading] = useState(true);
  const [activeJobsSearchTerm, setActiveJobsSearchTerm] = useState('');
  const [activeJobsStatusFilter, setActiveJobsStatusFilter] = useState<FogslyJobStatus | 'all'>('all');
  const [selectedActiveJob, setSelectedActiveJob] = useState<FogslyJob | null>(null);
  const [showActiveJobDetailModal, setShowActiveJobDetailModal] = useState(false);
  const [showActiveJobStatusDropdown, setShowActiveJobStatusDropdown] = useState(false);
  const activeJobDropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination for active jobs
  const [activeJobsCurrentPage, setActiveJobsCurrentPage] = useState(1);
  const activeJobsPerPage = 10;
  
  // Active jobs stats
  const [activeJobsStats, setActiveJobsStats] = useState({ total: 0, active: 0, paused: 0, closed: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetchJobs();
    fetchStats();
    fetchActiveJobs();
    fetchActiveJobsStats();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);
  
  useEffect(() => {
    filterActiveJobs();
  }, [activeJobs, activeJobsSearchTerm, activeJobsStatusFilter]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (activeJobDropdownRef.current && !activeJobDropdownRef.current.contains(event.target as Node)) {
        setShowActiveJobStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await getAllJobRequests();
      setJobs(allJobs);
      
      // Fetch status for all approved jobs from FogslyJobs collection
      const statusMap: Record<string, { fogslyJobId: string; status: FogslyJobStatus }> = {};
      for (const job of allJobs.filter(j => j.status === 'approved')) {
        const fogslyJob = await getFogslyJobByRequestId(job.id);
        if (fogslyJob) {
          statusMap[job.id] = {
            fogslyJobId: fogslyJob.id,
            status: fogslyJob.status
          };
        }
      }
      setApprovedJobsStatus(statusMap);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statistics = await getJobRequestsStats();
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const fetchActiveJobs = async () => {
    try {
      setActiveJobsLoading(true);
      const allActiveJobs = await getAllFogslyJobs();
      setActiveJobs(allActiveJobs);
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      toast.error('Failed to load active jobs');
    } finally {
      setActiveJobsLoading(false);
    }
  };
  
  const fetchActiveJobsStats = () => {
    const stats = {
      total: activeJobs.length,
      active: activeJobs.filter(j => j.status === 'active').length,
      paused: activeJobs.filter(j => j.status === 'paused').length,
      closed: activeJobs.filter(j => j.status === 'closed').length,
      inProgress: activeJobs.filter(j => j.status === 'in-progress').length,
      completed: activeJobs.filter(j => j.status === 'completed').length,
    };
    setActiveJobsStats(stats);
  };
  
  const filterActiveJobs = () => {
    let filtered = activeJobs;

    if (activeJobsStatusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === activeJobsStatusFilter);
    }

    if (activeJobsSearchTerm) {
      const lowerSearch = activeJobsSearchTerm.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.jobTitle.toLowerCase().includes(lowerSearch) ||
          job.userName.toLowerCase().includes(lowerSearch) ||
          job.userEmail.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredActiveJobs(filtered);
    setActiveJobsCurrentPage(1);
    fetchActiveJobsStats();
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.jobTitle.toLowerCase().includes(lowerSearch) ||
          job.userName.toLowerCase().includes(lowerSearch) ||
          job.userEmail.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleApprove = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const result = await approveJobRequest(jobId, 'admin-user-id');
      if (result.success) {
        toast.success('Job request approved successfully');
        await fetchJobs();
        await fetchStats();
        setShowDetailModal(false);
      } else {
        toast.error(result.error || 'Failed to approve job request');
      }
    } catch (error) {
      console.error('Error approving job:', error);
      toast.error('Failed to approve job request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedJob || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(selectedJob.id);
    try {
      const result = await rejectJobRequest(selectedJob.id, 'admin-user-id', rejectionReason);
      if (result.success) {
        toast.success('Job request rejected');
        await fetchJobs();
        await fetchStats();
        setShowDetailModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        toast.error(result.error || 'Failed to reject job request');
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
      toast.error('Failed to reject job request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReApprove = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to re-approve this job request?')) {
      return;
    }

    setActionLoading(jobId);
    try {
      const result = await approveJobRequest(jobId, 'admin-user-id');
      if (result.success) {
        toast.success('Job request re-approved successfully');
        await fetchJobs();
        await fetchStats();
        setShowDetailModal(false);
      } else {
        toast.error(result.error || 'Failed to re-approve job request');
      }
    } catch (error) {
      console.error('Error re-approving job:', error);
      toast.error('Failed to re-approve job request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleJobStatus = async (jobRequestId: string, jobData: { fogslyJobId: string; status: FogslyJobStatus }) => {
    const newStatus: FogslyJobStatus = jobData.status === 'active' ? 'paused' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'pause';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this job?`)) {
      return;
    }

    setActionLoading(jobRequestId);
    try {
      // Update the FogslyJob document (not JobRequest)
      const result = await updateFogslyJobStatus(jobData.fogslyJobId, newStatus);
      if (result.success) {
        toast.success(`Job ${actionText}d successfully`);
        // Update local state
        setApprovedJobsStatus(prev => ({
          ...prev,
          [jobRequestId]: {
            fogslyJobId: jobData.fogslyJobId,
            status: newStatus
          }
        }));
      } else {
        toast.error(result.error || `Failed to ${actionText} job`);
      }
    } catch (error) {
      console.error(`Error ${actionText}ing job:`, error);
      toast.error(`Failed to ${actionText} job`);
    } finally {
      setActionLoading(null);
    }
  };

  const viewDetails = (job: JobRequest) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };
  
  // Active Jobs Handlers
  const handleActiveJobStatusChange = async (jobId: string, newStatus: FogslyJobStatus) => {
    const actionText = newStatus === 'active' ? 'activate' : newStatus === 'paused' ? 'pause' : 'close';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this job?`)) {
      return;
    }

    setActionLoading(jobId);
    try {
      const result = await updateFogslyJobStatus(jobId, newStatus);
      if (result.success) {
        toast.success(`Job ${actionText}d successfully`);
        await fetchActiveJobs();
      } else {
        toast.error(result.error || `Failed to ${actionText} job`);
      }
    } catch (error) {
      console.error(`Error ${actionText}ing job:`, error);
      toast.error(`Failed to ${actionText} job`);
    } finally {
      setActionLoading(null);
    }
  };
  
  const viewActiveJobDetails = (job: FogslyJob) => {
    setSelectedActiveJob(job);
    setShowActiveJobDetailModal(true);
  };
  
  const viewJobApplications = (jobId: string) => {
    // Navigate to applications page or show modal
    toast.success('Applications view coming soon', { duration: 3000 });
    // TODO: Implement applications view
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const getStatusIcon = (status: JobRequestStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: JobRequestStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusBadge = (job: JobRequest) => {
    // If approved, check if the job is paused in FogslyJobs collection
    if (job.status === 'approved' && approvedJobsStatus[job.id]?.status === 'paused') {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            Paused
          </div>
        </Badge>
      );
    }

    return (
      <Badge className={getStatusColor(job.status)}>
        <div className="flex items-center gap-1">
          {getStatusIcon(job.status)}
          {job.status}
        </div>
      </Badge>
    );
  };
  
  // Active Jobs Helper Functions
  const getActiveJobStatusIcon = (status: FogslyJobStatus) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4" />;
      case 'paused': return <PauseCircle className="w-4 h-4" />;
      case 'closed': return <XOctagon className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActiveJobStatusColor = (status: FogslyJobStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getActiveJobStatusBadge = (job: FogslyJob) => {
    // Get status monogram
    const getStatusMonogram = (status: FogslyJobStatus) => {
      switch (status) {
        case 'completed': return 'C';
        case 'closed': return 'X';
        case 'in-progress': return 'P';
        default: return null;
      }
    };

    const monogram = getStatusMonogram(job.status);
    
    return (
      <Badge className={getActiveJobStatusColor(job.status)}>
        <div className="flex items-center gap-1">
          {monogram && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold mr-1">
              {monogram}
            </span>
          )}
          {getActiveJobStatusIcon(job.status)}
          {job.status}
        </div>
      </Badge>
    );
  };
  
  // Pagination for active jobs
  const indexOfLastActiveJob = activeJobsCurrentPage * activeJobsPerPage;
  const indexOfFirstActiveJob = indexOfLastActiveJob - activeJobsPerPage;
  const currentActiveJobs = filteredActiveJobs.slice(indexOfFirstActiveJob, indexOfLastActiveJob);
  const totalActiveJobsPages = Math.ceil(filteredActiveJobs.length / activeJobsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'requests'
              ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Job Requests
          </div>
        </button>
        <button
          onClick={() => setActiveTab('active-jobs')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'active-jobs'
              ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Active Jobs
          </div>
        </button>
      </div>

      {/* Job Requests Tab */}
      {activeTab === 'requests' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'text-blue-400' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' }
        ].map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by job title, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 capitalize min-w-[150px] justify-between"
              >
                {statusFilter === 'all' ? 'All Status' : statusFilter}
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              <AnimatePresence>
                {showStatusDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status as any);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 capitalize transition-colors ${
                          statusFilter === status
                            ? 'bg-[--color-primary] text-white'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        {status === 'all' ? 'All Status' : status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Job Requests ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Job Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Applicant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  {/* <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Submitted</th> */}
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No job requests found
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <div className="text-white font-small text-md">{job.jobTitle}</div>
                        <div className="text-sm text-gray-400 line-clamp-1">{job.jobDescription}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white text-sm">{job.userName}</div>
                        <div className="text-xs text-gray-400">{job.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white text-sm">
                          {job.budgetType === 'quote' ? (
                            <span className="text-gray-400">Request Quote</span>
                          ) : (
                            `${job.budgetCurrency} ${job.budgetAmount?.toLocaleString()}`
                          )}
                        </div>
                        {job.budgetInFogCoins && (
                          <div className="text-xs text-blue-400">
                            {job.budgetInFogCoins.toFixed(2)} FOG
                          </div>
                        )}
                        <div className="text-xs text-gray-400 capitalize">{job.budgetType}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(job)}
                      </td>
                      {/* <td className="py-3 px-4 text-white text-sm">
                        {job.submittedAt.toLocaleDateString()}
                      </td> */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDetails(job)}
                            className="text-blue-400 hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {job.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(job.id)}
                                disabled={actionLoading === job.id}
                                className="text-green-400 hover:text-green-300"
                                title="Approve"
                              >
                                {actionLoading === job.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-400 hover:text-red-300"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* {job.status === 'approved' && approvedJobsStatus[job.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleJobStatus(job.id, approvedJobsStatus[job.id])}
                              disabled={actionLoading === job.id}
                              className={`${
                                approvedJobsStatus[job.id].status === 'active'
                                  ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                                  : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={approvedJobsStatus[job.id].status === 'active' ? 'Pause Job' : 'Activate Job'}
                            >
                              {actionLoading === job.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : approvedJobsStatus[job.id].status === 'active' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Button>
                          )} */}
                          
                          {/* {job.status === 'rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReApprove(job.id)}
                              disabled={actionLoading === job.id}
                              className="text-blue-400 hover:text-blue-300"
                              title="Re-approve"
                            >
                              {actionLoading === job.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </Button>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} jobs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="flex items-center px-3 text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedJob && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Job Request Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{selectedJob.jobTitle}</h3>
              <Badge className={getStatusColor(selectedJob.status)}>
                {selectedJob.status.toUpperCase()}
              </Badge>
            </div>

            <div>
              <Label>Description</Label>
              <p className="text-sm text-[--color-text-secondary] whitespace-pre-wrap">
                {selectedJob.jobDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Type</Label>
                <p className="text-sm capitalize">{selectedJob.budgetType}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm">
                  {selectedJob.budgetType === 'quote' 
                    ? 'Request Quote' 
                    : `${selectedJob.budgetCurrency} ${selectedJob.budgetAmount?.toLocaleString()}`
                  }
                </p>
                {selectedJob.budgetInFogCoins && (
                  <p className="text-sm text-blue-400 mt-1">
                    {selectedJob.budgetInFogCoins.toFixed(2)} FOG Coins
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedJob.categories.map(cat => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedJob.skills.map(skill => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>Client Information</Label>
              <div className="space-y-2 mt-2 text-sm">
                <p><strong>Name:</strong> {selectedJob.userName}</p>
                <p><strong>Email:</strong> {selectedJob.userEmail}</p>
                <p><strong>Phone:</strong> {selectedJob.userPhone}</p>
                <p><strong>Location:</strong> {selectedJob.userCity}, {selectedJob.userCountry}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-[--color-text-secondary]">
                Submitted: {selectedJob.submittedAt.toLocaleString()}
              </p>
              {selectedJob.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Rejection Reason:</strong> {selectedJob.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {selectedJob.status === 'pending' && (
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(selectedJob.id)}
                  disabled={actionLoading === selectedJob.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowRejectModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Job Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-[--color-text-secondary]">
            Please provide a reason for rejecting this job request.
          </p>
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading !== null}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </div>
      </Modal>
        </>
      )}

      {/* Active Jobs Tab */}
      {activeTab === 'active-jobs' && (
        <>
          {/* Active Jobs Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: activeJobsStats.total, icon: Briefcase, color: 'text-blue-400' },
              { label: 'Active', value: activeJobsStats.active, icon: PlayCircle, color: 'text-green-400' },
              { label: 'Paused', value: activeJobsStats.paused, icon: PauseCircle, color: 'text-orange-400' },
              { label: 'Closed', value: activeJobsStats.closed, icon: XOctagon, color: 'text-red-400' },
              { label: 'In Progress', value: activeJobsStats.inProgress, icon: Clock, color: 'text-blue-400' },
              { label: 'Completed', value: activeJobsStats.completed, icon: CheckCircle, color: 'text-purple-400' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {stat.label}
                    </CardTitle>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters and Search for Active Jobs */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by job title, client name, or email..."
                      value={activeJobsSearchTerm}
                      onChange={(e) => setActiveJobsSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="relative" ref={activeJobDropdownRef}>
                  <Button
                    variant="outline"
                    onClick={() => setShowActiveJobStatusDropdown(!showActiveJobStatusDropdown)}
                    className="flex items-center gap-2 capitalize min-w-[150px] justify-between"
                  >
                    {activeJobsStatusFilter === 'all' ? 'All Status' : activeJobsStatusFilter}
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  <AnimatePresence>
                    {showActiveJobStatusDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden"
                      >
                        {['all', 'active', 'paused', 'closed', 'in-progress', 'completed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setActiveJobsStatusFilter(status as any);
                              setShowActiveJobStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 capitalize transition-colors ${
                              activeJobsStatusFilter === status
                                ? 'bg-[--color-primary] text-white'
                                : 'text-gray-300 hover:bg-slate-700'
                            }`}
                          >
                            {status === 'all' ? 'All Status' : status}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Jobs Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Active Jobs ({filteredActiveJobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {activeJobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary]"></div>
                </div>
              ) : currentActiveJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No active jobs found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Job Title</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Client</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Budget</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Applications</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentActiveJobs.map((job) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <p className="text-white font-medium">{job.jobTitle}</p>
                              <p className="text-sm text-gray-400 mt-1 line-clamp-1">{job.jobDescription}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-white">{job.userName}</p>
                              <p className="text-sm text-gray-400">{job.userEmail}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-white font-medium">
                                {job.budgetAmount ? `${job.budgetAmount} ${job.budgetCurrency}` : 'Contact for quote'}
                              </p>
                              {job.budgetInFogCoins && (
                                <p className="text-sm text-blue-400 mt-1">
                                  {job.budgetInFogCoins.toFixed(2)} FOG
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {getActiveJobStatusBadge(job)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{job.applicationCount || 0}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-400 text-sm">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => viewActiveJobDetails(job)}
                                  className="p-2"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {/* Hide applications button for completed and closed jobs */}
                                {job.status !== 'completed' && job.status !== 'closed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => viewJobApplications(job.id)}
                                    className="p-2"
                                    title="View Applications"
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                )}
                                {job.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleActiveJobStatusChange(job.id, 'paused')}
                                    className="p-2 text-orange-400 hover:text-orange-300"
                                    title="Pause Job"
                                    disabled={actionLoading === job.id}
                                  >
                                    <PauseCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {job.status === 'paused' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleActiveJobStatusChange(job.id, 'active')}
                                    className="p-2 text-green-400 hover:text-green-300"
                                    title="Activate Job"
                                    disabled={actionLoading === job.id}
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {(job.status === 'active' || job.status === 'paused') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleActiveJobStatusChange(job.id, 'closed')}
                                    className="p-2 text-red-400 hover:text-red-300"
                                    title="Close Job"
                                    disabled={actionLoading === job.id}
                                  >
                                    <XOctagon className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Active Jobs */}
                  {totalActiveJobsPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                      <p className="text-sm text-gray-400">
                        Showing {indexOfFirstActiveJob + 1} to {Math.min(indexOfLastActiveJob, filteredActiveJobs.length)} of {filteredActiveJobs.length} jobs
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveJobsCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={activeJobsCurrentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {Array.from({ length: totalActiveJobsPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={activeJobsCurrentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveJobsCurrentPage(page)}
                            className={activeJobsCurrentPage === page ? 'bg-[--color-primary]' : ''}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveJobsCurrentPage(prev => Math.min(totalActiveJobsPages, prev + 1))}
                          disabled={activeJobsCurrentPage === totalActiveJobsPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Job Detail Modal */}
          {selectedActiveJob && (
            <Modal
              isOpen={showActiveJobDetailModal}
              onClose={() => {
                setShowActiveJobDetailModal(false);
                setSelectedActiveJob(null);
              }}
              title="Active Job Details"
            >
              <div className="space-y-4">
                <div>
                  <Label>Job Title</Label>
                  <p className="text-white font-medium mt-1">{selectedActiveJob.jobTitle}</p>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-[--color-text-secondary] mt-1">{selectedActiveJob.jobDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    <p className="text-white mt-1">{selectedActiveJob.userName}</p>
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <p className="text-white mt-1">{selectedActiveJob.userEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <p className="text-white font-medium mt-1">
                      {selectedActiveJob.budgetAmount ? `${selectedActiveJob.budgetAmount} ${selectedActiveJob.budgetCurrency}` : 'Contact for quote'}
                    </p>
                    {selectedActiveJob.budgetInFogCoins && (
                      <p className="text-sm text-blue-400 mt-1">
                        {selectedActiveJob.budgetInFogCoins.toFixed(2)} FOG Coins
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getActiveJobStatusBadge(selectedActiveJob)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedActiveJob.categories?.map((category, index) => (
                      <Badge key={index} className="bg-slate-700 text-white">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Required Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedActiveJob.skills?.map((skill, index) => (
                      <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Applications</Label>
                    <p className="text-white mt-1">{selectedActiveJob.applicationCount || 0}</p>
                  </div>
                  <div>
                    <Label>Views</Label>
                    <p className="text-white mt-1">{selectedActiveJob.viewCount || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created At</Label>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(selectedActiveJob.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Updated At</Label>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(selectedActiveJob.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => viewJobApplications(selectedActiveJob.id)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Applications
                  </Button>
                  {selectedActiveJob.status === 'active' && (
                    <Button
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        handleActiveJobStatusChange(selectedActiveJob.id, 'paused');
                        setShowActiveJobDetailModal(false);
                      }}
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Pause Job
                    </Button>
                  )}
                  {selectedActiveJob.status === 'paused' && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleActiveJobStatusChange(selectedActiveJob.id, 'active');
                        setShowActiveJobDetailModal(false);
                      }}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Activate Job
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
          )}
        </>
      )}

      {/* Modals - Available for both tabs */}
      {activeTab === 'requests' && selectedJob && (
        <>
          {/* Detail Modal */}
          <Modal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedJob(null);
            }}
            title="Job Request Details"
          >
            <div className="space-y-4">
              <div>
                <Label>Job Title</Label>
                <p className="text-white font-medium mt-1">{selectedJob.jobTitle}</p>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-[--color-text-secondary] mt-1">{selectedJob.jobDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Name</Label>
                  <p className="text-white mt-1">{selectedJob.userName}</p>
                </div>
                <div>
                  <Label>User Email</Label>
                  <p className="text-white mt-1">{selectedJob.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget</Label>
                  <p className="text-white font-medium mt-1">
                    {selectedJob.budgetAmount ? `${selectedJob.budgetAmount} ${selectedJob.budgetCurrency}` : 'Contact for quote'}
                  </p>
                  {selectedJob.budgetInFogCoins && (
                    <p className="text-sm text-blue-400 mt-1">
                      {selectedJob.budgetInFogCoins.toFixed(2)} FOG Coins
                    </p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedJob)}
                  </div>
                </div>
              </div>

              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.categories?.map((category, index) => (
                    <Badge key={index} className="bg-slate-700 text-white">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.skills?.map((skill, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Submitted At</Label>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(selectedJob.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Updated At</Label>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(selectedJob.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedJob.status === 'rejected' && selectedJob.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Rejection Reason:</strong> {selectedJob.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {selectedJob.status === 'pending' && (
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(selectedJob.id)}
                  disabled={actionLoading === selectedJob.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowRejectModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </Modal>

          {/* Reject Modal */}
          <Modal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setRejectionReason('');
            }}
            title="Reject Job Request"
          >
            <div className="space-y-4">
              <p className="text-sm text-[--color-text-secondary]">
                Please provide a reason for rejecting this job request.
              </p>
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading !== null}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Request'}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default JobManagementView;
