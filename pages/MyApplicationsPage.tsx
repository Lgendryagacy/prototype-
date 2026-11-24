import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Ban,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Bell,
  Timer,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { type Route } from '../types';
import { useAuth } from '../firebase/hooks/useAuth';
import {
  getFreelancerProposals,
  countFreelancerProposals,
  withdrawProposal
} from '../firebase/services/jobProposals';
import { getFogslyJobById } from '../firebase/services/fogslyJobsService';
import { getConversationByJobAndFreelancer, createJobConversation } from '../firebase/services/jobMessaging';
import { JobProposal, ProposalStatus } from '../firebase/types/proposal';
import { FogslyJob } from '../firebase/types/job';
import { getDeadlineInfo, getUrgencyIcon } from '../utils/deadlineUtils';
import { toast } from 'react-hot-toast';
import { User } from '../firebase/types/user';
import JobChatModal from '../components/JobChatModal';
import WorkDeliveryModal from '../components/modals/WorkDeliveryModal';
import WorkDeliveryStatus from '../components/WorkDeliveryStatus';
import { workDeliveryService } from '../firebase/services/workDeliveryService';
import { WorkDelivery, CreateWorkDeliveryData } from '../firebase/types/workDelivery';

const ITEMS_PER_PAGE = 10;

type StatusTab = 'all' | ProposalStatus;

// Store unread counts for each job
const unreadCounts: { [jobId: string]: number } = {};

const MyApplicationsPage = ({ 
  navigate,
  currentUser: propCurrentUser,
  isLoggedIn 
}: { 
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  currentUser?: User | null;
  isLoggedIn?: boolean;
}) => {
  const { user: authUser } = useAuth();
  const currentUser = propCurrentUser || authUser;
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [jobsCache, setJobsCache] = useState<{ [key: string]: FogslyJob }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState<{ [jobId: string]: number }>({});
  
  // Work Delivery State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedProposalForDelivery, setSelectedProposalForDelivery] = useState<JobProposal | null>(null);
  const [deliveriesCache, setDeliveriesCache] = useState<{ [proposalId: string]: WorkDelivery }>({});
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to view your applications');
      navigate('auth');
      return;
    }

    fetchProposals();
    fetchStats();
  }, [currentUser, activeTab]);

  // Fetch unread counts for approved proposals
  useEffect(() => {
    if (!currentUser) return;

    const loadUnreadCounts = async () => {
      const approvedProposals = proposals.filter(p => p.status === 'approved');
      const counts: { [jobId: string]: number } = {};

      for (const proposal of approvedProposals) {
        try {
          const conversation = await getConversationByJobAndFreelancer(proposal.jobId, currentUser.uid);
          if (conversation) {
            counts[proposal.jobId] = conversation.freelancerUnreadCount || 0;
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }

      setConversationUnreadCounts(counts);
    };

    if (proposals.length > 0) {
      loadUnreadCounts();
    }
  }, [proposals, currentUser]);

  const fetchProposals = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const data = await getFreelancerProposals(currentUser.uid, statusFilter);
      setProposals(data);

      // Fetch job details for each proposal
      const jobPromises = data.map(async (proposal) => {
        if (!jobsCache[proposal.jobId]) {
          const job = await getFogslyJobById(proposal.jobId);
          if (job) {
            setJobsCache(prev => ({ ...prev, [proposal.jobId]: job }));
          }
        }
      });

      await Promise.all(jobPromises);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentUser) return;

    try {
      const counts = await countFreelancerProposals(currentUser.uid);
      setStats(counts);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      setWithdrawing(proposalId);
      await withdrawProposal(proposalId);
      toast.success('Application withdrawn successfully');
      fetchProposals();
      fetchStats();
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      toast.error('Failed to withdraw application');
    } finally {
      setWithdrawing(null);
    }
  };

  const handleOpenChat = async (proposal: JobProposal) => {
    console.log('🔵 handleOpenChat called', { proposal, currentUser });
    
    if (!currentUser) {
      console.log('❌ No currentUser');
      return;
    }
    
    try {
      console.log('🔍 Fetching conversation for:', { jobId: proposal.jobId, freelancerId: currentUser.uid });
      let conversation = await getConversationByJobAndFreelancer(proposal.jobId, currentUser.uid);
      
      console.log('📦 Conversation result:', conversation);
      
      // If no conversation exists, create one for approved proposals
      if (!conversation && proposal.status === 'approved') {
        console.log('🔨 Creating conversation for approved proposal...');
        
        const job = jobsCache[proposal.jobId];
        if (!job) {
          toast.error('Job details not found. Please refresh the page.');
          return;
        }
        
        const result = await createJobConversation(
          proposal.jobId,
          job.jobTitle,
          job.userId,
          job.userName || 'Client',
          currentUser.uid,
          proposal.freelancerName,
          proposal.freelancerEmail,
          proposal.id
        );
        
        if (result.success && result.conversationId) {
          console.log('✅ Conversation created:', result.conversationId);
          toast.success('Chat initialized!');
          conversation = await getConversationByJobAndFreelancer(proposal.jobId, currentUser.uid);
        } else {
          toast.error('Failed to create chat. Please try again.');
          return;
        }
      }
      
      if (conversation) {
        console.log('✅ Setting conversation ID:', conversation.id);
        setActiveChatConversationId(conversation.id);
        // Reset unread count for this job
        setConversationUnreadCounts(prev => ({
          ...prev,
          [proposal.jobId]: 0
        }));
      } else {
        console.log('❌ No conversation found');
        toast.error('Chat not available yet. Please wait for the client to approve your proposal.');
      }
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  // Load work deliveries for approved proposals
  useEffect(() => {
    const loadDeliveries = async () => {
      if (!currentUser) return;

      const approvedProposals = proposals.filter(p => p.status === 'approved');
      for (const proposal of approvedProposals) {
        if (!deliveriesCache[proposal.id]) {
          try {
            const latestDelivery = await workDeliveryService.getLatestDeliveryForProposal(proposal.id);
            if (latestDelivery) {
              setDeliveriesCache(prev => ({
                ...prev,
                [proposal.id]: latestDelivery
              }));
            }
          } catch (error) {
            console.error('Error loading delivery for proposal:', proposal.id, error);
          }
        }
      }
    };

    if (proposals.length > 0) {
      loadDeliveries();
    }
  }, [proposals, currentUser]);

  // Handle deliver work
  const handleDeliverWork = (proposal: JobProposal) => {
    setSelectedProposalForDelivery(proposal);
    setShowDeliveryModal(true);
  };

  // Handle delivery submission
  const handleSubmitDelivery = async (data: CreateWorkDeliveryData) => {
    if (!currentUser || !selectedProposalForDelivery) return;

    try {
      setSubmittingDelivery(true);

      const job = jobsCache[selectedProposalForDelivery.jobId];
      if (!job) {
        toast.error('Job details not found. Please refresh the page.');
        return;
      }

      const deliveryDeadline = selectedProposalForDelivery.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

      const result = await workDeliveryService.createWorkDelivery(
        {
          ...data,
          jobRequestId: selectedProposalForDelivery.jobId,
          proposalId: selectedProposalForDelivery.id
        },
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Freelancer',
        job.userId,
        job.userName || 'Client',
        deliveryDeadline
      );

      if (result.success && result.deliveryId) {
        toast.success('Work delivered successfully!');
        setShowDeliveryModal(false);
        setSelectedProposalForDelivery(null);

        // Reload the delivery to update cache
        const newDelivery = await workDeliveryService.getWorkDelivery(result.deliveryId);
        if (newDelivery) {
          setDeliveriesCache(prev => ({
            ...prev,
            [selectedProposalForDelivery.id]: newDelivery
          }));
        }
      } else {
        toast.error(result.error || 'Failed to submit delivery');
      }
    } catch (error) {
      console.error('Error submitting delivery:', error);
      toast.error('Failed to submit delivery');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Close delivery modal
  const handleCloseDeliveryModal = () => {
    if (submittingDelivery) return;
    setShowDeliveryModal(false);
    setSelectedProposalForDelivery(null);
  };

  const getStatusConfig = (status: ProposalStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Pending',
          description: 'Waiting for review'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Approved',
          description: 'Congratulations! Proposal accepted'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Rejected',
          description: 'Proposal not selected'
        };
      case 'closed':
        return {
          icon: Ban,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'Closed',
          description: 'Job closed, another freelancer selected'
        };
    }
  };

  const tabs: { key: StatusTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'approved', label: 'Approved', count: stats.approved },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
    { key: 'closed', label: 'Closed', count: stats.closed }
  ];

  // Pagination
  const totalPages = Math.ceil(proposals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProposals = proposals.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[--color-primary] mx-auto mb-4" />
          <p className="text-[--color-text-secondary]">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg-primary]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-[--color-text-secondary]">
            Track and manage your job proposals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => (
            <Card 
              key={tab.key}
              className={`cursor-pointer transition-all ${
                activeTab === tab.key 
                  ? 'border-[--color-primary] bg-[--color-primary]/5' 
                  : 'hover:border-[--color-primary]/50'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <CardContent className="p-6 pt-6 text-center">
                <p className="text-2xl font-bold mb-1">{tab.count}</p>
                <p className="text-sm text-[--color-text-secondary]">{tab.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Proposals List */}
        {currentProposals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 p-12 text-center">
              <Briefcase className="w-16 h-16 text-[--color-text-secondary] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
              <p className="text-[--color-text-secondary] mb-6">
                {activeTab === 'all'
                  ? "You haven't submitted any proposals yet. Start applying to jobs!"
                  : `No ${activeTab} applications at this time.`}
              </p>
              <Button onClick={() => navigate('find-work')}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentProposals.map((proposal, index) => {
              const job = jobsCache[proposal.jobId];
              const statusConfig = getStatusConfig(proposal.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-lg transition-shadow ${
                    job?.status === 'completed' ? 'relative overflow-hidden' : ''
                  }`}>
                    {/* Completed Job Background Monogram */}
                    {job?.status === 'completed' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                        <span className="text-[200px] font-bold text-green-500">✓</span>
                      </div>
                    )}
                    
                    <CardContent className="pt-6 p-6 relative z-10">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left Content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 
                                className="text-lg font-semibold mb-1 cursor-pointer hover:text-[--color-primary] transition-colors"
                                onClick={() => job && navigate('job-detail', job.id, { name: job.jobTitle })}
                              >
                                {job ? job.jobTitle : 'Loading job details...'}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-[--color-text-secondary]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Applied {proposal.submittedAt.toLocaleDateString()}
                                </span>
                                {job && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {job.categories[0]}
                                  </span>
                                )}
                                {job?.status === 'completed' && job.completedAt && (
                                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                                    <CheckCircle className="w-4 h-4" />
                                    Completed {new Date(job.completedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Deadline Display - Only for approved proposals AND NOT completed jobs */}
                          {proposal.status === 'approved' && proposal.deadline && job?.status !== 'completed' && (
                            <div className="mb-4 p-4 rounded-lg border-2" style={{ 
                              backgroundColor: `${getDeadlineInfo(proposal.deadline).urgencyColor}20`,
                              borderColor: getDeadlineInfo(proposal.deadline).urgencyColor
                            }}>
                              <div className="flex items-center gap-3">
                                <Timer className="w-5 h-5" style={{ color: getDeadlineInfo(proposal.deadline).urgencyColor }} />
                                <div className="flex-1">
                                  <p className="font-semibold text-sm" style={{ color: getDeadlineInfo(proposal.deadline).urgencyColor }}>
                                    {getUrgencyIcon(getDeadlineInfo(proposal.deadline).urgencyLevel)} {getDeadlineInfo(proposal.deadline).formattedCountdown}
                                  </p>
                                  <p className="text-xs text-[--color-text-secondary]">
                                    Due: {getDeadlineInfo(proposal.deadline).formattedDate}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Proposal Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 bg-[--color-bg-secondary] rounded-lg">
                            <div>
                              <p className="text-xs text-[--color-text-secondary] mb-1">Your Bid</p>
                              <p className="font-semibold text-[--color-primary]">
                                {proposal.bidCurrency} {proposal.bidAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[--color-text-secondary] mb-1">Delivery Time</p>
                              <p className="font-semibold">
                                {proposal.deliveryTime} {proposal.deliveryTimeUnit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[--color-text-secondary] mb-1">Status</p>
                              <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Cover Letter Preview */}
                          <div>
                            <p className="text-sm text-[--color-text-secondary] mb-1 font-semibold">
                              Cover Letter:
                            </p>
                            <p className="text-sm text-[--color-text-secondary] line-clamp-2">
                              {proposal.coverLetter}
                            </p>
                          </div>

                          {/* Status Description */}
                          <div className={`mt-3 p-3 rounded-lg ${statusConfig.bgColor}`}>
                            <p className={`text-sm ${statusConfig.color}`}>
                              {statusConfig.description}
                            </p>
                          </div>

                          {/* Work Delivery Status - Hide for completed jobs */}
                          {proposal.status === 'approved' && deliveriesCache[proposal.id] && job?.status !== 'completed' && (
                            <div className="mt-4">
                              <WorkDeliveryStatus
                                delivery={deliveriesCache[proposal.id]}
                                userType="freelancer"
                                onViewDelivery={() => {
                                  toast.success('Delivery details functionality coming soon');
                                }}
                                onRedelivery={() => handleDeliverWork(proposal)}
                              />
                            </div>
                          )}

                          {/* Completed Job Badge */}
                          {job?.status === 'completed' && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-semibold text-green-700">Job Completed Successfully</p>
                                  <p className="text-sm text-green-600">
                                    {job.adminApproved 
                                      ? '✓ Payment processed and released' 
                                      : '⏳ Payment pending admin approval'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Actions - Hide for completed jobs */}
                        {job?.status !== 'completed' && (
                          <div className="flex md:flex-col gap-2">
                            {job && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('job-detail', job.id, { name: job.jobTitle })}
                                className="flex-1 md:flex-initial"
                              >
                                View Job
                              </Button>
                            )}
                            {proposal.status === 'approved' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenChat(proposal)}
                                  className="flex-1 md:flex-initial border-purple-500/30 text-purple-600 hover:bg-purple-500/10 relative"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Chat with Client
                                  {conversationUnreadCounts[proposal.jobId] > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                                      {conversationUnreadCounts[proposal.jobId]}
                                    </span>
                                  )}
                                </Button>
                                {!deliveriesCache[proposal.id] && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeliverWork(proposal)}
                                    className="flex-1 md:flex-initial bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Package className="w-4 h-4 mr-2" />
                                    Deliver Work
                                  </Button>
                                )}
                              </>
                            )}
                            {proposal.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWithdraw(proposal.id)}
                                disabled={withdrawing === proposal.id}
                                className="flex-1 md:flex-initial border-red-500/30 text-red-600 hover:bg-red-500/10"
                              >
                                {withdrawing === proposal.id ? (
                                  <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Withdrawing...
                                  </>
                                ) : (
                                  'Withdraw'
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-[--color-text-secondary]">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Job Chat Modal */}
      {activeChatConversationId && currentUser && (
        <JobChatModal
          conversationId={activeChatConversationId}
          userType="freelancer"
          onClose={() => {
            console.log('🔴 Closing modal');
            setActiveChatConversationId(null);
          }}
        />
      )}

      {/* Work Delivery Modal */}
      {showDeliveryModal && selectedProposalForDelivery && (
        <WorkDeliveryModal
          isOpen={showDeliveryModal}
          onClose={handleCloseDeliveryModal}
          onSubmit={handleSubmitDelivery}
          jobTitle={jobsCache[selectedProposalForDelivery.jobId]?.jobTitle || 'Loading...'}
          deadlineInfo={selectedProposalForDelivery.deadline ? 
            `Due: ${getDeadlineInfo(selectedProposalForDelivery.deadline).formattedDate}` : 
            undefined
          }
          isSubmitting={submittingDelivery}
        />
      )}
    </div>
  );
};

export default MyApplicationsPage;
