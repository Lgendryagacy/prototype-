// Types for the earnings and wallet dashboard system

export type EarningSourceType = 
  | 'ads' 
  | 'referrals' 
  | 'tasks' 
  | 'bonuses' 
  | 'deposit'  // Changed from 'deposits' to match field name
  | 'freelanceJobs'
  | 'fogslyServices'
  | 'fogslyPhysical'
  | 'events';  // Event ticket sales earnings

export interface EarningSource {
  id: string;
  name: string;
  type: EarningSourceType;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface UserEarnings {
  userId: string;
  
  // Current available balances by source (auto-transferred to wallet)
  adsEarnings: number; // From watching ads
  referralEarnings: number; // From referrals
  taskEarnings: number; // From completing tasks
  bonusEarnings: number; // From promotions/bonuses
  depositEarnings: number; // From USD/PKR deposits
  freelanceJobsEarnings: number; // From completed freelance jobs
  fogslyServicesEarnings: number; // From Fogsly marketplace services
  fogslyPhysicalEarnings: number; // From physical products/services
  eventsEarnings: number; // From event ticket sales
  
  // Sum of all available balances (auto-synced with walletBalance)
  availableBalance: number;
  
  // Lifetime totals (never decreases - for stats only)
  totalAdsEarnings: number;
  totalReferralEarnings: number;
  totalTaskEarnings: number;
  totalBonusEarnings: number;
  totalDepositEarnings: number;
  totalFreelanceJobsEarnings: number;
  totalFogslyServicesEarnings: number;
  totalFogslyPhysicalEarnings: number;
  totalEventsEarnings: number;
  
  // Grand totals
  lifetimeEarnings: number; // Sum of all lifetime earnings
  totalWithdrawn: number; // Total sent/withdrawn
  totalSpent: number; // Total used for services
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Daily activity tracking
export interface UserDailyActivity {
  userId: string;
  date: string; // Format: "YYYY-MM-DD"
  
  // Ad watching
  adsWatched: number;
  adsEarned: number;
  adWatchLimit: number; // Default 10
  adsRemaining: number;
  
  // Other activities
  referralsMade: number;
  tasksCompleted: number;
  jobsCompleted: number;
  servicesCompleted: number;
  
  lastAdWatchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
