// Types for the withdrawal system

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number; // FOG coins to withdraw
  currency: 'PKR' | 'USD';
  account: {
    type: 'PKR' | 'USD';
    // PKR account details
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    ibanNumber?: string;
    // USD account details
    serviceName?: string;
    walletAddress?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  adminNotes?: string;
  rejectionReason?: string;
  transactionId?: string;
  userEarningsBeforeWithdrawal: number; // User's total earnings before this withdrawal
  userEarningsAfterWithdrawal: number; // User's total earnings after this withdrawal
  hiddenByUser?: boolean; // Whether the user has hidden this request from their view
}

export interface WithdrawalSettings {
  id: string;
  minimumWithdrawAmount: number; // Minimum FOG coins required for withdrawal
  processingTimeHours: number; // Expected processing time in hours
  isWithdrawalsEnabled: boolean;
  supportedCurrencies: ('PKR' | 'USD')[];
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
  notes: string;
}

export interface WithdrawalStats {
  userId: string;
  totalWithdrawals: number;
  totalWithdrawnAmount: number;
  pendingWithdrawals: number;
  pendingAmount: number;
  completedWithdrawals: number;
  completedAmount: number;
  rejectedWithdrawals: number;
  rejectedAmount: number;
  lastWithdrawalDate?: Date;
}
