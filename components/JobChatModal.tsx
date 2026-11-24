import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Loader2,
  Timer,
  Edit3,
  Check,
  XCircle,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  User,
  Calendar,
  DollarSign,
  Menu
} from 'lucide-react';
import {
  subscribeToJobMessages,
  sendJobMessage,
  markJobMessagesAsRead,
  getJobConversation
} from '../firebase/services/jobMessaging';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { JobChatMessage, JobConversation, MessageAttachment } from '../firebase/types/jobMessage';
import {
  getProposalById,
  submitModificationRequest,
  acceptModificationRequest,
  rejectModificationRequest
} from '../firebase/services/jobProposals';
import { JobProposal } from '../firebase/types/proposal';
import { getDeadlineInfo, getUrgencyIcon, formatTimeUnit } from '../utils/deadlineUtils';
import { useAuth } from '../firebase/hooks/useAuth';
import { toast } from 'react-hot-toast';
import WorkDeliveryModal from './modals/WorkDeliveryModal';
import JobReviewModal from './modals/JobReviewModal';
import { workDeliveryService } from '../firebase/services/workDeliveryService';
import { WorkDelivery, CreateWorkDeliveryData } from '../firebase/types/workDelivery';
import JobCompletionService from '../firebase/services/jobCompletionService';
import { getUserProfile } from '../firebase/services/userService';

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins} min${diffInMins !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

interface JobChatModalProps {
  conversationId: string;
  userType: 'client' | 'freelancer';
  onClose: () => void;
  onJobUpdated?: () => void;
}

export default function JobChatModal({ conversationId, userType, onClose, onJobUpdated }: JobChatModalProps) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<JobChatMessage[]>([]);
  const [conversation, setConversation] = useState<JobConversation | null>(null);
  const [proposal, setProposal] = useState<JobProposal | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modification modal state
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [modificationForm, setModificationForm] = useState({
    newDeliveryTime: 0,
    newDeliveryTimeUnit: 'days' as 'days' | 'weeks' | 'months',
    newBidAmount: 0,
    reason: ''
  });

  // Work delivery state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [latestDelivery, setLatestDelivery] = useState<WorkDelivery | null>(null);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [changeRequestText, setChangeRequestText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Job review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [acceptingWork, setAcceptingWork] = useState(false);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Refresh function for sync button
  const refreshChat = async () => {
    try {
      const conv = await getJobConversation(conversationId);
      if (conv) {
        setConversation(conv);

        // Reload proposal
        if (conv.proposalId) {
          const proposalData = await getProposalById(conv.proposalId);
          if (proposalData) {
            setProposal(proposalData);

            // Reload latest delivery
            const delivery = await workDeliveryService.getLatestDeliveryForProposal(proposalData.id);
            if (delivery) {
              setLatestDelivery(delivery);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing chat:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and proposal details
  useEffect(() => {
    const loadConversation = async () => {
      const conv = await getJobConversation(conversationId);
      if (conv) {
        setConversation(conv);

        // Load proposal details
        if (conv.proposalId) {
          const proposalData = await getProposalById(conv.proposalId);
          if (proposalData) {
            setProposal(proposalData);
            // Initialize modification form with current values
            setModificationForm({
              newDeliveryTime: proposalData.deliveryTime,
              newDeliveryTimeUnit: proposalData.deliveryTimeUnit,
              newBidAmount: proposalData.bidAmount,
              reason: ''
            });

            // Load latest work delivery
            const delivery = await workDeliveryService.getLatestDeliveryForProposal(proposalData.id);
            if (delivery) {
              setLatestDelivery(delivery);
            }
          }
        }

        // Load client profile for review modal
        if (userType === 'client' && currentUser) {
          try {
            const profile = await getUserProfile(currentUser.uid);
            setClientProfile(profile);
          } catch (error) {
            console.error('Error loading client profile:', error);
          }
        }
      }
      setLoading(false);
    };

    loadConversation();

    // Auto-refresh conversation every 10 seconds
    const refreshInterval = setInterval(() => {
      loadConversation();
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, [conversationId]);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = subscribeToJobMessages(conversationId, (msgs) => {
      setMessages(msgs);
      // Mark messages as read
      markJobMessagesAsRead(conversationId, userType);
    });

    return () => unsubscribe();
  }, [conversationId, userType]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentUser) return;

    setSending(true);

    try {
      const senderName = userType === 'client' ? conversation?.clientName || 'Client' : conversation?.freelancerName || 'Freelancer';

      await sendJobMessage(
        currentUser.uid,
        senderName,
        userType,
        {
          conversationId,
          message: newMessage,
          attachments: attachments
        }
      );

      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Modification request handlers
  const handleSubmitModification = async () => {
    if (!proposal) return;

    try {
      const result = await submitModificationRequest(
        proposal.id,
        modificationForm.newDeliveryTime,
        modificationForm.newDeliveryTimeUnit,
        modificationForm.newBidAmount,
        modificationForm.reason
      );

      if (result.success) {
        toast.success('Modification request sent!');

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: `Client requested changes: ${formatTimeUnit(modificationForm.newDeliveryTime, modificationForm.newDeliveryTimeUnit)} delivery, ${proposal.bidCurrency} ${modificationForm.newBidAmount.toLocaleString()} budget${modificationForm.reason ? ` - ${modificationForm.reason}` : ''}`,
            attachments: []
          }
        );

        setShowModificationModal(false);

        // Reload proposal
        const updatedProposal = await getProposalById(proposal.id);
        if (updatedProposal) setProposal(updatedProposal);
      } else {
        toast.error(result.error || 'Failed to submit modification');
      }
    } catch (error) {
      console.error('Error submitting modification:', error);
      toast.error('Failed to submit modification');
    }
  };

  const handleAcceptModification = async () => {
    if (!proposal) return;

    try {
      const result = await acceptModificationRequest(proposal.id);

      if (result.success) {
        toast.success('Modification accepted!');

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: 'Freelancer accepted the new project terms. Deadline and budget have been updated.',
            attachments: []
          }
        );

        // Reload proposal
        const updatedProposal = await getProposalById(proposal.id);
        if (updatedProposal) setProposal(updatedProposal);
      } else {
        toast.error(result.error || 'Failed to accept modification');
      }
    } catch (error) {
      console.error('Error accepting modification:', error);
      toast.error('Failed to accept modification');
    }
  };

  const handleRejectModification = async () => {
    if (!proposal) return;

    try {
      const result = await rejectModificationRequest(proposal.id);

      if (result.success) {
        toast.success('Modification rejected');

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: 'Freelancer rejected the proposed changes. Original terms remain in effect.',
            attachments: []
          }
        );

        // Reload proposal
        const updatedProposal = await getProposalById(proposal.id);
        if (updatedProposal) setProposal(updatedProposal);
      } else {
        toast.error(result.error || 'Failed to reject modification');
      }
    } catch (error) {
      console.error('Error rejecting modification:', error);
      toast.error('Failed to reject modification');
    }
  };

  // Work delivery handlers
  const handleDeliverWork = () => {
    setShowDeliveryModal(true);
  };

  const handleSubmitDelivery = async (data: CreateWorkDeliveryData) => {
    if (!currentUser || !conversation || !proposal) return;

    try {
      setSubmittingDelivery(true);

      // Ensure we have a valid Date object for the deadline
      let deliveryDeadline: Date;
      if (proposal.deadline && proposal.deadline instanceof Date && !isNaN(proposal.deadline.getTime())) {
        deliveryDeadline = proposal.deadline;
      } else {
        // Fallback to 7 days from now
        deliveryDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        console.warn('Proposal deadline is invalid, using 7-day fallback:', proposal.deadline);
      }

      const result = await workDeliveryService.createWorkDelivery(
        {
          ...data,
          jobRequestId: conversation.jobId,
          proposalId: proposal.id
        },
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Freelancer',
        conversation.clientId,
        conversation.clientName,
        deliveryDeadline
      );

      if (result.success && result.deliveryId) {
        toast.success('Work delivered successfully!');
        setShowDeliveryModal(false);

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: '📦 Freelancer has submitted their work for review. Client can now review and either accept the work or request changes.',
            attachments: []
          }
        );

        // Reload the delivery
        const newDelivery = await workDeliveryService.getWorkDelivery(result.deliveryId);
        if (newDelivery) {
          setLatestDelivery(newDelivery);
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

  const handleRequestChanges = async () => {
    if (!currentUser || !latestDelivery || !changeRequestText.trim()) return;

    try {
      const result = await workDeliveryService.requestModification(
        { deliveryId: latestDelivery.id, description: changeRequestText.trim() },
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Client'
      );

      if (result.success) {
        toast.success('Changes requested successfully!');
        setShowRequestChangesModal(false);
        setChangeRequestText('');

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: `🔄 Client requested changes: "${changeRequestText.trim()}"`,
            attachments: []
          }
        );

        // Reload delivery
        const updatedDelivery = await workDeliveryService.getWorkDelivery(latestDelivery.id);
        if (updatedDelivery) {
          setLatestDelivery(updatedDelivery);
        }
      } else {
        toast.error(result.error || 'Failed to request changes');
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
    }
  };

  const handleAcceptWork = async () => {
    if (!currentUser || !latestDelivery || !conversation) return;

    // Show confirmation dialog
    if (!confirm('Are you sure you want to accept this work delivery? This will mark the job as completed.')) {
      return;
    }

    setAcceptingWork(true);
    try {
      // Accept the delivery
      const result = await workDeliveryService.acceptDelivery(latestDelivery.id, currentUser.uid);

      if (result.success) {
        // Complete the job immediately
        const jobRef = doc(db, 'FogslyJobs', conversation.jobId);
        await updateDoc(jobRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          adminApproved: false,
          updatedAt: serverTimestamp()
        });

        // Send system message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: '🎉 Job completed! Client has accepted the work. You can now provide your review.',
            attachments: []
          }
        );

        // Reload delivery
        const updatedDelivery = await workDeliveryService.getWorkDelivery(latestDelivery.id);
        if (updatedDelivery) {
          setLatestDelivery(updatedDelivery);
        }

        toast.success('Work accepted! Job marked as completed.');

        // Show review modal
        setShowReviewModal(true);
      } else {
        toast.error(result.error || 'Failed to accept work');
      }
    } catch (error) {
      console.error('Error accepting work:', error);
      toast.error('Failed to accept work');
    } finally {
      setAcceptingWork(false);
    }
  };

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!conversation || !currentUser) return;

    setSubmittingReview(true);

    try {
      console.log('🔵 Submitting review:', {
        jobId: conversation.jobId,
        clientId: currentUser.uid,
        rating,
        reviewLength: review.length
      });

      // Update job with review (job is already completed)
      const result = await JobCompletionService.updateJobReview(
        conversation.jobId,
        rating,
        review,
        currentUser.photoURL || ''
      );

      console.log('🔵 Review update result:', result);

      if (result.success) {
        toast.success('Thank you for your review!');

        // Send review message
        await sendJobMessage(
          'system',
          'System',
          'system',
          {
            conversationId,
            message: `⭐ Client rated ${rating} star${rating > 1 ? 's' : ''} and left a review. Awaiting admin approval for payment.`,
            attachments: []
          }
        );

        setShowReviewModal(false);
        setReviewSubmitted(true);
        onJobUpdated?.();
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRedeliveryWork = () => {
    setShowDeliveryModal(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-2">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-sm rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-md"
            onClick={() => window.open(attachment.url, '_blank')}
          />
        </div>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 p-3 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg hover:bg-[--color-bg-primary] transition-colors max-w-sm"
      >
        <div className="text-[--color-text-secondary]">
          {attachment.type === 'video' && <Video className="w-5 h-5" />}
          {attachment.type === 'pdf' && <FileText className="w-5 h-5" />}
          {attachment.type === 'document' && <FileText className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[--color-text-primary] truncate">{attachment.name}</p>
          <p className="text-xs text-[--color-text-secondary]">{formatFileSize(attachment.size)}</p>
        </div>
        <Download className="w-4 h-4 text-[--color-text-secondary]" />
      </a>
    );
  };

  // Render work delivery messages in chat
  const renderWorkDeliveryMessages = () => {
    if (!latestDelivery) return null;

    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'delivered':
          return { icon: Package, color: '#3b82f6', label: 'Work Delivered' }; // blue
        case 'modification_requested':
          return { icon: AlertTriangle, color: '#f97316', label: 'Changes Requested' }; // orange
        case 're_delivered':
          return { icon: RefreshCw, color: '#a855f7', label: 'Work Re-delivered' }; // purple
        case 'accepted':
          return { icon: CheckCircle, color: '#10b981', label: 'Work Accepted' }; // green
        default:
          return { icon: Clock, color: '#6b7280', label: 'Unknown Status' }; // gray
      }
    };

    const statusInfo = getStatusInfo(latestDelivery.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex justify-center my-6">
        <div className="max-w-md w-full rounded-xl border-2 bg-[--color-bg-secondary] p-4" style={{ borderColor: statusInfo.color.replace('text-', '') }}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-full bg-[--color-bg-tertiary]">
              <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color.replace('text-', '') }} />
            </div>
            <div>
              <h4 className="font-semibold text-[--color-text-primary]">{statusInfo.label}</h4>
              <p className="text-xs text-[--color-text-secondary]">
                {formatTimeAgo(latestDelivery.deliveredAt)}
              </p>
            </div>
          </div>

          {/* Delivery Description */}
          <div className="mb-3">
            <p className="text-sm text-[--color-text-primary] font-medium mb-2">Description:</p>
            <p className="text-sm text-[--color-text-secondary]">{latestDelivery.description}</p>
          </div>

          {/* Files */}
          {latestDelivery.files.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-[--color-text-primary] mb-2">Files:</p>
              <div className="space-y-2">
                {latestDelivery.files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-[--color-bg-primary] rounded-lg border border-[--color-border]">
                    <FileText className="w-4 h-4 text-[--color-text-secondary]" />
                    <span className="text-sm text-[--color-text-primary] flex-1 truncate">{file.name}</span>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-1 hover:bg-[--color-bg-secondary] rounded transition-colors"
                    >
                      <Download className="w-4 h-4 text-[--color-primary]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URLs */}
          {latestDelivery.urls.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-[--color-text-primary] mb-2">Links:</p>
              <div className="space-y-2">
                {latestDelivery.urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-[--color-bg-primary] rounded-lg border border-[--color-border]">
                    <ExternalLink className="w-4 h-4 text-[--color-text-secondary]" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[--color-primary] hover:underline flex-1 truncate"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Modification Request */}
          {latestDelivery.status === 'modification_requested' && latestDelivery.modificationRequests.length > 0 && (
            <div className="p-3 bg-[--color-bg-tertiary] border-2 border-orange-500 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-500">Changes Requested:</p>
                  <p className="text-sm text-[--color-text-primary] mt-1">
                    {latestDelivery.modificationRequests[latestDelivery.modificationRequests.length - 1].description}
                  </p>
                  <p className="text-xs text-[--color-text-secondary] mt-1">
                    by {latestDelivery.modificationRequests[latestDelivery.modificationRequests.length - 1].clientName} • {' '}
                    {formatTimeAgo(latestDelivery.modificationRequests[latestDelivery.modificationRequests.length - 1].requestedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modification Count */}
          {latestDelivery.modificationCount > 0 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-[--color-text-secondary]">
                Modifications: {latestDelivery.modificationCount}/5
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render modification request message
  const renderModificationRequestMessage = () => {
    if (userType !== 'freelancer' || !proposal?.modificationRequest?.status || proposal.modificationRequest.status !== 'pending') {
      return null;
    }

    return (
      <div className="flex justify-center my-6">
        <div className="max-w-md w-full rounded-xl border-2 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800">Client Requested Changes</h4>
              <p className="text-xs text-[--color-text-secondary]">Project terms modification</p>
            </div>
          </div>

          <div className="space-y-2 text-sm mb-4">
            {proposal.modificationRequest.newDeliveryTime && (
              <p>
                <span className="text-[--color-text-secondary]">New Delivery:</span>{' '}
                <span className="font-semibold">{formatTimeUnit(proposal.modificationRequest.newDeliveryTime, proposal.modificationRequest.newDeliveryTimeUnit!)}</span>
              </p>
            )}
            {proposal.modificationRequest.newBidAmount && (
              <p>
                <span className="text-[--color-text-secondary]">New Budget:</span>{' '}
                <span className="font-semibold">{proposal.bidCurrency} {proposal.modificationRequest.newBidAmount.toLocaleString()}</span>
              </p>
            )}
            {proposal.modificationRequest.reason && (
              <p className="text-xs text-[--color-text-secondary] mt-2">
                Reason: {proposal.modificationRequest.reason}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAcceptModification}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={handleRejectModification}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMessage = (message: JobChatMessage) => {
    const isOwnMessage = message.senderId === currentUser?.uid;
    const isSystemMessage = message.senderType === 'system';

    if (isSystemMessage) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-[--color-bg-secondary] border border-[--color-border] px-4 py-2 rounded-full text-sm text-[--color-text-secondary] max-w-xs text-center">
            {message.message}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[85%] md:max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-medium text-[--color-text-primary]">{message.senderName}</span>
            <span className="text-xs text-[--color-text-secondary]">
              {formatTimeAgo(message.createdAt)}
            </span>
          </div>
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
              ? 'bg-[--color-primary] text-white'
              : 'bg-[--color-bg-secondary] text-[--color-text-primary] border border-[--color-border]'
              }`}
          >
            {message.message && <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>}
            {message.attachments?.map((attachment) => renderAttachment(attachment))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[--color-bg-primary] rounded-2xl p-8 shadow-2xl border border-[--color-border]">
          <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[--color-bg-primary] rounded-2xl p-8 shadow-2xl border border-[--color-border]">
          <p className="text-[--color-text-secondary] mb-4">Conversation not found</p>
          <button
            onClick={() => {
              onClose();
              window.location.reload();
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
        <div className="bg-[--color-bg-primary] rounded-xl shadow-2xl w-full h-full md:max-w-7xl md:max-h-[90vh] md:h-auto flex flex-col border border-[--color-border]">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-[--color-border] bg-[--color-bg-secondary]">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-[--color-bg-tertiary] rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-[--color-text-primary]" />
              </button>
              <div>
                <h2 className="font-semibold text-[--color-text-primary] text-sm truncate max-w-32">
                  {conversation.jobTitle}
                </h2>
                <p className="text-xs text-[--color-text-secondary]">
                  {userType === 'client' ? conversation.freelancerName : conversation.clientName}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="p-2 hover:bg-[--color-bg-tertiary] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[--color-text-secondary]" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 bg-[--color-bg-secondary] border-r border-[--color-border] transition-all duration-300 ease-in-out`}>
              {/* Desktop Header in Sidebar */}
              <div className="hidden md:flex items-center justify-between p-6 border-b border-[--color-border]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[--color-primary] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[--color-text-primary] text-sm">
                      {userType === 'client' ? conversation.freelancerName : conversation.clientName}
                    </h3>
                    <p className="text-xs text-[--color-text-secondary]">
                      {userType === 'client' ? 'Freelancer' : 'Client'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="p-2 hover:bg-[--color-bg-tertiary] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[--color-text-secondary]" />
                </button>
              </div>

              {/* Project Details */}
              <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-[--color-text-primary] mb-2">Project Details</h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[--color-bg-primary] border border-[--color-border]">
                      <p className="text-sm font-medium text-[--color-text-primary] mb-1">
                        {conversation.jobTitle}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-[--color-text-secondary]">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Started</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{proposal?.bidCurrency} {proposal?.bidAmount.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Deadline Display */}
                    {proposal?.deadline && (
                      <div className="p-3 rounded-lg border-2" style={{
                        backgroundColor: `${getDeadlineInfo(proposal.deadline).urgencyColor}15`,
                        borderColor: getDeadlineInfo(proposal.deadline).urgencyColor
                      }}>
                        <div className="flex items-center space-x-2">
                          <Timer className="w-4 h-4" style={{ color: getDeadlineInfo(proposal.deadline).urgencyColor }} />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: getDeadlineInfo(proposal.deadline).urgencyColor }}>
                              {getUrgencyIcon(getDeadlineInfo(proposal.deadline).urgencyLevel)} {getDeadlineInfo(proposal.deadline).formattedCountdown}
                            </p>
                            <p className="text-xs text-[--color-text-secondary]">
                              Due: {getDeadlineInfo(proposal.deadline).formattedDate}
                            </p>
                          </div>
                        </div>
                        {userType === 'client' && (
                          <button
                            onClick={() => setShowModificationModal(true)}
                            className="mt-2 w-full px-3 py-1 text-xs bg-[--color-primary] text-white rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Modify Terms
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    {proposal && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-[--color-text-secondary] uppercase tracking-wide">Quick Actions</h5>

                        {/* Sync Button - always visible */}
                        <button
                          onClick={async () => {
                            await refreshChat();
                            toast.success('Chat refreshed!');
                          }}
                          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync Chat</span>
                        </button>

                        {userType === 'freelancer' && !latestDelivery && (
                          <button
                            onClick={handleDeliverWork}
                            className="w-full p-3 bg-[--color-primary] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm font-medium"
                          >
                            <Package className="w-4 h-4" />
                            <span>Deliver Work</span>
                          </button>
                        )}

                        {latestDelivery && userType === 'client' && (latestDelivery.status === 'delivered' || latestDelivery.status === 're_delivered') && (
                          <div className="space-y-2">
                            <button
                              onClick={handleAcceptWork}
                              disabled={acceptingWork}
                              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {acceptingWork ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Accept Work</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setShowRequestChangesModal(true)}
                              disabled={acceptingWork}
                              className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>Request Changes</span>
                            </button>
                          </div>
                        )}

                        {latestDelivery && userType === 'freelancer' && latestDelivery.status === 'modification_requested' && latestDelivery.modificationCount < 5 && (
                          <button
                            onClick={handleRedeliveryWork}
                            className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Re-deliver Work</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col flex-1 min-h-0 ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
              {/* Chat Header - Desktop Only */}
              <div className="hidden md:flex items-center justify-between p-4 border-b border-[--color-border] bg-[--color-bg-secondary]">
                <div>
                  <h2 className="font-semibold text-[--color-text-primary]">{conversation.jobTitle}</h2>
                  <p className="text-sm text-[--color-text-secondary]">
                    Chat with {userType === 'client' ? conversation.freelancerName : conversation.clientName}
                  </p>
                </div>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-[--color-bg-tertiary] rounded-lg transition-colors md:hidden"
                >
                  <Menu className="w-5 h-5 text-[--color-text-primary]" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[--color-bg-primary]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[--color-bg-secondary] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-[--color-text-secondary]" />
                      </div>
                      <p className="text-[--color-text-secondary] mb-2">No messages yet</p>
                      <p className="text-sm text-[--color-text-secondary]">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(renderMessage)}
                    {renderWorkDeliveryMessages()}
                    {renderModificationRequestMessage()}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="px-4 py-3 border-t border-[--color-border] bg-[--color-bg-secondary]">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-[--color-bg-primary] px-3 py-2 rounded-lg border border-[--color-border]"
                      >
                        <div className="text-[--color-text-secondary]">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="text-sm text-[--color-text-primary] max-w-[200px] truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-[--color-text-secondary] hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="px-4 py-4 border-t border-[--color-border] bg-[--color-bg-secondary]">
                <div className="flex items-end gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-[--color-text-secondary] hover:text-[--color-primary] hover:bg-[--color-bg-tertiary] rounded-lg transition-colors"
                    disabled={sending}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="w-full px-4 py-3 bg-[--color-bg-primary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none text-[--color-text-primary] placeholder:text-[--color-text-secondary]"
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                    className="p-3 bg-[--color-primary] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[--color-text-secondary] mt-2">Press Enter to send, Shift+Enter for new line</p>
              </form>
            </div>
          </div>
        </div>

        {/* Modification Modal */}
        {showModificationModal && proposal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setShowModificationModal(false)}>
            <div className="bg-[--color-bg-primary] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[--color-border]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Modify Project Terms</h3>
                <button onClick={() => setShowModificationModal(false)} className="p-1 hover:bg-[--color-bg-secondary] rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Values */}
                <div className="p-3 bg-[--color-bg-secondary] rounded-lg border border-[--color-border]">
                  <p className="text-xs text-[--color-text-secondary] mb-2">Current Terms:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Delivery:</span> {formatTimeUnit(proposal.deliveryTime, proposal.deliveryTimeUnit)}</p>
                    <p><span className="font-semibold">Budget:</span> {proposal.bidCurrency} {proposal.bidAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* New Delivery Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">New Delivery Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={modificationForm.newDeliveryTime}
                      onChange={(e) => setModificationForm({ ...modificationForm, newDeliveryTime: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                    />
                    <select
                      value={modificationForm.newDeliveryTimeUnit}
                      onChange={(e) => setModificationForm({ ...modificationForm, newDeliveryTimeUnit: e.target.value as any })}
                      className="px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                {/* New Budget */}
                <div>
                  <label className="block text-sm font-medium mb-2">New Budget Amount</label>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-[--color-text-secondary]">{proposal.bidCurrency}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={modificationForm.newBidAmount}
                      onChange={(e) => setModificationForm({ ...modificationForm, newBidAmount: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                  <textarea
                    value={modificationForm.reason}
                    onChange={(e) => setModificationForm({ ...modificationForm, reason: e.target.value })}
                    placeholder="Explain why you need to modify the terms..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModificationModal(false)}
                    className="flex-1 px-4 py-2 border border-[--color-border] rounded-lg hover:bg-[--color-bg-secondary] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitModification}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Delivery Modal */}
        {showDeliveryModal && proposal && conversation && (
          <WorkDeliveryModal
            isOpen={showDeliveryModal}
            onClose={() => setShowDeliveryModal(false)}
            onSubmit={handleSubmitDelivery}
            jobTitle={conversation.jobTitle}
            deadlineInfo={proposal.deadline ?
              `Due: ${getDeadlineInfo(proposal.deadline).formattedDate}` :
              undefined
            }
            isSubmitting={submittingDelivery}
          />
        )}

        {/* Request Changes Modal */}
        {showRequestChangesModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setShowRequestChangesModal(false)}>
            <div className="bg-[--color-bg-primary] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-[--color-border]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-[--color-text-primary]">Request Changes</h3>
                </div>
                <button onClick={() => setShowRequestChangesModal(false)} className="p-1 hover:bg-[--color-bg-secondary] rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-[--color-text-secondary] mb-4">
                Describe what changes you'd like the freelancer to make to their delivered work.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[--color-text-primary] mb-2">Change Request Description</label>
                <textarea
                  value={changeRequestText}
                  onChange={(e) => setChangeRequestText(e.target.value)}
                  placeholder="Please explain what changes need to be made..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none text-[--color-text-primary] placeholder:text-[--color-text-secondary]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestChangesModal(false)}
                  className="flex-1 px-4 py-2 border border-[--color-border] text-[--color-text-primary] rounded-lg hover:bg-[--color-bg-secondary] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestChanges}
                  disabled={!changeRequestText.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && conversation && (
        <JobReviewModal
          isOpen={showReviewModal}
          jobTitle={conversation.jobTitle}
          freelancerName={conversation.freelancerName}
          freelancerImage="" // TODO: Load from freelancer profile
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowReviewModal(false);
            // If review wasn't submitted, refresh the page to show updated job status
            if (!reviewSubmitted) {
              window.location.reload();
            }
          }}
          isSubmitting={submittingReview}
        />
      )}
    </>
  );
}