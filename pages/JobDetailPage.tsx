import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Mail,
  Phone,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Loader,
  Award,
  User
} from 'lucide-react';
import { type Route } from '../types';
import { getFogslyJobById, incrementJobViewCount } from '../firebase/services/fogslyJobsService';
import { FogslyJob } from '../firebase/types/job';
import { User as FirebaseUser } from '../firebase/types/user';
import { toggleJobSave, isJobSaved } from '../firebase/services/savedJobs';
import { hasUserAppliedToJob, getUserProposalForJob, getJobProposals } from '../firebase/services/jobProposals';
import { JobProposal } from '../firebase/types/proposal';
import { getConversationByJobAndFreelancer, createJobConversation } from '../firebase/services/jobMessaging';
import { getAllApprovedFreelancersByUserId } from '../firebase/services/approvedFreelancers';
import { toast } from 'react-hot-toast';
import JobChatModal from '../components/JobChatModal';

const JobDetailPage = ({ navigate, context, currentUser }: {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  context?: string;
  currentUser: FirebaseUser | null;
}) => {
  const [job, setJob] = useState<FogslyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userProposal, setUserProposal] = useState<JobProposal | null>(null);
  const [hasAcceptedProposal, setHasAcceptedProposal] = useState(false);
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [hasGigs, setHasGigs] = useState(false);
  const [checkingGigs, setCheckingGigs] = useState(true);

  useEffect(() => {
    if (context) {
      fetchJobDetails(context);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    checkIfSaved();
    checkIfApplied();
    checkUserProposal();
    checkUserGigs();
  }, [job?.id, currentUser]);

  useEffect(() => {
    if (job?.status === 'closed') {
      checkForAcceptedProposal();
    }
  }, [job?.id, job?.status]);

  const checkIfSaved = async () => {
    if (!currentUser || !job?.id) return;

    try {
      const saved = await isJobSaved(currentUser.uid, job.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const checkIfApplied = async () => {
    if (!currentUser || !job?.id) return;

    try {
      const applied = await hasUserAppliedToJob(job.id, currentUser.uid);
      setHasApplied(applied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const checkUserProposal = async () => {
    if (!currentUser || !job?.id) return;

    try {
      const proposal = await getUserProposalForJob(job.id, currentUser.uid);
      setUserProposal(proposal);
    } catch (error) {
      console.error('Error checking user proposal:', error);
    }
  };

  const checkUserGigs = async () => {
    if (!currentUser) {
      setCheckingGigs(false);
      return;
    }

    try {
      setCheckingGigs(true);
      const gigs = await getAllApprovedFreelancersByUserId(currentUser.uid);
      setHasGigs(gigs.length > 0);
    } catch (error) {
      console.error('Error checking user gigs:', error);
      setHasGigs(false);
    } finally {
      setCheckingGigs(false);
    }
  };

  const checkForAcceptedProposal = async () => {
    if (!job?.id) return;

    try {
      const proposals = await getJobProposals(job.id);
      const hasAccepted = proposals.some(p => p.status === 'approved');
      setHasAcceptedProposal(hasAccepted);
    } catch (error) {
      console.error('Error checking proposals:', error);
    }
  };

  const handleOpenChat = async () => {
    if (!currentUser || !job || !userProposal) return;

    try {
      let conversation = await getConversationByJobAndFreelancer(job.id, currentUser.uid);

      // If no conversation exists, create one for approved proposals
      if (!conversation && userProposal.status === 'approved') {
        const result = await createJobConversation(
          job.id,
          job.jobTitle,
          job.userId,
          job.userName || 'Client',
          currentUser.uid,
          userProposal.freelancerName,
          userProposal.freelancerEmail,
          userProposal.id
        );

        if (result.success && result.conversationId) {
          toast.success('Chat initialized!');
          conversation = await getConversationByJobAndFreelancer(job.id, currentUser.uid);
        } else {
          toast.error('Failed to create chat. Please try again.');
          return;
        }
      }

      if (conversation) {
        setActiveChatConversationId(conversation.id);
      } else {
        toast.error('Chat not available yet.');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      const jobData = await getFogslyJobById(jobId);

      if (jobData) {
        setJob(jobData);
        // Increment view count
        await incrementJobViewCount(jobId);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.jobTitle,
          text: `Check out this job opportunity: ${job?.jobTitle}`,
          url: url
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please sign in to save jobs');
      navigate('auth');
      return;
    }

    if (!job?.id) {
      toast.error('Unable to save this job');
      return;
    }

    try {
      setIsSaving(true);
      const nowSaved = await toggleJobSave(currentUser.uid, job.id);
      setIsSaved(nowSaved);

      if (nowSaved) {
        toast.success('Job saved successfully!');
      } else {
        toast.success('Job removed from saved');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatBudget = (job: FogslyJob): string => {
    if (job.budgetType === 'quote') {
      return 'Request Quote';
    }
    if (!job.budgetAmount) {
      return 'Not specified';
    }
    return `${job.budgetCurrency} ${job.budgetAmount.toLocaleString()}`;
  };

  const getBudgetTypeLabel = (type: string): string => {
    switch (type) {
      case 'hourly': return 'Hourly Rate';
      case 'fixed': return 'Fixed Price';
      case 'quote': return 'Quote Based';
      default: return 'Budget';
    }
  };

  if (loading) {
    return (
      <div className="bg-[--color-bg-base] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 animate-spin text-[--color-primary] mx-auto mb-4" />
          <p className="text-[--color-text-secondary] text-lg font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="bg-[--color-bg-base] min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-8xl mb-6">😞</div>
          <h1 className="text-3xl font-black mb-3 text-[--color-text-primary]">Job Not Found</h1>
          <p className="text-[--color-text-secondary] mb-8 text-lg">The job you are looking for does not exist or has been removed.</p>
          <Button
            onClick={() => navigate('find-work')}
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:-translate-y-1 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-base] min-h-screen relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
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
          className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
            top: '40%',
            right: '10%'
          }}
          animate={{
            x: [0, -40, 30, -20, 0],
            y: [0, 40, -30, 20, 0],
            scale: [1, 0.9, 1.1, 0.95, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <div className="w-full relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => navigate('find-work')}
              className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Jobs</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  {/* Monogram Overlay for Closed/Completed Jobs */}
                  {(job.status === 'closed' || job.status === 'completed') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {job.status === 'completed' ? (
                        <span className="text-[200px] font-bold text-green-500 opacity-5">✓</span>
                      ) : (
                        <div
                          className="transform rotate-[-25deg] text-9xl font-black opacity-10 select-none"
                          style={{
                            color: hasAcceptedProposal ? '#22c55e' : '#ef4444',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                            letterSpacing: '0.1em',
                            border: hasAcceptedProposal ? '12px solid #22c55e' : '12px solid #ef4444',
                            padding: '30px 60px',
                            borderRadius: '16px'
                          }}
                        >
                          {hasAcceptedProposal ? 'HIRED' : 'CLOSED'}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative z-20">
                    {/* Title and Status Badge */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[--color-text-primary] tracking-tight leading-tight">{job.jobTitle}</h1>
                        {job.status !== 'completed' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleShare}
                              disabled={job.status === 'closed' || job.status === 'paused'}
                              title={job.status === 'closed' || job.status === 'paused' ? 'Cannot share closed or paused jobs' : 'Share job'}
                              className="rounded-full"
                            >
                              <Share2 size={18} />
                            </Button>
                            <Button
                              variant={isSaved ? "default" : "outline"}
                              size="icon"
                              onClick={handleSave}
                              disabled={isSaving}
                              title={isSaved ? "Unsave job" : "Save job"}
                              className={`rounded-full ${isSaved ? "bg-[--color-primary] text-white" : ""}`}
                            >
                              <Bookmark
                                size={18}
                                className={isSaved ? "fill-current" : ""}
                              />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      {(job.status === 'closed' || job.status === 'paused' || job.status === 'completed') && (
                        <Badge
                          variant="secondary"
                          className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2 ${
                            job.status === 'closed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            job.status === 'paused' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}
                        >
                          {job.status === 'closed' ? '🔒 Closed' :
                           job.status === 'paused' ? '⏸️ Paused' :
                           '✅ Completed'}
                        </Badge>
                      )}
                    </div>

                    {/* Categories Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.categories.map((category) => (
                        <Badge
                          key={category}
                          className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-bg-primary)',
                            borderColor: 'var(--color-primary)'
                          }}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-[--color-primary]" />
                        <div>
                          <p className="text-xs text-[--color-text-secondary] font-semibold">{getBudgetTypeLabel(job.budgetType)}</p>
                          <p className="font-semibold text-xl text-[--color-text-primary]">{formatBudget(job)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={20} className="text-[--color-primary]" />
                        <div>
                          <p className="text-xs text-[--color-text-secondary] font-semibold">Location</p>
                          <p className="font-semibold text-xl text-[--color-text-primary]">{job.userCity}, {job.userCountry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-[--color-primary]" />
                        <div>
                          <p className="text-xs text-[--color-text-secondary] font-semibold">Posted</p>
                          <p className="font-semibold text-xl text-[--color-text-primary]">{job.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* View/Application Count */}
                    {(job.viewCount || job.applicationCount) && (
                      <div className="flex items-center gap-6 text-sm text-[--color-text-secondary]">
                        {job.viewCount !== undefined && job.viewCount > 0 && (
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Eye size={14} /> {job.viewCount} view{job.viewCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {job.applicationCount !== undefined && job.applicationCount > 0 && (
                          <span className="flex items-center gap-1.5 font-semibold">
                            📝 {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Job Description</h2>
                  <p className="text-sm md:text-base text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap font-normal">{job.jobDescription}</p>
                </div>
              </motion.div>

              {/* Required Skills */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-primary)'
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Budget Details */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Budget Details</h2>
                  <div className="bg-[--color-bg-primary]/50 p-6 rounded-2xl border-2 border-[--color-border]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[--color-text-secondary] mb-1 font-semibold">Budget Type</p>
                        <p className="font-black text-lg capitalize text-[--color-text-primary]">{job.budgetType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[--color-text-secondary] mb-1 font-semibold">Amount</p>
                        <p className="font-black text-[--color-primary] text-2xl">
                          {formatBudget(job)}
                        </p>
                      </div>
                    </div>
                    {job.budgetType === 'hourly' && job.budgetAmount && (
                      <p className="text-xs text-[--color-text-secondary] mt-4 font-medium">
                        * This is an hourly rate. Total project cost will depend on hours worked.
                      </p>
                    )}
                    {job.budgetType === 'quote' && (
                      <p className="text-xs text-[--color-text-secondary] mt-4 font-medium">
                        * The client is requesting quotes from freelancers. Submit your proposal with your pricing.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Right Side */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Action Buttons Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 shadow-xl sticky top-24">
                  <div className="space-y-3">
                    {/* Chat Button - Only show if user's proposal is accepted and job not completed */}
                    {currentUser && userProposal && userProposal.status === 'approved' && job.userId !== currentUser.uid && job.status !== 'completed' && (
                      <Button
                        size="lg"
                        className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleOpenChat}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat with Client
                      </Button>
                    )}

                    {/* Apply Now Button or Create Gig Button */}
                    {currentUser && job.userId !== currentUser.uid && userProposal?.status !== 'approved' && (
                      <>
                        {!hasGigs && !checkingGigs && !hasApplied ? (
                          <div className="space-y-3">
                            <div className="p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl">
                              <p className="text-sm text-orange-600 font-semibold mb-1">⚠️ Gig Required</p>
                              <p className="text-xs text-[--color-text-secondary] font-medium">
                                Please create a gig first before applying to any job.
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              onClick={() => navigate('become-freelancer')}
                            >
                              <Briefcase className="w-5 h-5 mr-2" />
                              Create Gig Now
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all"
                            onClick={() => {
                              if (!currentUser) {
                                toast.error('Please sign in to apply');
                                navigate('auth');
                                return;
                              }
                              if (!hasGigs) {
                                toast.error('Please create a gig first before applying');
                                return;
                              }
                              if (job.status === 'closed') {
                                toast.error('This job is closed and no longer accepting applications');
                                return;
                              }
                              if (job.status === 'paused') {
                                toast.error('This job is paused and not accepting applications at the moment');
                                return;
                              }
                              if (hasApplied) {
                                toast('You have already applied to this job', { icon: 'ℹ️' });
                                navigate('my-applications');
                                return;
                              }
                              navigate('apply-job', job.id, { name: job.jobTitle });
                            }}
                            disabled={checkingGigs || hasApplied || job.status === 'closed' || job.status === 'paused'}
                          >
                            {checkingGigs ? (
                              'Checking...'
                            ) : hasApplied ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Already Applied
                              </>
                            ) : job.status === 'closed' ? (
                              'Job Closed'
                            ) : job.status === 'paused' ? (
                              'Job Paused'
                            ) : (
                              'Apply Now'
                            )}
                          </Button>
                        )}
                      </>
                    )}

                    {/* View Applications Button (for job owner) */}
                    {currentUser && job.userId === currentUser.uid && (
                      <Button
                        size="lg"
                        className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all"
                        onClick={() => navigate('job-applications', job.id, { name: job.jobTitle })}
                      >
                        <Briefcase className="w-5 h-5 mr-2" />
                        View Applications
                      </Button>
                    )}

                    {job.status !== 'completed' && (
                      <>
                        <Button
                          size="lg"
                          variant={isSaved ? "default" : "outline"}
                          className={`w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all ${isSaved ? "bg-[--color-primary] text-white" : ""}`}
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Bookmark
                            className={`w-5 h-5 mr-2 ${isSaved ? "fill-current" : ""}`}
                          />
                          {isSaved ? "Saved" : "Save Job"}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all"
                          onClick={handleShare}
                          disabled={job.status === 'closed' || job.status === 'paused'}
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          {job.status === 'closed' || job.status === 'paused' ? 'Cannot Share' : 'Share Job'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* About the Client */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-[--color-primary]/10 flex items-center justify-center">
                      <Award size={24} className="text-[--color-primary]" />
                    </div>
                    <h3 className="text-2xl font-black text-[--color-text-primary]">About the Client</h3>
                  </div>

                  <div className="mb-6">
                    <button
                      onClick={() => navigate('public-profile', job.userId)}
                      className="font-black text-xl text-[--color-primary] mb-2 hover:underline cursor-pointer transition-all"
                    >
                      {job.userName}
                    </button>
                  </div>

                  <div className="pt-6 border-t-2 border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[--color-primary]" />
                      <p className="text-[--color-text-secondary] text-sm font-medium">{job.userCity}, {job.userCountry}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-[--color-primary]" />
                      <p className="truncate text-[--color-text-secondary] text-sm font-medium">{job.userEmail}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-[--color-primary]" />
                      <p className="text-[--color-text-secondary] text-sm font-medium">{job.userPhone}</p>
                    </div>
                    {job.approvedAt && (
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[--color-primary]" />
                        <p className="text-[--color-text-secondary] text-sm font-medium">
                          Member since {job.approvedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all mt-6"
                    onClick={() => navigate('public-profile', job.userId)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    View Profile
                  </Button>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>

      {/* Job Chat Modal */}
      {activeChatConversationId && currentUser && (
        <JobChatModal
          conversationId={activeChatConversationId}
          userType="freelancer"
          onClose={() => setActiveChatConversationId(null)}
        />
      )}
    </div>
  );
};

export default JobDetailPage;