// Work Delivery Types for Firestore

export type DeliveryStatus = 'delivered' | 'modification_requested' | 're_delivered' | 'accepted' | 'rejected';
export type DeliveryType = 'files' | 'url' | 'both';

export interface DeliveryFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface ModificationRequest {
  id: string;
  description: string;
  requestedAt: Date;
  requestedBy: string; // clientId
  clientName: string;
}

export interface WorkDelivery {
  id: string;
  jobRequestId: string;
  proposalId: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  
  // Delivery content
  deliveryType: DeliveryType;
  files: DeliveryFile[];
  urls: string[];
  description: string;
  
  // Status tracking
  status: DeliveryStatus;
  modificationCount: number; // max 5
  modificationRequests: ModificationRequest[];
  
  // Timing
  deliveryDeadline: Date;
  deliveredAt: Date;
  acceptedAt?: Date;
  lastRedeliveredAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// For creating new work delivery
export interface CreateWorkDeliveryData {
  jobRequestId: string;
  proposalId: string;
  deliveryType: DeliveryType;
  files: File[];
  urls: string[];
  description: string;
}

// For requesting modifications
export interface RequestModificationData {
  deliveryId: string;
  description: string;
}

// For re-delivery
export interface RedeliveryData {
  deliveryId: string;
  deliveryType: DeliveryType;
  files: File[];
  urls: string[];
  description: string;
}