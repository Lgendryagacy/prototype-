export type CommunityPostType = 
  | 'question' 
  | 'poll' 
  | 'discussion' 
  | 'networking' 
  | 'opportunity' 
  | 'event' 
  | 'announcement';

export type PostStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface CommunityAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  skills?: string[];
  interests?: string[];
  lookingFor?: string;
  offering?: string;
  company?: string;
  location?: string;
  isCurrentUser?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPollData {
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface CommunityNetworkingData {
  role: string;
  skills: string[];
  lookingFor: string;
  offering: string;
  location?: string;
}

export interface CommunityOpportunityData {
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Internship' | 'Full-time' | 'Contract' | 'Hybrid';
  country: string;
  description: string;
  stipendOrSalary?: string;
  targetJobId?: string;
  tags?: string[];
}

export interface CommunityEventData {
  title: string;
  location: string;
  date: string;
  time?: string;
  organizer?: string;
  targetEventId?: string;
  description?: string;
}

export interface CommunityCommentReply {
  id: string;
  commentId: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
  likesCount: number;
  dislikesCount?: number;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  replyingToAuthorName?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
  likesCount: number;
  dislikesCount?: number;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  isReported?: boolean;
  replies: CommunityCommentReply[];
}

export interface CommunityPost {
  id: string;
  communityId: string; // Allows future multi-community support e.g. 'fogsly-universal', 'university-nust', 'startup-hub'
  author: CommunityAuthor;
  type: CommunityPostType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  status: PostStatus;
  rejectionReason?: string;
  viewsCount?: number;
  likesCount: number;
  dislikesCount?: number;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  savedByMe?: boolean;
  reportsCount?: number;
  isReportedByMe?: boolean;
  isPinned?: boolean;
  isFogslyExclusive?: boolean;
  fogslyBadgeText?: string;
  pollData?: CommunityPollData;
  networkingData?: CommunityNetworkingData;
  opportunityData?: CommunityOpportunityData;
  eventData?: CommunityEventData;
  commentsCount: number;
  comments: CommunityComment[];
}

export interface CommunityNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'approval' | 'rejection' | 'reply' | 'comment' | 'connection' | 'mention' | 'like' | 'opportunity' | 'announcement';
  targetPostId?: string;
  senderName?: string;
  senderAvatar?: string;
  actionSnippet?: string;
}

export interface CommunityConnection {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  bio?: string;
  location?: string;
  status: 'connected' | 'pending' | 'suggested';
}

export type CommunityCategoryFilter = 
  | 'all' 
  | 'exclusive'
  | 'question' 
  | 'poll' 
  | 'discussion' 
  | 'opportunity' 
  | 'networking' 
  | 'event'
  | 'announcement';

export type CommunityCategoryTab = 
  | 'all' 
  | 'exclusive'
  | 'questions' 
  | 'polls' 
  | 'discussions' 
  | 'opportunities' 
  | 'networking' 
  | 'events'
  | 'announcements';

export type CommunitySortOption = 'latest' | 'trending' | 'top' | 'discussed';

export type CommunityViewMode = 'detailed' | 'compact';

export type CommunitySidebarTab = 
  | 'home' 
  | 'discover' 
  | 'my-activity' 
  | 'saved' 
  | 'my-connections';
