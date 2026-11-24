export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  url: string;
  name: string;
  size: number;
}

export interface JobConversation {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  proposalId: string;
  lastMessage: string;
  lastMessageTime: Date;
  clientUnreadCount: number;
  freelancerUnreadCount: number;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface JobChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'client' | 'freelancer' | 'system';
  senderName: string;
  message: string;
  messageType: 'text' | 'project-started' | 'project-completed' | 'system';
  attachments?: MessageAttachment[];
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobMessageData {
  conversationId: string;
  message: string;
  messageType?: 'text';
  attachments?: File[];
}
