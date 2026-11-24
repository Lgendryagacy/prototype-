import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  FileText,
  Link as LinkIcon,
  Upload,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { type Route } from '../types';
import { useAuth } from '../firebase/hooks/useAuth';
import { getFogslyJobById } from '../firebase/services/fogslyJobsService';
import { submitJobProposal, hasUserAppliedToJob } from '../firebase/services/jobProposals';
import { getUserProfile } from '../firebase/services/userService';
import { getAllApprovedFreelancersByUserId } from '../firebase/services/approvedFreelancers';
import { FogslyJob } from '../firebase/types/job';
import { ProposalFormData, TimeUnit, AvailabilityType } from '../firebase/types/proposal';
import { toast } from 'react-hot-toast';
import { User } from '../firebase/types/user';

const ApplyJobPage = ({
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasGigs, setHasGigs] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form state
  const [bidAmount, setBidAmount] = useState('');
  const [bidCurrency, setBidCurrency] = useState('USD');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryTimeUnit, setDeliveryTimeUnit] = useState<TimeUnit>('days');
  const [coverLetter, setCoverLetter] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [questionsForClient, setQuestionsForClient] = useState('');
  const [availability, setAvailability] = useState<AvailabilityType>('full-time');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const jobId = context;

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to apply for jobs');
      navigate('auth');
      return;
    }

    if (jobId) {
      fetchJobAndCheckApplication();
    } else {
      setLoading(false);
      toast.error('No job ID provided');
    }
  }, [jobId, currentUser]);

  const fetchJobAndCheckApplication = async () => {
    if (!jobId || !currentUser) return;

    try {
      setLoading(true);

      // Check if user has gigs first
      const gigs = await getAllApprovedFreelancersByUserId(currentUser.uid);
      setHasGigs(gigs.length > 0);

      if (gigs.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch job details
      const jobData = await getFogslyJobById(jobId);
      if (!jobData) {
        toast.error('Job not found');
        navigate('find-work');
        return;
      }

      setJob(jobData);
      setBidCurrency(jobData.budgetCurrency);

      // Set default bid amount based on job budget
      if (jobData.budgetType !== 'quote' && jobData.budgetAmount) {
        setBidAmount(jobData.budgetAmount.toString());
      }

      // Check if user already applied
      const applied = await hasUserAppliedToJob(jobId, currentUser.uid);
      setHasApplied(applied);

      if (applied) {
        toast.error('You have already applied to this job');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const handleRemovePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      handleFiles(newFiles);
    }
  };

  const handleFiles = (files: File[]) => {
    if (attachments.length + files.length > 3) {
      toast.error('You can only upload up to 3 files');
      return;
    }
    setAttachments([...attachments, ...files.slice(0, 3 - attachments.length)]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return false;
    }

    // Check if bid exceeds fixed budget
    if (job?.budgetType === 'fixed' && job.budgetAmount && parseFloat(bidAmount) > job.budgetAmount) {
      toast.error(`Bid amount cannot exceed the client's fixed budget of ${job.budgetCurrency} ${job.budgetAmount.toLocaleString()}`);
      return false;
    }

    if (!deliveryTime || parseInt(deliveryTime) <= 0) {
      toast.error('Please enter a valid delivery time');
      return false;
    }

    if (coverLetter.length < 100) {
      toast.error('Cover letter must be at least 100 characters');
      return false;
    }

    if (coverLetter.length > 5000) {
      toast.error('Cover letter cannot exceed 5000 characters');
      return false;
    }

    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !jobId || !job) {
      toast.error('Unable to submit proposal');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Get user profile for name and email
      const userProfile = await getUserProfile(currentUser.uid);
      const freelancerName = userProfile?.name || userProfile?.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
      const freelancerEmail = userProfile?.email || currentUser.email || '';

      const formData: ProposalFormData = {
        bidAmount: parseFloat(bidAmount),
        bidCurrency,
        deliveryTime: parseInt(deliveryTime),
        deliveryTimeUnit,
        coverLetter,
        relevantExperience,
        portfolioLinks: portfolioLinks.filter(link => link.trim() !== ''),
        questionsForClient,
        availability,
        attachments
      };

      await submitJobProposal(
        jobId,
        currentUser.uid,
        freelancerName,
        freelancerEmail,
        formData
      );

      setShowSuccessModal(true);
      toast.success('Proposal submitted successfully!');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Failed to submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('my-applications');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[--color-primary] mx-auto mb-4" />
          <p className="text-[--color-text-secondary]">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!hasGigs) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-6 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg mb-6">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-3">⚠️ Gig Required</h1>
              <p className="text-[--color-text-secondary] mb-2">
                Please create a gig first before applying to any job.
              </p>
              <p className="text-sm text-[--color-text-secondary]">
                A gig showcases your skills and services to potential clients.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('become-freelancer')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Create Gig Now
              </Button>
              <Button variant="outline" onClick={() => navigate('find-work')}>
                Back to Jobs
              </Button>
            </div>
          </div>
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
              The job you're trying to apply for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('find-work')}>
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Already Applied</h1>
            <p className="text-[--color-text-secondary] mb-6">
              You have already submitted a proposal for this job.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('my-applications')}>
                View My Applications
              </Button>
              <Button variant="outline" onClick={() => navigate('find-work')}>
                Browse More Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg-primary]">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('job-detail', jobId)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job Details
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Submit Your Proposal</CardTitle>
                  <p className="text-[--color-text-secondary] mt-2">
                    Stand out by providing detailed information about your offer
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bid Amount */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Bid Amount ({bidCurrency}) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={job?.budgetAmount ? job.budgetAmount.toString() : "Enter your bid"}
                          min="0"
                          max={job?.budgetType === 'fixed' ? job.budgetAmount : undefined}
                          step="0.01"
                          required
                          className={`w-full pl-10 pr-4 py-2 bg-[--color-bg-secondary] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] ${job?.budgetType === 'fixed' && parseFloat(bidAmount) > (job?.budgetAmount || 0)
                            ? 'border-red-500'
                            : 'border-[--color-border]'
                            }`}
                        />
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-[--color-text-secondary]">
                          {job?.budgetType === 'hourly'
                            ? 'Enter your hourly rate'
                            : job?.budgetType === 'fixed'
                              ? `Client's budget: ${bidCurrency} ${job?.budgetAmount?.toLocaleString()} `
                              : 'Enter your total project cost'}
                        </p>
                        {job?.budgetType === 'fixed' && parseFloat(bidAmount) > (job?.budgetAmount || 0) && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Bid cannot exceed the fixed budget of {bidCurrency} {job?.budgetAmount?.toLocaleString()} - ({job.budgetInFogCoins.toFixed(2)} FOG)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Time */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Delivery Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                          <input
                            type="number"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(e.target.value)}
                            placeholder="Enter time"
                            min="1"
                            required
                            className="w-full pl-10 pr-4 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                          />
                        </div>
                        <select
                          value={deliveryTimeUnit}
                          onChange={(e) => setDeliveryTimeUnit(e.target.value as TimeUnit)}
                          className="px-4 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Cover Letter <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Explain why you're the best fit for this job..."
                        rows={6}
                        minLength={100}
                        maxLength={5000}
                        required
                        className="w-full px-4 py-3 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-[--color-text-secondary]">
                          Minimum 100 characters, Maximum 5000 characters
                        </p>
                        <p className={`text-xs ${coverLetter.length >= 100 && coverLetter.length <= 5000
                          ? 'text-green-500'
                          : coverLetter.length > 5000
                            ? 'text-red-500'
                            : 'text-[--color-text-secondary]'
                          }`}>
                          {coverLetter.length} / 5000
                        </p>
                      </div>
                    </div>

                    {/* Relevant Experience */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Relevant Experience (Optional)
                      </label>
                      <textarea
                        value={relevantExperience}
                        onChange={(e) => setRelevantExperience(e.target.value)}
                        placeholder="Describe your relevant experience..."
                        rows={4}
                        className="w-full px-4 py-3 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
                      />
                    </div>

                    {/* Portfolio Links */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Portfolio Links
                      </label>
                      <div className="space-y-2">
                        {portfolioLinks.map((link, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex-1 relative">
                              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                              <input
                                type="url"
                                value={link}
                                onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                                placeholder="https://example.com/portfolio"
                                className="w-full pl-10 pr-4 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                              />
                            </div>
                            {portfolioLinks.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemovePortfolioLink(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPortfolioLink}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Link
                      </Button>
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        File Attachments (Max 3 files)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                          ? 'border-[--color-primary] bg-[--color-primary]/5'
                          : 'border-[--color-border]'
                          } ${attachments.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-8 h-8 text-[--color-text-secondary] mx-auto mb-2" />
                        <label className={attachments.length >= 3 ? '' : 'cursor-pointer'}>
                          <span className="text-[--color-primary] hover:underline">
                            Click to upload
                          </span>
                          <span className="text-[--color-text-secondary]"> or drag and drop</span>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            disabled={attachments.length >= 3}
                          />
                        </label>
                        <p className="text-xs text-[--color-text-secondary] mt-1">
                          PDF, DOC, TXT, JPG, PNG (Max 10MB each)
                        </p>
                        <p className="text-xs text-[--color-primary] mt-1">
                          {attachments.length} / 3 files uploaded
                        </p>
                      </div>
                      {attachments.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {attachments.map((file, index) => {
                            const isImage = file.type.startsWith('image/');
                            const fileUrl = URL.createObjectURL(file);

                            return (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-[--color-bg-secondary] border border-[--color-border]">
                                  {isImage ? (
                                    <img
                                      src={fileUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                      <FileText className="w-12 h-12 text-[--color-text-secondary] mb-2" />
                                      <p className="text-xs text-center truncate w-full">
                                        {file.name}
                                      </p>
                                    </div>
                                  )}
                                  {/* Remove overlay */}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      size="icon"
                                      onClick={() => handleRemoveFile(index)}
                                      className="rounded-full bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-[--color-text-secondary] mt-1 truncate">
                                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Questions for Client */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Questions for Client (Optional)
                      </label>
                      <textarea
                        value={questionsForClient}
                        onChange={(e) => setQuestionsForClient(e.target.value)}
                        placeholder="Any questions you'd like to ask the client..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
                      />
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Availability <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as AvailabilityType)}
                        required
                        className="w-full px-4 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                      >
                        <option value="full-time">Full-time (40+ hours/week)</option>
                        <option value="part-time">Part-time (20-40 hours/week)</option>
                        <option value="as-needed">As Needed (Flexible)</option>
                      </select>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3 p-4 bg-[--color-bg-secondary] rounded-lg">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        required
                        className="mt-1 w-4 h-4 accent-[--color-primary]"
                      />
                      <label htmlFor="terms" className="text-sm text-[--color-text-secondary]">
                        I agree to the terms and conditions and understand that submitting a proposal is a commitment to deliver the work as described if accepted.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Proposal'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('job-detail', jobId)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Job Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{job.jobTitle}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.categories.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[--color-border] space-y-3">
                    <div>
                      <p className="text-xs text-[--color-text-secondary] mb-1">Budget Type</p>
                      <p className="font-semibold capitalize">{job.budgetType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[--color-text-secondary] mb-1">Client Budget</p>
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-[--color-primary]">
                          {job.budgetType === 'quote'
                            ? 'Request Quote'
                            : `${job.budgetCurrency} ${job.budgetAmount?.toLocaleString()} `}
                        </p>
                        <p className="text-sm  text-[--color-text-secondary]">
                          (
                          {job.budgetType !== 'quote' && ` ${job.budgetInFogCoins.toFixed(2)} FOG`}
                          )
                        </p>
                      </div>

                    </div>
                    <div>
                      <p className="text-xs text-[--color-text-secondary] mb-1">Location</p>
                      <p className="font-semibold">{job.userCity}, {job.userCountry}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[--color-border]">
                    <p className="text-xs text-[--color-text-secondary] mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 6).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs !text-[--color-text-secondary]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleSuccessModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[--color-bg-primary] rounded-xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Proposal Submitted!</h2>
              <p className="text-[--color-text-secondary] mb-6">
                Your proposal has been successfully submitted. The client will review it and get back to you soon.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleSuccessModalClose} className="flex-1">
                  View My Applications
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('find-work');
                  }}
                  className="flex-1"
                >
                  Browse More Jobs
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplyJobPage;
