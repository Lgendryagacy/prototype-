import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Briefcase, Clock, CheckCircle, XCircle, Building2, MapPin, Calendar, DollarSign, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserPhysicalJobRequests } from '../firebase/services/physicalJobRequestService';
import { PhysicalJobRequest, PhysicalJobRequestStatus } from '../firebase/types/physicalJob';

interface PhysicalJobRequestStatusPageProps {
  navigateBack: () => void;
}

const PhysicalJobRequestStatusPage: React.FC<PhysicalJobRequestStatusPageProps> = ({ navigateBack }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PhysicalJobRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PhysicalJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PhysicalJobRequestStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  const loadRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userRequests = await getUserPhysicalJobRequests(user.uid);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.job_title.toLowerCase().includes(query) ||
        req.company_name.toLowerCase().includes(query) ||
        req.category.toLowerCase().includes(query) ||
        req.city.toLowerCase().includes(query) ||
        req.country.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: PhysicalJobRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
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
      day: 'numeric'
    });
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">Please log in to view your requests</p>
          <button
            onClick={navigateBack}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border-b border-blue-500/[0.15] dark:border-white/[0.1] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={navigateBack}
              className="p-2 rounded-xl bg-white/[0.85] dark:bg-white/[0.05] border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Physical Job Requests</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your job posting submissions</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title, company, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 border transition-all ${
                showFilters
                  ? 'bg-blue-600 dark:bg-cyan-400 text-white border-blue-600 dark:border-cyan-400'
                  : 'bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08]'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Chips */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 dark:bg-cyan-400 text-white'
                    : 'bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
              >
                Pending ({statusCounts.pending})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  statusFilter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
              >
                Approved ({statusCounts.approved})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No requests found' : 'No requests yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start by posting your first physical job'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {request.company_logo ? (
                        <img
                          src={request.company_logo}
                          alt={request.company_name}
                          className="w-16 h-16 rounded-xl object-cover border border-blue-500/[0.15] dark:border-white/[0.1]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                          {request.job_title}
                        </h3>
                        <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {request.company_name}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {request.job_type}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {request.experience_level}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {request.employment_type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{request.city}, {request.country}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            <span>${request.salary_min.toLocaleString()} - ${request.salary_max.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Submitted: {formatDate(request.submittedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Briefcase className="w-4 h-4" />
                            <span>{request.num_positions} position{request.num_positions > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status */}
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(request.status)}

                    {request.status === 'approved' && request.approvedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Approved: {formatDate(request.approvedAt)}
                      </p>
                    )}

                    {request.status === 'rejected' && (
                      <div className="text-right">
                        {request.rejectedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Rejected: {formatDate(request.rejectedAt)}
                          </p>
                        )}
                        {request.rejectionReason && (
                          <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 max-w-md">
                            <p className="text-xs font-bold text-red-900 dark:text-red-100 mb-1">Reason:</p>
                            <p className="text-xs text-red-700 dark:text-red-300">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info for Special Benefits */}
                {(request.accommodation || request.visa_support) && (
                  <div className="mt-4 pt-4 border-t border-blue-500/[0.15] dark:border-white/[0.1]">
                    <div className="flex flex-wrap gap-2">
                      {request.accommodation && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          🏠 Accommodation Provided
                        </span>
                      )}
                      {request.visa_support && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          ✈️ Visa Support
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicalJobRequestStatusPage;
