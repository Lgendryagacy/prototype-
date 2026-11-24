// Unified earnings service with auto-transfer to wallet
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  writeBatch,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config';
import { UserEarnings, EarningSourceType, UserDailyActivity } from '../types/earnings';
import { Transaction } from '../types/transaction';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Initialize user earnings document
 */
export const initializeUserEarnings = async (
  userId: string
): Promise<void> => {
  // Check if document already exists by querying userId field
  const earningsQuery = query(
    collection(db, 'userEarnings'),
    where('userId', '==', userId)
  );
  const existingDocs = await getDocs(earningsQuery);
  
  if (!existingDocs.empty) {
    console.log(`✅ UserEarnings already exists for userId: ${userId}`);
    return;
  }
  
  // Create new document with auto-generated ID
  const earningsRef = doc(collection(db, 'userEarnings'));
  
  const initialEarnings: UserEarnings = {
    userId,
    
    // Current balances
    adsEarnings: 0,
    referralEarnings: 0,
    taskEarnings: 0,
    bonusEarnings: 0,
    depositEarnings: 0,
    freelanceJobsEarnings: 0,
    fogslyServicesEarnings: 0,
    fogslyPhysicalEarnings: 0,
    eventsEarnings: 0,
    
    availableBalance: 0,
    
    // Lifetime totals
    totalAdsEarnings: 0,
    totalReferralEarnings: 0,
    totalTaskEarnings: 0,
    totalBonusEarnings: 0,
    totalDepositEarnings: 0,
    totalFreelanceJobsEarnings: 0,
    totalFogslyServicesEarnings: 0,
    totalFogslyPhysicalEarnings: 0,
    totalEventsEarnings: 0,
    
    lifetimeEarnings: 0,
    totalWithdrawn: 0,
    totalSpent: 0,
    
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(earningsRef, initialEarnings);
  console.log(`✅ Created new userEarnings document ${earningsRef.id} for userId: ${userId}`);
};

/**
 * Add earnings from any source with AUTO-TRANSFER to wallet
 */
export const addEarnings = async (
  userId: string,
  amount: number,
  sourceType: EarningSourceType,
  sourceId?: string,
  description?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  try {
    // Find user earnings document by userId field
    const earningsQuery = query(
      collection(db, 'userEarnings'),
      where('userId', '==', userId)
    );
    const earningsSnapshot = await getDocs(earningsQuery);
    
    let earningsRef;
    
    if (earningsSnapshot.empty) {
      // Create new earnings document
      await initializeUserEarnings(userId);
      const newSnapshot = await getDocs(earningsQuery);
      if (newSnapshot.empty) {
        throw new Error('Failed to create user earnings');
      }
      earningsRef = newSnapshot.docs[0].ref;
    } else {
      earningsRef = earningsSnapshot.docs[0].ref;
    }
    
    // Query wallet balances by userId field
    const walletQuery = query(
      collection(db, 'walletBalances'),
      where('userId', '==', userId)
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    let walletRef;
    
    if (walletSnapshot.empty) {
      // Create wallet if doesn't exist
      const walletRefNew = doc(collection(db, 'walletBalances'));
      await setDoc(walletRefNew, {
        userId,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      walletRef = walletRefNew;
    } else {
      walletRef = walletSnapshot.docs[0].ref;
    }
    
    // Determine the field names for this source type
    const earningsField = `${sourceType}Earnings`;
    const totalField = `total${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}Earnings`;
    
    // Perform the updates in a batch
    const batch = writeBatch(db);
    
    // Update earnings
    batch.update(earningsRef, {
      [earningsField]: increment(amount),
      [totalField]: increment(amount),
      lifetimeEarnings: increment(amount),
      availableBalance: increment(amount),
      updatedAt: new Date()
    });
    
    // Auto-transfer to wallet
    batch.update(walletRef, {
      balance: increment(amount),
      updatedAt: new Date()
    });
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    batch.set(transactionRef, {
      userId,
      type: 'earning' as const,
      amount,
      sourceType,
      sourceId: sourceId || '',
      description: description || `${sourceType} earnings`,
      status: 'completed' as const,
      createdAt: new Date()
    });
    
    await batch.commit();
    console.log(`✅ Added ${amount} FOG earnings (${sourceType}) to user ${userId}`);
  } catch (error) {
    console.error('❌ Error adding earnings:', error);
    throw error;
  }
};

/**
 * Get user earnings
 */
export const getUserEarnings = async (
  userId: string
): Promise<UserEarnings | null> => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return null;
  }

  try {
    // Query by userId field, not document ID
    const earningsQuery = query(
      collection(db, 'userEarnings'),
      where('userId', '==', userId)
    );
    const earningsSnapshot = await getDocs(earningsQuery);
    
    if (earningsSnapshot.empty) {
      return null;
    }
    
    return earningsSnapshot.docs[0].data() as UserEarnings;
  } catch (error) {
    console.warn('Notice getting user earnings:', error);
    return null;
  }
};

/**
 * Get or create today's activity
 */
export const getTodayActivity = async (
  userId: string
): Promise<UserDailyActivity> => {
  const today = formatDate(new Date());
  const activityRef = doc(db, 'userDailyActivities', `${userId}_${today}`);
  const activityDoc = await getDoc(activityRef);
  
  if (activityDoc.exists()) {
    return activityDoc.data() as UserDailyActivity;
  }
  
  // Create new activity
  const newActivity: UserDailyActivity = {
    userId,
    date: today,
    adsWatched: 0,
    adsEarned: 0,
    adWatchLimit: 10,
    adsRemaining: 10,
    referralsMade: 0,
    tasksCompleted: 0,
    jobsCompleted: 0,
    servicesCompleted: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(activityRef, newActivity);
  return newActivity;
};

/**
 * Update daily activity (for ads watching)
 */
export const updateDailyActivity = async (
  userId: string,
  activityType: 'ads' | 'referrals' | 'tasks' | 'jobs' | 'services',
  earnedAmount?: number
): Promise<void> => {
  const today = formatDate(new Date());
  const activityRef = doc(db, 'userDailyActivities', `${userId}_${today}`);
  
  const updates: any = {
    updatedAt: new Date()
  };
  
  switch (activityType) {
    case 'ads':
      updates.adsWatched = increment(1);
      updates.adsRemaining = increment(-1);
      if (earnedAmount) {
        updates.adsEarned = increment(earnedAmount);
      }
      updates.lastAdWatchedAt = new Date();
      break;
    case 'referrals':
      updates.referralsMade = increment(1);
      break;
    case 'tasks':
      updates.tasksCompleted = increment(1);
      break;
    case 'jobs':
      updates.jobsCompleted = increment(1);
      break;
    case 'services':
      updates.servicesCompleted = increment(1);
      break;
  }
  
  await setDoc(activityRef, updates, { merge: true });
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (
  userId: string,
  limitCount: number = 10
): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to Date objects
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : (data.completedAt ? new Date(data.completedAt) : undefined),
      failedAt: data.failedAt?.toDate ? data.failedAt.toDate() : (data.failedAt ? new Date(data.failedAt) : undefined),
      cancelledAt: data.cancelledAt?.toDate ? data.cancelledAt.toDate() : (data.cancelledAt ? new Date(data.cancelledAt) : undefined),
      verifiedAt: data.verifiedAt?.toDate ? data.verifiedAt.toDate() : (data.verifiedAt ? new Date(data.verifiedAt) : undefined),
      approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : (data.approvedAt ? new Date(data.approvedAt) : undefined),
      rejectedAt: data.rejectedAt?.toDate ? data.rejectedAt.toDate() : (data.rejectedAt ? new Date(data.rejectedAt) : undefined),
      proofUploadedAt: data.proofUploadedAt?.toDate ? data.proofUploadedAt.toDate() : (data.proofUploadedAt ? new Date(data.proofUploadedAt) : undefined),
    } as Transaction;
  });
};

/**
 * Get job-related transactions (payments and refunds)
 */
export const getJobTransactions = async (
  userId: string
): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('type', 'in', ['job_payment', 'job_refund']),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};

/**
 * Get weekly activity stats
 */
export const getWeeklyActivity = async (
  userId: string
): Promise<UserDailyActivity[]> => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return formatDate(date);
  });
  
  const promises = last7Days.map(date =>
    getDoc(doc(db, 'userDailyActivities', `${userId}_${date}`))
  );
  
  const docs = await Promise.all(promises);
  
  return docs
    .filter(doc => doc.exists())
    .map(doc => doc.data() as UserDailyActivity);
};

// Backward compatibility - these functions wrap the new addEarnings function
export const addAdsEarnings = async (userId: string, amount: number, adId?: string) => {
  await addEarnings(userId, amount, 'ads', adId, `Earned ${amount} FOG from watching ad`);
};

export const addReferralEarnings = async (userId: string, amount: number, referralId?: string) => {
  await addEarnings(userId, amount, 'referrals', referralId, `Earned ${amount} FOG from referral`);
};

export const addTaskEarnings = async (userId: string, amount: number, taskId?: string) => {
  await addEarnings(userId, amount, 'tasks', taskId, `Earned ${amount} FOG from task`);
};

export const addBonusEarnings = async (userId: string, amount: number, bonusId?: string) => {
  await addEarnings(userId, amount, 'bonuses', bonusId, `Earned ${amount} FOG bonus`);
};

export const addFreelanceJobEarnings = async (userId: string, amount: number, jobId?: string) => {
  await addEarnings(userId, amount, 'freelanceJobs', jobId, `Earned ${amount} FOG from freelance job`);
  await updateDailyActivity(userId, 'jobs');
};

export const addFogslyServiceEarnings = async (userId: string, amount: number, serviceId?: string) => {
  await addEarnings(userId, amount, 'fogslyServices', serviceId, `Earned ${amount} FOG from Fogsly service`);
  await updateDailyActivity(userId, 'services');
};

export const addFogslyPhysicalEarnings = async (userId: string, amount: number, productId?: string) => {
  await addEarnings(userId, amount, 'fogslyPhysical', productId, `Earned ${amount} FOG from physical product`);
};

/**
 * Admin: Get all users with their earnings data
 */
export const getAllUsersEarnings = async (): Promise<Array<UserEarnings & { name: string; email: string }>> => {
  try {
    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));
    const usersCollection = collection(db, 'users');
    
    const earningsData = await Promise.all(
      earningsSnapshot.docs.map(async (earningDoc) => {
        const earnings = earningDoc.data() as UserEarnings;
        
        // Get user info
        const userDoc = await getDoc(doc(usersCollection, earnings.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        return {
          ...earnings,
          name: userData?.displayName || userData?.name || 'Unknown User',
          email: userData?.email || 'No email'
        };
      })
    );
    
    return earningsData;
  } catch (error) {
    console.error('Error fetching all users earnings:', error);
    throw error;
  }
};

/**
 * Admin: Update user earnings (any field)
 */
export const updateUserEarnings = async (
  userId: string, 
  updates: Partial<Omit<UserEarnings, 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const earningsRef = doc(db, 'userEarnings', userId);
    await updateDoc(earningsRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user earnings:', error);
    throw error;
  }
};

/**
 * Deduct FOG Coins for job posting
 */
export const deductJobPayment = async (
  userId: string,
  amount: number,
  jobRequestId: string,
  jobTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has sufficient balance
    const earnings = await getUserEarnings(userId);
    if (!earnings) {
      return { success: false, error: 'User earnings not found' };
    }
    
    if (earnings.availableBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    const batch = writeBatch(db);
    
    // Deduct from userEarnings
    const earningsRef = doc(db, 'userEarnings', userId);
    batch.update(earningsRef, {
      availableBalance: increment(-amount),
      totalSpent: increment(amount),
      updatedAt: new Date()
    });
    
    // Deduct from walletBalances
    const walletRef = doc(db, 'walletBalances', userId);
    batch.update(walletRef, {
      availableBalance: increment(-amount),
      totalBalance: increment(-amount),
      lastUpdated: new Date()
    });
    
    await batch.commit();
    
    // Log transaction
    await addDoc(collection(db, 'transactions'), {
      userId,
      type: 'job_payment',
      amount: -amount, // Negative for debit
      sourceId: jobRequestId,
      sourceType: 'job_posting',
      status: 'completed',
      description: `Payment for posting job: ${jobTitle}`,
      notes: `Deducted ${amount} FOG coins for job request`,
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deducting job payment:', error);
    return { success: false, error: 'Failed to process payment' };
  }
};

/**
 * Charge FOG Coins when job is reactivated from paused status
 */
export const chargeJobPayment = async (
  userId: string,
  amount: number,
  jobId: string,
  jobTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has enough balance
    const earningsDoc = await getDoc(doc(db, 'userEarnings', userId));
    if (!earningsDoc.exists()) {
      return { success: false, error: 'User earnings not found' };
    }
    
    const currentBalance = earningsDoc.data().availableBalance || 0;
    if (currentBalance < amount) {
      return { success: false, error: 'Insufficient balance to reactivate job' };
    }
    
    const batch = writeBatch(db);
    
    // Deduct from userEarnings
    const earningsRef = doc(db, 'userEarnings', userId);
    batch.update(earningsRef, {
      availableBalance: increment(-amount),
      totalSpent: increment(amount),
      updatedAt: new Date()
    });
    
    // Deduct from walletBalances
    const walletRef = doc(db, 'walletBalances', userId);
    batch.update(walletRef, {
      availableBalance: increment(-amount),
      totalBalance: increment(-amount),
      lastUpdated: new Date()
    });
    
    await batch.commit();
    
    // Log transaction
    await addDoc(collection(db, 'transactions'), {
      userId,
      type: 'job_payment',
      amount: -amount, // Negative for debit
      sourceId: jobId,
      sourceType: 'job_reactivation',
      status: 'completed',
      description: `Reactivation charge for job: ${jobTitle}`,
      notes: `Charged ${amount} FOG coins for reactivating paused job`,
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error charging job payment:', error);
    return { success: false, error: 'Failed to process payment' };
  }
};

/**
 * Refund FOG Coins when job is rejected, paused, or closed
 */
export const refundJobPayment = async (
  userId: string,
  amount: number,
  jobRequestId: string,
  jobTitle: string,
  reason: 'rejection' | 'pause' | 'close' = 'rejection'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const batch = writeBatch(db);
    
    // Add to userEarnings
    const earningsRef = doc(db, 'userEarnings', userId);
    batch.update(earningsRef, {
      availableBalance: increment(amount),
      totalSpent: increment(-amount),
      updatedAt: new Date()
    });
    
    // Add to walletBalances
    const walletRef = doc(db, 'walletBalances', userId);
    batch.update(walletRef, {
      availableBalance: increment(amount),
      totalBalance: increment(amount),
      lastUpdated: new Date()
    });
    
    await batch.commit();
    
    // Dynamic description based on reason
    const descriptions = {
      rejection: `Refund for rejected job: ${jobTitle}`,
      pause: `Refund for paused job: ${jobTitle}`,
      close: `Refund for closed job: ${jobTitle}`
    };
    
    const notes = {
      rejection: `Refunded ${amount} FOG coins after job rejection`,
      pause: `Refunded ${amount} FOG coins - job paused without hired freelancer`,
      close: `Refunded ${amount} FOG coins - job closed without hired freelancer`
    };
    
    // Log transaction
    await addDoc(collection(db, 'transactions'), {
      userId,
      type: 'job_refund',
      amount: amount, // Positive for credit
      sourceId: jobRequestId,
      sourceType: 'job_refund',
      status: 'completed',
      description: descriptions[reason],
      notes: notes[reason],
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error refunding job payment:', error);
    return { success: false, error: 'Failed to process refund' };
  }
};

/**
 * Transfer platform tax (2.5% commission) to admin wallet
 * Admin User ID: o3kGn4GMkFgNneSj1Cm8Vard99N2
 */
export const transferPlatformTax = async (
  taxAmount: number,
  jobId: string,
  jobTitle: string,
  taxType: 'client' | 'freelancer',
  fromUserId: string
): Promise<{ success: boolean; error?: string }> => {
  const ADMIN_USER_ID = 'o3kGn4GMkFgNneSj1Cm8Vard99N2';
  
  try {
    // Query to find admin's earnings document
    const adminEarningsQuery = query(
      collection(db, 'userEarnings'),
      where('userId', '==', ADMIN_USER_ID)
    );
    const adminEarningsSnapshot = await getDocs(adminEarningsQuery);
    
    if (adminEarningsSnapshot.empty) {
      console.error('❌ Admin earnings document not found');
      return { success: false, error: 'Admin account not configured' };
    }
    
    const adminEarningsDocId = adminEarningsSnapshot.docs[0].id;
    const batch = writeBatch(db);
    
    // Add to admin's userEarnings
    const adminEarningsRef = doc(db, 'userEarnings', adminEarningsDocId);
    batch.update(adminEarningsRef, {
      availableBalance: increment(taxAmount),
      lifetimeEarnings: increment(taxAmount),
      updatedAt: new Date()
    });
    
    // Add to admin's walletBalances
    const adminWalletRef = doc(db, 'walletBalances', ADMIN_USER_ID);
    batch.update(adminWalletRef, {
      availableBalance: increment(taxAmount),
      totalBalance: increment(taxAmount),
      lastUpdated: new Date()
    });
    
    await batch.commit();
    
    // Log transaction for admin (received tax)
    const adminDescription = taxType === 'client' 
      ? `Platform fee from client (job posting): ${jobTitle}`
      : `Platform fee from freelancer (job completion): ${jobTitle}`;
    
    await addDoc(collection(db, 'transactions'), {
      userId: ADMIN_USER_ID,
      type: 'platform_tax',
      amount: taxAmount, // Positive for admin (received)
      sourceId: jobId,
      sourceType: 'platform_commission',
      status: 'completed',
      description: adminDescription,
      notes: `2.5% platform commission collected from ${taxType}`,
      metadata: {
        taxType,
        fromUserId,
        jobTitle
      },
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    // Log transaction for user (paid tax)
    const userDescription = taxType === 'client'
      ? `Platform fee for job posting: ${jobTitle}`
      : `Platform fee deducted from job completion: ${jobTitle}`;
    
    await addDoc(collection(db, 'transactions'), {
      userId: fromUserId,
      type: 'platform_tax',
      amount: -taxAmount, // Negative for user (paid)
      sourceId: jobId,
      sourceType: 'platform_commission',
      status: 'completed',
      description: userDescription,
      notes: `2.5% platform commission`,
      metadata: {
        taxType,
        adminUserId: ADMIN_USER_ID,
        jobTitle
      },
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    console.log(`✅ Platform tax transferred: ${taxAmount} FOG from ${taxType} to admin`);
    return { success: true };
  } catch (error) {
    console.error('Error transferring platform tax:', error);
    return { success: false, error: 'Failed to transfer platform tax' };
  }
};

