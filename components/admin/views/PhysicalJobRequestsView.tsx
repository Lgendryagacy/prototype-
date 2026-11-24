import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Check,
  X,
  Users,
  Globe,
  Mail,
  Phone,
  TrendingUp,
  Loader,
  Lock,
  Unlock,
  Play,
  Pause
} from 'lucide-react';
import {
  getAllPhysicalJobRequests,
  getPhysicalJobRequestsStats,
  approvePhysicalJobRequest,
  rejectPhysicalJobRequest
} from '../../../firebase/services/physicalJobRequestService';
import {
  getAllPhysicalJobs,
  updatePhysicalJobStatus
} from '../../../firebase/services/fogslyPhysicalJobsService';
import { 
  PhysicalJobRequest, 
  PhysicalJobRequestStatus,
  FogslyPhysicalJob,
  FogslyPhysicalJobStatus
} from '../../../firebase/types/physicalJob';
import { toast } from 'react-hot-toast';

export default function PhysicalJobRequestsView() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'requests' | 'jobs'>('requests');

  // Requests state
  const [requests, setRequests] = useState<PhysicalJobRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PhysicalJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PhysicalJobRequestStatus | 'all'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<PhysicalJobRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Jobs state
  const [jobs, setJobs] = useState<FogslyPhysicalJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<FogslyPhysicalJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<FogslyPhysicalJobStatus | 'all'>('all');
  const [jobStats, setJobStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    closed: 0
  });
  const [selectedJob, setSelectedJob] = useState<FogslyPhysicalJob | null>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Load requests
  // Load requests
  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, []);

  // Filter requests
  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  // Filter jobs
  useEffect(() => {
    filterJobs();
  }, [jobs, jobSearchQuery, jobStatusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const allRequests = await getAllPhysicalJobRequests();
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load job requests');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getPhysicalJobRequestsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.job_title.toLowerCase().includes(query) ||
        req.company_name.toLowerCase().includes(query) ||
        req.category.toLowerCase().includes(query) ||
        req.city.toLowerCase().includes(query) ||
        req.country.toLowerCase().includes(query) ||
        req.userEmail.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const allJobs = await getAllPhysicalJobs(undefined, 1000);
      setJobs(allJobs);
      
      // Calculate stats
      const stats = {
        total: allJobs.length,
        active: allJobs.filter(job => job.status === 'active').length,
        paused: allJobs.filter(job => job.status === 'paused').length,
        closed: allJobs.filter(job => job.status === 'closed' || job.status === 'hired' || job.status === 'completed').length
      };
      setJobStats(stats);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (jobStatusFilter !== 'all') {
      if (jobStatusFilter === 'closed') {
        // Include all closed states
        filtered = filtered.filter(job => 
          job.status === 'closed' || 
          job.status === 'hired' || 
          job.status === 'completed'
        );
      } else {
        filtered = filtered.filter(job => job.status === jobStatusFilter);
      }
    }

    if (jobSearchQuery.trim()) {
      const query = jobSearchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(query) ||
        job.company_name.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query) ||
        job.city.toLowerCase().includes(query) ||
        job.country.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApprove = async (request: PhysicalJobRequest) => {
    if (!confirm(`Approve job request for "${request.job_title}" at ${request.company_name}?\n\nThis will create an active job posting.`)) {
      return;
    }

    setProcessingId(request.id);
    try {
      const result = await approvePhysicalJobRequest(request.id);
      
      if (result.success) {
        toast.success('Job request approved and posted successfully!');
        await loadRequests();
        await loadStats();
      } else {
        toast.error(result.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (request: PhysicalJobRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessingId(selectedRequest.id);
    setShowRejectModal(false);
    
    try {
      const result = await rejectPhysicalJobRequest(selectedRequest.id, rejectionReason);
      
      if (result.success) {
        toast.success('Job request rejected');
        await loadRequests();
        await loadStats();
      } else {
        toast.error(result.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  // Job action handlers
  const handlePauseJob = async (job: FogslyPhysicalJob) => {
    const reason = prompt('Please provide a reason for pausing this job:');
    if (!reason || !reason.trim()) {
      return;
    }

    setProcessingJobId(job.id);
    try {
      await updatePhysicalJobStatus(job.id, 'paused', reason.trim());
      toast.success('Job paused successfully');
      await loadJobs();
    } catch (error) {
      console.error('Error pausing job:', error);
      toast.error('Failed to pause job');
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleReactivateJob = async (job: FogslyPhysicalJob) => {
    if (!confirm(`Reactivate job "${job.job_title}" at ${job.company_name}?`)) {
      return;
    }

    setProcessingJobId(job.id);
    try {
      await updatePhysicalJobStatus(job.id, 'active');
      toast.success('Job reactivated successfully');
      await loadJobs();
    } catch (error) {
      console.error('Error reactivating job:', error);
      toast.error('Failed to reactivate job');
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleCloseJob = async (job: FogslyPhysicalJob) => {
    if (!confirm(`Close job "${job.job_title}" at ${job.company_name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setProcessingJobId(job.id);
    try {
      await updatePhysicalJobStatus(job.id, 'closed');
      toast.success('Job closed successfully');
      await loadJobs();
    } catch (error) {
      console.error('Error closing job:', error);
      toast.error('Failed to close job');
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleViewJobDetails = (job: FogslyPhysicalJob) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  const getStatusBadge = (status: PhysicalJobRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJobStatusBadge = (status: FogslyPhysicalJobStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            <Play className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Pause className="w-3.5 h-3.5" />
            Paused
          </span>
        );
      case 'closed':
      case 'hired':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Physical Job Management</h2>
          <p className="text-slate-400">Manage job requests and active job postings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === 'requests'
                ? 'text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Job Requests
            {activeTab === 'requests' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === 'jobs'
                ? 'text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Jobs
            {activeTab === 'jobs' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        </div>

        {/* Stats Cards - Conditional based on active tab */}
        {activeTab === 'requests' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Jobs</p>
                  <p className="text-2xl font-bold text-white mt-1">{jobStats.total}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{jobStats.active}</p>
                </div>
                <Play className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Paused</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{jobStats.paused}</p>
                </div>
                <Pause className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Closed</p>
                  <p className="text-2xl font-bold text-slate-400 mt-1">{jobStats.closed}</p>
                </div>
                <XCircle className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'requests' ? (
        <>
          {/* Search and Filters */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
              type="text"
              placeholder="Search by job title, company, location, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No requests found' : 'No requests yet'}
          </h3>
          <p className="text-slate-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Physical job requests will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {request.company_logo ? (
                      <img
                        src={request.company_logo}
                        alt={request.company_name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-1">
                        {request.job_title}
                      </h3>
                      <p className="text-base font-bold text-slate-300 mb-2">
                        {request.company_name}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {request.job_type}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {request.experience_level}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {request.employment_type}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.city}, {request.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${request.salary_min.toLocaleString()} - ${request.salary_max.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{request.num_positions} position{request.num_positions > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.submittedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{request.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.phone}</span>
                        </div>
                      </div>

                      {(request.accommodation || request.visa_support) && (
                        <div className="flex flex-wrap gap-2">
                          {request.accommodation && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                              🏠 Accommodation
                            </span>
                          )}
                          {request.visa_support && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              ✈️ Visa Support
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request.id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                        className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === 'approved' && request.approvedAt && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Approved</p>
                      <p className="text-xs text-green-400">{formatDate(request.approvedAt)}</p>
                      {request.approvedBy && (
                        <p className="text-xs text-slate-500 mt-1">by {request.approvedBy}</p>
                      )}
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="text-right">
                      {request.rejectedAt && (
                        <>
                          <p className="text-xs text-slate-400 mb-1">Rejected</p>
                          <p className="text-xs text-red-400">{formatDate(request.rejectedAt)}</p>
                          {request.rejectedBy && (
                            <p className="text-xs text-slate-500 mt-1">by {request.rejectedBy}</p>
                          )}
                        </>
                      )}
                      {request.rejectionReason && (
                        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="text-xs font-bold text-red-400 mb-1">Reason:</p>
                          <p className="text-xs text-red-300">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Reject Job Request</h3>
            <p className="text-slate-300 mb-4">
              You are rejecting: <span className="font-bold">{selectedRequest.job_title}</span> at {selectedRequest.company_name}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </>
      ) : (
        <>
          {/* Jobs Tab Content */}
          {/* Search and Filters */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title, company, location..."
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setJobStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    jobStatusFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All ({jobStats.total})
                </button>
                <button
                  onClick={() => setJobStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    jobStatusFilter === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Active ({jobStats.active})
                </button>
                <button
                  onClick={() => setJobStatusFilter('paused')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    jobStatusFilter === 'paused'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Paused ({jobStats.paused})
                </button>
                <button
                  onClick={() => setJobStatusFilter('closed')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    jobStatusFilter === 'closed'
                      ? 'bg-slate-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Closed ({jobStats.closed})
                </button>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {jobSearchQuery || jobStatusFilter !== 'all' ? 'No jobs found' : 'No jobs yet'}
              </h3>
              <p className="text-slate-400">
                {jobSearchQuery || jobStatusFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Active jobs will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {job.company_logo ? (
                          <img
                            src={job.company_logo}
                            alt={job.company_name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{job.job_title}</h3>
                              <p className="text-blue-400 font-bold">{job.company_name}</p>
                            </div>
                            {getJobStatusBadge(job.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {job.city}, {job.country}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              {job.category}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              Posted: {formatDate(job.posted_date)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                            </div>
                          </div>

                          {job.paused_reason && job.status === 'paused' && (
                            <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                              <p className="text-xs font-bold text-yellow-400 mb-1">Paused Reason:</p>
                              <p className="text-xs text-yellow-300">{job.paused_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {job.status === 'active' && (
                        <button
                          onClick={() => handlePauseJob(job)}
                          disabled={processingJobId === job.id}
                          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingJobId === job.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              Pause
                            </>
                          )}
                        </button>
                      )}

                      {job.status === 'paused' && (
                        <button
                          onClick={() => handleReactivateJob(job)}
                          disabled={processingJobId === job.id}
                          className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingJobId === job.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Unlock className="w-5 h-5" />
                              Reactivate
                            </>
                          )}
                        </button>
                      )}

                      {(job.status === 'active' || job.status === 'paused') && (
                        <button
                          onClick={() => handleCloseJob(job)}
                          disabled={processingJobId === job.id}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-5 h-5" />
                          Close
                        </button>
                      )}

                      <button
                        onClick={() => handleViewJobDetails(job)}
                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Job Details Modal */}
          {showJobDetailsModal && selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-3xl w-full my-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {selectedJob.company_logo ? (
                      <img
                        src={selectedJob.company_logo}
                        alt={selectedJob.company_name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{selectedJob.job_title}</h3>
                      <p className="text-blue-400 font-bold">{selectedJob.company_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJobDetailsModal(false)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Status</p>
                    {getJobStatusBadge(selectedJob.status)}
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Location</p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.city}, {selectedJob.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Category</p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {selectedJob.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Employment Type</p>
                      <p className="text-white font-bold">{selectedJob.employment_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Experience Level</p>
                      <p className="text-white font-bold">{selectedJob.experience_level}</p>
                    </div>
                  </div>

                  {/* Salary */}
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Salary Range</p>
                    <p className="text-white font-bold text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Job Description</p>
                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                      <p className="text-slate-200 whitespace-pre-wrap">{selectedJob.job_description}</p>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {selectedJob.responsibilities && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Responsibilities</p>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-slate-200 whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Benefits</p>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-slate-200 whitespace-pre-wrap">{selectedJob.benefits}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedJob.website && (
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Website</p>
                        <a
                          href={selectedJob.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          {selectedJob.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Contact Email</p>
                      <a
                        href={`mailto:${selectedJob.email}`}
                        className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {selectedJob.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Contact Phone</p>
                      <a
                        href={`tel:${selectedJob.phone}`}
                        className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedJob.phone}
                      </a>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Posted Date</p>
                      <p className="text-white font-bold">{formatDate(selectedJob.posted_date)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Application Deadline</p>
                      <p className="text-white font-bold">{selectedJob.deadline}</p>
                    </div>
                  </div>

                  {/* Paused Reason */}
                  {selectedJob.paused_reason && selectedJob.status === 'paused' && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Paused Reason</p>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <p className="text-yellow-300">{selectedJob.paused_reason}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowJobDetailsModal(false)}
                    className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
