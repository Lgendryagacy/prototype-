import { Timestamp } from 'firebase/firestore';
import { JobLocation } from './physicalJob';

export type EventType = 'physical' | 'virtual';
export type EventStatus = 'pending' | 'rejected' | 'approved';

export interface EventRequest {
  id: string;
  
  // User Information
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userProfile: string; // Profile picture URL
  
  // Event Details
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Event Type & Location
  type: EventType;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  location?: JobLocation;
  virtualLink?: string;
  
  // Schedule
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  
  // Pricing & Capacity
  priceInPKR: string;
  priceInFOG: number;
  isFree: boolean;
  maxCapacity: string;
  
  // Banner
  banner: string;
  
  // Status & Timestamps
  eventStatus: EventStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Optional: Admin review
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}

export interface CreateEventRequestData {
  // User Information
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userProfile: string;
  
  // Event Details
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Event Type & Location
  type: EventType;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  location?: JobLocation;
  virtualLink?: string;
  
  // Schedule
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  
  // Pricing & Capacity
  priceInPKR: string;
  priceInFOG: number;
  isFree: boolean;
  maxCapacity: string;
  
  // Banner
  banner: string;
}
