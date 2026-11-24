import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import { 
  ChatMessage, 
  Conversation, 
  CreateMessageData, 
  MessageAttachment,
  ConversationParticipants,
  ServiceMessageData,
  ServiceListItem
} from '../types/message';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

/**
 * Get or create a conversation between user and brand
 */
export const getOrCreateConversation = async (
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  brandId: string,
  brandName: string,
  brandLogo: string | undefined
): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId', '==', userId),
      where('brandId', '==', brandId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Conversation exists
      return {
        success: true,
        conversationId: querySnapshot.docs[0].id
      };
    }

    // Create new conversation
    const conversationData = {
      userId,
      userName,
      userAvatar: userAvatar || '',
      brandId,
      brandName,
      brandLogo: brandLogo || '',
      lastMessage: '',
      lastMessageType: 'text',
      lastMessageTime: Timestamp.fromDate(new Date()),
      unreadCount: 0,
      unreadBy: 'none',
      isOnline: false,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);

    return {
      success: true,
      conversationId: docRef.id
    };
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    return {
      success: false,
      error: 'Failed to create conversation'
    };
  }
};

/**
 * Send welcome message with service list
 */
export const sendWelcomeMessage = async (
  conversationId: string,
  brandId: string,
  brandName: string,
  brandLogo: string | undefined,
  services: ServiceListItem[],
  totalServices: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const welcomeText = `Hello, welcome to ${brandName}! How can we help you today? Check our services:`;

    const messageData: any = {
      conversationId,
      senderId: brandId,
      senderType: 'brand',
      senderName: brandName,
      senderAvatar: brandLogo || '',
      message: welcomeText,
      messageType: 'service-list',
      serviceData: {
        type: 'list',
        brandId: brandId,
        services: services.slice(0, 2), // Only send first 2 services
        totalServices: totalServices
      },
      status: 'delivered',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    await addDoc(collection(db, MESSAGES_COLLECTION), messageData);

    // Update conversation
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
      lastMessage: welcomeText,
      lastMessageType: 'service-list',
      lastMessageTime: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return {
      success: false,
      error: 'Failed to send welcome message'
    };
  }
};

/**
 * Check if welcome message already sent
 */
export const hasWelcomeMessage = async (conversationId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      where('messageType', '==', 'service-list'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking welcome message:', error);
    return false;
  }
};

/**
 * Upload attachment to storage
 */
export const uploadAttachment = async (
  file: File,
  conversationId: string,
  userId: string
): Promise<{ url: string; thumbnailUrl?: string }> => {
  const timestamp = Date.now();
  const fileName = `${userId}-${timestamp}-${file.name}`;
  const filePath = `chat-attachments/${conversationId}/${fileName}`;
  
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Return only url, thumbnailUrl generation is TODO
  return { url };
};

/**
 * Send message
 */
export const sendMessage = async (
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  data: CreateMessageData,
  senderType: 'user' | 'brand' = 'user' // Default to 'user' for backward compatibility
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    let attachments: MessageAttachment[] = [];

    // Upload attachments if any
    if (data.attachments && data.attachments.length > 0) {
      const uploadPromises = data.attachments.map(async (file) => {
        const uploadResult = await uploadAttachment(file, data.conversationId, userId);
        
        let type: 'image' | 'video' | 'pdf' | 'document' = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type === 'application/pdf') type = 'pdf';

        const attachment: MessageAttachment = {
          id: `${Date.now()}-${file.name}`,
          type,
          url: uploadResult.url,
          name: file.name,
          size: file.size
        };

        // Only add thumbnailUrl if it exists
        if (uploadResult.thumbnailUrl) {
          attachment.thumbnailUrl = uploadResult.thumbnailUrl;
        }

        return attachment;
      });

      attachments = await Promise.all(uploadPromises);
    }

    const messageData: any = {
      conversationId: data.conversationId,
      senderId: userId,
      senderType: senderType, // Use the parameter instead of hardcoded 'user'
      senderName: userName,
      senderAvatar: userAvatar || null, // Use null instead of empty string for consistency
      message: data.message || '',
      messageType: data.messageType || 'text',
      status: 'sent',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Only add attachments if there are any - ensure it's a valid array
    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    // Only add serviceData if provided and has valid data
    if (data.serviceData && Object.keys(data.serviceData).length > 0) {
      messageData.serviceData = data.serviceData;
    }

    // Only add inquiryData if provided and has valid data
    if (data.inquiryData && Object.keys(data.inquiryData).length > 0) {
      messageData.inquiryData = data.inquiryData;
    }

    // Only add paymentData if provided and has valid data
    if (data.paymentData && Object.keys(data.paymentData).length > 0) {
      messageData.paymentData = data.paymentData;
    }

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);

    // Update conversation
    let lastMessageText = data.message || '';
    
    // Special handling for different message types
    if (data.messageType === 'service-inquiry' && data.inquiryData) {
      lastMessageText = `📦 Service Inquiry: ${data.inquiryData.serviceName}`;
    } else if (attachments.length > 0) {
      lastMessageText = `Sent ${attachments[0].type}`;
    } else if (!lastMessageText) {
      lastMessageText = 'Sent a message';
    }
    
    // Determine who should see this as unread based on who sent it
    // If user sends → brand should read it ('brand')
    // If brand sends → user should read it ('user')
    const unreadByWho = senderType === 'user' ? 'brand' : 'user';
    
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, data.conversationId), {
      lastMessage: lastMessageText,
      lastMessageType: attachments.length > 0 ? attachments[0].type : (data.messageType || 'text'),
      lastMessageTime: Timestamp.fromDate(new Date()),
      unreadBy: unreadByWho,
      unreadCount: 1,
      updatedAt: Timestamp.fromDate(new Date())
    });

    return {
      success: true,
      messageId: docRef.id
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Failed to send message'
    };
  }
};

/**
 * Get user's conversations
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        brandId: data.brandId,
        brandName: data.brandName,
        brandLogo: data.brandLogo,
        lastMessage: data.lastMessage,
        lastMessageType: data.lastMessageType,
        lastMessageTime: data.lastMessageTime.toDate(),
        unreadCount: data.unreadCount || 0,
        unreadBy: data.unreadBy || 'none',
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

/**
 * Get conversation messages
 */
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderType: data.senderType,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        message: data.message,
        messageType: data.messageType,
        attachments: data.attachments,
        serviceData: data.serviceData,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userType: 'user' | 'brand'
): Promise<void> => {
  try {
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
      unreadBy: 'none',
      unreadCount: 0
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Subscribe to conversation messages (real-time)
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderType: data.senderType,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        message: data.message,
        messageType: data.messageType,
        attachments: data.attachments,
        serviceData: data.serviceData,
        inquiryData: data.inquiryData, // IMPORTANT: Include inquiry data!
        paymentData: data.paymentData, // IMPORTANT: Include payment data!
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      };
    });
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
};

/**
 * Subscribe to user conversations (real-time)
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        brandId: data.brandId,
        brandName: data.brandName,
        brandLogo: data.brandLogo,
        lastMessage: data.lastMessage,
        lastMessageType: data.lastMessageType,
        lastMessageTime: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : new Date(),
        unreadCount: data.unreadCount || 0,
        unreadBy: data.unreadBy || 'none',
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate() : undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      };
    });
    callback(conversations);
  }, (error) => {
    console.warn('Notice subscribing to conversations:', error?.message || error);
    callback([]);
  });
};
