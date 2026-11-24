import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  ThumbsUp,
  ThumbsDown,
  MessageSquare, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  CheckCircle2, 
  ExternalLink,
  Pin,
  Check,
  UserPlus,
  Clock,
  Flag,
  Coins,
  ShieldCheck,
  Calendar,
  MapPin,
  Eye,
  Reply,
  CornerDownRight,
  X,
  Send,
  Sparkles,
  Award
} from 'lucide-react';
import { CommunityPost, CommunityComment, CommunityCommentReply, CommunityViewMode } from './types';
import { toast } from 'react-hot-toast';

interface PostCardProps {
  post: CommunityPost;
  viewMode?: CommunityViewMode;
  onLikePost: (postId: string) => void;
  onDislikePost?: (postId: string) => void;
  onIncrementView?: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onAddReply: (postId: string, commentId: string, text: string, replyingToAuthorName?: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onDislikeComment?: (postId: string, commentId: string) => void;
  onLikeReply?: (postId: string, commentId: string, replyId: string) => void;
  onDislikeReply?: (postId: string, commentId: string, replyId: string) => void;
  onReportPost: (postId: string) => void;
  onReportComment: (postId: string, commentId: string) => void;
  onOpenOpportunity: (post: CommunityPost) => void;
  onOpenEvent: (post: CommunityPost) => void;
  onOpenUserProfile: (authorId: string) => void;
  onConnectWithAuthor?: (authorId: string) => void;
  onTagClick?: (tag: string) => void;
  isHighlighted?: boolean;
}

export const PostCardComponent: React.FC<PostCardProps> = ({
  post,
  viewMode = 'detailed',
  onLikePost,
  onDislikePost,
  onIncrementView,
  onSavePost,
  onVotePoll,
  onAddComment,
  onAddReply,
  onLikeComment,
  onDislikeComment,
  onLikeReply,
  onDislikeReply,
  onReportPost,
  onReportComment,
  onOpenOpportunity,
  onOpenEvent,
  onOpenUserProfile,
  onConnectWithAuthor,
  onTagClick,
  isHighlighted = false,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [tippedFog, setTippedFog] = useState(0);

  // Active inline reply state: tracks which comment (and optional sub-comment) the user is replying to
  const [activeReplyTarget, setActiveReplyTarget] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);
  const [replyInputText, setReplyInputText] = useState('');

  // Track session view once
  const hasTriggeredViewRef = useRef(false);
  useEffect(() => {
    if (!hasTriggeredViewRef.current && onIncrementView) {
      hasTriggeredViewRef.current = true;
      // Increment views count smoothly
      onIncrementView(post.id);
    }
  }, [post.id, onIncrementView]);

  const formatCount = (count?: number) => {
    if (!count || count <= 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return count.toLocaleString();
  };

  const handleLike = () => {
    onLikePost(post.id);
    if (!post.likedByMe) {
      toast.success('Thread upvoted', { icon: '👍', duration: 1500 });
    }
  };

  const handleDislike = () => {
    if (onDislikePost) {
      onDislikePost(post.id);
      if (!post.dislikedByMe) {
        toast('Feedback recorded', { icon: '👎', duration: 1500 });
      }
    }
  };

  const handleSave = () => {
    onSavePost(post.id);
    toast.success(post.savedByMe ? 'Removed from saved discussions' : 'Saved to your reading list');
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}${window.location.pathname}#post-${post.id}`
        );
        toast.success('Discussion link copied to clipboard');
      } catch (err) {
        toast.success('Discussion link ready');
      }
    }
  };

  const handleTipAuthor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTippedFog((prev) => prev + 25);
    toast.success(`Awarded 25 FOG to ${post.author.name}`, {
      icon: '🪙',
      style: {
        borderRadius: '12px',
        background: '#081440',
        color: '#F8FAFC',
        border: '1px solid #489fff40',
      },
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
    setShowComments(true);
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyInputText.trim() || !activeReplyTarget) return;
    onAddReply(post.id, commentId, replyInputText.trim(), activeReplyTarget.authorName);
    setReplyInputText('');
    setActiveReplyTarget(null);
  };

  // Minimal, high-signal category badge
  const getCategoryBadge = () => {
    switch (post.type) {
      case 'question':
        return { label: 'Q&A' };
      case 'poll':
        return { label: 'Poll' };
      case 'opportunity':
        return { label: 'Opportunity' };
      case 'networking':
        return { label: 'Collaboration' };
      case 'event':
        return { label: 'Event' };
      case 'announcement':
        return { label: 'Announcement' };
      default:
        return { label: 'Discussion' };
    }
  };

  const categoryBadge = getCategoryBadge();

  // Calculate total comments including all sub-comments
  const totalCommentsAndReplies = (post.comments || []).reduce((acc, c) => {
    return acc + 1 + (c.replies ? c.replies.length : 0);
  }, 0);

  // Real-time Sentiment Score calculation
  const likes = post.likesCount || 0;
  const dislikes = post.dislikesCount || 0;
  const sentimentScore = likes - dislikes;
  const totalReactions = likes + dislikes;
  const sentimentPercentage = totalReactions > 0 ? Math.round((likes / totalReactions) * 100) : 100;

  return (
    <article
      id={`community-post-${post.id}`}
      className={`group relative rounded-2xl border transition-all duration-300 ${
        isHighlighted
          ? 'ring-2 ring-blue-500 shadow-[0_0_28px_rgba(0,82,255,0.35)] scale-[1.008]'
          : ''
      } ${
        post.isFogslyExclusive
          ? 'bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-[#0B152B] dark:via-[#0D1832] dark:to-[#080E1C] border-blue-500/50 dark:border-blue-400/40 ring-1 ring-blue-500/30 dark:ring-blue-400/30 shadow-[0_4px_24px_-2px_rgba(37,99,235,0.14)] dark:shadow-[0_4px_32px_-2px_rgba(37,99,235,0.26)] hover:shadow-[0_8px_36px_-2px_rgba(37,99,235,0.22)] dark:hover:shadow-[0_8px_40px_rgba(37,99,235,0.34)] hover:border-blue-600 dark:hover:border-blue-300'
          : post.isPinned
          ? 'bg-white dark:bg-[#0E131F] border-[#2563eb]/60 dark:border-[#38bdf8]/50 shadow-xs'
          : 'bg-white dark:bg-[#0E131F] border-slate-200/80 dark:border-slate-800/80 hover:border-[#2563eb]/40 dark:hover:border-[#38bdf8]/40 shadow-xs hover:shadow-sm'
      } p-5 sm:p-6 overflow-hidden`}
    >
      {/* Executive Branded Official Header Strip */}
      {post.isFogslyExclusive && (
        <div className="relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 px-4 sm:px-5 py-3 bg-gradient-to-r from-[#060D1E] via-[#091838] to-[#060D1E] text-white border-b border-blue-500/30 flex items-center justify-between gap-3 overflow-hidden shadow-xs">
          {/* Subtle glowing accent line at the top edge */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-[11px] shrink-0 shadow-sm border border-white/20">
              F
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-[11px] sm:text-xs tracking-wider text-slate-100 uppercase font-mono">
                  FOGSLY OFFICIAL
                </span>
                <span className="text-blue-400 font-semibold text-xs">•</span>
                <span className="font-semibold text-sky-200 text-xs truncate max-w-[220px] sm:max-w-[340px]">
                  {post.fogslyBadgeText || 'ECOSYSTEM INITIATIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-500/20 text-sky-200 border border-blue-400/40 shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Verified Priority</span>
            </span>
          </div>
        </div>
      )}

      {/* Minimal Pinned Indicator (if pinned but not exclusive) */}
      {post.isPinned && !post.isFogslyExclusive && (
        <div className="flex items-center gap-1.5 pb-3 mb-3.5 border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#489fff]">
          <Pin className="w-3.5 h-3.5 fill-current" />
          <span>Pinned Discussion</span>
        </div>
      )}

      {/* Author & Minimal Metadata Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onOpenUserProfile(post.author.id)}
            className="cursor-pointer shrink-0 relative group/avatar focus:outline-none"
            title={post.author.name}
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className={`w-10 h-10 rounded-full object-cover transition-all ${
                post.isFogslyExclusive || post.author.id.includes('fogsly')
                  ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50'
                  : 'ring-1 ring-slate-200 dark:ring-slate-700 group-hover/avatar:ring-[#489fff]'
              }`}
            />
            {post.isFogslyExclusive || post.author.id.includes('fogsly') ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#0E131F]">
                ✓
              </span>
            ) : post.author.verified ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#489fff] text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-[#0E131F]">
                ✓
              </span>
            ) : null}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onOpenUserProfile(post.author.id)}
                className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#489fff] transition-colors truncate cursor-pointer text-left focus:outline-none"
              >
                {post.author.name}
              </button>
              {post.isFogslyExclusive || post.author.id.includes('fogsly') ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-[#489fff] border border-blue-500/20">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  Official Team
                </span>
              ) : post.author.verified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#489fff] shrink-0 fill-[#489fff]/10" />
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {post.author.role && (
                <>
                  <span className="truncate max-w-[130px] sm:max-w-[200px]">{post.author.role}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                </>
              )}
              <span className="shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {post.createdAt}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              {/* Views count in header */}
              <span className="shrink-0 flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium" title={`${post.viewsCount || 0} views`}>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatCount(post.viewsCount || 0)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Category Chip & Options Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            {categoryBadge.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#081440] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs font-medium">
                <button
                  onClick={() => {
                    handleShare();
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" /> Share thread
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" /> {post.savedByMe ? 'Remove saved' : 'Save discussion'}
                </button>
                <button
                  onClick={() => {
                    onReportPost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" /> Flag post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug tracking-tight group-hover:text-[#489fff] transition-colors">
        {post.title}
      </h3>

      {/* Post Content Body */}
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-3.5 whitespace-pre-line">
        {post.content}
      </div>

      {/* Official Platform Verification & Action Card */}
      {post.isFogslyExclusive && (
        <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-[#489fff] flex items-center justify-center shrink-0 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Verified Platform Ecosystem</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  ESCROW GUARANTEED
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Priority review, verified employer credentials & direct interview pipeline for Fogsly community members.
              </div>
            </div>
          </div>
          {post.opportunityData ? (
            <button
              onClick={() => onOpenOpportunity(post)}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#081440] hover:bg-[#0f215e] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#081440] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Roles</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : post.eventData ? (
            <button
              onClick={() => onOpenEvent(post)}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#081440] hover:bg-[#0f215e] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#081440] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>RSVP Pass</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setShowComments(true)}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>View Discussion</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Embedded Poll Card */}
      {post.type === 'poll' && post.pollData && (
        <div className="my-3.5 p-4 rounded-xl bg-slate-50 dark:bg-[#081440]/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          {post.pollData.options.map((option) => {
            const totalVotes = post.pollData?.totalVotes || 1;
            const percent = Math.round((option.votes / totalVotes) * 100);
            const isUserVoted = post.pollData?.userVotedOptionId === option.id;

            return (
              <button
                key={option.id}
                onClick={() => onVotePoll(post.id, option.id)}
                className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all group cursor-pointer ${
                  isUserVoted
                    ? 'border-[#489fff] bg-[#489fff]/10 dark:bg-[#489fff]/15'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500 ${
                    isUserVoted ? 'bg-[#489fff]' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                  style={{ width: `${percent}%` }}
                />

                <div className="relative flex items-center justify-between text-xs sm:text-sm font-semibold z-10">
                  <span className="text-slate-900 dark:text-white flex items-center gap-2">
                    {isUserVoted && <Check className="w-3.5 h-3.5 text-[#489fff] font-bold" />}
                    {option.text}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {percent}% ({option.votes})
                  </span>
                </div>
              </button>
            );
          })}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tap any option to cast your vote</span>
            <span className="font-mono">{post.pollData.totalVotes} total votes</span>
          </div>
        </div>
      )}

      {/* Embedded Opportunity Card */}
      {post.type === 'opportunity' && post.opportunityData && (
        <div className="my-3.5 p-4 rounded-xl bg-slate-50 dark:bg-[#081440]/40 border border-slate-200/80 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#489fff]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow Verified • {post.opportunityData.type}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {post.opportunityData.title}
            </div>
            {post.opportunityData.stipendOrSalary && (
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {post.opportunityData.stipendOrSalary}
              </div>
            )}
          </div>
          <button
            onClick={() => onOpenOpportunity(post)}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#489fff] hover:bg-[#3ba0ff] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Review Opportunity</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Embedded Event Card */}
      {post.type === 'event' && post.eventData && (
        <div className="my-3.5 p-4 rounded-xl bg-slate-50 dark:bg-[#081440]/40 border border-slate-200/80 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#489fff]" /> {post.eventData.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {post.eventData.location}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {post.eventData.title}
            </div>
          </div>
          <button
            onClick={() => onOpenEvent(post)}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081440] dark:bg-white text-white dark:text-[#081440] hover:bg-[#0d1d57] dark:hover:bg-slate-100 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Session Info</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Embedded Networking Card */}
      {post.type === 'networking' && post.networkingData && (
        <div className="my-3.5 p-4 rounded-xl bg-slate-50 dark:bg-[#081440]/40 border border-slate-200/80 dark:border-slate-800/90 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {post.networkingData.skills.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Seeking:</span>{' '}
              {post.networkingData.lookingFor}
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Offering:</span>{' '}
              {post.networkingData.offering}
            </div>
          </div>
          {onConnectWithAuthor && (
            <div className="pt-1.5 flex justify-end">
              <button
                onClick={() => onConnectWithAuthor(post.author.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#489fff] hover:bg-[#3ba0ff] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags Row */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-[#489fff] hover:bg-[#489fff]/10 transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Clean Interaction Row: Views, Likes, Dislikes, Comments, Tip */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Likes & Dislikes Combined Pill */}
          <div className="flex items-center rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A10]/50 p-0.5 shadow-2xs">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                post.likedByMe
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Like this discussion"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-current' : ''}`} />
              <span>{post.likesCount || 0}</span>
            </button>

            <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                post.dislikedByMe
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Dislike this discussion"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${post.dislikedByMe ? 'fill-current' : ''}`} />
              <span>{post.dislikesCount || 0}</span>
            </button>
          </div>

          {/* Real-time Sentiment Score Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs font-medium"
            title={`Net Community Sentiment: ${sentimentScore > 0 ? '+' : ''}${sentimentScore} (${sentimentPercentage}% positive out of ${totalReactions} reactions)`}
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sentiment:</span>
            <span className={`font-mono font-bold text-xs ${
              sentimentScore > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : sentimentScore < 0 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {sentimentScore > 0 ? `+${sentimentScore}` : sentimentScore}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              ({sentimentPercentage}%)
            </span>
          </div>

          {/* Comments / Replies Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
              showComments
                ? 'border-[#489fff] bg-[#489fff]/10 text-[#489fff]'
                : 'border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalCommentsAndReplies} {totalCommentsAndReplies === 1 ? 'Reply' : 'Replies'}</span>
          </button>

          {/* Views Metric Pill */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 text-xs font-medium"
            title={`${post.viewsCount || 0} total views on this post`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatCount(post.viewsCount || 0)} views</span>
          </div>

          {/* Tip Points Button */}
          <button
            onClick={handleTipAuthor}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-xs font-semibold"
            title="Award 25 Reputation Points to Author"
          >
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span>Award Rep {tippedFog > 0 && `(+${tippedFog})`}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Share */}
          <button
            onClick={handleShare}
            title="Share thread"
            className="p-2 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={handleSave}
            title={post.savedByMe ? 'Saved' : 'Save'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              post.savedByMe
                ? 'border-[#489fff] bg-[#489fff]/10 text-[#489fff]'
                : 'border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${post.savedByMe ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Comments & Sub-Comments (Threaded Conversation) Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          {/* Top-Level Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Contribute your thought to this discussion..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#489fff]/40 focus:border-[#489fff]"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#489fff] hover:bg-[#3ba0ff] text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Comment</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3 pt-1">
              {post.comments.map((comment) => {
                const isCommentFogsly = comment.author.id.startsWith('fogsly') || comment.author.name.toLowerCase().includes('fogsly');
                return (
                <div
                  key={comment.id}
                  className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                    isCommentFogsly
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300/80 dark:border-blue-800/70 shadow-2xs'
                      : 'bg-slate-50/70 dark:bg-[#081440]/30 border-slate-200/60 dark:border-slate-800/80'
                  }`}
                >
                  {/* Top-Level Comment Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <button
                        onClick={() => onOpenUserProfile(comment.author.id)}
                        className="cursor-pointer focus:outline-none shrink-0"
                      >
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className={`w-6 h-6 rounded-full object-cover ${
                            isCommentFogsly
                              ? 'ring-1.5 ring-blue-500'
                              : 'border border-slate-200 dark:border-slate-700'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onOpenUserProfile(comment.author.id)}
                        className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#489fff] transition-colors truncate cursor-pointer text-left"
                      >
                        {comment.author.name}
                      </button>
                      {isCommentFogsly ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                          Official Response
                        </span>
                      ) : comment.author.verified ? (
                        <CheckCircle2 className="w-3 h-3 text-[#489fff] shrink-0" />
                      ) : null}
                      <span className="text-[10px] text-slate-400 shrink-0">• {comment.createdAt}</span>
                    </div>

                    <button
                      onClick={() => onReportComment(post.id, comment.id)}
                      title="Report comment"
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal pl-8">
                    {comment.content}
                  </p>

                  {/* Comment Interaction Actions: Like, Dislike, Sentiment Score, Reply */}
                  <div className="flex items-center gap-3 pl-8 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {/* Comment Like Button */}
                    <button
                      onClick={() => onLikeComment(post.id, comment.id)}
                      className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        comment.likedByMe
                          ? 'text-[#489fff]'
                          : 'text-slate-500 hover:text-[#489fff]'
                      }`}
                      title="Like comment"
                    >
                      <ThumbsUp className={`w-3 h-3 ${comment.likedByMe ? 'fill-current' : ''}`} />
                      <span>{comment.likesCount || 0}</span>
                    </button>

                    {/* Comment Dislike Button */}
                    <button
                      onClick={() => onDislikeComment && onDislikeComment(post.id, comment.id)}
                      className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        comment.dislikedByMe
                          ? 'text-rose-500'
                          : 'text-slate-500 hover:text-rose-500'
                      }`}
                      title="Dislike comment"
                    >
                      <ThumbsDown className={`w-3 h-3 ${comment.dislikedByMe ? 'fill-current' : ''}`} />
                      <span>{comment.dislikesCount || 0}</span>
                    </button>

                    {/* Net Sentiment for Comment */}
                    {((comment.likesCount || 0) > 0 || (comment.dislikesCount || 0) > 0) && (
                      <span className={`text-[10px] font-mono font-semibold ${
                        (comment.likesCount || 0) - (comment.dislikesCount || 0) > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : (comment.likesCount || 0) - (comment.dislikesCount || 0) < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}>
                        Score: {(comment.likesCount || 0) - (comment.dislikesCount || 0) > 0 ? `+${(comment.likesCount || 0) - (comment.dislikesCount || 0)}` : (comment.likesCount || 0) - (comment.dislikesCount || 0)}
                      </span>
                    )}

                    {/* Inline Reply Trigger Button */}
                    <button
                      onClick={() => {
                        if (activeReplyTarget?.commentId === comment.id) {
                          setActiveReplyTarget(null);
                        } else {
                          setActiveReplyTarget({
                            commentId: comment.id,
                            authorName: comment.author.name,
                          });
                          setReplyInputText(`@${comment.author.name} `);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#489fff] transition-colors cursor-pointer"
                    >
                      <Reply className="w-3 h-3" />
                      <span>Reply</span>
                    </button>

                    {comment.replies && comment.replies.length > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {comment.replies.length} {comment.replies.length === 1 ? 'sub-comment' : 'sub-comments'}
                      </span>
                    )}
                  </div>

                  {/* Sub-Comments / Replies Thread (Nested Conversation) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 sm:ml-8 pl-3 border-l-2 border-slate-200/80 dark:border-slate-800 space-y-2.5 mt-2.5 pt-1">
                      {comment.replies.map((reply) => {
                        const isReplyFogsly = reply.author.id.startsWith('fogsly') || reply.author.name.toLowerCase().includes('fogsly');
                        return (
                        <div
                          key={reply.id}
                          className={`p-2.5 rounded-lg border space-y-1.5 ${
                            isReplyFogsly
                              ? 'bg-blue-50/80 dark:bg-blue-950/35 border-blue-300/80 dark:border-blue-800/70 shadow-2xs'
                              : 'bg-white/70 dark:bg-[#070A10]/60 border-slate-200/60 dark:border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <button
                                onClick={() => onOpenUserProfile(reply.author.id)}
                                className="cursor-pointer focus:outline-none shrink-0"
                              >
                                <img
                                  src={reply.author.avatar}
                                  alt={reply.author.name}
                                  className={`w-5 h-5 rounded-full object-cover ${
                                    isReplyFogsly
                                      ? 'ring-1 ring-blue-500'
                                      : 'border border-slate-200 dark:border-slate-700'
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => onOpenUserProfile(reply.author.id)}
                                className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#489fff] transition-colors truncate cursor-pointer text-left"
                              >
                                {reply.author.name}
                              </button>
                              {isReplyFogsly ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                  <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />
                                  Official
                                </span>
                              ) : reply.author.verified ? (
                                <CheckCircle2 className="w-3 h-3 text-[#489fff] shrink-0" />
                              ) : null}
                              <span className="text-[10px] text-slate-400 shrink-0">• {reply.createdAt}</span>
                            </div>

                            {/* Reply to another user tag indicator */}
                            {reply.replyingToAuthorName && (
                              <span className="text-[10px] font-mono text-[#489fff] bg-[#489fff]/10 px-1.5 py-0.5 rounded">
                                @{reply.replyingToAuthorName}
                              </span>
                            )}
                          </div>

                          {/* Sub-comment content */}
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal pl-7">
                            {reply.content}
                          </p>

                          {/* Sub-comment Actions: Like, Dislike, Sentiment Score, Reply */}
                          <div className="flex items-center gap-3 pl-7 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            {/* Like Sub-comment */}
                            <button
                              onClick={() => onLikeReply && onLikeReply(post.id, comment.id, reply.id)}
                              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                reply.likedByMe
                                  ? 'text-[#489fff]'
                                  : 'text-slate-500 hover:text-[#489fff]'
                              }`}
                              title="Like reply"
                            >
                              <ThumbsUp className={`w-3 h-3 ${reply.likedByMe ? 'fill-current' : ''}`} />
                              <span>{reply.likesCount || 0}</span>
                            </button>

                            {/* Dislike Sub-comment */}
                            <button
                              onClick={() => onDislikeReply && onDislikeReply(post.id, comment.id, reply.id)}
                              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                reply.dislikedByMe
                                  ? 'text-rose-500'
                                  : 'text-slate-500 hover:text-rose-500'
                              }`}
                              title="Dislike reply"
                            >
                              <ThumbsDown className={`w-3 h-3 ${reply.dislikedByMe ? 'fill-current' : ''}`} />
                              <span>{reply.dislikesCount || 0}</span>
                            </button>

                            {/* Sub-comment Sentiment Score */}
                            {((reply.likesCount || 0) > 0 || (reply.dislikesCount || 0) > 0) && (
                              <span className={`text-[10px] font-mono font-semibold ${
                                (reply.likesCount || 0) - (reply.dislikesCount || 0) > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : (reply.likesCount || 0) - (reply.dislikesCount || 0) < 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-slate-400'
                              }`}>
                                Score: {(reply.likesCount || 0) - (reply.dislikesCount || 0) > 0 ? `+${(reply.likesCount || 0) - (reply.dislikesCount || 0)}` : (reply.likesCount || 0) - (reply.dislikesCount || 0)}
                              </span>
                            )}

                            {/* Reply within conversation thread */}
                            <button
                              onClick={() => {
                                setActiveReplyTarget({
                                  commentId: comment.id,
                                  authorName: reply.author.name,
                                });
                                setReplyInputText(`@${reply.author.name} `);
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#489fff] transition-colors cursor-pointer"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                  {/* Inline Sub-Comment Composer (Active when user clicks Reply) */}
                  {activeReplyTarget?.commentId === comment.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(e, comment.id)}
                      className="ml-4 sm:ml-8 pl-3 mt-2 border-l-2 border-[#489fff] space-y-2 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#489fff] font-medium bg-[#489fff]/10 px-2.5 py-1 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <CornerDownRight className="w-3 h-3" />
                          <span>Replying to {activeReplyTarget.authorName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyTarget(null);
                            setReplyInputText('');
                          }}
                          className="hover:text-slate-700 dark:hover:text-white p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder={`Write a sub-comment reply to ${activeReplyTarget.authorName}...`}
                          value={replyInputText}
                          onChange={(e) => setReplyInputText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#489fff]"
                        />
                        <button
                          type="submit"
                          disabled={!replyInputText.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#489fff] hover:bg-[#3ba0ff] text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 dark:bg-[#081440]/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No replies yet. Be the first to start the conversation!
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export const PostCard = memo(PostCardComponent);
export default PostCard;
