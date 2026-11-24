import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  DollarSign,
  User as UserIcon,
  Mail,
  FileText,
  Link as LinkIcon,
  Download,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  AlertCircle,
  Eye,
  X as CloseIcon,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { type Route } from '../types';
import { useAuth } from '../firebase/hooks/useAuth';
import {
  getJobProposals,
  getProposalStats,
  approveProposal,
  rejectProposal
} from '../firebase/services/jobProposals';
import { getFogslyJobById } from '../firebase/services/fogslyJobsService';
import { getConversationByJobAndFreelancer, createJobConversation } from '../firebase/services/jobMessaging';
import { JobProposal, ProposalStats } from '../firebase/types/proposal';
import { FogslyJob } from '../firebase/types/job';
import { toast } from 'react-hot-toast';
import { User } from '../firebase/types/user';
import JobChatModal from '../components/JobChatModal';

const JobApplicationsPage = ({ 
  navigate, 
  context,
  currentUser: propCurrentUser,
  isLoggedIn 
}: {
  navigate: (route: Route, context?: any) => void;
  context?: string;
  currentUser?: User | null;
  isLoggedIn?: boolean;
}) => {
  const { user: authUser } = useAuth();
  const currentUser = propCurrentUser || authUser;
  const [job, setJob] = useState<FogslyJob | null>(null);
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [stats, setStats] = useState<ProposalStats>({ total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<JobProposal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState<{ [freelancerId: string]: number }>({});

  const jobId = context;

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to view applications');
      navigate('auth');
      return;
    }

    if (jobId) {
      fetchJobAndProposals();
    } else {
      setLoading(false);
      toast.error('No job ID provided');
    }
  }, [jobId, currentUser]);

  const fetchJobAndProposals = async () => {
    if (!jobId) return;

    try {
      setLoading(true);

      // Fetch job details
      const jobData = await getFogslyJobById(jobId);
      if (!jobData) {
        toast.error('Job not found');
        navigate('find-work');
        return;
      }

      // Check if current user is the job owner
      if (jobData.userId !== currentUser?.uid) {
        toast.error('You are not authorized to view these applications');
        navigate('find-work');
        return;
      }

      setJob(jobData);

      // Fetch proposals
      const proposalsData = await getJobProposals(jobId);
      setProposals(proposalsData);

      // Fetch stats
      const statsData = await getProposalStats(jobId);
      setStats(statsData);

      // Fetch unread counts for approved proposals
      const counts: { [freelancerId: string]: number } = {};
      const approvedProposals = proposalsData.filter(p => p.status === 'approved');
      
      for (const proposal of approvedProposals) {
        try {
          const conversation = await getConversationByJobAndFreelancer(jobId, proposal.freelancerId);
          if (conversation) {
            counts[proposal.freelancerId] = conversation.clientUnreadCount || 0;
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
      
      setConversationUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    if (!jobId) return;

    const confirmed = confirm(
      'Are you sure you want to approve this proposal? This will:\n' +
      '- Accept this freelancer\'s proposal\n' +
      '- Close this job\n' +
      '- Automatically reject all other pending proposals\n' +
      '- Create a chat conversation with the freelancer\n\n' +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setActionLoading(proposalId);
      const result = await approveProposal(proposalId, jobId);
      
      if (result.success) {
        toast.success('Proposal approved successfully! Job has been closed and chat created.');
        setShowModal(false);
        setSelectedProposal(null);
        await fetchJobAndProposals(); // Refresh data
        
        // Open chat modal automatically
        if (result.conversationId) {
          setActiveChatConversationId(result.conversationId);
        }
      } else {
        toast.error(result.error || 'Failed to approve proposal');
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error('Failed to approve proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    const confirmed = confirm('Are you sure you want to reject this proposal?');
    if (!confirmed) return;

    try {
      setActionLoading(proposalId);
      await rejectProposal(proposalId);
      toast.success('Proposal rejected');
      setShowModal(false);
      setSelectedProposal(null);
      await fetchJobAndProposals(); // Refresh data
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast.error('Failed to reject proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = async (proposal: JobProposal) => {
    console.log('🔵 handleOpenChat called (CLIENT)', { proposal, currentUser });
    
    try {
      console.log('🔍 Fetching conversation for:', { jobId: proposal.jobId, freelancerId: proposal.freelancerId });
      let conversation = await getConversationByJobAndFreelancer(proposal.jobId, proposal.freelancerId);
      
      console.log('📦 Conversation result:', conversation);
      
      // If no conversation exists, create one for approved proposals
      if (!conversation && proposal.status === 'approved' && job) {
        console.log('🔨 Creating conversation for approved proposal...');
        
        const result = await createJobConversation(
          proposal.jobId,
          job.jobTitle,
          job.userId,
          job.userName || 'Client',
          proposal.freelancerId,
          proposal.freelancerName,
          proposal.freelancerEmail,
          proposal.id
        );
        
        if (result.success && result.conversationId) {
          console.log('✅ Conversation created:', result.conversationId);
          toast.success('Chat initialized!');
          conversation = await getConversationByJobAndFreelancer(proposal.jobId, proposal.freelancerId);
        } else {
          toast.error('Failed to create chat. Please try again.');
          return;
        }
      }
      
      if (conversation) {
        console.log('✅ Setting conversation ID:', conversation.id);
        setActiveChatConversationId(conversation.id);
        
        // Reset unread count for this freelancer
        setConversationUnreadCounts(prev => ({
          ...prev,
          [proposal.freelancerId]: 0
        }));
      } else {
        console.log('❌ No conversation found');
        toast.error('Chat not available. Please make sure the proposal is approved.');
      }
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleViewDetails = (proposal: JobProposal) => {
    setSelectedProposal(proposal);
    setShowModal(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-500/10 text-yellow-500', label: 'Pending Review' };
      case 'approved':
        return { color: 'bg-green-500/10 text-green-500', label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-500/10 text-red-500', label: 'Rejected' };
      case 'closed':
        return { color: 'bg-gray-500/10 text-gray-500', label: 'Closed' };
      default:
        return { color: 'bg-gray-500/10 text-gray-500', label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[--color-primary] mx-auto mb-4" />
          <p className="text-[--color-text-secondary]">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
            <p className="text-[--color-text-secondary] mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('manage-jobs')}>
              Back to My Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg-primary]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate('find-work')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>

        {/* Job Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{job.jobTitle}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-[--color-text-secondary]">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.budgetType === 'quote' ? 'Quote Based' : `${job.budgetCurrency} ${job.budgetAmount?.toLocaleString()}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {job.createdAt.toLocaleDateString()}
                  </span>
                  <Badge className={job.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                    {job.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('job-detail', job.id)}
              >
                View Job
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 p-6 text-center">
              <p className="text-3xl font-bold mb-1">{stats.total}</p>
              <p className="text-sm text-[--color-text-secondary]">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 p-6 text-center">
              <p className="text-3xl font-bold text-yellow-500 mb-1">{stats.pending}</p>
              <p className="text-sm text-[--color-text-secondary]">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 p-6 text-center">
              <p className="text-3xl font-bold text-green-500 mb-1">{stats.approved}</p>
              <p className="text-sm text-[--color-text-secondary]">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 p-6 text-center">
              <p className="text-3xl font-bold text-red-500 mb-1">{stats.rejected}</p>
              <p className="text-sm text-[--color-text-secondary]">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 p-6 text-center">
              <p className="text-3xl font-bold text-gray-500 mb-1">{stats.closed}</p>
              <p className="text-sm text-[--color-text-secondary]">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proposals ({proposals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="pt-6 p-6 text-center">
                <Briefcase className="w-16 h-16 text-[--color-text-secondary] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-[--color-text-secondary]">
                  No freelancers have applied to this job yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[--color-border]">
                      <th className="text-left p-4 font-semibold">Freelancer</th>
                      <th className="text-left p-4 font-semibold">Bid Amount</th>
                      <th className="text-left p-4 font-semibold">Delivery</th>
                      <th className="text-left p-4 font-semibold">Applied</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-center p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal) => {
                      const statusConfig = getStatusConfig(proposal.status);
                      return (
                        <tr 
                          key={proposal.id}
                          className="border-b border-[--color-border] hover:bg-[--color-bg-secondary] transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[--color-primary]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-[--color-primary]" />
                              </div>
                              <div className="min-w-0">
                                <p 
                                  className="font-semibold cursor-pointer hover:text-[--color-primary] transition-colors truncate"
                                  onClick={() => navigate('public-profile', proposal.freelancerId)}
                                >
                                  {proposal.freelancerName}
                                </p>
                                <p className="text-sm text-[--color-text-secondary] truncate">
                                  {proposal.freelancerEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-[--color-primary]">
                              {proposal.bidCurrency} {proposal.bidAmount.toLocaleString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">
                              {proposal.deliveryTime} {proposal.deliveryTimeUnit}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-[--color-text-secondary]">
                              {proposal.submittedAt.toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(proposal)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {proposal.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenChat(proposal)}
                                  className="relative border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Chat
                                  {conversationUnreadCounts[proposal.freelancerId] > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                                      {conversationUnreadCounts[proposal.freelancerId]}
                                    </span>
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proposal Details Modal */}
      <AnimatePresence>
        {showModal && selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[--color-bg-primary] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[--color-border] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[--color-primary]/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-[--color-primary]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProposal.freelancerName}</h2>
                    <p className="text-sm text-[--color-text-secondary]">{selectedProposal.freelancerEmail}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                >
                  <CloseIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[--color-bg-secondary] rounded-lg">
                  <div>
                    <p className="text-xs text-[--color-text-secondary] mb-1">Bid Amount</p>
                    <p className="text-2xl font-bold text-[--color-primary]">
                      {selectedProposal.bidCurrency} {selectedProposal.bidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[--color-text-secondary] mb-1">Delivery Time</p>
                    <p className="text-lg font-semibold">
                      {selectedProposal.deliveryTime} {selectedProposal.deliveryTimeUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[--color-text-secondary] mb-1">Availability</p>
                    <p className="text-lg font-semibold capitalize">
                      {selectedProposal.availability.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Cover Letter
                  </h4>
                  <p className="text-[--color-text-secondary] whitespace-pre-wrap bg-[--color-bg-secondary] p-4 rounded-lg">
                    {selectedProposal.coverLetter}
                  </p>
                </div>

                {/* Relevant Experience */}
                {selectedProposal.relevantExperience && (
                  <div>
                    <h4 className="font-semibold mb-2">Relevant Experience</h4>
                    <p className="text-[--color-text-secondary] whitespace-pre-wrap bg-[--color-bg-secondary] p-4 rounded-lg">
                      {selectedProposal.relevantExperience}
                    </p>
                  </div>
                )}

                {/* Portfolio Links */}
                {selectedProposal.portfolioLinks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Portfolio Links
                    </h4>
                    <div className="space-y-2">
                      {selectedProposal.portfolioLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[--color-primary] hover:underline text-sm break-all p-2 bg-[--color-bg-secondary] rounded"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments with Preview */}
                {selectedProposal.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Attachments ({selectedProposal.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedProposal.attachments.map((file, i) => {
                        const isImage = file.type?.startsWith('image/') || 
                                       file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        
                        return (
                          <div key={i} className="group relative">
                            <div className="aspect-square rounded-lg overflow-hidden bg-[--color-bg-secondary] border border-[--color-border] cursor-pointer"
                              onClick={() => isImage && setSelectedImage(file.url)}
                            >
                              {isImage ? (
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                  <FileText className="w-12 h-12 text-[--color-text-secondary] mb-2" />
                                  <p className="text-xs text-center truncate w-full">
                                    {file.name}
                                  </p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-[--color-text-secondary] mt-1 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-[--color-text-secondary]">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Questions for Client */}
                {selectedProposal.questionsForClient && (
                  <div>
                    <h4 className="font-semibold mb-2">Questions for You</h4>
                    <p className="text-[--color-text-secondary] whitespace-pre-wrap bg-[--color-bg-secondary] p-4 rounded-lg">
                      {selectedProposal.questionsForClient}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="p-6 border-t border-[--color-border]">
                {selectedProposal.status === 'pending' ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedProposal.id)}
                      disabled={actionLoading === selectedProposal.id}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      {actionLoading === selectedProposal.id ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Proposal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedProposal.id)}
                      disabled={actionLoading === selectedProposal.id}
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        navigate('public-profile', selectedProposal.freelancerId);
                      }}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      navigate('public-profile', selectedProposal.freelancerId);
                    }}
                    className="w-full"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    View Freelancer Profile
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh]"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </Button>
              <img 
                src={selectedImage} 
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Chat Modal */}
      {activeChatConversationId && currentUser && (
        <JobChatModal
          conversationId={activeChatConversationId}
          userType="client"
          onClose={() => setActiveChatConversationId(null)}
        />
      )}
    </div>
  );
};

export default JobApplicationsPage;
