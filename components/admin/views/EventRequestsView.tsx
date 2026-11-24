import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, XCircle,
  Eye, Loader, AlertCircle, Filter, Search, Globe, MonitorPlay,
  ChevronLeft, ChevronRight, Sparkles, Tag
} from 'lucide-react';
import {
  getUserEventRequests,
  getPendingEventRequests,
  getAllEventRequests,
  getEventRequestsByStatus,
  updateEventRequestStatus
} from '../../../firebase/services/eventRequestService';
import { createActiveEventFromRequest } from '../../../firebase/services/activeEventService';
import type { EventRequest } from '../../../firebase/types/eventRequest';
import { toast } from 'react-toastify';
import { auth } from '../../../firebase/config';

const EventRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      let data: EventRequest[] = [];
      
      if (filter === 'all') {
        data = await getAllEventRequests();
      } else {
        data = await getEventRequestsByStatus(filter);
      }
      
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch event requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: EventRequest) => {
    if (!request.id) return;

    if (!confirm(`Approve event: "${request.title}"?\n\nThis will:\n✅ Create an active event\n✅ Make it visible to users\n✅ Allow ticket bookings`)) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to approve requests');
      return;
    }

    setIsProcessing(request.id);
    try {
      // Step 1: Create active event from request
      const activeEventId = await createActiveEventFromRequest(request, currentUser.uid);
      
      // Step 2: Update request status to approved
      await updateEventRequestStatus(request.id, 'approved', currentUser.uid);
      
      toast.success(
        `✅ Event approved and activated!\n\nActive Event ID: ${activeEventId}`,
        { duration: 4000 }
      );
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest?.id || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(selectedRequest.id);
    try {
      await updateEventRequestStatus(
        selectedRequest.id,
        'rejected',
        auth.currentUser?.uid || '',
        rejectionReason
      );
      toast.success('❌ Event request rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setIsProcessing(null);
    }
  };

  const openRejectModal = (request: EventRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Filter and search
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.eventStatus === 'pending').length,
    approved: requests.filter(r => r.eventStatus === 'approved').length,
    rejected: requests.filter(r => r.eventStatus === 'rejected').length,
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const icons = {
      physical: <MapPin size={12} />,
      virtual: <Globe size={12} />,
      hybrid: <MonitorPlay size={12} />
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700 text-slate-300 text-xs font-medium">
        {icons[type as keyof typeof icons]}
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-teal-400" size={32} />
            Event Requests
          </h1>
          <p className="text-slate-400 mt-1">Manage and review event submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-700/30 rounded-xl p-6 hover:border-amber-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-green-700/30 rounded-xl p-6 hover:border-green-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 hover:border-red-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle size={24} className="text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-teal-400" size={32} />
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">No event requests found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-700/30 transition-colors">
                      {/* Event Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{request.title}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/10 text-teal-400 text-xs font-medium rounded">
                              {request.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Organizer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {request.userProfile ? (
                            <img 
                              src={request.userProfile} 
                              alt={request.userName}
                              className="w-8 h-8 rounded-full border border-slate-600"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                              <span className="text-teal-400 text-xs font-bold">
                                {request.userName?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{request.userName}</p>
                            <p className="text-slate-400 text-xs">{request.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        {getTypeBadge(request.type)}
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white font-medium">{request.startDate}</p>
                          <p className="text-slate-400 text-xs">{request.startTime}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        {request.isFree ? (
                          <span className="text-green-400 font-bold text-sm">Free</span>
                        ) : (
                          <div className="text-sm">
                            <p className="text-white font-medium">{request.priceInFOG} FOG</p>
                            <p className="text-slate-400 text-xs">PKR {request.priceInPKR}</p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(request.eventStatus)}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-6 py-4">
                        <p className="text-slate-400 text-xs">{formatDate(request.createdAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {request.eventStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                disabled={isProcessing === request.id}
                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isProcessing === request.id ? (
                                  <Loader className="animate-spin" size={16} />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>

                              <button
                                onClick={() => openRejectModal(request)}
                                disabled={isProcessing === request.id}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-slate-300 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedRequest && !showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Banner */}
              {selectedRequest.banner && (
                <div className="relative h-64 overflow-hidden rounded-t-2xl">
                  <img 
                    src={selectedRequest.banner} 
                    alt={selectedRequest.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  <div className="absolute top-6 right-6">
                    {getStatusBadge(selectedRequest.eventStatus)}
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Title & Category */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-sm font-bold border border-teal-500/20 mb-4">
                    {selectedRequest.category}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedRequest.title}</h2>
                  <p className="text-slate-300 leading-relaxed">{selectedRequest.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Organizer */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3">Organizer Information</p>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedRequest.userProfile ? (
                        <img 
                          src={selectedRequest.userProfile} 
                          alt={selectedRequest.userName}
                          className="w-12 h-12 rounded-full border border-slate-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <span className="text-teal-400 font-bold">
                            {selectedRequest.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold">{selectedRequest.userName}</p>
                        <p className="text-slate-400 text-sm">{selectedRequest.userEmail}</p>
                      </div>
                    </div>
                    {selectedRequest.userPhone && (
                      <p className="text-slate-300 text-sm">📞 {selectedRequest.userPhone}</p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Event Schedule
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-slate-400">Start:</span> {selectedRequest.startDate} at {selectedRequest.startTime}
                      </p>
                      {selectedRequest.endDate && (
                        <p className="text-white">
                          <span className="text-slate-400">End:</span> {selectedRequest.endDate} at {selectedRequest.endTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <MapPin size={16} /> Location & Type
                    </p>
                    <div className="space-y-2">
                      {getTypeBadge(selectedRequest.type)}
                      {selectedRequest.type !== 'virtual' && (
                        <div className="text-sm text-slate-300 mt-2">
                          {selectedRequest.venue && <p>{selectedRequest.venue}</p>}
                          {selectedRequest.address && <p>{selectedRequest.address}</p>}
                          <p>{selectedRequest.city}, {selectedRequest.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Capacity */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Users size={16} /> Pricing & Capacity
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-slate-400">Price:</span> {selectedRequest.isFree ? 'Free' : `${selectedRequest.priceInFOG} FOG (PKR ${selectedRequest.priceInPKR})`}
                      </p>
                      <p className="text-white">
                        <span className="text-slate-400">Capacity:</span> {selectedRequest.maxCapacity} attendees
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedRequest.tags && selectedRequest.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Tag size={16} /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-6">
                  <p className="text-slate-400 text-sm">
                    Submitted on {formatDate(selectedRequest.createdAt)}
                  </p>
                  {selectedRequest.reviewedAt && selectedRequest.reviewedBy && (
                    <p className="text-slate-400 text-sm mt-2">
                      Reviewed on {formatDate(selectedRequest.reviewedAt)} by Admin
                    </p>
                  )}
                </div>

                {/* Rejection Reason */}
                {selectedRequest.eventStatus === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-bold mb-1">Rejection Reason</p>
                        <p className="text-red-300 text-sm">{selectedRequest.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Close
                  </button>

                  {selectedRequest.eventStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedRequest);
                          setSelectedRequest(null);
                        }}
                        disabled={isProcessing === selectedRequest.id}
                        className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing === selectedRequest.id ? (
                          <Loader className="animate-spin" size={18} />
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowRejectModal(true);
                        }}
                        disabled={isProcessing === selectedRequest.id}
                        className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Reject Event Request</h3>
                  <p className="text-slate-400 text-sm">Please provide a reason for rejection</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Event: {selectedRequest.title}
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing === selectedRequest.id}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing === selectedRequest.id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <>
                      <XCircle size={18} />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventRequestsView;
