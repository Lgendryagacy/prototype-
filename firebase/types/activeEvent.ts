import { Timestamp } from 'firebase/firestore';
import type { JobLocation } from './physicalJob';

export type ActiveEventStatus = 'active' | 'paused' | 'closed';
export type EventType = 'physical' | 'virtual';

export interface ActiveEvent {
  id?: string;
  
  // Event Information
  title: string;
  description: string;
  category: string;
  tags: string[];
  banner?: string;
  
  // Event Type & Location
  type: EventType;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  virtualLink?: string;
  location?: JobLocation;
  
  // Schedule
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  
  // Pricing & Capacity
  priceInPKR: string;
  priceInFOG: string;
  isFree: boolean;
  maxCapacity: string;
  currentAttendees: number; // Track total registered attendees
  
  // Organizer Information
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  organizerProfile?: string;
  
  // Status & Admin Tracking
  eventStatus: ActiveEventStatus;
  originalRequestId: string; // Reference to EventRequest document
  approvedBy: string; // Admin userId who approved
  approvedAt: Timestamp;
  activatedAt: Timestamp;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateActiveEventData extends Omit<ActiveEvent, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees' | 'eventStatus' | 'approvedAt' | 'activatedAt'> {
  // All fields from ActiveEvent except auto-generated ones
}
