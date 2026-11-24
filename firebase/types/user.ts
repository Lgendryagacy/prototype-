// User type for authentication
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

// User data stored in users collection
export interface UserData {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin';
  rank?: number; // Add rank field
  createdAt: Date;
  updatedAt: Date;
  // Referral system fields
  referralCode?: string;
  referralCodeCreatedAt?: Date;
  surveyCompleted?: boolean;
  surveyCompletedAt?: Date;
  referredBy?: string;
  referralCodeUsed?: string;
  referredAt?: Date;
}

// Withdrawal account interface
export interface WithdrawalAccount {
  pkr?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ibanNumber?: string; // Optional field
  };
  usd?: {
    serviceName: string;
    walletAddress: string;
  };
}

// User profile data stored in userProfile collection
export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  phone?: string;
  gender?: string; // male, female, rather_not_say
  ageRange?: string; // under_18, 18_25, 26_35, 36_45, 46_55, 56_above
  bio?: string;
  skills?: string[];
  social?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  withdrawalAccount?: WithdrawalAccount; // Add withdrawal account
  stats?: {
    rating?: string;
    reviews?: string;
    projects?: string;
    completionRate?: string;
  };
  avatarUrl?: string;
  coverUrl?: string;
  rank?: number; // Add rank field
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRanking {
  userId: string;
  rank: number;
  email: string;
  name: string;
  signupDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// Auth form data types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Auth response type
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
  email?: string;
}
