import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Filter, 
  Flag,
  HelpCircle,
  BarChart2,
  Briefcase,
  Users,
  MessageSquare
} from 'lucide-react';
import { CommunityPost, CommunityPostType } from './types';

interface AdminModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPosts: CommunityPost[];
  reportedPosts: CommunityPost[];
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string, reason?: string) => void;
  onRemoveReportedContent: (postId: string) => void;
  onDismissReport: (postId: string) => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  isOpen,
  onClose,
  pendingPosts,
  reportedPosts,
  onApprovePost,
  onRejectPost,
  onRemoveReportedContent,
  onDismissReport,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports'>('pending');
  const [filterType, setFilterType] = useState<string>('all');
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const filteredPending = pendingPosts.filter(p => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  const handleConfirmReject = (postId: string) => {
    onRejectPost(postId, rejectReason || 'Post did not meet community guidelines.');
    setRejectingPostId(null);
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Fogsly Moderation Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maintain high editorial standards across questions, discussions & opportunities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Pending Submissions ({pendingPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Reported Content ({reportedPosts.length})
            </button>
          </div>

          {/* Sub Filter by Post Type (when in pending tab) */}
          {activeTab === 'pending' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none text-xs"
              >
                <option value="all">All Types</option>
                <option value="question">Questions</option>
                <option value="poll">Polls</option>
                <option value="discussion">Discussions</option>
                <option value="networking">Networking</option>
                <option value="opportunity">Opportunities</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'pending' ? (
            filteredPending.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Check className="w-12 h-12 text-emerald-500 mx-auto p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Moderation Queue is Clear!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All community submissions have been reviewed. New posts created by users will appear here for verification.
                </p>
              </div>
            ) : (
              filteredPending.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {post.author.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {post.author.role} • Submitted {post.createdAt}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200">
                      {post.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Structured Details if available */}
                  {post.type === 'poll' && post.pollData && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                      <span className="font-bold block mb-1 text-slate-500">Poll Options:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                        {post.pollData.options.map(o => (
                          <li key={o.id}>{o.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {post.type === 'networking' && post.networkingData && (
                    <div className="p-3 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 text-xs space-y-1">
                      <div><strong>Skills:</strong> {post.networkingData.skills.join(', ')}</div>
                      <div><strong>Looking For:</strong> {post.networkingData.lookingFor}</div>
                      <div><strong>Offering:</strong> {post.networkingData.offering}</div>
                    </div>
                  )}

                  {post.tags && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((t, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions & Reject Reason prompt */}
                  {rejectingPostId === post.id ? (
                    <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 space-y-2">
                      <label className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                        Reason for Rejection (Visible to submitter):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please clarify your specific question details or remove promotional link."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 text-xs"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setRejectingPostId(null)}
                          className="px-3 py-1 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(post.id)}
                          className="px-4 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => setRejectingPostId(post.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer border border-rose-200 dark:border-rose-900"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onApprovePost(post.id)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            /* Reports Tab */
            reportedPosts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No Reported Content
                </h4>
                <p className="text-xs text-slate-500">
                  There are currently no community reports pending moderator action.
                </p>
              </div>
            ) : (
              reportedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" /> Flagged Content
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {post.id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {post.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => onDismissReport(post.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => onRemoveReportedContent(post.id)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Content</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
