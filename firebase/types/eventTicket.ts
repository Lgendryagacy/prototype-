export interface EventTicket {
  id?: string;
  
  // Ticket Information
  ticketId: string; // Unique ticket ID (e.g., "TKT-ABC123")
  eventId: string;
  eventTitle: string;
  eventBanner?: string;
  eventDate: string;
  eventTime: string;
  eventType: 'physical' | 'virtual';
  eventVenue?: string; // For physical events
  eventVirtualLink?: string; // For virtual events
  
  // Attendee Information
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeProfileImage?: string;
  
  // Organizer Information
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  
  // Payment Information
  price: string; // e.g., "50 FOG" or "Free"
  priceInFOG: number; // Numeric value
  priceInPKR: string;
  paymentMethod: 'fog-coins' | 'free';
  transactionId?: string; // Reference to transaction record
  
  // Status & Timestamps
  status: 'active' | 'cancelled' | 'used' | 'expired';
  purchaseDate: string; // ISO date string
  purchaseTimestamp: number;
  
  // QR Code & Verification
  qrCode?: string; // Base64 QR code image
  isVerified: boolean;
  checkInTime?: string;
  
  // Metadata
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateTicketData {
  eventId: string;
  eventTitle: string;
  eventBanner?: string;
  eventDate: string;
  eventTime: string;
  eventType: 'physical' | 'virtual';
  eventVenue?: string;
  eventVirtualLink?: string;
  
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeProfileImage?: string;
  
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  
  price: string;
  priceInFOG: number;
  priceInPKR: string;
  paymentMethod: 'fog-coins' | 'free';
  transactionId?: string;
}
