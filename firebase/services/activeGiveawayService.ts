import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  increment,
  deleteField
} from 'firebase/firestore';
import { db } from '../config';
import type { GiveawayRequest, ActiveGiveaway } from '../../types/giveaway';

const ACTIVE_COLLECTION = 'GiveawaysNfts';

/**
 * Create an active giveaway directly (for admin)
 */
export const createActiveGiveawayDirect = async (
  giveawayData: {
    userId: string;
    userEmail: string;
    userName: string;
    title: string;
    description: string;
    type: 'coins' | 'nft' | 'service';
    totalCoins: number;
    winnersCount: number;
    requiredNft: string;
    endTime: string;
    whatsappNumber: string;
    brandId?: string;
    brandName?: string;
    freelancerId?: string;
    freelancerName?: string;
  },
  adminUserId: string
): Promise<string> => {
  try {
    const activeGiveaway: Omit<ActiveGiveaway, 'id'> = {
      ...giveawayData,
      status: 'active',
      totalParticipated: 0,
      participants: [],
      approvedAt: new Date().toISOString(),
      approvedBy: adminUserId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, ACTIVE_COLLECTION), activeGiveaway);
    console.log('✅ Active giveaway created directly:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating active giveaway:', error);
    throw error;
  }
};

/**
 * Create an active giveaway from an approved request
 */
export const createActiveGiveaway = async (
  request: GiveawayRequest,
  adminUserId: string
): Promise<string> => {
  try {
    if (!request.id) {
      throw new Error('Request must have an ID');
    }

    const activeGiveaway: Omit<ActiveGiveaway, 'id'> = {
      // Copy from request
      userId: request.userId,
      userEmail: request.userEmail,
      userName: request.userName,
      title: request.title,
      description: request.description,
      type: request.type,
      totalCoins: request.totalCoins,
      winnersCount: request.winnersCount,
      requiredNft: request.requiredNft,
      endTime: request.endTime,
      whatsappNumber: request.whatsappNumber,
      
      // Active giveaway specific
      status: 'active',
      totalParticipated: 0,
      participants: [],
      
      // Metadata
      approvedAt: new Date().toISOString(),
      approvedBy: adminUserId,
      createdAt: request.createdAt,
      originalRequestId: request.id,
    };

    const docRef = await addDoc(collection(db, ACTIVE_COLLECTION), activeGiveaway);
    console.log('✅ Active giveaway created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating active giveaway:', error);
    throw error;
  }
};

/**
 * Get all active giveaways
 */
export const getAllActiveGiveaways = async (): Promise<ActiveGiveaway[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_COLLECTION),
      orderBy('approvedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const giveaways: ActiveGiveaway[] = [];

    querySnapshot.forEach((doc) => {
      giveaways.push({
        id: doc.id,
        ...doc.data()
      } as ActiveGiveaway);
    });

    console.log(`✅ Fetched ${giveaways.length} active giveaways`);
    return giveaways;
  } catch (error) {
    console.error('❌ Error fetching active giveaways:', error);
    throw error;
  }
};

/**
 * Get active giveaways by status
 */
export const getActiveGiveawaysByStatus = async (
  status: 'active' | 'paused' | 'closed'
): Promise<ActiveGiveaway[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_COLLECTION),
      where('status', '==', status),
      orderBy('approvedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const giveaways: ActiveGiveaway[] = [];

    querySnapshot.forEach((doc) => {
      giveaways.push({
        id: doc.id,
        ...doc.data()
      } as ActiveGiveaway);
    });

    console.log(`✅ Fetched ${giveaways.length} ${status} giveaways`);
    return giveaways;
  } catch (error) {
    console.error(`❌ Error fetching ${status} giveaways:`, error);
    throw error;
  }
};

/**
 * Update giveaway status (pause/resume/close)
 */
export const updateGiveawayStatus = async (
  giveawayId: string,
  status: 'active' | 'paused' | 'closed'
): Promise<void> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'closed') {
      updateData.closedAt = new Date().toISOString();
    }

    await updateDoc(giveawayRef, updateData);
    console.log(`✅ Giveaway ${giveawayId} status updated to ${status}`);
  } catch (error) {
    console.error('❌ Error updating giveaway status:', error);
    throw error;
  }
};

/**
 * Update an active giveaway (for edit functionality)
 */
export const updateActiveGiveaway = async (
  giveawayId: string,
  giveawayData: {
    title?: string;
    description?: string;
    type?: 'coins' | 'nft' | 'service';
    totalCoins?: number;
    winnersCount?: number;
    requiredNft?: string;
    endTime?: string;
    whatsappNumber?: string;
    brandId?: string;
    brandName?: string;
    freelancerId?: string;
    freelancerName?: string;
  }
): Promise<void> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    
    // Build update data, converting null to deleteField()
    const cleanData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Process each field - convert null to deleteField(), remove undefined
    Object.entries(giveawayData).forEach(([key, value]) => {
      if (value === null) {
        cleanData[key] = deleteField();
      } else if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    await updateDoc(giveawayRef, cleanData);
    console.log(`✅ Giveaway ${giveawayId} updated successfully`);
  } catch (error) {
    console.error('❌ Error updating giveaway:', error);
    throw error;
  }
};

/**
 * Set winners for a giveaway
 */
export const setGiveawayWinners = async (
  giveawayId: string,
  winnerIds: string[]
): Promise<void> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    
    await updateDoc(giveawayRef, {
      winners: winnerIds,
      status: 'closed',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Winners set for giveaway ${giveawayId}`);
  } catch (error) {
    console.error('❌ Error setting winners:', error);
    throw error;
  }
};

/**
 * Get a single active giveaway by ID
 */
export const getActiveGiveawayById = async (giveawayId: string): Promise<ActiveGiveaway | null> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    const giveawaySnap = await getDoc(giveawayRef);

    if (giveawaySnap.exists()) {
      return {
        id: giveawaySnap.id,
        ...giveawaySnap.data()
      } as ActiveGiveaway;
    } else {
      console.log('No active giveaway found with ID:', giveawayId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching active giveaway:', error);
    throw error;
  }
};

/**
 * Delete an active giveaway (admin only)
 */
export const deleteActiveGiveaway = async (giveawayId: string): Promise<void> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    await deleteDoc(giveawayRef);
    console.log(`✅ Active giveaway ${giveawayId} deleted successfully`);
  } catch (error) {
    console.error('❌ Error deleting active giveaway:', error);
    throw error;
  }
};
/**
 * Add a participant to a giveaway
 */
export const addParticipant = async (
  giveawayId: string,
  userId: string,
  userName: string,
  userEmail: string
): Promise<void> => {
  try {
    const giveawayRef = doc(db, ACTIVE_COLLECTION, giveawayId);
    
    await updateDoc(giveawayRef, {
      participants: arrayUnion({ id: userId, name: userName, email: userEmail }),
      totalParticipated: increment(1)
    });
    
    console.log(`✅ Participant ${userName} added to giveaway ${giveawayId}`);
  } catch (error) {
    console.error('❌ Error adding participant:', error);
    throw error;
  }
};
/**
 * Check if user has participated in a giveaway
 */
export const hasUserParticipated = async (
  giveawayId: string,
  userId: string
): Promise<boolean> => {
  try {
    const giveaway = await getActiveGiveawayById(giveawayId);
    if (!giveaway) return false;
    
    return giveaway.participants.includes(userId);
  } catch (error) {
    console.error('❌ Error checking participation:', error);
    return false;
  }
};

/**
 * Get user's participated giveaways
 */
export const getUserParticipatedGiveaways = async (userId: string): Promise<ActiveGiveaway[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('approvedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const giveaways: ActiveGiveaway[] = [];

    querySnapshot.forEach((doc) => {
      giveaways.push({
        id: doc.id,
        ...doc.data()
      } as ActiveGiveaway);
    });

    console.log(`✅ Fetched ${giveaways.length} participated giveaways for user ${userId}`);
    return giveaways;
  } catch (error) {
    console.error('❌ Error fetching user participated giveaways:', error);
    throw error;
  }
};

/**
 * Get all active giveaways created by a specific user
 */
export const getUserActiveGiveaways = async (userId: string): Promise<ActiveGiveaway[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_COLLECTION),
      where('userId', '==', userId),
      orderBy('approvedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const giveaways: ActiveGiveaway[] = [];

    querySnapshot.forEach((doc) => {
      giveaways.push({
        id: doc.id,
        ...doc.data()
      } as ActiveGiveaway);
    });

    console.log(`✅ Fetched ${giveaways.length} active giveaways created by user ${userId}`);
    return giveaways;
  } catch (error) {
    console.error('❌ Error fetching user active giveaways:', error);
    throw error;
  }
};
