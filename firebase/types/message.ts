import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'brand';
  senderName: string;
  senderAvatar?: string;
  message: string;
  messageType: 'text' | 'service-list' | 'service-card' | 'service-inquiry' | 'services-payment-request';
  attachments?: MessageAttachment[];
  serviceData?: ServiceMessageData; // For service list or service card messages
  inquiryData?: ServiceInquiryData; // For service inquiry messages
  paymentData?: PaymentRequestData; // For payment request messages
  status: 'sending' | 'sent' | 'delivered' | 'read'; // Added 'sending' for optimistic updates
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string; // For videos and images
}

export interface ServiceMessageData {
  type: 'list' | 'card';
  brandId: string;
  services?: ServiceListItem[]; // For welcome message
  totalServices?: number; // Total count of services (for "Explore More" button)
  service?: ServiceListItem; // For single service card
}

export interface ServiceListItem {
  id: string;
  name: string;
  price: string;
  deliveryTime: string;
  image?: string;
}

export interface ServiceInquiryData {
  serviceName: string;
  packageName?: string;
  price?: string;
  deliveryTime?: string;
  hourlyRate?: string;
  minimumHours?: number;
}

export interface PaymentRequestData {
  requestId: string; // Unique ID for this payment request
  title: string; // Service title
  description: string; // Service description
  priceInPKR: number; // Original price in PKR
  priceInFOG: number; // Converted price in FOG coins
  platformFee: number; // 3% platform commission in FOG
  brandReceives: number; // Amount brand receives (97%) in FOG
  conversionRate: number; // FOG to PKR rate used
  status: 'pending' | 'paid' | 'rejected' | 'cancelled';
  paidAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  transactionId?: string; // Transaction ID after payment
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  lastMessage: string;
  lastMessageType: 'text' | 'service-list' | 'service-card' | 'image' | 'video' | 'pdf' | 'services-payment-request';
  lastMessageTime: Date;
  unreadCount: number;
  unreadBy: 'user' | 'brand' | 'none'; // Who has unread messages
  isOnline: boolean; // Brand online status
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageData {
  conversationId: string;
  message: string;
  messageType?: 'text' | 'service-list' | 'service-card' | 'service-inquiry' | 'services-payment-request';
  attachments?: File[];
  serviceData?: ServiceMessageData;
  inquiryData?: ServiceInquiryData;
  paymentData?: PaymentRequestData;
}

export interface ConversationParticipants {
  userId: string;
  userName: string;
  brandId: string;
  brandName: string;
}

// Typing indicator
export interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}
