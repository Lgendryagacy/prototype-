import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '../config';
import type { EventTicket, CreateTicketData } from '../types/eventTicket';
import { addEarnings } from './earningsService';

const COLLECTION_NAME = 'EventTickets';

/**
 * Generate a unique ticket ID
 */
function generateTicketId(): string {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create a new event ticket (book event)
 */
export async function createEventTicket(ticketData: CreateTicketData): Promise<string> {
  try {
    const ticketId = generateTicketId();
    
    // Remove undefined fields before saving to Firestore
    const ticket: Omit<EventTicket, 'id'> = {
      ticketId,
      eventId: ticketData.eventId,
      eventTitle: ticketData.eventTitle,
      eventType: ticketData.eventType,
      eventDate: ticketData.eventDate,
      eventTime: ticketData.eventTime,
      ...(ticketData.eventBanner && { eventBanner: ticketData.eventBanner }),
      ...(ticketData.eventVirtualLink && { eventVirtualLink: ticketData.eventVirtualLink }),
      ...(ticketData.eventVenue && { eventVenue: ticketData.eventVenue }),
      userId: ticketData.userId,
      attendeeName: ticketData.attendeeName,
      attendeeEmail: ticketData.attendeeEmail,
      attendeePhone: ticketData.attendeePhone,
      ...(ticketData.attendeeProfileImage && { attendeeProfileImage: ticketData.attendeeProfileImage }),
      organizerId: ticketData.organizerId,
      organizerName: ticketData.organizerName,
      ...(ticketData.organizerEmail && { organizerEmail: ticketData.organizerEmail }),
      price: ticketData.price,
      priceInFOG: ticketData.priceInFOG,
      priceInPKR: ticketData.priceInPKR,
      paymentMethod: ticketData.paymentMethod,
      ...(ticketData.transactionId && { transactionId: ticketData.transactionId }),
      status: 'active',
      purchaseDate: new Date().toISOString(),
      purchaseTimestamp: Date.now(),
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), ticket);
    
    // Update event's currentAttendees count
    await updateEventAttendeeCount(ticketData.eventId, 1);
    
    // Add earnings to organizer for paid events
    if (ticketData.priceInFOG > 0 && ticketData.organizerId) {
      try {
        await addEarnings(
          ticketData.organizerId,
          ticketData.priceInFOG,
          'events',
          ticketData.eventId,
          `Ticket sale for "${ticketData.eventTitle}" - ${ticketData.attendeeName}`
        );
        console.log(`✅ Added ${ticketData.priceInFOG} FOG earnings to organizer ${ticketData.organizerId}`);
      } catch (earningError) {
        console.error('⚠️ Failed to add earnings to organizer:', earningError);
        // Don't throw - ticket was created successfully
      }
    }
    
    console.log('✅ Event ticket created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating event ticket:', error);
    throw error;
  }
}

/**
 * Update event's current attendee count
 */
async function updateEventAttendeeCount(eventId: string, increment_by: number): Promise<void> {
  try {
    const eventRef = doc(db, 'ActiveEvents', eventId);
    await updateDoc(eventRef, {
      currentAttendees: increment(increment_by),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Event attendees updated: +${increment_by}`);
  } catch (error) {
    console.error('❌ Error updating event attendees:', error);
    // Don't throw - ticket already created
  }
}

/**
 * Get all tickets for a specific user
 */
export async function getUserTickets(userId: string): Promise<EventTicket[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const tickets: EventTicket[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventTicket));
    
    console.log(`✅ Found ${tickets.length} tickets for user ${userId}`);
    return tickets;
  } catch (error) {
    console.error('❌ Error getting user tickets:', error);
    throw error;
  }
}

/**
 * Get all tickets (attendees) for a specific event
 */
export async function getEventTickets(eventId: string): Promise<EventTicket[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('eventId', '==', eventId)
    );
    
    const snapshot = await getDocs(q);
    const tickets: EventTicket[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventTicket));
    
    console.log(`✅ Found ${tickets.length} attendees for event ${eventId}`);
    return tickets;
  } catch (error) {
    console.error('❌ Error getting event tickets:', error);
    throw error;
  }
}

/**
 * Check if user already has a ticket for an event
 */
export async function checkUserHasTicket(userId: string, eventId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('eventId', '==', eventId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking user ticket:', error);
    return false;
  }
}

/**
 * Get a specific ticket by user and event
 */
export async function getUserEventTicket(userId: string, eventId: string): Promise<EventTicket | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('eventId', '==', eventId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const ticketDoc = snapshot.docs[0];
    return {
      id: ticketDoc.id,
      ...ticketDoc.data()
    } as EventTicket;
  } catch (error) {
    console.error('❌ Error getting user event ticket:', error);
    return null;
  }
}

/**
 * Cancel a ticket (refund)
 */
export async function cancelTicket(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, COLLECTION_NAME, ticketId);
    
    // Get ticket data to update event attendees
    const ticketDoc = await getDoc(ticketRef);
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const ticketData = ticketDoc.data() as EventTicket;
    
    // Update ticket status
    await updateDoc(ticketRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    
    // Decrease event attendee count
    await updateEventAttendeeCount(ticketData.eventId, -1);
    
    console.log('✅ Ticket cancelled:', ticketId);
  } catch (error) {
    console.error('❌ Error cancelling ticket:', error);
    throw error;
  }
}

/**
 * Mark ticket as used (check-in)
 */
export async function checkInTicket(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, COLLECTION_NAME, ticketId);
    await updateDoc(ticketRef, {
      status: 'used',
      isVerified: true,
      checkInTime: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Ticket checked in:', ticketId);
  } catch (error) {
    console.error('❌ Error checking in ticket:', error);
    throw error;
  }
}

/**
 * Get attendee count for an event
 */
export async function getEventAttendeeCount(eventId: string): Promise<number> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('eventId', '==', eventId),
      where('status', 'in', ['active', 'used'])
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting attendee count:', error);
    return 0;
  }
}
