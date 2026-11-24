import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config';

// Simple badge states - true means there are new items
export interface NotificationBadges {
  'payment-requests': boolean;
  'withdrawal-management': boolean;
  'job-management': boolean;
  'job-completions': boolean;
  'physical-job-requests': boolean;
  'freelance-management': boolean;
  'user-management': boolean;
  'brand-management': boolean;
}

interface CheckParams {
  lastSyncTimestamp?: number;
}

// Check for items created AFTER last sync time
export async function checkForNewItems(params: CheckParams): Promise<NotificationBadges> {
  const { lastSyncTimestamp } = params;
  
  const badges: NotificationBadges = {
    'payment-requests': false,
    'withdrawal-management': false,
    'job-management': false,
    'job-completions': false,
    'physical-job-requests': false,
    'freelance-management': false,
    'user-management': false,
    'brand-management': false,
  };

  // If no lastSyncTimestamp, default to 1 hour ago to avoid showing everything
  const checkAfter = lastSyncTimestamp || (Date.now() - 60 * 60 * 1000);

  console.log('🔍 adminNotificationService checking after:', new Date(checkAfter).toLocaleString());
  console.log('🕐 Timestamp (ms):', checkAfter);

  try {
    // Payment Requests - check for items created AFTER last sync (uses submittedAt field)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'paymentRequests'),
          where('status', '==', 'pending'),
          where('submittedAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['payment-requests'] = snapshot.size > 0;
      console.log('💰 Payment requests badge:', badges['payment-requests'], '(found:', snapshot.size, 'NEW items after', new Date(checkAfter).toLocaleString(), ')');
    } catch (error) {
      console.error('Error checking payment requests:', error);
    }

    // Withdrawal Requests (collection: withdrawalRequests, field: requestedAt)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'withdrawalRequests'),
          where('status', '==', 'pending'),
          where('requestedAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['withdrawal-management'] = snapshot.size > 0;
      console.log('💸 Withdrawal requests badge:', badges['withdrawal-management'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking withdrawal requests:', error);
    }

    // Job Requests (collection: JobRequests, field: submittedAt, status: pending)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'JobRequests'),
          where('status', '==', 'pending'),
          where('submittedAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['job-management'] = snapshot.size > 0;
      console.log('📋 Job requests badge:', badges['job-management'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking job requests:', error);
    }

    // Job Completions (collection: FogslyJobs where status=completed, field: completedAt)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'FogslyJobs'),
          where('status', '==', 'completed'),
          where('adminApproved', '==', false),
          where('completedAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['job-completions'] = snapshot.size > 0;
      console.log('✅ Job completions badge:', badges['job-completions'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking job completions:', error);
    }

    // Physical Jobs (collection: PhysicalJobRequests, field: submittedAt)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'PhysicalJobRequests'),
          where('status', '==', 'pending'),
          where('submittedAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['physical-job-requests'] = snapshot.size > 0;
      console.log('🏢 Physical job requests badge:', badges['physical-job-requests'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking physical job requests:', error);
    }

    // Freelance Requests (collection: FreelanceRequests, field: createdAt, status: pending)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'FreelanceRequests'),
          where('requestStatus', '==', 'pending'),
          where('createdAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['freelance-management'] = snapshot.size > 0;
      console.log('💼 Freelance requests badge:', badges['freelance-management'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking freelance requests:', error);
    }

    // New Users (collection: users, field: createdAt)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('createdAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['user-management'] = snapshot.size > 0;
      console.log('👥 New users badge:', badges['user-management'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking new users:', error);
    }

    // Brand Requests (collection: brandRequests, field: createdAt, status: pending)
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'brandRequests'),
          where('status', '==', 'pending'),
          where('createdAt', '>', Timestamp.fromMillis(checkAfter))
        )
      );
      badges['brand-management'] = snapshot.size > 0;
      console.log('🏷️ Brand requests badge:', badges['brand-management'], '(found:', snapshot.size, 'items)');
    } catch (error) {
      console.error('Error checking brand requests:', error);
    }

  } catch (error) {
    console.error('Error checking for new items:', error);
  }

  return badges;
}

