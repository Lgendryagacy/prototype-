import React, { useState, useEffect } from 'react';
import { X, Edit, Pause, Play, Trash2, Eye, Users, Clock, DollarSign, MessageCircle, Timer, CheckCircle, Star, PenLine } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Route } from '../types';
import { User } from '../firebase/types/user';
import { FogslyJob, FogslyJobStatus } from '../firebase/types/job';
import { getUserJobs, updateJobStatus, updateJobDetails, deleteJob } from '../firebase/services/fogslyJobsService';
import { getJobProposals } from '../firebase/services/jobProposals';
import { JobProposal } from '../firebase/types/proposal';
import { getConversationByJobAndFreelancer, createJobConversation } from '../firebase/services/jobMessaging';
import { getDeadlineInfo, getUrgencyIcon } from '../utils/deadlineUtils';
import JobChatModal from '../components/JobChatModal';
import JobReviewModal from '../components/modals/JobReviewModal';
import { JobCompletionService } from '../firebase/services/jobCompletionService';

// Simple toast notification
const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error')
};

function showToast(message: string, type: 'success' | 'error') {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
  toastEl.textContent = message;
  toastEl.style.opacity = '0';
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.style.opacity = '1', 10);
  setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toastEl), 300);
  }, 3000);
}

interface ManageJobsPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  currentUser: User | null;
}

type FilterTab = 'all' | 'active' | 'paused' | 'closed' | 'completed';

interface EditForm {
  jobTitle: string;
  jobDescription: string;
  budgetAmount: number;
  budgetCurrency: string;
  budgetType: 'fixed' | 'hourly' | 'quote';
  categories: string[];
  skills: string[];
}

const ManageJobsPage: React.FC<ManageJobsPageProps> = ({ navigate, currentUser }) => {
  const [jobs, setJobs] = useState<FogslyJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<FogslyJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [editingJob, setEditingJob] = useState<FogslyJob | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    jobTitle: '',
    jobDescription: '',
    budgetAmount: 0,
    budgetCurrency: 'USD',
    budgetType: 'fixed',
    categories: [],
    skills: []
  });

  // Chat-related state
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [approvedProposals, setApprovedProposals] = useState<{ [jobId: string]: JobProposal | null }>({});
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState<{ [jobId: string]: number }>({});

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<FogslyJob | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Loading states for job actions
  const [loadingJobAction, setLoadingJobAction] = useState<{ [jobId: string]: 'pausing' | 'activating' | 'closing' | null }>({});

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser]);

  useEffect(() => {
    filterJobs();
  }, [jobs, activeFilter]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!currentUser) return;

    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing jobs data...');
      fetchJobs();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    return () => clearInterval(refreshInterval);
  }, [currentUser]);

  const fetchJobs = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const userJobs = await getUserJobs(currentUser.uid);
      setJobs(userJobs);

      // Fetch approved proposals for each job
      await fetchApprovedProposals(userJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovedProposals = async (jobsList: FogslyJob[]) => {
    const approvedMap: { [jobId: string]: JobProposal | null } = {};
    const unreadCounts: { [jobId: string]: number } = {};

    for (const job of jobsList) {
      try {
        const proposals = await getJobProposals(job.id);
        const approvedProposal = proposals.find(p => p.status === 'approved');
        approvedMap[job.id] = approvedProposal || null;

        // Fetch unread count if there's an approved proposal
        if (approvedProposal && currentUser) {
          const conversation = await getConversationByJobAndFreelancer(job.id, approvedProposal.freelancerId);
          if (conversation) {
            unreadCounts[job.id] = conversation.clientUnreadCount || 0;
          }
        }
      } catch (error) {
        console.error(`Error fetching proposals for job ${job.id}:`, error);
        approvedMap[job.id] = null;
      }
    }

    setApprovedProposals(approvedMap);
    setConversationUnreadCounts(unreadCounts);
  };

  const filterJobs = () => {
    if (activeFilter === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === activeFilter));
    }
  };

  const handleStatusToggle = async (job: FogslyJob) => {
    const newStatus: FogslyJobStatus = job.status === 'active' ? 'paused' : 'active';
    const approvedProposal = approvedProposals[job.id];
    const hasHiredFreelancer = !!approvedProposal;
    const hasBudget = job.budgetInFogCoins && job.budgetInFogCoins > 0;

    // Show confirmation dialog with refund information
    if (newStatus === 'paused') {
      if (hasHiredFreelancer) {
        if (!window.confirm(
          `⚠️ A freelancer has been hired for this job.\n\n` +
          `Pausing will NOT refund the ${job.budgetInFogCoins.toFixed(2)} FOG budget.\n\n` +
          `Do you want to continue?`
        )) {
          return;
        }
      } else if (hasBudget) {
        if (!window.confirm(
          `💰 Pausing this job will refund ${job.budgetInFogCoins.toFixed(2)} FOG to your account.\n\n` +
          `You can reactivate it later (budget will be charged again).\n\n` +
          `Continue?`
        )) {
          return;
        }
      }
    } else if (newStatus === 'active') {
      // Reactivating from paused
      if (hasBudget && !hasHiredFreelancer) {
        if (!window.confirm(
          `💳 Reactivating will charge ${job.budgetInFogCoins.toFixed(2)} FOG from your account.\n\n` +
          `Make sure you have sufficient balance.\n\n` +
          `Continue?`
        )) {
          return;
        }
      }
    }

    try {
      // Set loading state
      setLoadingJobAction(prev => ({ ...prev, [job.id]: newStatus === 'active' ? 'activating' : 'pausing' }));

      const result = await updateJobStatus(job.id, newStatus);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to update job status');
        return;
      }
      
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      
      // Success message with refund/charge information
      if (newStatus === 'paused' && hasBudget && !hasHiredFreelancer) {
        toast.success(`Job paused! ${job.budgetInFogCoins.toFixed(2)} FOG refunded to your account.`);
      } else if (newStatus === 'active' && hasBudget && !hasHiredFreelancer) {
        toast.success(`Job activated! ${job.budgetInFogCoins.toFixed(2)} FOG charged from your account.`);
      } else {
        toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    } finally {
      // Clear loading state
      setLoadingJobAction(prev => ({ ...prev, [job.id]: null }));
    }
  };

  const handleDeleteJob = async (job: FogslyJob) => {
    const approvedProposal = approvedProposals[job.id];
    const hasHiredFreelancer = !!approvedProposal;
    const hasBudget = job.budgetInFogCoins && job.budgetInFogCoins > 0;
    
    // Build confirmation message with refund information
    let confirmMessage = `Are you sure you want to close "${job.jobTitle}"?\n\n`;
    
    if (hasHiredFreelancer) {
      confirmMessage += `⚠️ A freelancer has been hired. Closing will NOT refund the budget.\n\n`;
    } else if (hasBudget) {
      confirmMessage += `💰 Your ${job.budgetInFogCoins.toFixed(2)} FOG budget will be refunded.\n\n`;
    }
    
    confirmMessage += `This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Set loading state
      setLoadingJobAction(prev => ({ ...prev, [job.id]: 'closing' }));

      const result = await deleteJob(job.id);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to close job');
        return;
      }
      
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'closed' as FogslyJobStatus } : j));
      
      // Success message with refund information
      if (hasBudget && !hasHiredFreelancer) {
        toast.success(`Job closed successfully! ${job.budgetInFogCoins.toFixed(2)} FOG refunded to your account.`);
      } else {
        toast.success('Job closed successfully');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to close job');
    } finally {
      // Clear loading state
      setLoadingJobAction(prev => ({ ...prev, [job.id]: null }));
    }
  };

  const handleEditClick = (job: FogslyJob) => {
    setEditingJob(job);
    setEditForm({
      jobTitle: job.jobTitle,
      jobDescription: job.jobDescription,
      budgetAmount: job.budgetAmount,
      budgetCurrency: job.budgetCurrency,
      budgetType: job.budgetType,
      categories: job.categories,
      skills: job.skills
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;

    try {
      await updateJobDetails(editingJob.id, editForm);
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, ...editForm } : j));
      setShowEditModal(false);
      setEditingJob(null);
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleWriteReview = (job: FogslyJob) => {
    setSelectedJobForReview(job);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!selectedJobForReview || !currentUser) return;

    setSubmittingReview(true);
    try {
      // Check if job already has a review (editing) or is a new review
      if (selectedJobForReview.clientRating && selectedJobForReview.clientReview) {
        // Update existing review
        await JobCompletionService.updateJobReview(
          selectedJobForReview.id,
          rating,
          review,
          '' // clientImage
        );
        toast.success('Review updated successfully!');
      } else {
        // Submit new review
        await JobCompletionService.updateJobReview(
          selectedJobForReview.id,
          rating,
          review,
          '' // clientImage
        );
        toast.success('Review submitted successfully! Awaiting admin approval for payment.');
      }

      setShowReviewModal(false);
      setSelectedJobForReview(null);

      // Refresh jobs to show updated review
      await fetchJobs();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenChat = async (job: FogslyJob) => {
    const approvedProposal = approvedProposals[job.id];
    if (!approvedProposal || !currentUser) return;

    try {
      let conversation = await getConversationByJobAndFreelancer(job.id, approvedProposal.freelancerId);

      // If no conversation exists, create one for approved proposals
      if (!conversation) {
        const result = await createJobConversation(
          job.id,
          job.jobTitle,
          currentUser.uid,
          currentUser.displayName || 'Client',
          approvedProposal.freelancerId,
          approvedProposal.freelancerName,
          approvedProposal.freelancerEmail,
          approvedProposal.id
        );

        if (result.success && result.conversationId) {
          toast.success('Chat initialized!');
          conversation = await getConversationByJobAndFreelancer(job.id, approvedProposal.freelancerId);
        } else {
          toast.error('Failed to create chat. Please try again.');
          return;
        }
      }

      if (conversation) {
        setActiveChatConversationId(conversation.id);

        // Reset unread count for this job
        setConversationUnreadCounts(prev => ({
          ...prev,
          [job.id]: 0
        }));
      } else {
        toast.error('Chat not available.');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const getStatusBadge = (status: FogslyJobStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">✅ Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[--color-bg-primary] to-[--color-bg-secondary] pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in to manage your jobs</h1>
          <Button onClick={() => navigate('auth')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (


    <div className="min-h-screen bg-gradient-to-br from-[--color-bg-primary] to-[--color-bg-secondary] pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Manage Your Jobs</h1>
          <p className="text-[--color-text-secondary]">
            View and manage all your posted jobs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
          >
            All Jobs ({jobs.length})
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('active')}
          >
            Active ({jobs.filter(j => j.status === 'active').length})
          </Button>
          <Button
            variant={activeFilter === 'paused' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('paused')}
          >
            Paused ({jobs.filter(j => j.status === 'paused').length})
          </Button>
          <Button
            variant={activeFilter === 'closed' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('closed')}
          >
            Closed ({jobs.filter(j => j.status === 'closed').length})
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({jobs.filter(j => j.status === 'completed').length})
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary] mx-auto"></div>
            <p className="mt-4 text-[--color-text-secondary]">Loading your jobs...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredJobs.length === 0 && (
          <Card className="text-center pt-6 py-6">
            <CardContent>
              <p className="text-xl text-[--color-text-secondary] mb-4">
                {activeFilter === 'all'
                  ? 'You haven\'t posted any jobs yet'
                  : `No ${activeFilter} jobs`}
              </p>
              {activeFilter === 'all' && (
                <Button onClick={() => navigate('post-job')}>
                  Post Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{job.jobTitle}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-[--color-text-secondary] line-clamp-2">
                      {job.jobDescription}
                    </p>
                  </div>
                </div>

                {/* Deadline Display - Only for jobs with approved proposals and NOT completed/closed */}
                {approvedProposals[job.id]?.deadline && job.status !== 'completed' && (
                  <div className="mb-4 p-4 rounded-lg border-2" style={{
                    backgroundColor: `${getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor}20`,
                    borderColor: getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5" style={{ color: getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor }}>
                            {getUrgencyIcon(getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyLevel)} {getDeadlineInfo(approvedProposals[job.id]!.deadline!).formattedCountdown}
                          </p>
                          <p className="text-xs text-[--color-text-secondary]">
                            Due: {getDeadlineInfo(approvedProposals[job.id]!.deadline!).formattedDate}
                          </p>
                        </div>
                      </div>
                      <Badge style={{
                        backgroundColor: `${getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor}30`,
                        color: getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor,
                        borderColor: getDeadlineInfo(approvedProposals[job.id]!.deadline!).urgencyColor
                      }}>
                        Project In Progress
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Job Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-[--color-primary]" />
                    <span>
                      {job.budgetCurrency} {job.budgetAmount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[--color-primary]" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-[--color-primary]" />
                    <span>{job.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-[--color-primary]" />
                    <span>{job.applicationCount || 0} applications</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 5 && (
                    <Badge variant="secondary">+{job.skills.length - 5} more</Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Hide these buttons for completed and closed jobs */}
                  {job.status !== 'completed' && (
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('job-detail', job.id, { name: job.jobTitle })}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    {job.status !== 'closed' && (
                      <Button
                        size="sm"
                        onClick={() => navigate('job-applications', job.id, { name: job.jobTitle })}
                        className="bg-[--color-primary] hover:bg-[--color-primary]/90"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Applications
                      </Button>
                    )}
                      {/* Chat button - only show if there's an approved proposal */}
                      {approvedProposals[job.id] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenChat(job)}
                          className="relative border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat with Freelancer
                          {conversationUnreadCounts[job.id] > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                              {conversationUnreadCounts[job.id]}
                            </span>
                          )}
                        </Button>
                      )}

                      {/* Action buttons for active/paused jobs */}

                      {job.status !== 'closed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(job)}
                            disabled={!!loadingJobAction[job.id]}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(job)}
                            disabled={!!loadingJobAction[job.id]}
                          >
                            {loadingJobAction[job.id] === 'pausing' ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Pausing...
                              </>
                            ) : loadingJobAction[job.id] === 'activating' ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Activating...
                              </>
                            ) : job.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>

                          {/* Hide close button if job is paused */}
                          {job.status !== 'paused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job)}
                              disabled={!!loadingJobAction[job.id]}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              {loadingJobAction[job.id] === 'closing' ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  Closing...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Close Job
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )
                      }

                    </div>
                  )}

                  {/* Completed job info and Write Review button */}
                  {job.status === 'completed' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Job Completed Successfully</span>
                        </div>
                        {job.completedAt && (
                          <span className="text-xs text-green-600">
                            Completed on {new Date(job.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {job.clientRating && job.clientReview ? (
                        <div className="flex items-center justify-between gap-3 py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Rating Stars */}
                            <div className="flex gap-0.5 shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= (job.clientRating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>

                            {/* Review Text (truncated to 7 words) */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic truncate flex-1">
                              "{job.clientReview.split(' ').slice(0, 7).join(' ')}{job.clientReview.split(' ').length > 7 ? '...' : ''}"
                            </p>

                            {/* Admin Approval Status */}
                            {job.adminApproved ? (
                              <Badge className="bg-green-600 text-white text-xs shrink-0">✓ Processed</Badge>
                            ) : (
                              <Badge className="bg-yellow-500 text-white text-xs shrink-0">⏳ Pending</Badge>
                            )}
                          </div>

                          {/* Edit Button - only show if not admin approved */}
                          {!job.adminApproved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleWriteReview(job)}
                              className="shrink-0 h-8 px-2"
                              title="Edit Review"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-amber-700 font-medium">Review not submitted yet</p>
                          <Button
                            size="sm"
                            onClick={() => handleWriteReview(job)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          >
                            <PenLine className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Edit Job</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Job Description</label>
                  <textarea
                    value={editForm.jobDescription}
                    onChange={(e) => setEditForm({ ...editForm, jobDescription: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Amount</label>
                    <input
                      type="number"
                      value={editForm.budgetAmount}
                      onChange={(e) => setEditForm({ ...editForm, budgetAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={editForm.budgetCurrency}
                      onChange={(e) => setEditForm({ ...editForm, budgetCurrency: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Job Chat Modal */}
        {activeChatConversationId && (
          <JobChatModal
            conversationId={activeChatConversationId}
            userType="client"
            onClose={() => setActiveChatConversationId(null)}
          />
        )}

        {/* Review Modal */}
        {showReviewModal && selectedJobForReview && approvedProposals[selectedJobForReview.id] && (
          <JobReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              if (!submittingReview) {
                setShowReviewModal(false);
                setSelectedJobForReview(null);
                // Navigate to manage-jobs page
                navigate('manage-jobs');
              }
            }}
            onSubmit={handleSubmitReview}
            jobTitle={selectedJobForReview.jobTitle}
            freelancerName={approvedProposals[selectedJobForReview.id]?.freelancerName || 'Freelancer'}
            isSubmitting={submittingReview}
          />
        )}
      </div>
    </div>
  );
};

export default ManageJobsPage;
