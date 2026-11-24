export type JobBudgetType = 'hourly' | 'fixed' | 'quote';
export type JobRequestStatus = 'pending' | 'approved' | 'rejected';
export type FogslyJobStatus = 'active' | 'paused' | 'closed' | 'in-progress' | 'completed';

export interface JobRequest {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  categories: string[];
  skills: string[];
  budgetType: JobBudgetType;
  budgetAmount?: number; // Optional for 'quote' type
  budgetCurrency: string;
  budgetInFogCoins?: number; // Calculated FOG coins equivalent
  
  // User Profile Data
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  userCountry: string;
  
  // Status and metadata
  status: JobRequestStatus;
  rejectionReason?: string;
  submittedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: string;
  rejectedBy?: string;
}

export interface CreateJobRequestData {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  categories: string[];
  skills: string[];
  budgetType: JobBudgetType;
  budgetAmount?: number;
  budgetCurrency: string;
  budgetInFogCoins?: number; // Calculated FOG coins equivalent
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  userCountry: string;
}

export interface UpdateJobRequestData {
  jobTitle?: string;
  jobDescription?: string;
  categories?: string[];
  skills?: string[];
  budgetType?: JobBudgetType;
  budgetAmount?: number;
  status?: JobRequestStatus;
  rejectionReason?: string;
}

// FogslyJobs Collection - Approved jobs that are publicly visible
export interface FogslyJob {
  id: string;
  jobRequestId: string; // Reference to original JobRequest
  userId: string;
  jobTitle: string;
  jobDescription: string;
  categories: string[];
  skills: string[];
  budgetType: JobBudgetType;
  budgetAmount?: number;
  budgetCurrency: string;
  budgetInFogCoins?: number; // Calculated FOG coins equivalent
  
  // Client Contact Info
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  userCountry: string;
  
  // Job Status
  status: FogslyJobStatus;
  
  // Metadata
  createdAt: Date;      // When job was approved and added to FogslyJobs
  updatedAt: Date;
  approvedAt: Date;     // From original JobRequest
  approvedBy: string;   // Admin who approved
  
  // Optional tracking
  viewCount?: number;
  applicationCount?: number;
  
  // Job Completion Fields
  completedAt?: Date;
  clientRating?: number; // 1-5 stars
  clientReview?: string;
  clientName?: string;
  clientImage?: string;
  revisionCount?: number;
  adminApproved?: boolean;
  adminApprovedAt?: Date;
  adminApprovedBy?: string;
  
  // Platform Tax Fields (2.5% commission)
  clientPlatformTax?: number;        // Tax paid by client on job posting
  clientTaxPaid?: boolean;           // Flag to prevent double charging
  freelancerPlatformTax?: number;    // Tax deducted from freelancer on completion
  freelancerTaxPaid?: boolean;       // Flag after completion approval
}
