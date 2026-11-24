import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Edit2, Eye, Calendar, User, DollarSign, MessageSquare, Clock } from 'lucide-react';
import { FogslyJob } from '../../../firebase/types/job';
import JobCompletionService from '../../../firebase/services/jobCompletionService';
import { toast } from 'react-hot-toast';

interface EditReviewModalProps {
  job: FogslyJob;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rating: number, review: string) => Promise<void>;
}

function EditReviewModal({ job, isOpen, onClose, onSave }: EditReviewModalProps) {
  const [rating, setRating] = useState(job.clientRating || 1);
  const [review, setReview] = useState(job.clientReview || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!review.trim()) {
      toast.error('Review text is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(rating, review.trim());
      onClose();
    } catch (error) {
      console.error('Error saving review:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Job Review</h2>
            <p className="text-sm text-slate-400 mt-1">{job.jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Enter review text..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-white placeholder:text-slate-400"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !review.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobCompletionsView() {
  const [pendingJobs, setPendingJobs] = useState<FogslyJob[]>([]);
  const [approvedJobs, setApprovedJobs] = useState<FogslyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [editingJob, setEditingJob] = useState<FogslyJob | null>(null);
  const [approvingJobId, setApprovingJobId] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        JobCompletionService.getCompletedJobsPendingApproval(),
        JobCompletionService.getApprovedCompletedJobs()
      ]);
      setPendingJobs(pending);
      setApprovedJobs(approved);
    } catch (error) {
      console.error('Error loading completed jobs:', error);
      toast.error('Failed to load completed jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApprove = async (jobId: string) => {
    if (!confirm('Are you sure you want to approve this job completion? This will:\n\n1. Mark job as admin approved\n2. Update freelancer stats (jobs, reviews, rating, earnings)\n3. Process payment to freelancer wallet\n\nProceed?')) {
      console.log('❌ Admin cancelled approval');
      return;
    }

    setApprovingJobId(jobId);
    const loadingToast = toast.loading('Processing approval...');
    
    try {
      console.log('🔵 Starting approval process for job:', jobId);
      const result = await JobCompletionService.adminApproveCompletion(jobId, 'admin-user-id');
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('✅ Job approved! Payment processed and stats updated.', {
          duration: 5000,
          icon: '🎉'
        });
        console.log('✅ Approval completed successfully');
        await loadJobs();
      } else {
        const errorMsg = result.error || 'Failed to approve job completion';
        toast.error(errorMsg, { duration: 6000 });
        console.error('❌ Approval failed:', errorMsg);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('❌ Exception during approval:', error);
      toast.error('An error occurred while processing approval. Please check console.', {
        duration: 6000
      });
    } finally {
      setApprovingJobId(null);
    }
  };

  const handleEditReview = async (rating: number, review: string) => {
    if (!editingJob) return;

    const result = await JobCompletionService.updateJobReview(editingJob.id, rating, review);
    if (result.success) {
      toast.success('Review updated successfully');
      await loadJobs();
    } else {
      toast.error(result.error || 'Failed to update review');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const renderJobCard = (job: FogslyJob, isPending: boolean) => (
    <div key={job.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-2">{job.jobTitle}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{job.clientName || job.userName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Completed: {formatDate(job.completedAt)}</span>
            </div>
            {job.budgetInFogCoins && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-yellow-300">{job.budgetInFogCoins} FOG</span>
              </div>
            )}
            {job.budgetAmount && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-300">
                  {job.budgetCurrency} {job.budgetAmount.toLocaleString()}
                </span>
              </div>
            )}
            {job.revisionCount !== undefined && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>{job.revisionCount} Revision{job.revisionCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPending 
            ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
            : 'bg-green-900/50 text-green-300 border border-green-700'
        }`}>
          {isPending ? 'Pending Approval' : 'Approved'}
        </div>
      </div>

      {/* Review */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Client Review:</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (job.clientRating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-400">({job.clientRating || 0}/5)</span>
        </div>
        <p className="text-slate-300 text-sm bg-slate-700/50 rounded p-3">
          {job.clientReview || 'No review text provided'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isPending ? (
          <>
            <button
              onClick={() => setEditingJob(job)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Review
            </button>
            <button
              onClick={() => handleApprove(job.id)}
              disabled={approvingJobId === job.id}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approvingJobId === job.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve & Process Payment
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex items-center text-sm text-slate-400 gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Approved: {formatDate(job.adminApprovedAt)}</span>
            </div>
            {job.adminApprovedBy && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By: {job.adminApprovedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-400">Loading completed jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Completed Jobs Management</h1>
        <p className="text-slate-400">
          Review and approve completed jobs. Process payments to freelancers after approval.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-900/50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Pending Approval</p>
              <p className="text-2xl font-bold text-white">{pendingJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-white">{approvedJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Completed</p>
              <p className="text-2xl font-bold text-white">{pendingJobs.length + approvedJobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending Approval ({pendingJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'approved'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Approved ({approvedJobs.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'pending' ? (
          pendingJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Pending Jobs</h3>
              <p className="text-slate-400">All completed jobs have been approved.</p>
            </div>
          ) : (
            pendingJobs.map(job => renderJobCard(job, true))
          )
        ) : (
          approvedJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Approved Jobs</h3>
              <p className="text-slate-400">Approved jobs will appear here.</p>
            </div>
          ) : (
            approvedJobs.map(job => renderJobCard(job, false))
          )
        )}
      </div>

      {/* Edit Review Modal */}
      {editingJob && (
        <EditReviewModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleEditReview}
        />
      )}
    </div>
  );
}