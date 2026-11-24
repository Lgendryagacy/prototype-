// Unified transaction types for all money movements

export type TransactionType = 
  | 'ad_earning'
  | 'referral_earning'
  | 'task_earning'
  | 'bonus_earning'
  | 'deposit_earning'
  | 'freelance_job_earning'
  | 'fogsly_service_earning'
  | 'fogsly_physical_earning'
  | 'event_earning'         // Event ticket sale earnings
  | 'event_ticket_purchase' // Event ticket purchase by attendee
  | 'deposit_request'
  | 'deposit_approved'
  | 'deposit_rejected'
  | 'transfer_sent'
  | 'transfer_received'
  | 'withdrawal'
  | 'job_payment'          // Payment deducted when posting a job
  | 'job_refund'           // Refund when job request is rejected
  | 'platform_tax';        // Platform commission (2.5% tax)

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // FOG coins (positive for credits, negative for debits)
  
  // For transfers
  fromUserId?: string;
  toUserId?: string;
  fromWalletAddress?: string;
  toWalletAddress?: string;
  
  // For earnings
  sourceId?: string; // adId, jobId, referralId, taskId, serviceId, eventId
  sourceType?: 'ads' | 'referrals' | 'tasks' | 'bonuses' | 'deposit' | 'freelanceJobs' | 'fogslyServices' | 'fogslyPhysical' | 'events';
  
  // For deposits
  usdAmount?: number;
  localAmount?: number;
  localCurrency?: 'USD' | 'PKR';
  fogUsdRate?: number;
  bankAccountId?: string;
  proofOfPaymentUrl?: string;
  proofUploadedAt?: Date;
  
  // Admin actions (for deposits)
  verifiedBy?: string;
  verifiedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Status
  status: TransactionStatus;
  
  // Metadata
  description: string;
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
}

export interface CreateTransactionData {
  userId: string;
  type: TransactionType;
  amount: number;
  sourceId?: string;
  sourceType?: string;
  description: string;
  notes?: string;
  status?: TransactionStatus;
}
