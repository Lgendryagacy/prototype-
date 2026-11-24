import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { EventRequest, CreateEventRequestData, EventStatus } from '../types/eventRequest';

const EVENT_REQUESTS_COLLECTION = 'EventRequests';

/**
 * Create a new event request
 */
export const createEventRequest = async (
  eventData: CreateEventRequestData
): Promise<string> => {
  try {
    // Remove undefined fields (Firebase doesn't accept undefined)
    const cleanedData: any = {
      eventStatus: 'pending' as EventStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add fields that are not undefined
    Object.keys(eventData).forEach(key => {
      const value = (eventData as any)[key];
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    });

    const docRef = await addDoc(
      collection(db, EVENT_REQUESTS_COLLECTION),
      cleanedData
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating event request:', error);
    throw new Error('Failed to submit event request');
  }
};

/**
 * Get event requests by user ID
 */
export const getUserEventRequests = async (
  userId: string
): Promise<EventRequest[]> => {
  try {
    const q = query(
      collection(db, EVENT_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRequest[];
  } catch (error) {
    console.error('Error fetching user event requests:', error);
    throw new Error('Failed to fetch event requests');
  }
};

/**
 * Get all pending event requests (for admin)
 */
export const getPendingEventRequests = async (): Promise<EventRequest[]> => {
  try {
    const q = query(
      collection(db, EVENT_REQUESTS_COLLECTION),
      where('eventStatus', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRequest[];
  } catch (error) {
    console.error('Error fetching pending event requests:', error);
    throw new Error('Failed to fetch pending event requests');
  }
};

/**
 * Get all event requests (for admin)
 */
export const getAllEventRequests = async (): Promise<EventRequest[]> => {
  try {
    const q = query(
      collection(db, EVENT_REQUESTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRequest[];
  } catch (error) {
    console.error('Error fetching all event requests:', error);
    throw new Error('Failed to fetch all event requests');
  }
};

/**
 * Get event requests by status (for admin)
 */
export const getEventRequestsByStatus = async (
  status: EventStatus
): Promise<EventRequest[]> => {
  try {
    const q = query(
      collection(db, EVENT_REQUESTS_COLLECTION),
      where('eventStatus', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRequest[];
  } catch (error) {
    console.error('Error fetching event requests by status:', error);
    throw new Error('Failed to fetch event requests by status');
  }
};

/**
 * Update event request status
 */
export const updateEventRequestStatus = async (
  requestId: string,
  status: EventStatus,
  reviewedBy: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const docRef = doc(db, EVENT_REQUESTS_COLLECTION, requestId);
    
    const updateData: any = {
      eventStatus: status,
      reviewedBy,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating event request status:', error);
    throw new Error('Failed to update event request status');
  }
};
