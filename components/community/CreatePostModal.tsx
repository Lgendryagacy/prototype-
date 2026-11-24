import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BarChart2, 
  MessageSquare, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2 
} from 'lucide-react';
import { CommunityPost, CommunityPostType, CommunityAuthor } from './types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<CommunityPost>) => void;
  currentUser?: any;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
  currentUser,
}) => {
  const [postType, setPostType] = useState<CommunityPostType>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Networking state
  const [netRole, setNetRole] = useState('');
  const [netSkills, setNetSkills] = useState('');
  const [netLookingFor, setNetLookingFor] = useState('');
  const [netOffering, setNetOffering] = useState('');
  const [netLocation, setNetLocation] = useState('Remote');

  // Opportunity state
  const [oppCompany, setOppCompany] = useState('');
  const [oppLocation, setOppLocation] = useState('Remote');
  const [oppType, setOppType] = useState<'Remote' | 'Internship' | 'Full-time' | 'Contract' | 'Hybrid'>('Remote');
  const [oppStipend, setOppStipend] = useState('');

  if (!isOpen) return null;

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const author: CommunityAuthor = {
      id: currentUser?.uid || 'user-current',
      name: currentUser?.displayName || currentUser?.name || 'You (Member)',
      role: 'Community Builder',
      avatar: currentUser?.photoURL || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: false,
      isCurrentUser: true,
    };

    const newPostData: Partial<CommunityPost> = {
      type: postType,
      title: title.trim(),
      content: content.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['General'],
      author,
      viewsCount: 1,
      likesCount: 0,
      dislikesCount: 0,
      likedByMe: false,
      dislikedByMe: false,
      commentsCount: 0,
      comments: [],
    };

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      newPostData.pollData = {
        totalVotes: 0,
        options: validOptions.map((optText, idx) => ({
          id: `opt-${idx + 1}`,
          text: optText.trim(),
          votes: 0,
        })),
      };
    } else if (postType === 'networking') {
      newPostData.networkingData = {
        role: netRole.trim() || 'Professional',
        skills: netSkills.split(',').map(s => s.trim()).filter(Boolean),
        lookingFor: netLookingFor.trim(),
        offering: netOffering.trim(),
        location: netLocation.trim(),
      };
    } else if (postType === 'opportunity') {
      newPostData.opportunityData = {
        title: title.trim(),
        company: oppCompany.trim() || 'Verified Organization',
        location: oppLocation.trim() || 'Remote',
        type: oppType,
        country: 'Global',
        description: content.trim(),
        stipendOrSalary: oppStipend.trim() || undefined,
        tags: parsedTags,
      };
    }

    onSubmitPost(newPostData);
    setSubmittedSuccess(true);
  };

  const resetAndClose = () => {
    setSubmittedSuccess(false);
    setTitle('');
    setContent('');
    setTagsInput('');
    setPollOptions(['', '']);
    setNetRole('');
    setNetSkills('');
    setNetLookingFor('');
    setNetOffering('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#12161F] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            New Discussion
          </h2>
          <button
            onClick={resetAndClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Post Submitted for Review
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Your post has entered the community moderation queue. Once approved by a moderator, it will appear live in the feed.
            </p>
            <div className="pt-2">
              <button
                onClick={resetAndClose}
                className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                Back to Feed
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Type Selection */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'question', label: 'Question', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                  { id: 'poll', label: 'Poll', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                  { id: 'discussion', label: 'Discussion', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                  { id: 'opportunity', label: 'Opportunity', icon: <Briefcase className="w-3.5 h-3.5" /> },
                  { id: 'networking', label: 'Collab', icon: <Users className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPostType(item.id as CommunityPostType)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      postType === item.id
                        ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder={
                  postType === 'question'
                    ? 'What is your question?'
                    : postType === 'poll'
                    ? 'What would you like to poll the community about?'
                    : postType === 'opportunity'
                    ? 'Role or gig title'
                    : 'Discussion title'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Content / Description */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Details & Context
              </label>
              <textarea
                rows={4}
                placeholder="Share context, details, code snippets, or background..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Poll Options */}
            {postType === 'poll' && (
              <div className="space-y-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                  Poll Options (Min 2)
                </label>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add option</span>
                  </button>
                )}
              </div>
            )}

            {/* Opportunity Fields */}
            {postType === 'opportunity' && (
              <div className="space-y-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Labs"
                      value={oppCompany}
                      onChange={(e) => setOppCompany(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                      Type
                    </label>
                    <select
                      value={oppType}
                      onChange={(e) => setOppType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                      Compensation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $40/hr or PKR 80k/mo"
                      value={oppStipend}
                      onChange={(e) => setOppStipend(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tags Input */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Nextjs, AI, Career, Freelance"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-3.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                Submit Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePostModal;
