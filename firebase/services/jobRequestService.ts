import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { JobRequest, CreateJobRequestData, UpdateJobRequestData, JobRequestStatus } from '../types/job';
import { createFogslyJob } from './fogslyJobsService';

const JOB_REQUESTS_COLLECTION = 'JobRequests';

/**
 * Create a new job request
 */
export const createJobRequest = async (
  data: CreateJobRequestData
): Promise<{ success: boolean; jobRequestId?: string; error?: string }> => {
  try {
    const jobRequestRef = doc(collection(db, JOB_REQUESTS_COLLECTION));
    
    // Build the data object, excluding undefined fields
    const jobRequestData: any = {
      userId: data.userId,
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      categories: data.categories,
      skills: data.skills,
      budgetType: data.budgetType,
      budgetCurrency: data.budgetCurrency,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      userCity: data.userCity,
      userCountry: data.userCountry,
      id: jobRequestRef.id,
      status: 'pending' as JobRequestStatus,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Only add budgetAmount if it's defined
    if (data.budgetAmount !== undefined) {
      jobRequestData.budgetAmount = data.budgetAmount;
    }
    
    // Only add budgetInFogCoins if it's defined
    if (data.budgetInFogCoins !== undefined) {
      jobRequestData.budgetInFogCoins = data.budgetInFogCoins;
    }

    await setDoc(jobRequestRef, jobRequestData);

    return { success: true, jobRequestId: jobRequestRef.id };
  } catch (error) {
    console.error('Error creating job request:', error);
    return {
      success: false,
      error: 'Failed to submit job request. Please try again.'
    };
  }
};

/**
 * Get job request by ID
 */
export const getJobRequestById = async (jobRequestId: string): Promise<JobRequest | null> => {
  try {
    const jobRequestDoc = await getDoc(doc(db, JOB_REQUESTS_COLLECTION, jobRequestId));
    
    if (!jobRequestDoc.exists()) {
      return null;
    }

    const data = jobRequestDoc.data();
    return {
      id: jobRequestDoc.id,
      userId: data.userId,
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      categories: data.categories || [],
      skills: data.skills || [],
      budgetType: data.budgetType,
      budgetAmount: data.budgetAmount,
      budgetCurrency: data.budgetCurrency || 'USD',
      budgetInFogCoins: data.budgetInFogCoins,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      userCity: data.userCity,
      userCountry: data.userCountry,
      status: data.status,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
      approvedBy: data.approvedBy,
      rejectedBy: data.rejectedBy
    };
  } catch (error) {
    console.error('Error fetching job request:', error);
    return null;
  }
};

/**
 * Get all job requests by user ID
 */
export const getUserJobRequests = async (userId: string): Promise<JobRequest[]> => {
  try {
    const q = query(
      collection(db, JOB_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        categories: data.categories || [],
        skills: data.skills || [],
        budgetType: data.budgetType,
        budgetAmount: data.budgetAmount,
        budgetCurrency: data.budgetCurrency || 'USD',
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        userCity: data.userCity,
        userCountry: data.userCountry,
        status: data.status,
        rejectionReason: data.rejectionReason,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        approvedBy: data.approvedBy,
        rejectedBy: data.rejectedBy
      };
    });
  } catch (error) {
    console.error('Error fetching user job requests:', error);
    return [];
  }
};

/**
 * Get pending job requests count for a user
 */
export const getUserPendingJobRequestsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, JOB_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching pending job requests count:', error);
    return 0;
  }
};

/**
 * Get all job requests (Admin)
 */
export const getAllJobRequests = async (
  statusFilter?: JobRequestStatus,
  searchTerm?: string,
  limitCount: number = 50
): Promise<JobRequest[]> => {
  try {
    let q = query(collection(db, JOB_REQUESTS_COLLECTION), orderBy('submittedAt', 'desc'));

    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    
    let jobRequests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        categories: data.categories || [],
        skills: data.skills || [],
        budgetType: data.budgetType,
        budgetAmount: data.budgetAmount,
        budgetCurrency: data.budgetCurrency || 'USD',
        budgetInFogCoins: data.budgetInFogCoins,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        userCity: data.userCity,
        userCountry: data.userCountry,
        status: data.status,
        rejectionReason: data.rejectionReason,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        approvedBy: data.approvedBy,
        rejectedBy: data.rejectedBy
      };
    });

    // Filter by search term if provided
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      jobRequests = jobRequests.filter(job =>
        job.jobTitle.toLowerCase().includes(lowerSearchTerm) ||
        job.userName.toLowerCase().includes(lowerSearchTerm) ||
        job.userEmail.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return jobRequests;
  } catch (error) {
    console.error('Error fetching all job requests:', error);
    return [];
  }
};

/**
 * Approve job request and create FogslyJob listing
 */
export const approveJobRequest = async (
  jobRequestId: string,
  adminId: string
): Promise<{ success: boolean; error?: string; fogslyJobId?: string }> => {
  try {
    console.log('🟢 Starting approveJobRequest for ID:', jobRequestId);
    
    // First, get the job request data
    const jobRequest = await getJobRequestById(jobRequestId);
    
    console.log('🟢 Retrieved job request:', jobRequest);
    
    if (!jobRequest) {
      console.error('❌ Job request not found');
      return {
        success: false,
        error: 'Job request not found'
      };
    }

    if (jobRequest.status !== 'pending') {
      console.error('❌ Job request already processed. Status:', jobRequest.status);
      return {
        success: false,
        error: 'Job request has already been processed'
      };
    }

    // Update the job request status to approved
    const jobRequestRef = doc(db, JOB_REQUESTS_COLLECTION, jobRequestId);
    const approvedAt = new Date();
    
    console.log('🟢 Updating JobRequest status to approved...');
    
    await updateDoc(jobRequestRef, {
      status: 'approved',
      approvedAt: Timestamp.fromDate(approvedAt),
      approvedBy: adminId,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ JobRequest updated successfully');
    console.log('🟢 Creating FogslyJob listing...');

    // Calculate platform tax (2.5%)
    const PLATFORM_TAX_RATE = 0.025;
    const clientPlatformTax = jobRequest.budgetInFogCoins 
      ? jobRequest.budgetInFogCoins * PLATFORM_TAX_RATE 
      : undefined;

    // Create a FogslyJob listing with the approved job data
    const fogslyJobResult = await createFogslyJob({
      jobRequestId: jobRequestId,
      userId: jobRequest.userId,
      jobTitle: jobRequest.jobTitle,
      jobDescription: jobRequest.jobDescription,
      categories: jobRequest.categories,
      skills: jobRequest.skills,
      budgetType: jobRequest.budgetType,
      budgetAmount: jobRequest.budgetAmount,
      budgetCurrency: jobRequest.budgetCurrency,
      budgetInFogCoins: jobRequest.budgetInFogCoins,
      userName: jobRequest.userName,
      userEmail: jobRequest.userEmail,
      userPhone: jobRequest.userPhone,
      userCity: jobRequest.userCity,
      userCountry: jobRequest.userCountry,
      status: 'active',
      approvedAt: approvedAt,
      approvedBy: adminId,
      clientPlatformTax: clientPlatformTax,
      clientTaxPaid: true // Tax was already paid during job posting
    });

    console.log('🟢 createFogslyJob result:', fogslyJobResult);

    if (!fogslyJobResult.success) {
      // If FogslyJob creation fails, log the error but still return success
      // since the job request was approved
      console.error('❌ Failed to create FogslyJob:', fogslyJobResult.error);
      return {
        success: true,
        error: 'Job approved but failed to create public listing: ' + fogslyJobResult.error
      };
    }

    console.log('✅ Full approval process completed. FogslyJob ID:', fogslyJobResult.jobId);

    return { 
      success: true, 
      fogslyJobId: fogslyJobResult.jobId 
    };
  } catch (error) {
    console.error('❌ Error approving job request:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: 'Failed to approve job request. Please try again.'
    };
  }
};

/**
 * Reject job request
 */
export const rejectJobRequest = async (
  jobRequestId: string,
  adminId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔴 Starting rejectJobRequest for ID:', jobRequestId);
    
    // Get job request details first
    const jobRequest = await getJobRequestById(jobRequestId);
    if (!jobRequest) {
      return { success: false, error: 'Job request not found' };
    }
    
    console.log('🔴 Job request found:', jobRequest);
    
    const jobRequestRef = doc(db, JOB_REQUESTS_COLLECTION, jobRequestId);
    
    await updateDoc(jobRequestRef, {
      status: 'rejected',
      rejectionReason,
      rejectedAt: serverTimestamp(),
      rejectedBy: adminId,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Job request status updated to rejected');
    
    // Refund FOG Coins if budget was set (not a quote request)
    if (jobRequest.budgetInFogCoins && jobRequest.budgetInFogCoins > 0) {
      console.log('💰 Refunding job budget FOG Coins:', jobRequest.budgetInFogCoins);
      
      const { refundJobPayment, transferPlatformTax } = await import('./earningsService');
      
      // Refund the job budget
      const refundResult = await refundJobPayment(
        jobRequest.userId,
        jobRequest.budgetInFogCoins,
        jobRequestId,
        jobRequest.jobTitle,
        'rejection'
      );
      
      if (!refundResult.success) {
        console.error('❌ Budget refund failed:', refundResult.error);
        return { 
          success: false, 
          error: `Job rejected but budget refund failed: ${refundResult.error}` 
        };
      }
      
      console.log('✅ Budget refund successful');
      
      // Also refund the platform tax (2.5%)
      const PLATFORM_TAX_RATE = 0.025;
      const platformTax = jobRequest.budgetInFogCoins * PLATFORM_TAX_RATE;
      
      console.log('💰 Refunding platform tax:', platformTax);
      
      // Refund platform tax to user (deduct from admin wallet)
      const taxRefundResult = await refundJobPayment(
        jobRequest.userId,
        platformTax,
        jobRequestId,
        `Platform fee refund for: ${jobRequest.jobTitle}`,
        'rejection'
      );
      
      if (!taxRefundResult.success) {
        console.error('❌ Platform tax refund failed:', taxRefundResult.error);
        // Don't fail the whole operation, just log it
        console.warn('⚠️ Job budget refunded but platform tax refund failed');
      } else {
        console.log('✅ Platform tax refund successful');
      }
    } else {
      console.log('ℹ️ No refund needed (quote request or no budget)');
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting job request:', error);
    return {
      success: false,
      error: 'Failed to reject job request. Please try again.'
    };
  }
};

/**
 * Update job request
 */
export const updateJobRequest = async (
  jobRequestId: string,
  updates: UpdateJobRequestData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const jobRequestRef = doc(db, JOB_REQUESTS_COLLECTION, jobRequestId);
    
    await updateDoc(jobRequestRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating job request:', error);
    return {
      success: false,
      error: 'Failed to update job request. Please try again.'
    };
  }
};

/**
 * Get job requests statistics
 */
export const getJobRequestsStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> => {
  try {
    const allJobsSnapshot = await getDocs(collection(db, JOB_REQUESTS_COLLECTION));
    const total = allJobsSnapshot.size;

    const pendingSnapshot = await getDocs(
      query(collection(db, JOB_REQUESTS_COLLECTION), where('status', '==', 'pending'))
    );
    const pending = pendingSnapshot.size;

    const approvedSnapshot = await getDocs(
      query(collection(db, JOB_REQUESTS_COLLECTION), where('status', '==', 'approved'))
    );
    const approved = approvedSnapshot.size;

    const rejectedSnapshot = await getDocs(
      query(collection(db, JOB_REQUESTS_COLLECTION), where('status', '==', 'rejected'))
    );
    const rejected = rejectedSnapshot.size;

    return { total, pending, approved, rejected };
  } catch (error) {
    console.error('Error fetching job requests stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
};
