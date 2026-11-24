export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  referralCode: string;
  timestamp: Date;
  status: 'active' | 'inactive';
}

export interface SurveyData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  hearAboutUs: string;
  primaryGoal: string;
  timestamp: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  thisMonthReferrals: number;
  referrals: Referral[];
}
