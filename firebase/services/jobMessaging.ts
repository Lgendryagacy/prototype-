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
  JobConversation, 
  JobChatMessage, 
  CreateJobMessageData,
  MessageAttachment
} from '../types/jobMessage';

const JOB_CONVERSATIONS_COLLECTION = 'jobConversations';
const JOB_MESSAGES_COLLECTION = 'jobMessages';

/**
 * Create a conversation when a job proposal is accepted
 */
export const createJobConversation = async (
  jobId: string,
  jobTitle: string,
  clientId: string,
  clientName: string,
  freelancerId: string,
  freelancerName: string,
  freelancerEmail: string,
  proposalId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    // Check if conversation already exists for this job and freelancer
    const q = query(
      collection(db, JOB_CONVERSATIONS_COLLECTION),
      where('jobId', '==', jobId),
      where('freelancerId', '==', freelancerId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Conversation already exists
      return {
        success: true,
        conversationId: querySnapshot.docs[0].id
      };
    }

    // Create new conversation
    const conversationData = {
      jobId,
      jobTitle,
      clientId,
      clientName,
      freelancerId,
      freelancerName,
      freelancerEmail,
      proposalId,
      lastMessage: '',
      lastMessageTime: Timestamp.fromDate(new Date()),
      clientUnreadCount: 0,
      freelancerUnreadCount: 0,
      status: 'active',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(db, JOB_CONVERSATIONS_COLLECTION), conversationData);

    // Send initial system message
    await sendSystemMessage(
      docRef.id,
      `Project started: ${jobTitle}`,
      'project-started'
    );

    return {
      success: true,
      conversationId: docRef.id
    };
  } catch (error) {
    console.error('Error creating job conversation:', error);
    return {
      success: false,
      error: 'Failed to create conversation'
    };
  }
};

/**
 * Send a system message (automated messages)
 */
const sendSystemMessage = async (
  conversationId: string,
  message: string,
  messageType: 'project-started' | 'project-completed' | 'system'
): Promise<void> => {
  try {
    const messageData = {
      conversationId,
      senderId: 'system',
      senderType: 'system',
      senderName: 'System',
      message,
      messageType,
      status: 'delivered',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    await addDoc(collection(db, JOB_MESSAGES_COLLECTION), messageData);

    // Update conversation
    await updateDoc(doc(db, JOB_CONVERSATIONS_COLLECTION, conversationId), {
      lastMessage: message,
      lastMessageTime: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error sending system message:', error);
  }
};

/**
 * Send a message in job conversation
 */
export const sendJobMessage = async (
  senderId: string,
  senderName: string,
  senderType: 'client' | 'freelancer' | 'system',
  data: CreateJobMessageData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Upload attachments if any
    let uploadedAttachments: MessageAttachment[] = [];
    
    if (data.attachments && data.attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        data.attachments.map(async (file) => {
          const timestamp = Date.now();
          const storageRef = ref(
            storage,
            `job-messages/${data.conversationId}/${timestamp}_${file.name}`
          );
          
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          const type: 'image' | 'video' | 'pdf' | 'document' = 
            file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' :
            file.type === 'application/pdf' ? 'pdf' : 'document';
          
          return {
            id: `${timestamp}`,
            type,
            url,
            name: file.name,
            size: file.size
          };
        })
      );
    }

    // Create message
    const messageData: any = {
      conversationId: data.conversationId,
      senderId,
      senderType,
      senderName,
      message: data.message,
      messageType: data.messageType || 'text',
      status: 'delivered',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (uploadedAttachments.length > 0) {
      messageData.attachments = uploadedAttachments;
    }

    const messageRef = await addDoc(collection(db, JOB_MESSAGES_COLLECTION), messageData);

    // Update conversation
    const conversationRef = doc(db, JOB_CONVERSATIONS_COLLECTION, data.conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      
      // Increment unread count for the recipient
      const updateData: any = {
        lastMessage: data.message || (uploadedAttachments.length > 0 ? '📎 Attachment' : ''),
        lastMessageTime: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (senderType === 'client') {
        updateData.freelancerUnreadCount = (conversationData.freelancerUnreadCount || 0) + 1;
      } else {
        updateData.clientUnreadCount = (conversationData.clientUnreadCount || 0) + 1;
      }

      await updateDoc(conversationRef, updateData);
    }

    return {
      success: true,
      messageId: messageRef.id
    };
  } catch (error) {
    console.error('Error sending job message:', error);
    return {
      success: false,
      error: 'Failed to send message'
    };
  }
};

/**
 * Subscribe to job conversations for a user
 */
export const subscribeToJobConversations = (
  userId: string,
  userType: 'client' | 'freelancer',
  onUpdate: (conversations: JobConversation[]) => void
): (() => void) => {
  const field = userType === 'client' ? 'clientId' : 'freelancerId';
  
  const q = query(
    collection(db, JOB_CONVERSATIONS_COLLECTION),
    where(field, '==', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations: JobConversation[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        clientId: data.clientId,
        clientName: data.clientName,
        freelancerId: data.freelancerId,
        freelancerName: data.freelancerName,
        freelancerEmail: data.freelancerEmail,
        proposalId: data.proposalId,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        clientUnreadCount: data.clientUnreadCount || 0,
        freelancerUnreadCount: data.freelancerUnreadCount || 0,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });

    onUpdate(conversations);
  }, (error) => {
    console.error('Error subscribing to job conversations:', error);
    onUpdate([]);
  });

  return unsubscribe;
};

/**
 * Subscribe to messages in a job conversation
 */
export const subscribeToJobMessages = (
  conversationId: string,
  onUpdate: (messages: JobChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, JOB_MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: JobChatMessage[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderType: data.senderType,
        senderName: data.senderName,
        message: data.message,
        messageType: data.messageType || 'text',
        attachments: data.attachments,
        status: data.status || 'delivered',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });

    onUpdate(messages);
  }, (error) => {
    console.error('Error subscribing to job messages:', error);
    onUpdate([]);
  });

  return unsubscribe;
};

/**
 * Mark messages as read
 */
export const markJobMessagesAsRead = async (
  conversationId: string,
  userType: 'client' | 'freelancer'
): Promise<void> => {
  try {
    const conversationRef = doc(db, JOB_CONVERSATIONS_COLLECTION, conversationId);
    
    const updateData = userType === 'client' 
      ? { clientUnreadCount: 0 }
      : { freelancerUnreadCount: 0 };

    await updateDoc(conversationRef, updateData);
  } catch (error) {
    console.error('Error marking job messages as read:', error);
  }
};

/**
 * Get a specific job conversation
 */
export const getJobConversation = async (
  conversationId: string
): Promise<JobConversation | null> => {
  try {
    const docRef = doc(db, JOB_CONVERSATIONS_COLLECTION, conversationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      clientId: data.clientId,
      clientName: data.clientName,
      freelancerId: data.freelancerId,
      freelancerName: data.freelancerName,
      freelancerEmail: data.freelancerEmail,
      proposalId: data.proposalId,
      lastMessage: data.lastMessage,
      lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
      clientUnreadCount: data.clientUnreadCount || 0,
      freelancerUnreadCount: data.freelancerUnreadCount || 0,
      status: data.status || 'active',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting job conversation:', error);
    return null;
  }
};

/**
 * Get conversation by job and freelancer
 */
export const getConversationByJobAndFreelancer = async (
  jobId: string,
  freelancerId: string
): Promise<JobConversation | null> => {
  try {
    const q = query(
      collection(db, JOB_CONVERSATIONS_COLLECTION),
      where('jobId', '==', jobId),
      where('freelancerId', '==', freelancerId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      clientId: data.clientId,
      clientName: data.clientName,
      freelancerId: data.freelancerId,
      freelancerName: data.freelancerName,
      freelancerEmail: data.freelancerEmail,
      proposalId: data.proposalId,
      lastMessage: data.lastMessage,
      lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
      clientUnreadCount: data.clientUnreadCount || 0,
      freelancerUnreadCount: data.freelancerUnreadCount || 0,
      status: data.status || 'active',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};
