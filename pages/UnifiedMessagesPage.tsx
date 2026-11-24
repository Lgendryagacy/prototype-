import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../firebase/types/user';
import { 
  Search, 
  Send, 
  Loader2, 
  Paperclip, 
  X, 
  ChevronLeft,
  Download,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';

// Import services
import {
  subscribeToConversations as subscribeToBrandConversations,
  subscribeToMessages as subscribeToBrandMessages,
  sendMessage as sendBrandMessage,
  markMessagesAsRead as markBrandMessagesAsRead,
  sendWelcomeMessage,
  hasWelcomeMessage,
  getOrCreateConversation as createBrandConversation
} from '../firebase/services/messageService';

import {
  subscribeToConversations as subscribeToP2PConversations,
  subscribeToMessages as subscribeToP2PMessages,
  sendMessage as sendP2PMessage,
  markMessagesAsRead as markP2PMessagesAsRead,
  createOrGetConversation as createP2PConversation
} from '../firebase/services/publicChatService';

import {
  requestNotificationPermission,
  onForegroundMessage,
  hasNotificationPermission,
  showLocalNotification,
  checkNotificationCompatibility
} from '../firebase/services/pushNotificationService';

import { getUserProfile } from '../firebase/services/userService';
import { convertPKRtoFOG } from '../firebase/services/servicePaymentService';
import { getBrandServices } from '../firebase/services/brandServiceService';
import { 
  processPaymentApproval, 
  updatePaymentRequestStatus 
} from '../firebase/services/servicePaymentService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import types
import { Conversation, ChatMessage } from '../firebase/types/message';
import { PublicConversation, PublicChatMessage } from '../firebase/types/chat';

// Import components
import { ServiceListMessage } from '../components/chat/ServiceListMessage';
import { ServiceInquiryMessage } from '../components/chat/ServiceInquiryMessage';

// Unified Conversation Type
interface UnifiedConversation {
  id: string;
  type: 'p2p' | 'brand';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  
  // P2P specific
  otherUser?: {
    id: string;
    name: string;
    displayName: string;
    avatar?: string;
  };
  
  // Brand specific
  brandData?: {
    brandId: string;
    brandName: string;
    brandLogo?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
  };
}

interface UnifiedMessagesPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  context?: {
    // For P2P chat
    selectedUserId?: string;
    
    // For Brand chat
    brandId?: string;
    serviceInquiry?: {
      serviceName: string;
      packageName?: string;
      price?: string;
      deliveryTime?: string;
      hourlyRate?: string;
      minimumHours?: number;
    };
  };
  user?: User | null;
  isLoggedIn?: boolean;
  onBack?: () => void;
}

type ConversationFilter = 'all' | 'people' | 'brands';

const UnifiedMessagesPage: React.FC<UnifiedMessagesPageProps> = ({ 
  navigate, 
  context, 
  user,
  isLoggedIn,
  onBack 
}) => {
  // Use user directly (it can be either User or FirebaseUser type)
  const currentUser = user;

  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<(ChatMessage | PublicChatMessage)[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{url: string; type: 'image' | 'video'; name?: string} | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  // Payment handling state
  const [paymentStates, setPaymentStates] = useState<{[messageId: string]: {
    approving: boolean;
    rejecting: boolean;
    error: string | null;
  }}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check auth
  useEffect(() => {
    if (!currentUser || !isLoggedIn) {
      toast.error('Please login to access messages');
      navigate('auth');
      return;
    }
  }, [currentUser, isLoggedIn, navigate]);

  // Push notification setup
  useEffect(() => {
    if (!currentUser) return;

    const hasPermission = hasNotificationPermission();
    if (!hasPermission && !localStorage.getItem('notification-prompt-dismissed')) {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('📨 Foreground message:', payload);
      if (payload.notification) {
        showLocalNotification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/FOGCOIN_SITE_ICON.png',
          badge: '/FOGCOIN_SITE_ICON.png',
          data: payload.data,
          tag: 'chat-message',
          requireInteraction: false
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Handle notification permission request
  const handleEnableNotifications = async () => {
    if (!currentUser) return;

    const compatibility = checkNotificationCompatibility();
    console.log('🔍 Notification compatibility:', compatibility);

    if (!compatibility.supported) {
      if (compatibility.isIOS) {
        toast.error('📱 iOS Safari does not support web push notifications. Please use the Fogsly mobile app.', {
          duration: 8000
        });
      } else {
        toast.error(`❌ ${compatibility.reason}. Please try Chrome, Firefox, or Edge.`, {
          duration: 6000
        });
      }
      return;
    }

    toast.loading('Requesting notification permission...', { id: 'notif-request' });

    try {
      const token = await requestNotificationPermission(currentUser.uid);
      toast.dismiss('notif-request');
      
      if (token) {
        toast.success(`✅ Notifications enabled! You'll receive push notifications for new messages.`, {
          duration: 5000
        });
        setShowNotificationPrompt(false);
      } else {
        toast.error('Failed to enable notifications. Check console for details.', {
          duration: 4000
        });
      }
    } catch (error: any) {
      toast.dismiss('notif-request');
      console.error('Error enabling notifications:', error);
      toast.error(`Failed to enable notifications: ${error.message}`, {
        duration: 5000
      });
    }
  };

  const handleDismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Subscribe to both P2P and Brand conversations
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to P2P conversations
    const unsubP2P = subscribeToP2PConversations(currentUser.uid, (p2pConvos) => {
      const unified: UnifiedConversation[] = p2pConvos.map(convo => {
        const otherUserId = convo.participants.find(p => p !== currentUser.uid);
        const otherUserData = otherUserId ? convo.participantsData[otherUserId] : null;
        
        return {
          id: convo.id,
          type: 'p2p' as const,
          lastMessage: convo.lastMessage?.text || '',
          lastMessageTime: new Date(convo.updatedAt),
          unreadCount: convo.unreadCount[currentUser.uid] || 0,
          otherUser: otherUserData ? {
            id: otherUserId!,
            name: otherUserData.name,
            displayName: otherUserData.displayName,
            avatar: otherUserData.avatar
          } : undefined
        };
      });

      setConversations(prev => {
        const brandConvos = prev.filter(c => c.type === 'brand');
        const merged = [...brandConvos, ...unified];
        return merged.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      });
      
      setIsLoading(false);
    });
    unsubscribers.push(unsubP2P);

    // Subscribe to Brand conversations
    const unsubBrand = subscribeToBrandConversations(currentUser.uid, (brandConvos) => {
      const unified: UnifiedConversation[] = brandConvos.map(convo => ({
        id: convo.id,
        type: 'brand' as const,
        lastMessage: convo.lastMessage,
        lastMessageTime: convo.lastMessageTime,
        unreadCount: convo.unreadBy === 'user' ? convo.unreadCount : 0,
        brandData: {
          brandId: convo.brandId,
          brandName: convo.brandName,
          brandLogo: convo.brandLogo,
          userId: convo.userId,
          userName: convo.userName,
          userAvatar: convo.userAvatar
        }
      }));

      setConversations(prev => {
        const p2pConvos = prev.filter(c => c.type === 'p2p');
        const merged = [...p2pConvos, ...unified];
        return merged.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      });
      
      setIsLoading(false);
    });
    unsubscribers.push(unsubBrand);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]);

  // Handle initial conversation creation from context
  useEffect(() => {
    if (!currentUser || isCreatingConversation) return;

    // Handle P2P conversation from selectedUserId
    if (context?.selectedUserId && !selectedConversation) {
      const existingP2P = conversations.find(
        c => c.type === 'p2p' && c.otherUser?.id === context.selectedUserId
      );
      
      if (existingP2P) {
        setSelectedConversation(existingP2P);
      } else {
        handleCreateP2PConversation(context.selectedUserId);
      }
    }
    
    // Handle Brand conversation from brandId
    else if (context?.brandId && !selectedConversation) {
      const existingBrand = conversations.find(
        c => c.type === 'brand' && c.brandData?.brandId === context.brandId
      );
      
      if (existingBrand) {
        setSelectedConversation(existingBrand);
      } else {
        handleCreateBrandConversation(context.brandId);
      }
    }
  }, [currentUser, context, conversations, selectedConversation, isCreatingConversation]);

  // Create P2P conversation
  const handleCreateP2PConversation = async (otherUserId: string) => {
    if (!currentUser || typeof otherUserId !== 'string') return;
    
    setIsCreatingConversation(true);
    
    try {
      const [currentUserProfile, otherUserProfile] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserProfile(otherUserId)
      ]);

      if (!otherUserProfile || !currentUserProfile) {
        toast.error('User not found');
        return;
      }

      const conversation = await createP2PConversation(
        currentUser.uid,
        otherUserId,
        {
          name: currentUserProfile.name || '',
          displayName: currentUserProfile.displayName || currentUserProfile.name || '',
          avatar: currentUserProfile.avatarUrl || '',
          email: currentUserProfile.email || ''
        },
        {
          name: otherUserProfile.name || '',
          displayName: otherUserProfile.displayName || otherUserProfile.name || '',
          avatar: otherUserProfile.avatarUrl || '',
          email: otherUserProfile.email || ''
        }
      );

      // Will be picked up by the subscription
      setIsLoading(false);
      setIsCreatingConversation(false);
    } catch (error) {
      console.error('Error creating P2P conversation:', error);
      toast.error('Failed to start conversation');
      setIsCreatingConversation(false);
    }
  };

  // Create Brand conversation
  const handleCreateBrandConversation = async (brandId: string) => {
    if (!currentUser) return;

    setIsCreatingConversation(true);

    try {
      const brandDoc = await getDoc(doc(db, 'brands', brandId));
      if (!brandDoc.exists()) {
        toast.error('Brand not found');
        navigate('fog-services');
        return;
      }

      const brandDataRaw = brandDoc.data();
      const brand = {
        id: brandDoc.id,
        brandName: brandDataRaw.brandName || '',
        logoUrl: brandDataRaw.logoUrl || '',
        ...brandDataRaw
      };

      const result = await createBrandConversation(
        currentUser.uid,
        (currentUser as any).displayName || (currentUser as any).email || 'User',
        undefined,
        brandId,
        brand.brandName,
        brand.logoUrl
      );

      if (!result.success || !result.conversationId) {
        toast.error(result.error || 'Failed to create conversation');
        return;
      }

      // Send welcome message with services
      const hasWelcome = await hasWelcomeMessage(result.conversationId);
      if (!hasWelcome) {
        const services = await getBrandServices(brandId);
        const activeServices = services.filter(s => s.status === 'active');

        const serviceList = await Promise.all(
          activeServices.slice(0, 5).map(async (service) => {
            const firstPackage = service.pricing.type === 'fixed' && service.pricing.packages?.[0];
            const hourlyRate = service.pricing.type === 'hourly' && service.pricing.hourlyRate;

            let price = 'Contact for price';
            
            try {
              if (firstPackage) {
                const conversion = await convertPKRtoFOG(firstPackage.price);
                price = `${conversion.priceInFOG.toFixed(2)} FOG`;
              } else if (hourlyRate) {
                const conversion = await convertPKRtoFOG(hourlyRate.rate);
                price = `${conversion.priceInFOG.toFixed(2)} FOG/hr`;
              }
            } catch (error) {
              price = firstPackage
                ? `${firstPackage.currency} ${firstPackage.price.toLocaleString()}`
                : hourlyRate
                  ? `${hourlyRate.currency} ${hourlyRate.rate.toLocaleString()}/hr`
                  : 'Contact for price';
            }

            const deliveryTime = firstPackage?.deliveryTime ||
              (hourlyRate ? `${hourlyRate.minimumHours}h min` : 'Contact for details');

            return {
              id: service.id,
              name: service.title,
              price,
              deliveryTime,
              image: service.mainImage
            };
          })
        );

        await sendWelcomeMessage(
          result.conversationId,
          brandId,
          brand.brandName,
          brand.logoUrl,
          serviceList,
          activeServices.length
        );
      }

      // Send service inquiry if provided
      if (context?.serviceInquiry) {
        const inquiry = context.serviceInquiry;
        setTimeout(async () => {
          await sendBrandMessage(
            currentUser.uid,
            (currentUser as any).displayName || (currentUser as any).email || 'User',
            undefined,
            {
              conversationId: result.conversationId!,
              message: '💬 Looking forward to discussing this further',
              messageType: 'service-inquiry',
              attachments: [],
              inquiryData: inquiry
            }
          );
        }, 1000);
      }

      setIsLoading(false);
      setIsCreatingConversation(false);
    } catch (error) {
      console.error('Error creating brand conversation:', error);
      toast.error('Failed to start conversation');
      setIsCreatingConversation(false);
    }
  };

  // Subscribe to messages
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;

    let unsubscribe: (() => void) | undefined;

    if (selectedConversation.type === 'p2p') {
      unsubscribe = subscribeToP2PMessages(selectedConversation.id, (msgs) => {
        setMessages(msgs);
        markP2PMessagesAsRead(selectedConversation.id, currentUser.uid);
      });
    } else {
      unsubscribe = subscribeToBrandMessages(selectedConversation.id, (msgs) => {
        setMessages(msgs);
        markBrandMessagesAsRead(selectedConversation.id, 'user');
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation, currentUser]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!currentUser || !selectedConversation) return;
    if (!newMessage.trim() && !selectedFile) return;

    const messageText = newMessage.trim();
    const fileToSend = selectedFile;
    
    setNewMessage('');
    removeSelectedFile();
    setIsSending(true);

    try {
      if (selectedConversation.type === 'p2p' && selectedConversation.otherUser) {
        await sendP2PMessage(
          selectedConversation.id,
          currentUser.uid,
          selectedConversation.otherUser.id,
          messageText,
          fileToSend || undefined
        );
      } else if (selectedConversation.type === 'brand') {
        // For brand messages, we don't support file uploads yet through the unified page
        // User should use the regular message input component
        await sendBrandMessage(
          currentUser.uid,
          (currentUser as any).displayName || (currentUser as any).email || 'User',
          undefined,
          {
            conversationId: selectedConversation.id,
            message: messageText,
            attachments: fileToSend ? [fileToSend] : []
          }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
      if (fileToSend) setSelectedFile(fileToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle payment approval
  const handleApprovePayment = async (messageId: string, conversationId: string, paymentData: any, brandId: string) => {
    if (!currentUser) return;

    setPaymentStates(prev => ({
      ...prev,
      [messageId]: { approving: true, rejecting: false, error: null }
    }));

    try {
      const result = await processPaymentApproval(
        conversationId,
        messageId,
        currentUser.uid,
        brandId,
        {
          requestId: paymentData.requestId,
          title: paymentData.title,
          priceInFOG: paymentData.priceInFOG,
          platformFee: paymentData.platformFee,
          brandReceives: paymentData.brandReceives
        }
      );

      if (result.success) {
        toast.success('✅ Payment successful! FOG coins transferred to brand owner.');
        setPaymentStates(prev => ({
          ...prev,
          [messageId]: { approving: false, rejecting: false, error: null }
        }));
      } else {
        setPaymentStates(prev => ({
          ...prev,
          [messageId]: { approving: false, rejecting: false, error: result.error || 'Payment failed. Please try again.' }
        }));
      }
    } catch (error: any) {
      setPaymentStates(prev => ({
        ...prev,
        [messageId]: { approving: false, rejecting: false, error: error.message || 'Failed to process payment. Please try again.' }
      }));
    }
  };

  // Handle payment rejection
  const handleRejectPayment = async (messageId: string, conversationId: string) => {
    setPaymentStates(prev => ({
      ...prev,
      [messageId]: { approving: false, rejecting: true, error: null }
    }));

    try {
      const result = await updatePaymentRequestStatus(
        conversationId,
        messageId,
        'rejected'
      );

      if (result.success) {
        toast.success('Payment request rejected');
        setPaymentStates(prev => ({
          ...prev,
          [messageId]: { approving: false, rejecting: false, error: null }
        }));
      } else {
        setPaymentStates(prev => ({
          ...prev,
          [messageId]: { approving: false, rejecting: false, error: result.error || 'Failed to reject payment' }
        }));
      }
    } catch (error: any) {
      setPaymentStates(prev => ({
        ...prev,
        [messageId]: { approving: false, rejecting: false, error: error.message || 'Failed to reject payment' }
      }));
    }
  };

  // Clear payment error
  const clearPaymentError = (messageId: string) => {
    setPaymentStates(prev => ({
      ...prev,
      [messageId]: { ...prev[messageId], error: null }
    }));
  };

  // Filter conversations
  const filteredConversations = conversations.filter((convo) => {
    // Apply filter
    if (filter === 'people' && convo.type !== 'p2p') return false;
    if (filter === 'brands' && convo.type !== 'brand') return false;

    // Apply search
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    if (convo.type === 'p2p') {
      return convo.otherUser?.displayName.toLowerCase().includes(searchLower) ||
             convo.otherUser?.name.toLowerCase().includes(searchLower);
    } else {
      return convo.brandData?.brandName.toLowerCase().includes(searchLower);
    }
  });

  // Get display name for conversation
  const getConversationName = (convo: UnifiedConversation): string => {
    if (convo.type === 'p2p') {
      return convo.otherUser?.displayName || convo.otherUser?.name || 'Unknown User';
    } else {
      return convo.brandData?.brandName || 'Unknown Brand';
    }
  };

  // Get avatar for conversation
  const getConversationAvatar = (convo: UnifiedConversation) => {
    const name = getConversationName(convo);
    const avatar = convo.type === 'p2p' ? convo.otherUser?.avatar : convo.brandData?.brandLogo;
    
    if (avatar) {
      return <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />;
    }
    
    const initial = name?.charAt(0)?.toUpperCase() || '?';
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {initial}
      </div>
    );
  };

  // Format time
  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Convert Firestore Timestamp to Date
  const convertFirestoreTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    // Check if it's a Firestore Timestamp (has toDate method)
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Check if it has seconds property (Firestore Timestamp format)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    // Otherwise try to parse as regular date
    return new Date(timestamp);
  };

  // Download media
  const handleDownloadMedia = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (!currentUser || !isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden border-t" 
         style={{ 
           backgroundColor: 'var(--color-bg-primary)', 
           color: 'var(--color-text-primary)',
           borderColor: 'var(--color-border)'
         }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isSidebarOpen && !selectedConversation ? '100%' : '0px') : (isSidebarOpen ? '320px' : '0px'),
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={`flex-shrink-0 border-r backdrop-blur-xl flex flex-col h-full z-20 ${
          isMobile && selectedConversation ? 'hidden' : ''
        } ${!isSidebarOpen && 'hidden md:flex'}`}
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-secondary)'
        }}
      >
        {/* Search & Filters */}
        <div className="p-4 pt-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" 
                    style={{ color: 'var(--color-text-secondary)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 transition-all text-sm"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: filter === 'all' ? '#ffffff' : 'var(--color-text-secondary)'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('people')}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
              style={{
                backgroundColor: filter === 'people' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: filter === 'people' ? '#ffffff' : 'var(--color-text-secondary)'
              }}
            >
              <span>👤</span> People
            </button>
            <button
              onClick={() => setFilter('brands')}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
              style={{
                backgroundColor: filter === 'brands' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: filter === 'brands' ? '#ffffff' : 'var(--color-text-secondary)'
              }}
            >
              <span>🏢</span> Brands
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest" 
               style={{ color: 'var(--color-text-secondary)' }}>Messages</div>
          {isLoading || isCreatingConversation ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-slate-500">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const isSelected = selectedConversation?.id === convo.id;
              const name = getConversationName(convo);

              return (
                <button
                  key={convo.id}
                  onClick={() => {
                    setSelectedConversation(convo);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl transition-all border-l-4"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary)' + '20' : 'transparent',
                    borderLeftColor: isSelected ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  <div className="relative w-11 h-11">
                    {getConversationAvatar(convo)}
                    {convo.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2" 
                           style={{ 
                             backgroundColor: 'var(--color-primary)',
                             borderColor: 'var(--color-bg-secondary)'
                           }}>
                        <span className="text-[10px] font-bold text-white">{convo.unreadCount}</span>
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {convo.type === 'p2p' ? '👤' : '🏢'}
                    </div>
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold truncate text-sm" 
                          style={{ color: 'var(--color-text-primary)' }}>{name}</h3>
                      <span className="text-[9px] font-mono" 
                            style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(convo.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs truncate opacity-70" 
                       style={{ color: 'var(--color-text-secondary)' }}>
                      {convo.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col min-w-0 relative ${
        isMobile && selectedConversation ? 'w-full' : ''
      }`}
      style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {selectedConversation && currentUser ? (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-4 overflow-hidden">
                <button
                  onClick={() => {
                    if (isMobile) {
                      setSelectedConversation(null);
                      setIsSidebarOpen(true);
                    } else {
                      setIsSidebarOpen(!isSidebarOpen);
                    }
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg mr-1 text-slate-400 md:hidden"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative">
                    {getConversationAvatar(selectedConversation)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{getConversationName(selectedConversation)}</h3>
                    <p className="text-xs text-slate-400">
                      {selectedConversation.type === 'p2p' ? 'User' : 'Brand'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onBack ? onBack() : navigate('home')} 
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            {/* Message Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar bg-gradient-to-b from-slate-900/20 to-transparent">
              {messages.map((msg, index) => {
                const isSender = msg.senderId === currentUser.uid;
                
                // Check if it's a brand message (has brand-specific features)
                const isBrandMessage = selectedConversation?.type === 'brand';
                const chatMsg = msg as ChatMessage;
                const p2pMsg = msg as PublicChatMessage;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
                      {/* Payment Request for Brand messages */}
                      {isBrandMessage && chatMsg.messageType === 'services-payment-request' && chatMsg.paymentData && (() => {
                        const paymentState = paymentStates[msg.id] || { approving: false, rejecting: false, error: null };
                        const brandId = selectedConversation?.brandData?.brandId || '';
                        
                        return (
                          <div className="w-full bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-2xl p-4 space-y-3 mb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-100">{chatMsg.paymentData.title}</h4>
                                  <p className="text-xs text-slate-400">Payment Request</p>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                chatMsg.paymentData.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                chatMsg.paymentData.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {chatMsg.paymentData.status.toUpperCase()}
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {chatMsg.paymentData.description}
                            </p>
                            
                            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Price (PKR):</span>
                                <span className="font-medium text-slate-200">₨{chatMsg.paymentData.priceInPKR.toLocaleString()}</span>
                              </div>
                              <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
                                <span className="text-slate-400">Total (FOG):</span>
                                <span className="text-lg font-bold text-green-400">{chatMsg.paymentData.priceInFOG.toFixed(2)} FOG</span>
                              </div>
                              <p className="text-xs text-slate-400 text-center pt-1">
                                Rate: 1 FOG = ₨{chatMsg.paymentData.conversionRate.toFixed(2)}
                              </p>
                            </div>
                            
                            {/* Error Message */}
                            {paymentState.error && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm text-red-400 font-medium">Payment Error</p>
                                  <p className="text-xs text-red-300 mt-1">{paymentState.error}</p>
                                </div>
                                <button
                                  onClick={() => clearPaymentError(msg.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
                            {/* Action Buttons - Only show for pending status and if user is the customer (not sender) */}
                            {chatMsg.paymentData.status === 'pending' && !isSender && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => handleRejectPayment(msg.id, chatMsg.conversationId)}
                                  disabled={paymentState.approving || paymentState.rejecting}
                                  variant="outline"
                                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  {paymentState.rejecting ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleApprovePayment(msg.id, chatMsg.conversationId, chatMsg.paymentData, brandId)}
                                  disabled={paymentState.approving || paymentState.rejecting}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                >
                                  {paymentState.approving ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve & Pay
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                            
                            {/* Status Info */}
                            {chatMsg.paymentData.status === 'paid' && chatMsg.paymentData.paidAt && (
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Paid on {convertFirestoreTimestamp(chatMsg.paymentData.paidAt).toLocaleString()}</span>
                              </div>
                            )}
                            {chatMsg.paymentData.status === 'rejected' && (
                              <div className="flex items-center gap-2 text-xs text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span>Payment request rejected</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {/* Service Inquiry for Brand messages */}
                      {isBrandMessage && chatMsg.messageType === 'service-inquiry' && chatMsg.inquiryData && (
                        <ServiceInquiryMessage
                          serviceName={chatMsg.inquiryData.serviceName}
                          packageName={chatMsg.inquiryData.packageName}
                          price={chatMsg.inquiryData.price}
                          deliveryTime={chatMsg.inquiryData.deliveryTime}
                          hourlyRate={chatMsg.inquiryData.hourlyRate}
                          minimumHours={chatMsg.inquiryData.minimumHours}
                          isUser={isSender}
                        />
                      )}
                      
                      {/* Service List for Brand messages */}
                      {isBrandMessage && chatMsg.messageType === 'service-list' && chatMsg.serviceData && (
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 mb-2">
                          <ServiceListMessage
                            services={chatMsg.serviceData.services}
                            brandId={chatMsg.serviceData.brandId}
                            totalServices={chatMsg.serviceData.totalServices}
                            onServiceClick={(serviceId, serviceName) => {
                              navigate('fog-service-detail', serviceId);
                            }}
                            onServiceView={(serviceId) => {
                              navigate('fog-service-detail', serviceId);
                            }}
                            onExploreBrand={(brandId) => {
                              navigate('fog-service-brand', brandId);
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Media attachments for both P2P and Brand */}
                      {((isBrandMessage && chatMsg.attachments) || (!isBrandMessage && (p2pMsg.mediaUrl || p2pMsg.mediaType))) && (
                        <div className="mb-2">
                          {isBrandMessage && chatMsg.attachments?.map((attachment, idx) => (
                            <div key={idx} className="rounded-2xl overflow-hidden mb-2">
                              {attachment.type === 'image' && (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-2xl"
                                  onClick={() => setPreviewMedia({ url: attachment.url, type: 'image', name: attachment.name })}
                                />
                              )}
                              {attachment.type === 'video' && (
                                <video
                                  src={attachment.url}
                                  controls
                                  className="max-w-[280px] max-h-[280px] rounded-2xl"
                                />
                              )}
                              {attachment.type === 'pdf' && (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-3 rounded-2xl transition-colors ${
                                    isSender ? 'bg-blue-600 text-white hover:opacity-90' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  <FileText size={20} className={isSender ? 'text-white' : 'text-red-400'} />
                                  <div>
                                    <p className="font-medium text-sm">{attachment.name}</p>
                                    <p className={`text-xs ${isSender ? 'text-white/70' : 'text-slate-400'}`}>
                                      {(attachment.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </a>
                              )}
                            </div>
                          ))}
                          
                          {!isBrandMessage && p2pMsg.mediaUrl && (
                            <div className="rounded-2xl overflow-hidden">
                              {p2pMsg.mediaType === 'image' && (
                                <img
                                  src={p2pMsg.mediaUrl}
                                  alt={p2pMsg.mediaName || 'Image'}
                                  className="max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-2xl"
                                  onClick={() => setPreviewMedia({ url: p2pMsg.mediaUrl!, type: 'image', name: p2pMsg.mediaName })}
                                />
                              )}
                              {p2pMsg.mediaType === 'video' && (
                                <video
                                  src={p2pMsg.mediaUrl}
                                  controls
                                  className="max-w-[280px] max-h-[280px] rounded-2xl"
                                />
                              )}
                              {p2pMsg.mediaType === 'document' && (
                                <a
                                  href={p2pMsg.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-3 rounded-2xl transition-colors ${
                                    isSender ? 'bg-blue-600 text-white hover:opacity-90' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  <FileText size={20} className={isSender ? 'text-white' : 'text-red-400'} />
                                  <div>
                                    <p className="font-medium text-sm">{p2pMsg.mediaName || 'Document'}</p>
                                    {p2pMsg.mediaSize && (
                                      <p className={`text-xs ${isSender ? 'text-white/70' : 'text-slate-400'}`}>
                                        {(p2pMsg.mediaSize / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Text message (for both P2P and Brand) */}
                      {((isBrandMessage && chatMsg.message && chatMsg.messageType !== 'service-inquiry' && chatMsg.messageType !== 'service-list') || 
                        (!isBrandMessage && p2pMsg.text)) && (
                        <div className={`p-3 rounded-2xl ${
                          isSender 
                            ? 'bg-blue-600 text-white rounded-br-lg' 
                            : 'bg-slate-800 text-slate-100 rounded-bl-lg'
                        }`}>
                          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
                            {isBrandMessage ? chatMsg.message : p2pMsg.text}
                          </p>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`flex items-center gap-1.5 mt-1 ${isSender ? 'justify-end' : ''}`}>
                        <span className="text-[10px] md:text-xs text-slate-500">
                          {formatTime(isBrandMessage ? chatMsg.createdAt : p2pMsg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="p-3 md:p-6 pt-2 backdrop-blur-xl pb-20 md:pb-6" 
                    style={{ backgroundColor: 'var(--color-bg-secondary)' + '99' }}>
              {selectedFile && (
                <div className="mb-3 px-4 py-2 rounded-xl flex items-center justify-between max-w-4xl mx-auto"
                     style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="flex items-center gap-2">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <Paperclip size={20} style={{ color: 'var(--color-primary)' }} />
                    )}
                    <span className="text-sm truncate max-w-xs" 
                          style={{ color: 'var(--color-text-primary)' }}>{selectedFile.name}</span>
                  </div>
                  <button onClick={removeSelectedFile} 
                          className="transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}>
                    <X size={18} />
                  </button>
                </div>
              )}
              <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
                <div className="flex-1 border rounded-2xl p-1.5 flex items-end shadow-2xl"
                     style={{ 
                       backgroundColor: 'var(--color-bg-tertiary)',
                       borderColor: 'var(--color-border)'
                     }}>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Paperclip size={20} />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 bg-transparent px-3 py-2.5 focus:outline-none resize-none max-h-32 text-sm"
                    style={{ 
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isSending || (!newMessage.trim() && !selectedFile)}
                    className="p-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </footer>  
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {isLoading || isCreatingConversation ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400 text-lg">Loading conversation...</p>
                </>
              ) : (
                <p className="text-slate-400 text-lg">Select a conversation to start chatting</p>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-bg-secondary);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }
      `}</style>

      {/* Media Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                title="Close"
              >
                <X size={24} className="text-white" />
              </button>

              <button
                onClick={() => handleDownloadMedia(previewMedia.url, previewMedia.name || 'media')}
                className="absolute -top-12 right-14 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                title="Download"
              >
                <Download size={24} className="text-white" />
              </button>

              <div className="flex items-center justify-center">
                {previewMedia.type === 'image' ? (
                  <img
                    src={previewMedia.url}
                    alt="Preview"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh] rounded-lg"
                  />
                )}
              </div>

              {previewMedia.name && (
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <p className="text-white/80 text-sm truncate px-4">{previewMedia.name}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Permission Prompt */}
      <AnimatePresence>
        {showNotificationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-sm z-50"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Enable Push Notifications</h3>
                <p className="text-sm text-slate-400 mb-4">Get notified when you receive new messages.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleEnableNotifications}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={handleDismissNotificationPrompt}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissNotificationPrompt}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedMessagesPage;
