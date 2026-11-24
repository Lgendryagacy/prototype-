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
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config';
import type { GiveawayRequest } from '../../types/giveaway';
import { createActiveGiveaway } from './activeGiveawayService';

const COLLECTION_NAME = 'GiveawaysRequests';

/**
 * Submit a new giveaway request
 */
export const submitGiveawayRequest = async (
  userId: string,
  userEmail: string,
  userName: string,
  giveawayData: Omit<GiveawayRequest, 'id' | 'userId' | 'userEmail' | 'userName' | 'status' | 'createdAt'>
): Promise<string> => {
  try {
    const requestData: Omit<GiveawayRequest, 'id'> = {
      userId,
      userEmail,
      userName,
      ...giveawayData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), requestData);
    console.log('✅ Giveaway request submitted successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting giveaway request:', error);
    throw error;
  }
};

/**
 * Get all giveaway requests for a specific user
 */
export const getUserGiveawayRequests = async (userId: string): Promise<GiveawayRequest[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: GiveawayRequest[] = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as GiveawayRequest);
    });

    console.log(`✅ Fetched ${requests.length} giveaway requests for user:`, userId);
    return requests;
  } catch (error) {
    console.error('❌ Error fetching user giveaway requests:', error);
    throw error;
  }
};

/**
 * Get all giveaway requests (for admin)
 */
export const getAllGiveawayRequests = async (): Promise<GiveawayRequest[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: GiveawayRequest[] = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as GiveawayRequest);
    });

    console.log(`✅ Fetched ${requests.length} total giveaway requests`);
    return requests;
  } catch (error) {
    console.error('❌ Error fetching all giveaway requests:', error);
    throw error;
  }
};

/**
 * Get giveaway requests by status
 */
export const getGiveawayRequestsByStatus = async (
  status: 'pending' | 'approved' | 'rejected'
): Promise<GiveawayRequest[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: GiveawayRequest[] = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as GiveawayRequest);
    });

    console.log(`✅ Fetched ${requests.length} ${status} giveaway requests`);
    return requests;
  } catch (error) {
    console.error(`❌ Error fetching ${status} giveaway requests:`, error);
    throw error;
  }
};

/**
 * Update giveaway request status (for admin)
 */
export const updateGiveawayRequestStatus = async (
  requestId: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, requestId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(requestRef, updateData);
    console.log(`✅ Giveaway request ${requestId} status updated to ${status}`);
  } catch (error) {
    console.error('❌ Error updating giveaway request status:', error);
    throw error;
  }
};

/**
 * Get a single giveaway request by ID
 */
export const getGiveawayRequestById = async (requestId: string): Promise<GiveawayRequest | null> => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, requestId);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists()) {
      return {
        id: requestSnap.id,
        ...requestSnap.data()
      } as GiveawayRequest;
    } else {
      console.log('No giveaway request found with ID:', requestId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching giveaway request:', error);
    throw error;
  }
};

/**
 * Delete a giveaway request (user can delete pending requests)
 */
export const deleteGiveawayRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, requestId);
    await deleteDoc(requestRef);
    console.log(`✅ Giveaway request ${requestId} deleted successfully`);
  } catch (error) {
    console.error('❌ Error deleting giveaway request:', error);
    throw error;
  }
};

/**
 * Admin: Approve a giveaway request and create active giveaway
 */
export const approveGiveawayRequest = async (
  requestId: string,
  adminUserId: string
): Promise<string> => {
  try {
    // Get the request
    const request = await getGiveawayRequestById(requestId);
    if (!request) {
      throw new Error('Giveaway request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be approved');
    }

    // Update request status to approved
    await updateGiveawayRequestStatus(requestId, 'approved');

    // Create active giveaway
    const activeGiveawayId = await createActiveGiveaway(request, adminUserId);

    console.log(`✅ Giveaway request ${requestId} approved and active giveaway ${activeGiveawayId} created`);
    return activeGiveawayId;
  } catch (error) {
    console.error('❌ Error approving giveaway request:', error);
    throw error;
  }
};

/**
 * Admin: Reject a giveaway request
 */
export const rejectGiveawayRequest = async (
  requestId: string,
  rejectionReason: string
): Promise<void> => {
  try {
    const request = await getGiveawayRequestById(requestId);
    if (!request) {
      throw new Error('Giveaway request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be rejected');
    }

    // Update request status to rejected
    await updateGiveawayRequestStatus(requestId, 'rejected', rejectionReason);

    console.log(`✅ Giveaway request ${requestId} rejected`);
  } catch (error) {
    console.error('❌ Error rejecting giveaway request:', error);
    throw error;
  }
};

/**
 * Update a giveaway request (for editing)
 */
export const updateGiveawayRequest = async (
  requestId: string,
  updateData: Partial<Omit<GiveawayRequest, 'id' | 'userId' | 'userEmail' | 'userName' | 'status' | 'createdAt'>>
): Promise<void> => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, requestId);
    
    await updateDoc(requestRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Giveaway request ${requestId} updated successfully`);
  } catch (error) {
    console.error('❌ Error updating giveaway request:', error);
    throw error;
  }
};
