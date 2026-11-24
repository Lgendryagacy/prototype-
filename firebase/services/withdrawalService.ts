import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { 
  WithdrawalRequest, 
  WithdrawalSettings, 
  WithdrawalStats 
} from '../types/withdrawals';
import { getUserEarnings } from './earningsService';
import { getUserProfile } from './userService';
import { getFogCoinSettings } from './fogCoinSettingsService';
import { UserEarnings } from '../types/earnings';

// Collection names
const WITHDRAWAL_REQUESTS_COLLECTION = 'withdrawalRequests';
const WITHDRAWAL_SETTINGS_COLLECTION = 'withdrawalSettings';
const WITHDRAWAL_STATS_COLLECTION = 'withdrawalStats';
const USER_EARNINGS_COLLECTION = 'userEarnings';

/**
 * Deduct withdrawal amount from user's available balance and update totalWithdrawn
 */
const deductWithdrawalFromEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const userEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    await updateDoc(userEarningsRef, {
      availableBalance: increment(-amount), // Deduct from available balance
      totalWithdrawn: increment(amount), // Track total withdrawn
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deducting withdrawal from earnings:', error);
    throw new Error('Failed to deduct withdrawal amount');
  }
};

/**
 * Refund withdrawal amount back to user's available balance
 */
const refundWithdrawalToEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    const userEarningsRef = doc(db, USER_EARNINGS_COLLECTION, userId);
    await updateDoc(userEarningsRef, {
      availableBalance: increment(amount), // Add back to available balance
      totalWithdrawn: increment(-amount), // Reduce total withdrawn
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error refunding withdrawal to earnings:', error);
    throw new Error('Failed to refund withdrawal amount');
  }
};

/**
 * Get withdrawal settings (now gets from FogCoin settings)
 */
export const getWithdrawalSettings = async (): Promise<WithdrawalSettings | null> => {
  try {
    // Get settings from FogCoin management instead of static withdrawal settings
    const fogCoinSettings = await getFogCoinSettings();
    
    // Convert FogCoin settings to withdrawal settings format
    const withdrawalSettings: WithdrawalSettings = {
      id: 'default',
      minimumWithdrawAmount: fogCoinSettings.minimumWithdrawAmount,
      processingTimeHours: 24, // Default processing time
      isWithdrawalsEnabled: fogCoinSettings.isWithdrawalsEnabled,
      supportedCurrencies: ['PKR', 'USD'],
      lastUpdatedBy: fogCoinSettings.lastUpdatedBy,
      lastUpdatedAt: fogCoinSettings.lastUpdatedAt,
      notes: fogCoinSettings.notes || 'Settings from FogCoin Management'
    };
    
    return withdrawalSettings;
  } catch (error) {
    console.error('Error getting withdrawal settings:', error);
    throw new Error('Failed to get withdrawal settings');
  }
};

/**
 * Create a new withdrawal request
 */
export const createWithdrawalRequest = async (
  userId: string,
  amount: number,
  currency: 'PKR' | 'USD',
  accountDetails: any
): Promise<string> => {
  try {
    // Get withdrawal settings
    const settings = await getWithdrawalSettings();
    if (!settings?.isWithdrawalsEnabled) {
      throw new Error('Withdrawals are currently disabled');
    }

    if (amount < settings.minimumWithdrawAmount) {
      throw new Error(`Minimum withdrawal amount is ${settings.minimumWithdrawAmount} FOG coins`);
    }

    // Get user earnings - use new UserEarnings structure
    const userEarnings = await getUserEarnings(userId);
    if (!userEarnings) {
      throw new Error('User earnings not found');
    }

    // Check if user has sufficient available balance
    if (amount > userEarnings.availableBalance) {
      throw new Error(`Insufficient balance. Available: ${userEarnings.availableBalance.toFixed(2)} FOG coins`);
    }

    // Get user profile for account verification
    const userProfile = await getUserProfile(userId);
    if (!userProfile?.withdrawalAccount) {
      throw new Error('No withdrawal account found. Please add your withdrawal account in settings.');
    }

    // Verify account details exist
    if (currency === 'PKR' && !userProfile.withdrawalAccount.pkr) {
      throw new Error('PKR account not found. Please add your PKR account in settings.');
    }
    if (currency === 'USD' && !userProfile.withdrawalAccount.usd) {
      throw new Error('USD account not found. Please add your USD account in settings.');
    }

    // Create withdrawal request
    const withdrawalRequest: Omit<WithdrawalRequest, 'id'> = {
      userId,
      amount,
      currency,
      account: {
        type: currency,
        ...(currency === 'PKR' ? {
          accountName: userProfile.withdrawalAccount.pkr?.accountName,
          accountNumber: userProfile.withdrawalAccount.pkr?.accountNumber,
          bankName: userProfile.withdrawalAccount.pkr?.bankName,
          ibanNumber: userProfile.withdrawalAccount.pkr?.ibanNumber,
        } : {
          serviceName: userProfile.withdrawalAccount.usd?.serviceName,
          walletAddress: userProfile.withdrawalAccount.usd?.walletAddress,
        })
      },
      status: 'pending',
      requestedAt: new Date(),
      userEarningsBeforeWithdrawal: userEarnings.availableBalance,
      userEarningsAfterWithdrawal: userEarnings.availableBalance - amount
    };

    // Add withdrawal request to database
    const docRef = await addDoc(collection(db, WITHDRAWAL_REQUESTS_COLLECTION), withdrawalRequest);

    // Deduct withdrawal amount from user's available balance
    await deductWithdrawalFromEarnings(userId, amount);

    // Update withdrawal stats
    await updateWithdrawalStats(userId, amount, 'pending');

    return docRef.id;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    throw error;
  }
};

/**
 * Get user's withdrawal requests
 */
export const getUserWithdrawalRequests = async (
  userId: string, 
  includeHidden: boolean = false
): Promise<WithdrawalRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, WITHDRAWAL_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    const allRequests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to Dates
      requestedAt: doc.data().requestedAt?.toDate() || new Date(doc.data().requestedAt),
      processedAt: doc.data().processedAt?.toDate() || (doc.data().processedAt ? new Date(doc.data().processedAt) : undefined),
      completedAt: doc.data().completedAt?.toDate() || (doc.data().completedAt ? new Date(doc.data().completedAt) : undefined)
    } as WithdrawalRequest));
    
    // Filter out hidden requests unless specifically requested
    if (!includeHidden) {
      return allRequests.filter(request => !request.hiddenByUser);
    }
    
    return allRequests;
  } catch (error) {
    console.error('Error getting user withdrawal requests:', error);
    throw new Error('Failed to get withdrawal requests');
  }
};

/**
 * Get all withdrawal requests (Admin function)
 */
export const getAllWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, WITHDRAWAL_REQUESTS_COLLECTION),
      orderBy('requestedAt', 'desc')
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    return requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to Dates
      requestedAt: doc.data().requestedAt?.toDate() || new Date(doc.data().requestedAt),
      processedAt: doc.data().processedAt?.toDate() || (doc.data().processedAt ? new Date(doc.data().processedAt) : undefined),
      completedAt: doc.data().completedAt?.toDate() || (doc.data().completedAt ? new Date(doc.data().completedAt) : undefined)
    } as WithdrawalRequest));
  } catch (error) {
    console.error('Error getting all withdrawal requests:', error);
    throw new Error('Failed to get withdrawal requests');
  }
};

/**
 * Get withdrawal stats for user
 */
export const getUserWithdrawalStats = async (userId: string): Promise<WithdrawalStats | null> => {
  try {
    const statsRef = doc(db, WITHDRAWAL_STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { userId, ...statsDoc.data() } as WithdrawalStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting withdrawal stats:', error);
    return null;
  }
};

/**
 * Update withdrawal stats (internal function)
 */
const updateWithdrawalStats = async (userId: string, amount: number, status: 'pending' | 'completed' | 'rejected'): Promise<void> => {
  try {
    const statsRef = doc(db, WITHDRAWAL_STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);
    
    let currentStats: WithdrawalStats;
    
    if (statsDoc.exists()) {
      currentStats = { userId, ...statsDoc.data() } as WithdrawalStats;
    } else {
      currentStats = {
        userId,
        totalWithdrawals: 0,
        totalWithdrawnAmount: 0,
        pendingWithdrawals: 0,
        pendingAmount: 0,
        completedWithdrawals: 0,
        completedAmount: 0,
        rejectedWithdrawals: 0,
        rejectedAmount: 0
      };
    }

    // Update stats based on status
    switch (status) {
      case 'pending':
        currentStats.totalWithdrawals += 1;
        currentStats.totalWithdrawnAmount += amount;
        currentStats.pendingWithdrawals += 1;
        currentStats.pendingAmount += amount;
        currentStats.lastWithdrawalDate = new Date();
        break;
      case 'completed':
        currentStats.pendingWithdrawals -= 1;
        currentStats.pendingAmount -= amount;
        currentStats.completedWithdrawals += 1;
        currentStats.completedAmount += amount;
        break;
      case 'rejected':
        currentStats.pendingWithdrawals -= 1;
        currentStats.pendingAmount -= amount;
        currentStats.rejectedWithdrawals += 1;
        currentStats.rejectedAmount += amount;
        break;
    }

    await setDoc(statsRef, currentStats);
  } catch (error) {
    console.error('Error updating withdrawal stats:', error);
    throw new Error('Failed to update withdrawal stats');
  }
};

/**
 * Cancel withdrawal request (only for pending requests)
 */
export const cancelWithdrawalRequest = async (withdrawalId: string, userId: string): Promise<void> => {
  try {
    const withdrawalRef = doc(db, WITHDRAWAL_REQUESTS_COLLECTION, withdrawalId);
    const withdrawalDoc = await getDoc(withdrawalRef);
    
    if (!withdrawalDoc.exists()) {
      throw new Error('Withdrawal request not found');
    }
    
    const withdrawal = withdrawalDoc.data() as WithdrawalRequest;
    
    if (withdrawal.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    if (withdrawal.status !== 'pending') {
      throw new Error('Can only cancel pending withdrawals');
    }
    
    // Update withdrawal status
    await updateDoc(withdrawalRef, {
      status: 'cancelled',
      processedAt: new Date()
    });
    
    // Refund the amount back to user's available balance
    await refundWithdrawalToEarnings(userId, withdrawal.amount);
    
    // Update withdrawal stats
    await updateWithdrawalStats(userId, withdrawal.amount, 'rejected');
  } catch (error) {
    console.error('Error cancelling withdrawal request:', error);
    throw error;
  }
};

/**
 * Admin function: Update withdrawal request status
 */
export const updateWithdrawalStatus = async (
  withdrawalId: string,
  status: 'processing' | 'completed' | 'rejected',
  adminNotes?: string,
  rejectionReason?: string,
  transactionId?: string
): Promise<void> => {
  try {
    const withdrawalRef = doc(db, WITHDRAWAL_REQUESTS_COLLECTION, withdrawalId);
    const withdrawalDoc = await getDoc(withdrawalRef);
    
    if (!withdrawalDoc.exists()) {
      throw new Error('Withdrawal request not found');
    }
    
    const withdrawal = withdrawalDoc.data() as WithdrawalRequest;
    
    const updateData: any = {
      status,
      processedAt: new Date()
    };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.transactionId = transactionId;
    }
    
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
      
      // Refund the amount back to user's available balance
      await refundWithdrawalToEarnings(withdrawal.userId, withdrawal.amount);
    }
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    await updateDoc(withdrawalRef, updateData);
    
    // Update withdrawal stats
    if (status === 'completed' || status === 'rejected') {
      await updateWithdrawalStats(withdrawal.userId, withdrawal.amount, status);
    }
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    throw error;
  }
};

/**
 * Toggle the hidden status of a withdrawal request for the user
 */
export const toggleWithdrawalHiddenStatus = async (
  requestId: string, 
  userId: string, 
  isHidden: boolean
): Promise<void> => {
  try {
    const withdrawalRef = doc(db, WITHDRAWAL_REQUESTS_COLLECTION, requestId);
    
    // First verify the request belongs to the user
    const withdrawalDoc = await getDoc(withdrawalRef);
    if (!withdrawalDoc.exists()) {
      throw new Error('Withdrawal request not found');
    }
    
    const withdrawal = withdrawalDoc.data() as WithdrawalRequest;
    if (withdrawal.userId !== userId) {
      throw new Error('Unauthorized: Request does not belong to user');
    }
    
    // Update the hidden status
    await updateDoc(withdrawalRef, {
      hiddenByUser: isHidden,
      lastUpdatedAt: new Date()
    });
  } catch (error) {
    console.error('Error toggling withdrawal hidden status:', error);
    throw error;
  }
};
