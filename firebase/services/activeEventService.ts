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
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { ActiveEvent, ActiveEventStatus, CreateActiveEventData } from '../types/activeEvent';
import type { EventRequest } from '../types/eventRequest';

const ACTIVE_EVENTS_COLLECTION = 'ActiveEvents';

/**
 * Create an active event from an approved request
 */
export const createActiveEventFromRequest = async (
  eventRequest: EventRequest,
  approvedBy: string
): Promise<string> => {
  try {
    const activeEventData: any = {
      // Event Information
      title: eventRequest.title,
      description: eventRequest.description,
      category: eventRequest.category,
      tags: eventRequest.tags || [],
      banner: eventRequest.banner,
      
      // Event Type & Location
      type: eventRequest.type,
      venue: eventRequest.venue,
      address: eventRequest.address,
      city: eventRequest.city,
      country: eventRequest.country,
      virtualLink: eventRequest.virtualLink,
      location: eventRequest.location,
      
      // Schedule
      startDate: eventRequest.startDate,
      startTime: eventRequest.startTime,
      endDate: eventRequest.endDate,
      endTime: eventRequest.endTime,
      
      // Pricing & Capacity
      priceInPKR: eventRequest.priceInPKR,
      priceInFOG: eventRequest.priceInFOG,
      isFree: eventRequest.isFree,
      maxCapacity: eventRequest.maxCapacity,
      currentAttendees: 0, // Initialize to 0
      
      // Organizer Information
      organizerId: eventRequest.userId,
      organizerName: eventRequest.userName,
      organizerEmail: eventRequest.userEmail,
      organizerPhone: eventRequest.userPhone,
      organizerProfile: eventRequest.userProfile,
      
      // Status & Admin Tracking
      eventStatus: 'active' as ActiveEventStatus,
      originalRequestId: eventRequest.id || '',
      approvedBy,
      approvedAt: serverTimestamp(),
      activatedAt: serverTimestamp(),
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Remove undefined fields
    const cleanedData: any = {};
    Object.keys(activeEventData).forEach(key => {
      const value = activeEventData[key];
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    });

    const docRef = await addDoc(
      collection(db, ACTIVE_EVENTS_COLLECTION),
      cleanedData
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating active event:', error);
    throw new Error('Failed to create active event');
  }
};

/**
 * Get all active events
 */
export const getAllActiveEvents = async (): Promise<ActiveEvent[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_EVENTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActiveEvent[];
  } catch (error) {
    console.error('Error fetching active events:', error);
    throw new Error('Failed to fetch active events');
  }
};

/**
 * Get active events by status
 */
export const getActiveEventsByStatus = async (
  status: ActiveEventStatus
): Promise<ActiveEvent[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_EVENTS_COLLECTION),
      where('eventStatus', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActiveEvent[];
  } catch (error) {
    console.error('Error fetching active events by status:', error);
    throw new Error('Failed to fetch active events by status');
  }
};

/**
 * Get active events by organizer
 */
export const getActiveEventsByOrganizer = async (
  organizerId: string
): Promise<ActiveEvent[]> => {
  try {
    const q = query(
      collection(db, ACTIVE_EVENTS_COLLECTION),
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActiveEvent[];
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    throw new Error('Failed to fetch organizer events');
  }
};

/**
 * Get single active event by ID
 */
export const getActiveEventById = async (
  eventId: string
): Promise<ActiveEvent | null> => {
  try {
    const docRef = doc(db, ACTIVE_EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ActiveEvent;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching active event:', error);
    throw new Error('Failed to fetch active event');
  }
};

/**
 * Update active event status
 */
export const updateActiveEventStatus = async (
  eventId: string,
  status: ActiveEventStatus
): Promise<void> => {
  try {
    const docRef = doc(db, ACTIVE_EVENTS_COLLECTION, eventId);
    
    await updateDoc(docRef, {
      eventStatus: status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating active event status:', error);
    throw new Error('Failed to update active event status');
  }
};

/**
 * Increment attendee count
 */
export const incrementAttendeeCount = async (
  eventId: string
): Promise<void> => {
  try {
    const docRef = doc(db, ACTIVE_EVENTS_COLLECTION, eventId);
    
    await updateDoc(docRef, {
      currentAttendees: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error incrementing attendee count:', error);
    throw new Error('Failed to increment attendee count');
  }
};

/**
 * Decrement attendee count
 */
export const decrementAttendeeCount = async (
  eventId: string
): Promise<void> => {
  try {
    const docRef = doc(db, ACTIVE_EVENTS_COLLECTION, eventId);
    
    await updateDoc(docRef, {
      currentAttendees: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error decrementing attendee count:', error);
    throw new Error('Failed to decrement attendee count');
  }
};

/**
 * Update active event details
 */
export const updateActiveEvent = async (
  eventId: string,
  updateData: Partial<ActiveEvent>
): Promise<void> => {
  try {
    const docRef = doc(db, ACTIVE_EVENTS_COLLECTION, eventId);
    
    // Remove undefined fields
    const cleanedData: any = {
      updatedAt: serverTimestamp(),
    };
    
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        cleanedData[key] = value;
      }
    });
    
    await updateDoc(docRef, cleanedData);
  } catch (error) {
    console.error('Error updating active event:', error);
    throw new Error('Failed to update active event');
  }
};
