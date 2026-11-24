import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  HelpCircle, 
  BarChart2, 
  MessageSquare, 
  Briefcase, 
  Users, 
  ArrowUp,
  Search,
  CheckCircle2,
  X,
  Check,
  Coins,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { 
  CommunityPost, 
  CommunityCategoryTab, 
  CommunitySortOption, 
  CommunityViewMode,
  CommunityNotification,
  CommunityConnection,
  CommunityAuthor 
} from '../components/community/types';
import { 
  getStoredPosts, 
  saveStoredPosts, 
  getStoredPendingPosts, 
  saveStoredPendingPosts,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredConnections,
  saveStoredConnections,
} from '../components/community/communityData';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { CommunitySidebarRight } from '../components/community/CommunitySidebarRight';
import { PostCard } from '../components/community/PostCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { AdminModerationModal } from '../components/community/AdminModerationModal';
import { UserProfileModal } from '../components/community/UserProfileModal';
import { ReportModal } from '../components/community/ReportModal';
import { OpportunityDetailModal } from '../components/community/OpportunityDetailModal';
import { EventDetailModal } from '../components/community/EventDetailModal';
import { CommunityPostSkeleton } from '../components/common/FeedSkeletons';
import { RealtimeNotificationBanner } from '../components/community/RealtimeNotificationBanner';
import { CommunityGlobalSearchBar, SearchFilterMode } from '../components/community/CommunityGlobalSearchBar';
import { playNotificationChime } from '../utils/soundUtils';

interface CommunityPageProps {
  navigate?: (route: string) => void;
  currentUser?: any;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  navigate,
  currentUser,
}) => {
  // State: Posts & Moderation
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);
  const [reportedPosts, setReportedPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [connections, setConnections] = useState<CommunityConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation, Filter & Sort
  const [activeCategory, setActiveCategory] = useState<CommunityCategoryTab>('all');
  const [sortBy, setSortBy] = useState<CommunitySortOption>('latest');
  const [viewMode, setViewMode] = useState<CommunityViewMode>('detailed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchMode, setSearchMode] = useState<SearchFilterMode>('all');

  // Real-time Notification State
  const [realtimeAlert, setRealtimeAlert] = useState<CommunityNotification | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  // Toast & Back to top
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [inspectingAuthor, setInspectingAuthor] = useState<CommunityAuthor | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportingCommentId, setReportingCommentId] = useState<{ postId: string; commentId: string } | null>(null);
  const [inspectingOpportunityPost, setInspectingOpportunityPost] = useState<CommunityPost | null>(null);
  const [inspectingEventPost, setInspectingEventPost] = useState<CommunityPost | null>(null);

  // Initialize data from LocalStorage with skeleton state
  useEffect(() => {
    setIsLoading(true);
    setPosts(getStoredPosts());
    setPendingPosts(getStoredPendingPosts());
    setNotifications(getStoredNotifications());
    setConnections(getStoredConnections());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 320);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State update helpers with persistence
  const updatePosts = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    saveStoredPosts(newPosts);
  };

  const updatePending = (newPending: CommunityPost[]) => {
    setPendingPosts(newPending);
    saveStoredPendingPosts(newPending);
  };

  const updateNotifications = (newNotifs: CommunityNotification[]) => {
    setNotifications(newNotifs);
    saveStoredNotifications(newNotifs);
  };

  const updateConnections = (newConns: CommunityConnection[]) => {
    setConnections(newConns);
    saveStoredConnections(newConns);
  };

  // Post Actions
  const handleLikePost = useCallback((postId: string) => {
    setPosts((prev) => {
      let targetPost: CommunityPost | undefined;
      let becameLiked = false;
      const updated = prev.map((p) => {
        if (p.id === postId) {
          targetPost = p;
          const currentlyLiked = !!p.likedByMe;
          const currentlyDisliked = !!p.dislikedByMe;
          let newLikes = p.likesCount || 0;
          let newDislikes = p.dislikesCount || 0;

          if (currentlyLiked) {
            newLikes = Math.max(0, newLikes - 1);
            return { ...p, likedByMe: false, likesCount: newLikes };
          } else {
            becameLiked = true;
            newLikes += 1;
            if (currentlyDisliked) {
              newDislikes = Math.max(0, newDislikes - 1);
            }
            return {
              ...p,
              likedByMe: true,
              dislikedByMe: false,
              likesCount: newLikes,
              dislikesCount: newDislikes,
            };
          }
        }
        return p;
      });
      saveStoredPosts(updated);

      if (becameLiked && targetPost) {
        const actorName = currentUser?.displayName || currentUser?.name || 'You';
        const notif: CommunityNotification = {
          id: `notif-like-${Date.now()}`,
          title: `${actorName} liked your discussion`,
          message: `"${targetPost.title.substring(0, 50)}${targetPost.title.length > 50 ? '...' : ''}" received a new like!`,
          timestamp: 'Just now',
          read: false,
          type: 'like',
          targetPostId: postId,
          senderName: actorName,
          senderAvatar: currentUser?.photoURL || currentUser?.avatar || undefined,
        };
        setNotifications((nPrev) => {
          const nUp = [notif, ...nPrev];
          saveStoredNotifications(nUp);
          return nUp;
        });
        setRealtimeAlert(notif);
        playNotificationChime();
      }

      return updated;
    });
  }, [currentUser]);

  const handleDislikePost = useCallback((postId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const currentlyLiked = !!p.likedByMe;
          const currentlyDisliked = !!p.dislikedByMe;
          let newLikes = p.likesCount || 0;
          let newDislikes = p.dislikesCount || 0;

          if (currentlyDisliked) {
            newDislikes = Math.max(0, newDislikes - 1);
            return { ...p, dislikedByMe: false, dislikesCount: newDislikes };
          } else {
            newDislikes += 1;
            if (currentlyLiked) {
              newLikes = Math.max(0, newLikes - 1);
            }
            return {
              ...p,
              dislikedByMe: true,
              likedByMe: false,
              likesCount: newLikes,
              dislikesCount: newDislikes,
            };
          }
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });
  }, []);

  const handleIncrementView = useCallback((postId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            viewsCount: (p.viewsCount || 0) + 1,
          };
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });
  }, []);

  const handleSavePost = useCallback((postId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const saved = !p.savedByMe;
          return { ...p, savedByMe: saved };
        }
        return p;
      });
      saveStoredPosts(updated);
      const post = updated.find((p) => p.id === postId);
      showToast(post?.savedByMe ? 'Saved to bookmarks' : 'Removed from bookmarks');
      return updated;
    });
  }, [showToast]);

  const handleVotePoll = useCallback((postId: string, optionId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId && p.pollData) {
          const prevVotedId = p.pollData.userVotedOptionId;
          if (prevVotedId === optionId) return p;

          const updatedOptions = p.pollData.options.map((opt) => {
            if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
            if (opt.id === prevVotedId) return { ...opt, votes: Math.max(0, opt.votes - 1) };
            return opt;
          });

          const totalVotes = updatedOptions.reduce((acc, o) => acc + o.votes, 0);

          return {
            ...p,
            pollData: {
              ...p.pollData,
              totalVotes,
              userVotedOptionId: optionId,
              options: updatedOptions,
            },
          };
        }
        return p;
      });
      saveStoredPosts(updated);
      showToast('Vote recorded');
      return updated;
    });
  }, [showToast]);

  const handleAddComment = useCallback((postId: string, text: string) => {
    const actorName = currentUser?.displayName || currentUser?.name || 'You (Member)';
    const newComment = {
      id: `comm-${Date.now()}`,
      postId,
      author: {
        id: currentUser?.uid || 'user-current',
        name: actorName,
        role: 'Community Builder',
        avatar: currentUser?.photoURL || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: false,
        isCurrentUser: true,
      },
      content: text,
      createdAt: 'Just now',
      likesCount: 0,
      dislikesCount: 0,
      likedByMe: false,
      dislikedByMe: false,
      replies: [],
    };

    setPosts((prev) => {
      let targetPost: CommunityPost | undefined;
      const updated = prev.map((p) => {
        if (p.id === postId) {
          targetPost = p;
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      });
      saveStoredPosts(updated);

      if (targetPost) {
        const notif: CommunityNotification = {
          id: `notif-comm-${Date.now()}`,
          title: `${actorName} commented on discussion`,
          message: `"${text.substring(0, 65)}${text.length > 65 ? '...' : ''}"`,
          timestamp: 'Just now',
          read: false,
          type: 'comment',
          targetPostId: postId,
          senderName: actorName,
          senderAvatar: newComment.author.avatar,
        };

        setNotifications((nPrev) => {
          const nUp = [notif, ...nPrev];
          saveStoredNotifications(nUp);
          return nUp;
        });
        setRealtimeAlert(notif);
        playNotificationChime();
      }

      showToast('Comment published');
      return updated;
    });
  }, [currentUser, showToast]);

  const handleAddReply = useCallback((postId: string, commentId: string, text: string, replyingToAuthorName?: string) => {
    const actorName = currentUser?.displayName || currentUser?.name || 'You (Member)';
    const newReply = {
      id: `reply-${Date.now()}`,
      commentId,
      author: {
        id: currentUser?.uid || 'user-current',
        name: actorName,
        role: 'Community Builder',
        avatar: currentUser?.photoURL || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: false,
        isCurrentUser: true,
      },
      content: text,
      createdAt: 'Just now',
      likesCount: 0,
      dislikesCount: 0,
      likedByMe: false,
      dislikedByMe: false,
      replyingToAuthorName,
    };

    setPosts((prev) => {
      let targetPost: CommunityPost | undefined;
      const updated = prev.map((p) => {
        if (p.id === postId) {
          targetPost = p;
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            return c;
          });
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: updatedComments,
          };
        }
        return p;
      });
      saveStoredPosts(updated);

      const recipient = replyingToAuthorName || 'your comment';
      const notif: CommunityNotification = {
        id: `notif-reply-${Date.now()}`,
        title: `${actorName} replied to ${recipient}`,
        message: `"${text.substring(0, 65)}${text.length > 65 ? '...' : ''}"`,
        timestamp: 'Just now',
        read: false,
        type: 'reply',
        targetPostId: postId,
        senderName: actorName,
        senderAvatar: newReply.author.avatar,
      };

      setNotifications((nPrev) => {
        const nUp = [notif, ...nPrev];
        saveStoredNotifications(nUp);
        return nUp;
      });
      setRealtimeAlert(notif);
      playNotificationChime();
      showToast('Reply published to conversation');

      return updated;
    });
  }, [currentUser, showToast]);

  const handleLikeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) => {
      let becameLiked = false;
      let targetCommentSnippet = '';
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              targetCommentSnippet = c.content;
              const currentlyLiked = !!c.likedByMe;
              const currentlyDisliked = !!c.dislikedByMe;
              let newLikes = c.likesCount || 0;
              let newDislikes = c.dislikesCount || 0;

              if (currentlyLiked) {
                newLikes = Math.max(0, newLikes - 1);
                return { ...c, likedByMe: false, likesCount: newLikes };
              } else {
                becameLiked = true;
                newLikes += 1;
                if (currentlyDisliked) {
                  newDislikes = Math.max(0, newDislikes - 1);
                }
                return {
                  ...c,
                  likedByMe: true,
                  dislikedByMe: false,
                  likesCount: newLikes,
                  dislikesCount: newDislikes,
                };
              }
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      saveStoredPosts(updated);

      if (becameLiked) {
        const actorName = currentUser?.displayName || currentUser?.name || 'Someone';
        const notif: CommunityNotification = {
          id: `notif-like-comm-${Date.now()}`,
          title: `${actorName} liked your comment`,
          message: `"${targetCommentSnippet.substring(0, 50)}${targetCommentSnippet.length > 50 ? '...' : ''}" received a reaction!`,
          timestamp: 'Just now',
          read: false,
          type: 'like',
          targetPostId: postId,
          senderName: actorName,
        };

        setNotifications((nPrev) => {
          const nUp = [notif, ...nPrev];
          saveStoredNotifications(nUp);
          return nUp;
        });
        setRealtimeAlert(notif);
        playNotificationChime();
      }

      return updated;
    });
  }, [currentUser]);

  const handleDislikeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              const currentlyLiked = !!c.likedByMe;
              const currentlyDisliked = !!c.dislikedByMe;
              let newLikes = c.likesCount || 0;
              let newDislikes = c.dislikesCount || 0;

              if (currentlyDisliked) {
                newDislikes = Math.max(0, newDislikes - 1);
                return { ...c, dislikedByMe: false, dislikesCount: newDislikes };
              } else {
                newDislikes += 1;
                if (currentlyLiked) {
                  newLikes = Math.max(0, newLikes - 1);
                }
                return {
                  ...c,
                  dislikedByMe: true,
                  likedByMe: false,
                  likesCount: newLikes,
                  dislikesCount: newDislikes,
                };
              }
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });
  }, []);

  const handleLikeReply = useCallback((postId: string, commentId: string, replyId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              const updatedReplies = (c.replies || []).map((r) => {
                if (r.id === replyId) {
                  const currentlyLiked = !!r.likedByMe;
                  const currentlyDisliked = !!r.dislikedByMe;
                  let newLikes = r.likesCount || 0;
                  let newDislikes = r.dislikesCount || 0;

                  if (currentlyLiked) {
                    newLikes = Math.max(0, newLikes - 1);
                    return { ...r, likedByMe: false, likesCount: newLikes };
                  } else {
                    newLikes += 1;
                    if (currentlyDisliked) {
                      newDislikes = Math.max(0, newDislikes - 1);
                    }
                    return {
                      ...r,
                      likedByMe: true,
                      dislikedByMe: false,
                      likesCount: newLikes,
                      dislikesCount: newDislikes,
                    };
                  }
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });
  }, []);

  const handleDislikeReply = useCallback((postId: string, commentId: string, replyId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              const updatedReplies = (c.replies || []).map((r) => {
                if (r.id === replyId) {
                  const currentlyLiked = !!r.likedByMe;
                  const currentlyDisliked = !!r.dislikedByMe;
                  let newLikes = r.likesCount || 0;
                  let newDislikes = r.dislikesCount || 0;

                  if (currentlyDisliked) {
                    newDislikes = Math.max(0, newDislikes - 1);
                    return { ...r, dislikedByMe: false, dislikesCount: newDislikes };
                  } else {
                    newDislikes += 1;
                    if (currentlyLiked) {
                      newLikes = Math.max(0, newLikes - 1);
                    }
                    return {
                      ...r,
                      dislikedByMe: true,
                      likedByMe: false,
                      likesCount: newLikes,
                      dislikesCount: newDislikes,
                    };
                  }
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });
  }, []);

  // Post Creation
  const handleCreatePost = (newPost: Partial<CommunityPost>) => {
    const completePost: CommunityPost = {
      id: newPost.id || `post-${Date.now()}`,
      communityId: 'fogsly-universal',
      author: newPost.author!,
      type: newPost.type || 'question',
      title: newPost.title || '',
      content: newPost.content || '',
      tags: newPost.tags || ['General'],
      createdAt: 'Just now',
      likesCount: 0,
      commentsCount: 0,
      comments: [],
      status: 'pending',
      pollData: newPost.pollData,
      networkingData: newPost.networkingData,
      opportunityData: newPost.opportunityData,
      eventData: newPost.eventData,
    };

    const newPending = [completePost, ...pendingPosts];
    updatePending(newPending);
    showToast('Post submitted for review. Moderators review submissions promptly.');
  };

  // Moderation
  const handleApprovePost = (postId: string) => {
    const postToApprove = pendingPosts.find((p) => p.id === postId);
    if (!postToApprove) return;

    const approvedPost: CommunityPost = {
      ...postToApprove,
      status: 'approved',
      createdAt: 'Just now',
    };

    updatePending(pendingPosts.filter((p) => p.id !== postId));
    updatePosts([approvedPost, ...posts]);

    const newNotif: CommunityNotification = {
      id: `notif-${Date.now()}`,
      type: 'approval',
      title: 'Post Approved & Published',
      message: `Your post "${approvedPost.title}" is now live in the community.`,
      timestamp: 'Just now',
      read: false,
      targetPostId: approvedPost.id,
    };
    updateNotifications([newNotif, ...notifications]);
    showToast('Post approved and published');
  };

  const handleRejectPost = (postId: string, reason?: string) => {
    updatePending(pendingPosts.filter((p) => p.id !== postId));
    showToast('Post submission declined');
  };

  const handleReportPost = (postId: string) => {
    setReportingPostId(postId);
  };

  const handleConfirmReport = (reason: string, details: string) => {
    if (reportingPostId) {
      const post = posts.find((p) => p.id === reportingPostId);
      if (post && !reportedPosts.some((r) => r.id === post.id)) {
        setReportedPosts([...reportedPosts, post]);
      }
      setReportingPostId(null);
      showToast('Thank you. Content flagged for community moderators.');
    }
  };

  const handleDismissReport = (postId: string) => {
    setReportedPosts(reportedPosts.filter((p) => p.id !== postId));
  };

  const handleRemoveReportedContent = (postId: string) => {
    setReportedPosts(reportedPosts.filter((p) => p.id !== postId));
    updatePosts(posts.filter((p) => p.id !== postId));
    showToast('Content removed');
  };

  const handleToggleConnect = (connectionIdOrUserId: string) => {
    const updatedConns = connections.map((conn) => {
      if (conn.id === connectionIdOrUserId || conn.userId === connectionIdOrUserId) {
        const nextStatus = conn.status === 'connected' ? 'suggested' : 'connected';
        return { ...conn, status: nextStatus as any };
      }
      return conn;
    });
    updateConnections(updatedConns);
    const isConnected = updatedConns.find(
      (c) => c.id === connectionIdOrUserId || c.userId === connectionIdOrUserId
    )?.status === 'connected';
    showToast(isConnected ? 'Connected' : 'Connection removed');
  };

  const handleMarkAllNotifsRead = () => {
    updateNotifications(notifications.map((n) => ({ ...n, read: true })));
    showToast('Notifications marked as read');
  };

  const handleNotificationClick = (notif: CommunityNotification) => {
    // Mark clicked notification as read
    updateNotifications(
      notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    if (notif.targetPostId) {
      setHighlightedPostId(notif.targetPostId);
      setTimeout(() => {
        setHighlightedPostId(null);
      }, 4000);

      // Reset filter if target post is hidden
      const target = posts.find((p) => p.id === notif.targetPostId);
      if (target && activeCategory !== 'all') {
        setActiveCategory('all');
      }

      setTimeout(() => {
        const postEl = document.getElementById(`community-post-${notif.targetPostId}`);
        if (postEl) {
          postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  };

  // Simulate an incoming peer action for real-time testing
  const handleTriggerTestNotification = useCallback(() => {
    const sampleAuthors = [
      { name: 'Zainab Tariq', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { name: 'Bilal Khan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { name: 'Hamza Farooq', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    ];
    const pickedAuthor = sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)];
    const isLike = Math.random() > 0.5;
    const target = posts[Math.floor(Math.random() * Math.min(3, posts.length))] || posts[0];

    const notif: CommunityNotification = {
      id: `notif-test-${Date.now()}`,
      title: isLike 
        ? `${pickedAuthor.name} liked your post`
        : `${pickedAuthor.name} replied to your comment`,
      message: isLike
        ? `"${target?.title?.substring(0, 48) || 'Discussion'}..." received an endorsement`
        : `“Great technical writeup, looking forward to the 2026 cohort launch!”`,
      timestamp: 'Just now',
      read: false,
      type: isLike ? 'like' : 'reply',
      targetPostId: target?.id,
      senderName: pickedAuthor.name,
      senderAvatar: pickedAuthor.avatar,
    };

    setNotifications((prev) => {
      const next = [notif, ...prev];
      saveStoredNotifications(next);
      return next;
    });
    setRealtimeAlert(notif);
    playNotificationChime();
    showToast('Live notification simulated');
  }, [posts, showToast]);

  // Ambient peer engagement simulator (gentle real-time activity while browsing)
  useEffect(() => {
    if (posts.length === 0) return;

    const timer = setTimeout(() => {
      const targetPost = posts[0];
      const notif: CommunityNotification = {
        id: `notif-ambient-${Date.now()}`,
        title: 'Zainab Tariq liked your response',
        message: `Endorsed your architectural answer in "${targetPost?.title.substring(0, 45)}..."`,
        timestamp: 'Just now',
        read: false,
        type: 'like',
        targetPostId: targetPost?.id,
        senderName: 'Zainab Tariq',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      };

      setNotifications((prev) => {
        const next = [notif, ...prev];
        saveStoredNotifications(next);
        return next;
      });
      setRealtimeAlert(notif);
      playNotificationChime();
    }, 25000);

    return () => clearTimeout(timer);
  }, [posts]);

  const handleOpenAuthorProfile = (authorId: string) => {
    const postWithAuthor = posts.find((p) => p.author.id === authorId);
    if (postWithAuthor) {
      setInspectingAuthor(postWithAuthor.author);
    } else {
      const conn = connections.find((c) => c.userId === authorId);
      if (conn) {
        setInspectingAuthor({
          id: conn.userId,
          name: conn.name,
          role: conn.role,
          avatar: conn.avatar,
          bio: conn.bio,
          skills: conn.skills,
          verified: true,
        });
      }
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: posts.length,
      exclusive: posts.filter((p) => p.isFogslyExclusive || p.author.id.includes('fogsly')).length,
      discussions: posts.filter((p) => p.type === 'discussion').length,
      questions: posts.filter((p) => p.type === 'question').length,
      polls: posts.filter((p) => p.type === 'poll').length,
      opportunities: posts.filter((p) => p.type === 'opportunity').length,
      networking: posts.filter((p) => p.type === 'networking').length,
    };
  }, [posts]);

  // Filter & Sort Feed
  const displayedPosts = useMemo(() => {
    let list = [...posts];

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'exclusive') {
        list = list.filter((p) => p.isFogslyExclusive || p.author.id.includes('fogsly'));
      }
      else if (activeCategory === 'discussions') list = list.filter((p) => p.type === 'discussion');
      else if (activeCategory === 'questions') list = list.filter((p) => p.type === 'question');
      else if (activeCategory === 'polls') list = list.filter((p) => p.type === 'poll');
      else if (activeCategory === 'opportunities') list = list.filter((p) => p.type === 'opportunity');
      else if (activeCategory === 'networking') list = list.filter((p) => p.type === 'networking');
    }

    // Keyword, Tag, and Author search based on searchMode
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanTagQuery = q.replace(/^#/, '');

      list = list.filter((p) => {
        if (searchMode === 'keywords') {
          return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
        }
        if (searchMode === 'tags') {
          return p.tags?.some((t) => t.toLowerCase().includes(cleanTagQuery));
        }
        if (searchMode === 'authors') {
          return (
            p.author.name.toLowerCase().includes(q) ||
            p.author.role?.toLowerCase().includes(q) ||
            p.author.company?.toLowerCase().includes(q)
          );
        }
        // Mode 'all': match any field
        return (
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(cleanTagQuery)) ||
          p.opportunityData?.company?.toLowerCase().includes(q) ||
          p.opportunityData?.title?.toLowerCase().includes(q)
        );
      });
    }

    // Hashtag chip filter
    if (selectedTag) {
      const cleanTag = selectedTag.toLowerCase().replace(/^#/, '');
      list = list.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === cleanTag)
      );
    }

    // Sorting
    if (sortBy === 'top') {
      list.sort((a, b) => ((b.likesCount - (b.dislikesCount || 0)) - (a.likesCount - (a.dislikesCount || 0))));
    } else if (sortBy === 'trending') {
      list.sort(
        (a, b) =>
          ((b.viewsCount || 0) * 0.1 + b.commentsCount * 4 + b.likesCount * 2 - (b.dislikesCount || 0)) -
          ((a.viewsCount || 0) * 0.1 + a.commentsCount * 4 + a.likesCount * 2 - (a.dislikesCount || 0))
      );
    } else if (sortBy === 'discussed') {
      list.sort((a, b) => b.commentsCount - a.commentsCount);
    } else {
      // Latest: pinned & exclusive first, then chronological
      list.sort((a, b) => {
        const aScore = (a.isPinned ? 10 : 0) + (a.isFogslyExclusive ? 5 : 0);
        const bScore = (b.isPinned ? 10 : 0) + (b.isFogslyExclusive ? 5 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return 0;
      });
    }

    return list;
  }, [posts, activeCategory, selectedTag, searchQuery, searchMode, sortBy]);

  // Partition posts for prioritized layout
  const { officialPosts, communityPosts } = useMemo(() => {
    const official = displayedPosts.filter(
      (p) => p.isFogslyExclusive || p.author.id.includes('fogsly')
    );
    const community = displayedPosts.filter(
      (p) => !p.isFogslyExclusive && !p.author.id.includes('fogsly')
    );
    return { officialPosts: official, communityPosts: community };
  }, [displayedPosts]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors relative">
      {/* Real-time Floating Notification Alert Banner */}
      <RealtimeNotificationBanner
        notification={realtimeAlert}
        onDismiss={() => setRealtimeAlert(null)}
        onView={(targetPostId) => {
          if (targetPostId) {
            handleNotificationClick({
              id: 'temp',
              title: '',
              message: '',
              timestamp: '',
              read: true,
              type: 'comment',
              targetPostId,
            });
          }
        }}
      />

      {/* Minimalist Top Header Bar */}
      <CommunityHeader
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreatePostClick={() => setIsCreateModalOpen(true)}
        pendingCount={pendingPosts.length}
        onOpenModeration={() => setIsAdminModalOpen(true)}
        isAdmin={true}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkAllNotifsRead}
        onNotificationClick={handleNotificationClick}
        onTriggerTestNotification={handleTriggerTestNotification}
        categoryCounts={categoryCounts}
      />

      {/* Main 2-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Feed Column */}
          <section className="flex-1 min-w-0 space-y-5">
            {/* Dedicated Global Discovery Search Bar */}
            <CommunityGlobalSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchMode={searchMode}
              onSearchModeChange={setSearchMode}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              totalMatchesCount={displayedPosts.length}
              totalPostsCount={posts.length}
            />

            {/* Elevated Quick Composer Prompt */}
            <div className="bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser?.photoURL ||
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="You"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A10] hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal border border-slate-200/80 dark:border-slate-800/80 transition-colors cursor-pointer truncate"
                >
                  Start an architectural thread, ask a technical question, or pitch an escrow opportunity...
                </button>
              </div>

              {/* Quick Topic Triggers */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setActiveCategory('exclusive')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-800/60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Fogsly Official</span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#489fff]" />
                    <span>Ask Question</span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Run Poll</span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Gig / Opportunity</span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#489fff]" />
                    <span>Collaborate</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Peer-reviewed answers earn verified badges & reputation</span>
                </div>
              </div>
            </div>

            {/* Stream Mode Segmented Switcher */}
            <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-slate-100/90 dark:bg-[#0D1527] border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSelectedTag('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === 'all'
                      ? 'bg-white dark:bg-[#131F37] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>All Discussions</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                    {posts.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('exclusive');
                    setSelectedTag('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === 'exclusive'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 dark:text-sky-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>FOGSLY Official</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeCategory === 'exclusive'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  }`}>
                    {categoryCounts.exclusive || 0}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('discussions');
                    setSelectedTag('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === 'discussions'
                      ? 'bg-white dark:bg-[#131F37] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Community Peer Threads</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                    {categoryCounts.discussions || 0}
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center text-[11px] text-slate-400 px-2 shrink-0">
                <span>{displayedPosts.length} updates</span>
              </div>
            </div>

            {/* Active Filter Pill (if searching or tag clicked) */}
            {(selectedTag || searchQuery) && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Filter:</span>
                  {selectedTag && <span className="font-mono font-medium">#{selectedTag}</span>}
                  {searchQuery && <span>"{searchQuery}"</span>}
                </div>
                <button
                  onClick={() => {
                    setSelectedTag('');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}

            {/* Post Feed List & Skeletons */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <CommunityPostSkeleton key={n} />
                ))}
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No discussions found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or hashtag filter, or start a new thread for the community.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#081440] dark:bg-white text-white dark:text-[#081440] hover:bg-[#0d1d57] dark:hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : activeCategory === 'all' && !searchQuery.trim() && !selectedTag ? (
              /* Prioritized 2-Section Feed Layout */
              <div className="space-y-6">
                {/* 1. Featured FOGSLY Official Section */}
                {officialPosts.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between px-1 py-1.5 border-b border-blue-500/25 dark:border-blue-400/20">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                          F
                        </span>
                        <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                          <span>FOGSLY Official Ecosystem Publications</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                            {officialPosts.length} Priority Bulletins
                          </span>
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveCategory('exclusive')}
                        className="text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Official</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {officialPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          viewMode={viewMode}
                          onLikePost={handleLikePost}
                          onDislikePost={handleDislikePost}
                          onIncrementView={handleIncrementView}
                          onSavePost={handleSavePost}
                          onVotePoll={handleVotePoll}
                          onAddComment={handleAddComment}
                          onAddReply={handleAddReply}
                          onLikeComment={handleLikeComment}
                          onDislikeComment={handleDislikeComment}
                          onLikeReply={handleLikeReply}
                          onDislikeReply={handleDislikeReply}
                          onReportPost={handleReportPost}
                          onReportComment={(postId, commentId) => {
                            setReportingPostId(postId);
                            setReportingCommentId({ postId, commentId });
                          }}
                          onOpenOpportunity={(p) => setInspectingOpportunityPost(p)}
                          onOpenEvent={(p) => setInspectingEventPost(p)}
                          onOpenUserProfile={handleOpenAuthorProfile}
                          onConnectWithAuthor={handleToggleConnect}
                          onTagClick={(tag) => setSelectedTag(tag)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Community Peer Discussions Section */}
                <div className="pt-2 space-y-3.5">
                  <div className="flex items-center justify-between px-1 py-1.5 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                        <span>Community Peer Discussions</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {communityPosts.length} Threads
                        </span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Start Discussion</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        viewMode={viewMode}
                        onLikePost={handleLikePost}
                        onDislikePost={handleDislikePost}
                        onIncrementView={handleIncrementView}
                        onSavePost={handleSavePost}
                        onVotePoll={handleVotePoll}
                        onAddComment={handleAddComment}
                        onAddReply={handleAddReply}
                        onLikeComment={handleLikeComment}
                        onDislikeComment={handleDislikeComment}
                        onLikeReply={handleLikeReply}
                        onDislikeReply={handleDislikeReply}
                        onReportPost={handleReportPost}
                        onReportComment={(postId, commentId) => {
                          setReportingPostId(postId);
                          setReportingCommentId({ postId, commentId });
                        }}
                        onOpenOpportunity={(p) => setInspectingOpportunityPost(p)}
                        onOpenEvent={(p) => setInspectingEventPost(p)}
                        onOpenUserProfile={handleOpenAuthorProfile}
                        onConnectWithAuthor={handleToggleConnect}
                        onTagClick={(tag) => setSelectedTag(tag)}
                      />
                    ))}
                  </div>
                </div>

                {/* Subtle End of Feed mark */}
                <div className="py-6 text-center text-xs text-slate-400">
                  <span>Showing all {displayedPosts.length} discussions</span>
                </div>
              </div>
            ) : (
              /* Filtered / Category / Tag Stream */
              <div className="space-y-4">
                {activeCategory === 'exclusive' && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                      <span className="font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                        FOGSLY Official Verified Publications ({displayedPosts.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveCategory('all')}
                      className="text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                    >
                      Show All Feed
                    </button>
                  </div>
                )}

                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    viewMode={viewMode}
                    onLikePost={handleLikePost}
                    onDislikePost={handleDislikePost}
                    onIncrementView={handleIncrementView}
                    onSavePost={handleSavePost}
                    onVotePoll={handleVotePoll}
                    onAddComment={handleAddComment}
                    onAddReply={handleAddReply}
                    onLikeComment={handleLikeComment}
                    onDislikeComment={handleDislikeComment}
                    onLikeReply={handleLikeReply}
                    onDislikeReply={handleDislikeReply}
                    onReportPost={handleReportPost}
                    onReportComment={(postId, commentId) => {
                      setReportingPostId(postId);
                      setReportingCommentId({ postId, commentId });
                    }}
                    onOpenOpportunity={(p) => setInspectingOpportunityPost(p)}
                    onOpenEvent={(p) => setInspectingEventPost(p)}
                    onOpenUserProfile={handleOpenAuthorProfile}
                    onConnectWithAuthor={handleToggleConnect}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}

                {/* Subtle End of Feed mark */}
                <div className="py-6 text-center text-xs text-slate-400">
                  <span>Showing {displayedPosts.length} discussions</span>
                </div>
              </div>
            )}
          </section>

          {/* Right Rail: Trending Topics & Active Builders */}
          <CommunitySidebarRight
            connections={connections}
            onToggleConnect={handleToggleConnect}
            onTagClick={(tag) => setSelectedTag(tag)}
            selectedTag={selectedTag}
            onViewEventClick={() => {
              const eventPost = posts.find((p) => p.type === 'event');
              if (eventPost) setInspectingEventPost(eventPost);
            }}
            onOpenUserProfile={handleOpenAuthorProfile}
            onSelectCategory={(cat) => setActiveCategory(cat as any)}
          />
        </div>
      </main>

      {/* Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Non-Intrusive Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitPost={handleCreatePost}
        currentUser={currentUser}
      />

      <AdminModerationModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        pendingPosts={pendingPosts}
        reportedPosts={reportedPosts}
        onApprovePost={handleApprovePost}
        onRejectPost={handleRejectPost}
        onRemoveReportedContent={handleRemoveReportedContent}
        onDismissReport={handleDismissReport}
      />

      <UserProfileModal
        isOpen={!!inspectingAuthor}
        onClose={() => setInspectingAuthor(null)}
        author={inspectingAuthor}
        isConnected={connections.some(
          (c) => c.userId === inspectingAuthor?.id && c.status === 'connected'
        )}
        onToggleConnect={(authorId) => handleToggleConnect(authorId)}
        onSendMessage={(author) => {
          if (navigate) navigate('chat');
        }}
      />

      <OpportunityDetailModal
        isOpen={!!inspectingOpportunityPost}
        onClose={() => setInspectingOpportunityPost(null)}
        post={inspectingOpportunityPost}
        onDiscussClick={(postId) => {
          const postEl = document.getElementById(`community-post-${postId}`);
          if (postEl) postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        onApplyClick={() => {
          if (navigate) navigate('fog-jobs');
        }}
      />

      <EventDetailModal
        isOpen={!!inspectingEventPost}
        onClose={() => setInspectingEventPost(null)}
        post={inspectingEventPost}
        onDiscussClick={(postId) => {
          const postEl = document.getElementById(`community-post-${postId}`);
          if (postEl) postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        onRegisterClick={() => {
          if (navigate) navigate('events');
        }}
      />

      <ReportModal
        isOpen={!!reportingPostId}
        onClose={() => {
          setReportingPostId(null);
          setReportingCommentId(null);
        }}
        onSubmitReport={handleConfirmReport}
        targetType={reportingCommentId ? 'comment' : 'post'}
      />
    </div>
  );
};

export default CommunityPage;
