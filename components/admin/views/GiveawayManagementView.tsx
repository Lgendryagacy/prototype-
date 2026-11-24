import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Trophy, Coins, Zap, Clock, Users, CheckCircle, XCircle,
  Eye, Loader, AlertCircle, Filter, Search, Calendar, Pause, Play, StopCircle, Plus, Edit, UserCheck,
  MessageCircle,
  User
} from 'lucide-react';
import {
  getAllGiveawayRequests,
  getGiveawayRequestsByStatus,
  approveGiveawayRequest,
  rejectGiveawayRequest
} from '../../../firebase/services/giveawayRequestService';
import {
  getAllActiveGiveaways,
  updateGiveawayStatus
} from '../../../firebase/services/activeGiveawayService';
import type { GiveawayRequest, ActiveGiveaway } from '../../../types/giveaway';
import { toast } from 'react-toastify';
import { auth } from '../../../firebase/config';
import AdminCreateGiveawayModal from '../AdminCreateGiveawayModal';
import { getUserProfile } from '../../../firebase/services/userService';

const GiveawayManagementView: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'active'>('active');
  const [requests, setRequests] = useState<GiveawayRequest[]>([]);
  const [activeGiveaways, setActiveGiveaways] = useState<ActiveGiveaway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<GiveawayRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<ActiveGiveaway | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedGiveawayForParticipants, setSelectedGiveawayForParticipants] = useState<ActiveGiveaway | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, { phone?: string; city?: string; country?: string }>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchActiveGiveaways();
    }
  }, [filter, activeFilter, activeTab]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = filter === 'all'
        ? await getAllGiveawayRequests()
        : await getGiveawayRequestsByStatus(filter);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch giveaway requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveGiveaways = async () => {
    try {
      setIsLoading(true);
      const data = await getAllActiveGiveaways();
      const filtered = activeFilter === 'all'
        ? data
        : data.filter(g => g.status === activeFilter);
      setActiveGiveaways(filtered);
    } catch (error) {
      console.error('Error fetching active giveaways:', error);
      toast.error('Failed to fetch active giveaways');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: GiveawayRequest) => {
    if (!request.id) return;

    if (!confirm(`Approve giveaway request: "${request.title}"?\n\nThis will create an active giveaway that users can participate in.`)) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to approve requests');
      return;
    }

    setIsProcessing(request.id);
    try {
      await approveGiveawayRequest(request.id, currentUser.uid);
      toast.success('✅ Giveaway approved and activated!');
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest?.id || !rejectionReason.trim()) return;

    setIsProcessing(selectedRequest.id);
    try {
      await rejectGiveawayRequest(selectedRequest.id, rejectionReason);
      toast.success('❌ Giveaway request rejected');
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

  const openRejectModal = (request: GiveawayRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const fetchParticipantProfiles = async (participants: Array<{ id: string; name: string; email: string }>) => {
    setLoadingProfiles(true);
    const profiles: Record<string, { phone?: string; city?: string; country?: string }> = {};
    
    try {
      // Fetch profiles in parallel
      const profilePromises = participants.map(async (participant) => {
        try {
          const profile = await getUserProfile(participant.id);
          if (profile) {
            profiles[participant.id] = {
              phone: profile.phone,
              city: profile.city,
              country: profile.country
            };
          }
        } catch (error) {
          console.error(`Error fetching profile for ${participant.id}:`, error);
        }
      });
      
      await Promise.all(profilePromises);
      setParticipantProfiles(profiles);
    } catch (error) {
      console.error('Error fetching participant profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handlePauseGiveaway = async (giveawayId: string) => {
    if (!confirm('Pause this giveaway? Users won\'t be able to participate until it\'s reactivated.')) return;

    setIsProcessing(giveawayId);
    try {
      await updateGiveawayStatus(giveawayId, 'paused');
      toast.success('⏸️ Giveaway paused');
      fetchActiveGiveaways();
    } catch (error: any) {
      console.error('Error pausing giveaway:', error);
      toast.error(error.message || 'Failed to pause giveaway');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReactivateGiveaway = async (giveawayId: string) => {
    setIsProcessing(giveawayId);
    try {
      await updateGiveawayStatus(giveawayId, 'active');
      toast.success('▶️ Giveaway reactivated');
      fetchActiveGiveaways();
    } catch (error: any) {
      console.error('Error reactivating giveaway:', error);
      toast.error(error.message || 'Failed to reactivate giveaway');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCloseGiveaway = async (giveawayId: string) => {
    if (!confirm('Close this giveaway permanently? This action cannot be undone.')) return;

    setIsProcessing(giveawayId);
    try {
      await updateGiveawayStatus(giveawayId, 'closed');
      toast.success('🔒 Giveaway closed');
      fetchActiveGiveaways();
    } catch (error: any) {
      console.error('Error closing giveaway:', error);
      toast.error(error.message || 'Failed to close giveaway');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActiveGiveaways = activeGiveaways.filter(giveaway =>
    giveaway.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const activeStats = {
    total: activeGiveaways.length,
    active: activeGiveaways.filter(g => g.status === 'active').length,
    paused: activeGiveaways.filter(g => g.status === 'paused').length,
    closed: activeGiveaways.filter(g => g.status === 'closed').length,
    totalParticipants: activeGiveaways.reduce((sum, g) => sum + g.totalParticipated, 0),
  };

  const typeColors: Record<string, string> = {
    coins: 'from-yellow-400 to-amber-600',
    nft: 'from-purple-500 to-indigo-700',
    service: 'from-blue-500 to-cyan-600'
  };

  const typeIcons: Record<string, any> = {
    coins: Coins,
    nft: Trophy,
    service: Zap
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-500 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-500 border-red-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Giveaway Management</h1>
          <p className="text-slate-400">Review requests and manage active giveaways</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create Giveaway
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        {/* Requests tab hidden - will be enabled later */}
        {/* <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'requests'
              ? 'text-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Giveaway Requests
          {activeTab === 'requests' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            />
          )}
        </button> */}
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'active'
            ? 'text-blue-500'
            : 'text-slate-400 hover:text-slate-300'
            }`}
        >
          Active Giveaways
          {activeTab === 'active' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            />
          )}
        </button>
      </div>

      {/* Stats */}
      {/* Only showing Active Giveaways stats - Requests tab hidden */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: activeStats.total, color: 'from-blue-500 to-cyan-600', icon: Gift },
          { label: 'Active', value: activeStats.active, color: 'from-green-500 to-emerald-600', icon: Play },
          { label: 'Paused', value: activeStats.paused, color: 'from-yellow-400 to-amber-600', icon: Pause },
          { label: 'Closed', value: activeStats.closed, color: 'from-red-500 to-rose-600', icon: StopCircle },
          { label: 'Participants', value: activeStats.totalParticipants, color: 'from-purple-500 to-indigo-600', icon: Users },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wider transition-all ${activeFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader size={40} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Content */}
      {/* Only showing Active Giveaways - Requests tab hidden */}
      <>
        {/* Empty State */}
        {!isLoading && filteredActiveGiveaways.length === 0 && (
          <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
            <Trophy size={64} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Giveaways Found</h3>
            <p className="text-slate-400">
              {searchTerm
                ? 'No giveaways match your search criteria'
                : activeFilter === 'all'
                  ? 'No approved giveaways are available yet'
                  : `No ${activeFilter} giveaways found`}
            </p>
          </div>
        )}

        {/* Active Giveaways Table */}
        {!isLoading && filteredActiveGiveaways.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Winners</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Participants</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredActiveGiveaways.map((giveaway) => {
                    const TypeIcon = typeIcons[giveaway.type];
                    const statusColor = giveaway.status === 'active'
                      ? 'bg-green-500/20 text-green-500 border-green-500/30'
                      : giveaway.status === 'paused'
                        ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-500 border-red-500/30';

                    return (
                      <tr key={giveaway.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${typeColors[giveaway.type]}`}>
                            <TypeIcon size={16} className="text-white" />
                            <span className="text-xs font-bold text-white uppercase">{giveaway.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white max-w-xs truncate">{giveaway.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{giveaway.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{giveaway.whatsappNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white">{giveaway.winnersCount}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-blue-400" />
                            <span className="text-sm font-semibold text-white">{giveaway.totalParticipated}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            {new Date(giveaway.endTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(giveaway.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor}`}>
                            {giveaway.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {/* Participants Button */}
                            <button
                              onClick={async () => {
                                setSelectedGiveawayForParticipants(giveaway);
                                setShowParticipantsModal(true);
                                // Fetch participant profiles
                                await fetchParticipantProfiles(giveaway.participants);
                              }}
                              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                              title="View Participants"
                            >
                              <UserCheck size={16} />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingGiveaway(giveaway);
                                setShowCreateModal(true);
                              }}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            {giveaway.status === 'active' && (
                              <button
                                onClick={() => handlePauseGiveaway(giveaway.id!)}
                                disabled={isProcessing === giveaway.id}
                                className="p-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-white rounded-lg transition-colors"
                                title="Pause"
                              >
                                {isProcessing === giveaway.id ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  <Pause size={16} />
                                )}
                              </button>
                            )}
                            {giveaway.status === 'paused' && (
                              <button
                                onClick={() => handleReactivateGiveaway(giveaway.id!)}
                                disabled={isProcessing === giveaway.id}
                                className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors"
                                title="Reactivate"
                              >
                                {isProcessing === giveaway.id ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  <Play size={16} />
                                )}
                              </button>
                            )}
                            {giveaway.status !== 'closed' && (
                              <button
                                onClick={() => handleCloseGiveaway(giveaway.id!)}
                                disabled={isProcessing === giveaway.id}
                                className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors"
                                title="Close"
                              >
                                <StopCircle size={16} />
                              </button>
                            )}
                            {giveaway.status === 'closed' && (
                              <span className="text-xs text-slate-500">Closed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <XCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Reject Giveaway Request</h3>
                  <p className="text-sm text-slate-400">Provide a reason for rejection</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this giveaway request is being rejected..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing === selectedRequest.id}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg font-semibold transition-colors"
                >
                  {isProcessing === selectedRequest.id ? (
                    <Loader size={18} className="animate-spin mx-auto" />
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Giveaway Modal */}
      <AdminCreateGiveawayModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingGiveaway(null);
        }}
        onSuccess={fetchActiveGiveaways}
        giveaway={editingGiveaway}
      />

      {/* Participants Modal */}
      <AnimatePresence>
        {showParticipantsModal && selectedGiveawayForParticipants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowParticipantsModal(false);
                setSelectedGiveawayForParticipants(null);
                setParticipantProfiles({});
                setParticipantProfiles({});
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-800 rounded-2xl p-6 max-w-5xl w-full border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <UserCheck size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Participants</h3>
                    <p className="text-sm text-slate-400">{selectedGiveawayForParticipants.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowParticipantsModal(false);
                    setSelectedGiveawayForParticipants(null);
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Total Participants</p>
                  <p className="text-2xl font-bold text-white">{selectedGiveawayForParticipants.totalParticipated}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Winners Count</p>
                  <p className="text-2xl font-bold text-white">{selectedGiveawayForParticipants.winnersCount}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <p className="text-2xl font-bold text-white capitalize">{selectedGiveawayForParticipants.status}</p>
                </div>
              </div>

              {/* Participants Table */}
              <div className="flex-1 overflow-auto">
                {selectedGiveawayForParticipants.participants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users size={64} className="text-slate-600 mb-4" />
                    <h4 className="text-xl font-bold text-slate-400 mb-2">No Participants Yet</h4>
                    <p className="text-slate-500">This giveaway has no participants yet.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-700/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {selectedGiveawayForParticipants.participants.map((participant, index) => (
                        <tr key={participant.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-white">
                            {participant.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {participant.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {loadingProfiles ? (
                              <Loader size={14} className="animate-spin text-blue-400" />
                            ) : (
                              participantProfiles[participant.id]?.phone || <span className="text-slate-500 italic">Not provided</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                            {participant.id}
                          </td>
                          <td className="flex align-items-center gap-2 px-4 py-3 text-sm text-slate-400 font-mono">
                            <button
                              onClick={() => navigate && navigate('public-profile', participant.id )}
                              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <User size={16} />
                            </button>
                            <button
                              onClick={() => navigate && navigate('messages', { selectedUserId: participant.id })}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              title="Start Chat"
                            >
                              <MessageCircle size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => {
                    setShowParticipantsModal(false);
                    setSelectedGiveawayForParticipants(null);
                    setParticipantProfiles({});
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiveawayManagementView;
