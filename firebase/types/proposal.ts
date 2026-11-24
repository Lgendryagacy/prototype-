// JobProposal Types for Firestore

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'closed';

export type TimeUnit = 'days' | 'weeks' | 'months';

export type AvailabilityType = 'full-time' | 'part-time' | 'as-needed';

export interface JobProposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  
  // Proposal details
  bidAmount: number;
  bidCurrency: string; // e.g., "USD", "EUR"
  deliveryTime: number;
  deliveryTimeUnit: TimeUnit;
  coverLetter: string;
  relevantExperience?: string;
  portfolioLinks: string[];
  questionsForClient?: string;
  availability: AvailabilityType;
  
  // File attachments (URLs after upload)
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  
  // Status tracking
  status: ProposalStatus;
  submittedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  
  // Deadline tracking (calculated when proposal is approved)
  deadline?: Date;
  
  // Modification request (only latest modification tracked)
  modificationRequest?: {
    newDeliveryTime?: number;
    newDeliveryTimeUnit?: TimeUnit;
    newBidAmount?: number;
    reason?: string;
    status: 'pending' | 'accepted' | 'rejected';
    requestedAt: Date;
  };
  
  // Additional metadata
  isWithdrawn: boolean;
  withdrawnAt?: Date;
}

// For form submission
export interface ProposalFormData {
  bidAmount: number;
  bidCurrency: string;
  deliveryTime: number;
  deliveryTimeUnit: TimeUnit;
  coverLetter: string;
  relevantExperience?: string;
  portfolioLinks: string[];
  questionsForClient?: string;
  availability: AvailabilityType;
  attachments: File[];
}

// Statistics for client view
export interface ProposalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  closed: number;
}
