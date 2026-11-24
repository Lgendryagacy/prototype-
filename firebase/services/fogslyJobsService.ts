import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  updateDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { FogslyJob, FogslyJobStatus } from '../types/job';

const FOGSLY_JOBS_COLLECTION = 'FogslyJobs';

/**
 * Create a new FogslyJob from an approved JobRequest
 * This is called automatically when admin approves a job request
 */
export const createFogslyJob = async (
  jobData: Omit<FogslyJob, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationCount'>
): Promise<{ success: boolean; error?: string; jobId?: string }> => {
  try {
    console.log('🔵 Starting createFogslyJob with data:', jobData);
    
    const jobRef = doc(collection(db, FOGSLY_JOBS_COLLECTION));
    const jobId = jobRef.id;
    
    console.log('🔵 Generated jobId:', jobId);

    const fogslyJob: FogslyJob = {
      ...jobData,
      id: jobId,
      status: 'active', // Always starts as active
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      applicationCount: 0
    };
    
    console.log('🔵 FogslyJob object created:', fogslyJob);

    // Build Firestore data object, excluding undefined fields
    const firestoreData: any = {
      id: fogslyJob.id,
      jobRequestId: fogslyJob.jobRequestId,
      userId: fogslyJob.userId,
      jobTitle: fogslyJob.jobTitle,
      jobDescription: fogslyJob.jobDescription,
      categories: fogslyJob.categories,
      skills: fogslyJob.skills,
      budgetType: fogslyJob.budgetType,
      budgetCurrency: fogslyJob.budgetCurrency,
      userName: fogslyJob.userName,
      userEmail: fogslyJob.userEmail,
      userPhone: fogslyJob.userPhone,
      userCity: fogslyJob.userCity,
      userCountry: fogslyJob.userCountry,
      status: fogslyJob.status,
      approvedBy: fogslyJob.approvedBy,
      viewCount: fogslyJob.viewCount,
      applicationCount: fogslyJob.applicationCount,
      createdAt: Timestamp.fromDate(fogslyJob.createdAt),
      updatedAt: Timestamp.fromDate(fogslyJob.updatedAt),
      approvedAt: Timestamp.fromDate(fogslyJob.approvedAt)
    };
    
    // Only add budgetAmount if it's defined
    if (fogslyJob.budgetAmount !== undefined) {
      firestoreData.budgetAmount = fogslyJob.budgetAmount;
    }
    
    // Only add budgetInFogCoins if it's defined
    if (fogslyJob.budgetInFogCoins !== undefined) {
      firestoreData.budgetInFogCoins = fogslyJob.budgetInFogCoins;
    }
    
    // Add platform tax fields if provided
    if (fogslyJob.clientPlatformTax !== undefined) {
      firestoreData.clientPlatformTax = fogslyJob.clientPlatformTax;
    }
    if (fogslyJob.clientTaxPaid !== undefined) {
      firestoreData.clientTaxPaid = fogslyJob.clientTaxPaid;
    }
    
    console.log('🔵 Firestore data to save:', firestoreData);
    console.log('🔵 Attempting to save to collection:', FOGSLY_JOBS_COLLECTION);
    
    await setDoc(jobRef, firestoreData);
    
    console.log('✅ FogslyJob created successfully with ID:', jobId);

    return { success: true, jobId };
  } catch (error) {
    console.error('❌ Error creating FogslyJob:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return { success: false, error: `Failed to create job listing: ${error}` };
  }
};

/**
 * Get a single FogslyJob by ID
 */
export const getFogslyJobById = async (jobId: string): Promise<FogslyJob | null> => {
  try {
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return null;
    }

    const data = jobSnap.data();
    return {
      ...data,
      id: jobSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || new Date()
    } as FogslyJob;
  } catch (error) {
    console.error('Error fetching FogslyJob:', error);
    return null;
  }
};

/**
 * Get a single FogslyJob by JobRequest ID
 */
export const getFogslyJobByRequestId = async (jobRequestId: string): Promise<FogslyJob | null> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(jobsRef, where('jobRequestId', '==', jobRequestId), firestoreLimit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || new Date()
    } as FogslyJob;
  } catch (error) {
    console.error('Error fetching FogslyJob by request ID:', error);
    return null;
  }
};

/**
 * Get all active FogslyJobs (public job listings)
 */
export const getActiveFogslyJobs = async (
  limitCount: number = 50
): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching active FogslyJobs:', error);
    return [];
  }
};

/**
 * Get all FogslyJobs with optional filters
 */
export const getAllFogslyJobs = async (
  statusFilter?: FogslyJobStatus,
  searchTerm?: string,
  limitCount: number = 100
): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    let q = query(jobsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));

    if (statusFilter) {
      q = query(
        jobsRef,
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    let jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    // Client-side search filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(lowerSearch) ||
          job.jobDescription.toLowerCase().includes(lowerSearch) ||
          job.userName.toLowerCase().includes(lowerSearch) ||
          job.categories.some(cat => cat.toLowerCase().includes(lowerSearch)) ||
          job.skills.some(skill => skill.toLowerCase().includes(lowerSearch))
      );
    }

    return jobs;
  } catch (error) {
    console.error('Error fetching all FogslyJobs:', error);
    return [];
  }
};

/**
 * Get jobs posted by a specific user
 */
export const getUserFogslyJobs = async (userId: string): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching user FogslyJobs:', error);
    return [];
  }
};

/**
 * Update FogslyJob status
 */
/**
 * Update FogslyJob status (used by admin) with automatic refund/charge handling
 */
export const updateFogslyJobStatus = async (
  jobId: string,
  newStatus: FogslyJobStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Get current job details
    const job = await getFogslyJobById(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }
    
    // 2. Check if someone is hired (approved proposal exists)
    const { getJobProposals } = await import('./jobProposals');
    const proposals = await getJobProposals(jobId);
    const hasHiredFreelancer = proposals.some(p => p.status === 'approved');
    
    // 3. Handle refund/charge scenarios only if no freelancer hired and budget exists
    if (!hasHiredFreelancer && job.budgetInFogCoins && job.budgetInFogCoins > 0) {
      const currentStatus = job.status;
      
      // PAUSE: Refund money (active → paused)
      if (newStatus === 'paused' && currentStatus === 'active') {
        const { refundJobPayment } = await import('./earningsService');
        const refundResult = await refundJobPayment(
          job.userId,
          job.budgetInFogCoins,
          job.jobRequestId,
          job.jobTitle,
          'pause'
        );
        
        if (!refundResult.success) {
          console.error('Refund failed:', refundResult.error);
          return { 
            success: false, 
            error: `Failed to process refund: ${refundResult.error}` 
          };
        }
        
        console.log(`✅ Admin: Refunded ${job.budgetInFogCoins} FOG for paused job: ${job.jobTitle}`);
      }
      
      // REACTIVATE: Charge again (paused → active)
      if (newStatus === 'active' && currentStatus === 'paused') {
        const { chargeJobPayment } = await import('./earningsService');
        const chargeResult = await chargeJobPayment(
          job.userId,
          job.budgetInFogCoins,
          jobId,
          job.jobTitle
        );
        
        if (!chargeResult.success) {
          console.error('Charge failed:', chargeResult.error);
          return { 
            success: false, 
            error: chargeResult.error || 'Insufficient balance to reactivate job'
          };
        }
        
        console.log(`✅ Admin: Charged ${job.budgetInFogCoins} FOG for reactivated job: ${job.jobTitle}`);
      }
      
      // CLOSE: Refund money (any status → closed)
      if (newStatus === 'closed' && currentStatus !== 'closed') {
        const { refundJobPayment } = await import('./earningsService');
        const refundResult = await refundJobPayment(
          job.userId,
          job.budgetInFogCoins,
          job.jobRequestId,
          job.jobTitle,
          'close'
        );
        
        if (!refundResult.success) {
          console.error('Refund failed:', refundResult.error);
          return { 
            success: false, 
            error: `Failed to process refund: ${refundResult.error}` 
          };
        }
        
        console.log(`✅ Admin: Refunded ${job.budgetInFogCoins} FOG for closed job: ${job.jobTitle}`);
      }
    } else if (hasHiredFreelancer) {
      console.log(`ℹ️ Admin: No refund - freelancer hired for job: ${job.jobTitle}`);
    } else {
      console.log(`ℹ️ Admin: No refund needed - no budget or quote-based job: ${job.jobTitle}`);
    }
    
    // 4. Update job status
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating FogslyJob status:', error);
    return { success: false, error: 'Failed to update job status' };
  }
};

/**
 * Increment view count for a job
 */
export const incrementJobViewCount = async (jobId: string): Promise<void> => {
  try {
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      viewCount: increment(1),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

/**
 * Increment application count for a job
 */
export const incrementJobApplicationCount = async (jobId: string): Promise<void> => {
  try {
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      applicationCount: increment(1),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error incrementing application count:', error);
  }
};

/**
 * Get FogslyJobs statistics
 */
export const getFogslyJobsStats = async (): Promise<{
  total: number;
  active: number;
  closed: number;
  inProgress: number;
  completed: number;
}> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const querySnapshot = await getDocs(jobsRef);

    const stats = {
      total: 0,
      active: 0,
      closed: 0,
      inProgress: 0,
      completed: 0
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      switch (data.status) {
        case 'active':
          stats.active++;
          break;
        case 'closed':
          stats.closed++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching FogslyJobs stats:', error);
    return { total: 0, active: 0, closed: 0, inProgress: 0, completed: 0 };
  }
};

/**
 * Search jobs by category
 */
export const searchJobsByCategory = async (category: string): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('categories', 'array-contains', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    return jobs;
  } catch (error) {
    console.error('Error searching jobs by category:', error);
    return [];
  }
};

/**
 * Search jobs by skill
 */
export const searchJobsBySkill = async (skill: string): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('skills', 'array-contains', skill),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    return jobs;
  } catch (error) {
    console.error('Error searching jobs by skill:', error);
    return [];
  }
};

/**
 * Get count of jobs posted by a specific user
 */
export const getUserJobsCount = async (userId: string): Promise<number> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(jobsRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting user jobs count:', error);
    return 0;
  }
};

/**
 * Get all jobs posted by a specific user
 */
export const getUserJobs = async (
  userId: string,
  statusFilter?: FogslyJobStatus,
  limitCount: number = 50
): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    let q = query(
      jobsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );

    // Add status filter if provided
    if (statusFilter) {
      q = query(
        jobsRef,
        where('userId', '==', userId),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const jobs: FogslyJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    return [];
  }
};

/**
 * Update job status (active, paused, closed) with automatic refund/charge handling
 */
export const updateJobStatus = async (
  jobId: string,
  newStatus: FogslyJobStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Get current job details
    const job = await getFogslyJobById(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }
    
    // 2. Check if someone is hired (approved proposal exists)
    const { getJobProposals } = await import('./jobProposals');
    const proposals = await getJobProposals(jobId);
    const hasHiredFreelancer = proposals.some(p => p.status === 'approved');
    
    // 3. Handle refund/charge scenarios only if no freelancer hired and budget exists
    if (!hasHiredFreelancer && job.budgetInFogCoins && job.budgetInFogCoins > 0) {
      const currentStatus = job.status;
      
      // PAUSE: Refund money (active → paused)
      if (newStatus === 'paused' && currentStatus === 'active') {
        const { refundJobPayment } = await import('./earningsService');
        const refundResult = await refundJobPayment(
          job.userId,
          job.budgetInFogCoins,
          job.jobRequestId,
          job.jobTitle,
          'pause'
        );
        
        if (!refundResult.success) {
          console.error('Refund failed:', refundResult.error);
          return { 
            success: false, 
            error: `Failed to process refund: ${refundResult.error}` 
          };
        }
        
        console.log(`✅ Refunded ${job.budgetInFogCoins} FOG for paused job: ${job.jobTitle}`);
      }
      
      // REACTIVATE: Charge again (paused → active)
      if (newStatus === 'active' && currentStatus === 'paused') {
        const { chargeJobPayment } = await import('./earningsService');
        const chargeResult = await chargeJobPayment(
          job.userId,
          job.budgetInFogCoins,
          jobId,
          job.jobTitle
        );
        
        if (!chargeResult.success) {
          console.error('Charge failed:', chargeResult.error);
          return { 
            success: false, 
            error: chargeResult.error || 'Insufficient balance to reactivate job'
          };
        }
        
        console.log(`✅ Charged ${job.budgetInFogCoins} FOG for reactivated job: ${job.jobTitle}`);
      }
      
      // CLOSE: Refund money (any status → closed)
      if (newStatus === 'closed' && currentStatus !== 'closed') {
        const { refundJobPayment } = await import('./earningsService');
        const refundResult = await refundJobPayment(
          job.userId,
          job.budgetInFogCoins,
          job.jobRequestId,
          job.jobTitle,
          'close'
        );
        
        if (!refundResult.success) {
          console.error('Refund failed:', refundResult.error);
          return { 
            success: false, 
            error: `Failed to process refund: ${refundResult.error}` 
          };
        }
        
        console.log(`✅ Refunded ${job.budgetInFogCoins} FOG for closed job: ${job.jobTitle}`);
      }
    } else if (hasHiredFreelancer) {
      console.log(`ℹ️ No refund - freelancer hired for job: ${job.jobTitle}`);
    } else {
      console.log(`ℹ️ No refund needed - no budget or quote-based job: ${job.jobTitle}`);
    }
    
    // 4. Update job status
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating job status:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Update job details
 */
export const updateJobDetails = async (
  jobId: string,
  updates: Partial<Omit<FogslyJob, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationCount'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const jobRef = doc(db, FOGSLY_JOBS_COLLECTION, jobId);
    
    await updateDoc(jobRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating job details:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Delete a job (soft delete - mark as closed) with automatic refund handling
 */
export const deleteJob = async (
  jobId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use updateJobStatus which handles refund logic automatically
    return await updateJobStatus(jobId, 'closed');
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get all unique categories from active FogslyJobs
 */
export const getJobCategories = async (): Promise<string[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    const q = query(jobsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    const categoriesSet = new Set<string>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((category: string) => {
          categoriesSet.add(category);
        });
      }
    });
    
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error('Error fetching job categories:', error);
    return [];
  }
};

/**
 * Search and filter FogslyJobs by query text and category
 */
export const searchAndFilterJobs = async (
  searchQuery: string = '',
  categoryFilter: string = '',
  limitCount: number = 100
): Promise<FogslyJob[]> => {
  try {
    const jobsRef = collection(db, FOGSLY_JOBS_COLLECTION);
    let q = query(
      jobsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    let jobs: FogslyJob[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date()
      } as FogslyJob);
    });
    
    // Apply filters in memory (since we can't use multiple where clauses with orderBy)
    if (categoryFilter) {
      jobs = jobs.filter(job => 
        job.categories.some(cat => 
          cat.toLowerCase() === categoryFilter.toLowerCase()
        )
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      jobs = jobs.filter(job => 
        job.jobTitle.toLowerCase().includes(query) ||
        job.jobDescription.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query)) ||
        job.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    return jobs;
  } catch (error) {
    console.error('Error searching and filtering jobs:', error);
    return [];
  }
};
