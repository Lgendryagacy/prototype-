import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config';
import { Referral, SurveyData, ReferralStats } from '../types/referral';

// Generate unique referral code
export const generateReferralCode = (identifier: string): string => {
  // Use username or email prefix
  const prefix = identifier.split('@')[0].toLowerCase(); // Changed to LOWERCASE
  // Generate 4 random digits
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}_${randomDigits}`;
};

// Create referral code for user
export const createReferralCodeForUser = async (
  userId: string,
  username: string,
  email: string
): Promise<string> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Check if user already has a referral code
    const userData = userDoc.data();
    if (userData.referralCode) {
      return userData.referralCode;
    }

    // Generate new referral code
    const identifier = email;
    let referralCode = generateReferralCode(identifier);
    
    // Ensure uniqueness by checking if code already exists
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true;
      } else {
        // Generate new code
        referralCode = generateReferralCode(identifier);
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique referral code');
    }

    // Update user with referral code
    await updateDoc(userRef, {
      referralCode,
      referralCodeCreatedAt: Timestamp.now()
    });

    return referralCode;
  } catch (error) {
    console.error('Error creating referral code:', error);
    throw error;
  }
};

// Submit survey
export const submitSurvey = async (surveyData: Omit<SurveyData, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const surveyRef = doc(collection(db, 'FogslySurvey'));
    await setDoc(surveyRef, {
      ...surveyData,
      timestamp: Timestamp.now()
    });

    // Mark user as survey completed
    const userRef = doc(db, 'users', surveyData.userId);
    await updateDoc(userRef, {
      surveyCompleted: true,
      surveyCompletedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }
};

// Validate referral code
export const validateReferralCode = async (referralCode: string): Promise<{ valid: boolean; referrerId?: string }> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false };
    }

    const referrerDoc = querySnapshot.docs[0];
    return { valid: true, referrerId: referrerDoc.id };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false };
  }
};

// Create referral record
export const createReferral = async (
  referralCode: string,
  referredUserId: string,
  referredUserName: string,
  referredUserEmail: string
): Promise<void> => {
  try {
    // Validate referral code and get referrer
    const validation = await validateReferralCode(referralCode);
    
    if (!validation.valid || !validation.referrerId) {
      throw new Error('Invalid referral code');
    }

    // Create referral record
    const referralRef = doc(collection(db, 'referrals'));
    await setDoc(referralRef, {
      referrerId: validation.referrerId,
      referredUserId,
      referredUserName,
      referredUserEmail,
      referralCode,
      timestamp: Timestamp.now(),
      status: 'active'
    });

    // Update referred user with referrer info
    const userRef = doc(db, 'users', referredUserId);
    await updateDoc(userRef, {
      referredBy: validation.referrerId,
      referralCodeUsed: referralCode,
      referredAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
};

// Get user's referrals
export const getUserReferrals = async (userId: string): Promise<ReferralStats> => {
  try {
    const referralsRef = collection(db, 'referrals');
    
    // Try to get referrals with orderBy (requires index)
    // If index doesn't exist yet, fall back to simple query
    let querySnapshot;
    try {
      const q = query(
        referralsRef,
        where('referrerId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index error, use simple query without orderBy
      console.warn('Firestore index not created yet, using simple query:', indexError);
      const q = query(
        referralsRef,
        where('referrerId', '==', userId)
      );
      querySnapshot = await getDocs(q);
    }

    const referrals: Referral[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Referral[];

    // Sort manually if orderBy wasn't used
    referrals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;

    // Calculate this month's referrals
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthReferrals = referrals.filter(r => r.timestamp >= firstDayOfMonth).length;

    return {
      totalReferrals,
      activeReferrals,
      thisMonthReferrals,
      referrals
    };
  } catch (error) {
    console.error('Error getting user referrals:', error);
    // Return empty stats instead of throwing
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      thisMonthReferrals: 0,
      referrals: []
    };
  }
};

// Check if user has completed survey
export const hasCompletedSurvey = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    return userDoc.data().surveyCompleted === true;
  } catch (error) {
    console.error('Error checking survey completion:', error);
    return false;
  }
};
