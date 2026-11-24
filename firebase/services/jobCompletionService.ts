import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  getDocs,
  writeBatch,
  collection,
  addDoc,
  query,
  where,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { FogslyJob } from '../types/job';
import { JobProposal } from '../types/proposal';
import { WorkDelivery } from '../types/workDelivery';
import { addEarnings } from './earningsService';

import { UserEarnings } from '../types/earnings';

interface JobCompletionData {
  jobId: string;
  proposalId: string;
  workDeliveryId: string;
  clientId: string;
  clientName: string;
  clientImage?: string;
  freelancerId: string;
  freelancerName: string;
  rating: number;
  review: string;
}

export class JobCompletionService {
  private static readonly JOBS_COLLECTION = 'FogslyJobs';
  private static readonly PROPOSALS_COLLECTION = 'JobProposals';
  private static readonly FREELANCERS_COLLECTION = 'ApprovedFreelancers';
  private static readonly EARNINGS_COLLECTION = 'UserEarnings';
  private static readonly TRANSACTIONS_COLLECTION = 'Transactions';

  /**
   * Simple job completion method for client review submission
   */
  static async completeJobWithReview(
    jobId: string,
    clientId: string,
    rating: number,
    review: string,
    clientName: string,
    clientImage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔵 Starting job completion with review:', {
        jobId,
        clientId,
        rating,
        reviewLength: review.length,
        clientName
      });

      const jobRef = doc(db, this.JOBS_COLLECTION, jobId);
      
      // First, verify the job exists
      const jobDoc = await getDoc(jobRef);
      if (!jobDoc.exists()) {
        console.error('❌ Job not found:', jobId);
        return { success: false, error: 'Job not found' };
      }

      const currentJob = jobDoc.data();
      console.log('🔵 Current job status:', currentJob.status);
      
      // Update job to completed status
      await updateDoc(jobRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        clientRating: rating,
        clientReview: review,
        clientName: clientName,
        clientImage: clientImage || '',
        adminApproved: false,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Job completed with review successfully. Status set to: completed');
      
      // Verify the update
      const updatedJobDoc = await getDoc(jobRef);
      if (updatedJobDoc.exists()) {
        console.log('🔵 Verified job status after update:', updatedJobDoc.data().status);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error completing job:', error);
      return { success: false, error: 'Failed to complete job' };
    }
  }

  /**
   * Complete a job with client review - this marks the job as completed
   * and queues it for admin approval
   */
  static async completeJob(data: JobCompletionData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get job details
      const jobRef = doc(db, this.JOBS_COLLECTION, data.jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        return { success: false, error: 'Job not found' };
      }

      const job = jobDoc.data() as FogslyJob;
      
      // Get work delivery to get revision count
      const deliveryRef = doc(db, 'WorkDeliveries', data.workDeliveryId);
      const deliveryDoc = await getDoc(deliveryRef);
      
      if (!deliveryDoc.exists()) {
        return { success: false, error: 'Work delivery not found' };
      }

      const workDelivery = deliveryDoc.data() as WorkDelivery;

      // Update job with completion data
      await updateDoc(jobRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        clientRating: data.rating,
        clientReview: data.review,
        clientName: data.clientName,
        clientImage: data.clientImage || null,
        revisionCount: workDelivery.modificationCount,
        adminApproved: false, // Requires admin approval
        updatedAt: serverTimestamp()
      });

      console.log('✅ Job completed successfully, pending admin approval');
      return { success: true };
    } catch (error) {
      console.error('❌ Error completing job:', error);
      return { success: false, error: 'Failed to complete job' };
    }
  }

  /**
   * Update existing review for a completed job
   */
  static async updateJobReview(
    jobId: string, 
    rating: number, 
    review: string,
    clientImage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const jobRef = doc(db, this.JOBS_COLLECTION, jobId);
      
      await updateDoc(jobRef, {
        clientRating: rating,
        clientReview: review,
        clientImage: clientImage || null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Job review updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating job review:', error);
      return { success: false, error: 'Failed to update review' };
    }
  }

  /**
   * Admin approves a completed job - processes payment and updates stats
   */
  static async adminApproveCompletion(
    jobId: string, 
    adminId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔵 ========================================');
      console.log('🔵 STARTING ADMIN APPROVAL PROCESS');
      console.log('🔵 Job ID:', jobId);
      console.log('🔵 Admin ID:', adminId);
      console.log('🔵 ========================================');
      
      // Get job details
      const jobRef = doc(db, this.JOBS_COLLECTION, jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        console.error('❌ Job not found:', jobId);
        return { success: false, error: 'Job not found' };
      }

      const job = jobDoc.data() as FogslyJob;
      
      console.log('📋 Job Details:');
      console.log('  - Title:', job.jobTitle);
      console.log('  - Status:', job.status);
      console.log('  - Budget (PKR):', job.budgetAmount, job.budgetCurrency);
      console.log('  - Budget (FOG):', job.budgetInFogCoins);
      console.log('  - Client ID:', job.userId);
      console.log('  - Admin Approved:', job.adminApproved);
      
      if (job.status !== 'completed') {
        console.error('❌ Job is not completed. Current status:', job.status);
        return { success: false, error: 'Job is not completed' };
      }

      if (job.adminApproved) {
        console.error('❌ Job already approved');
        return { success: false, error: 'Job already approved' };
      }

      // Find the freelancer who worked on this job
      console.log('🔍 Finding approved proposal...');
      const proposalsQuery = query(
        collection(db, 'JobsProposal'),
        where('jobId', '==', job.id),
        where('status', '==', 'approved')
      );
      
      const proposalsSnapshot = await getDocs(proposalsQuery);
      
      if (proposalsSnapshot.empty) {
        console.error('❌ No approved proposal found for job:', job.id);
        return { success: false, error: 'No approved proposal found' };
      }

      const approvedProposal = proposalsSnapshot.docs[0].data();
      console.log('✅ Found approved proposal:');
      console.log('  - Proposal ID:', proposalsSnapshot.docs[0].id);
      console.log('  - Freelancer ID:', approvedProposal.freelancerId);
      console.log('  - Freelancer Name:', approvedProposal.freelancerName);
      console.log('  - Bid Amount:', approvedProposal.bidAmount, approvedProposal.bidCurrency);
      
      // Get freelancer ID first for stats update
      const proposalsQueryForStats = query(
        collection(db, 'JobsProposal'),
        where('jobId', '==', job.id),
        where('status', '==', 'approved')
      );
      const proposalsSnapshotForStats = await getDocs(proposalsQueryForStats);
      const freelancerId = proposalsSnapshotForStats.docs[0]?.data().freelancerId;

      if (!freelancerId) {
        console.error('❌ Cannot find freelancer ID for stats update');
        return { success: false, error: 'Freelancer not found' };
      }

      const batch = writeBatch(db);

      // 1. Mark job as admin approved
      console.log('📝 Marking job as admin approved...');
      batch.update(jobRef, {
        adminApproved: true,
        adminApprovedAt: serverTimestamp(),
        adminApprovedBy: adminId,
        updatedAt: serverTimestamp()
      });

      // 2. Update freelancer stats FIRST (in the batch)
      console.log('📊 Updating freelancer stats...');
      await this.updateFreelancerStats(
        job,
        freelancerId,
        batch
      );

      // 3. Commit the batch (job approval + stats update)
      console.log('💾 Committing batch updates (job approval + stats)...');
      await batch.commit();
      console.log('✅ Batch committed successfully!');

      // 4. Process payment to freelancer (separate transaction for safety)
      console.log('💰 Starting payment process...');
      if (job.budgetInFogCoins && job.budgetInFogCoins > 0) {
        await this.processFreelancerPayment(
          job,
          freelancerId
        );
      } else {
        console.warn('⚠️ No FOG coins budget specified. Skipping payment.');
      }

      console.log('🔵 ========================================');
      console.log('✅ JOB COMPLETION APPROVED AND PROCESSED');
      console.log('🔵 ========================================');
      return { success: true };
    } catch (error) {
      console.error('🔵 ========================================');
      console.error('❌ ERROR APPROVING JOB COMPLETION');
      console.error('Error details:', error);
      console.error('Stack:', (error as Error).stack);
      console.error('🔵 ========================================');
      return { success: false, error: 'Failed to approve completion' };
    }
  }

  /**
   * Process payment to freelancer using new earnings structure
   * Deducts 2.5% platform tax before transferring to freelancer
   */
  private static async processFreelancerPayment(
    job: FogslyJob,
    freelancerId: string
  ): Promise<void> {
    try {
      const PLATFORM_TAX_RATE = 0.025; // 2.5%
      const budgetAmount = job.budgetInFogCoins || 0;

      console.log('💵 Payment Details:');
      console.log('  - Freelancer ID:', freelancerId);
      console.log('  - Job Budget (FOG):', budgetAmount);
      console.log('  - Job ID:', job.id);
      console.log('  - Job Title:', job.jobTitle);

      if (budgetAmount <= 0) {
        console.error('❌ No FOG coins payment amount specified for job:', job.id);
        return;
      }

      // Calculate platform tax and freelancer payout
      const platformTax = budgetAmount * PLATFORM_TAX_RATE;
      const freelancerPayout = budgetAmount - platformTax;
      
      console.log('💰 Payment Breakdown:');
      console.log('  - Budget Amount:', budgetAmount, 'FOG');
      console.log('  - Platform Tax (2.5%):', platformTax.toFixed(2), 'FOG');
      console.log('  - Freelancer Receives:', freelancerPayout.toFixed(2), 'FOG');

      // Transfer platform tax to admin
      console.log('💰 Transferring platform tax to admin...');
      const { transferPlatformTax } = await import('./earningsService');
      const taxResult = await transferPlatformTax(
        platformTax,
        job.id,
        job.jobTitle,
        'freelancer',
        freelancerId
      );
      
      if (!taxResult.success) {
        console.error('❌ Platform tax transfer failed:', taxResult.error);
        throw new Error('Platform tax transfer failed');
      }
      
      console.log('✅ Platform tax transferred successfully');

      // Add freelancer earnings (after tax deduction)
      console.log('💰 Calling addEarnings service for freelancer...');
      await addEarnings(
        freelancerId,
        freelancerPayout,
        'freelanceJobs',
        job.id,
        `Payment for completing job: ${job.jobTitle} (after 2.5% platform fee)`
      );

      console.log('✅ Payment processed successfully!');
      console.log('  - Job ID:', job.id);
      console.log('  - Freelancer ID:', freelancerId);
      console.log('  - Amount Received:', freelancerPayout.toFixed(2), 'FOG');
      console.log('  - Platform Fee:', platformTax.toFixed(2), 'FOG');
      
      // Update job with freelancer tax info
      const jobRef = doc(db, this.JOBS_COLLECTION, job.id);
      await updateDoc(jobRef, {
        freelancerPlatformTax: platformTax,
        freelancerTaxPaid: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Job updated with freelancer tax information');
    } catch (error) {
      console.error('❌ ERROR IN PAYMENT PROCESSING:');
      console.error('  - Error:', error);
      console.error('  - Stack:', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Update freelancer aggregate stats
   * Updates: totalJobs, totalReviews, averageRating, totalEarnings
   */
  private static async updateFreelancerStats(
    job: FogslyJob,
    freelancerId: string,
    batch: any
  ): Promise<void> {
    try {
      console.log('📊 Starting freelancer stats update...');
      
      if (!job.clientRating) {
        console.log('⚠️ No rating provided, skipping stats update for job:', job.id);
        return;
      }
      
      console.log('📋 Freelancer Stats Update Details:');
      console.log('  - Freelancer User ID:', freelancerId);
      console.log('  - Job Rating:', job.clientRating);
      console.log('  - Job Payment (FOG):', job.budgetInFogCoins);

      // Query ApprovedFreelancers by userId field (NOT document ID)
      console.log('🔍 Querying ApprovedFreelancers by userId field...');
      const freelancersQuery = query(
        collection(db, 'ApprovedFreelancers'),
        where('userId', '==', freelancerId)
      );
      
      const freelancersSnapshot = await getDocs(freelancersQuery);
      
      if (freelancersSnapshot.empty) {
        console.warn('⚠️ Freelancer profile not found in ApprovedFreelancers collection for userId:', freelancerId);
        console.warn('  - Skipping stats update. Freelancer may not have a gig created yet.');
        return;
      }

      // Get the first matching document (should only be one per userId)
      const freelancerDoc = freelancersSnapshot.docs[0];
      const freelancerRef = doc(db, 'ApprovedFreelancers', freelancerDoc.id);
      
      console.log('✅ Found freelancer document:');
      console.log('  - Document ID:', freelancerDoc.id);
      console.log('  - User ID:', freelancerId);

      if (freelancerDoc.exists()) {
        const currentData = freelancerDoc.data();
        
        // Use correct field names from ApprovedFreelancers collection
        const currentTotalJobs = currentData.totalJobs || 0;
        const currentTotalReviews = currentData.totalReviews || 0;
        const currentAverageRating = currentData.averageRating || 0;
        const currentTotalEarnings = currentData.totalEarnings || 0;
        
        // Calculate new values
        const newTotalJobs = currentTotalJobs + 1;
        const newTotalReviews = currentTotalReviews + 1;
        const totalRatingSum = (currentAverageRating * currentTotalReviews) + job.clientRating;
        const newAverageRating = totalRatingSum / newTotalReviews;
        const newTotalEarnings = currentTotalEarnings + (job.budgetInFogCoins || 0);

        console.log('📊 Current Stats:');
        console.log('  - Total Jobs:', currentTotalJobs, '→', newTotalJobs);
        console.log('  - Total Reviews:', currentTotalReviews, '→', newTotalReviews);
        console.log('  - Average Rating:', currentAverageRating, '→', newAverageRating);
        console.log('  - Total Earnings:', currentTotalEarnings, '→', newTotalEarnings, 'FOG');

        // Add stats update to batch with CORRECT field names
        batch.update(freelancerRef, {
          totalJobs: newTotalJobs,              // ✅ Correct field name
          totalReviews: newTotalReviews,        // ✅ Correct field name
          averageRating: newAverageRating,      // ✅ Correct field name
          totalEarnings: newTotalEarnings,      // ✅ Now updating earnings!
          lastJobCompletedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log('✅ Freelancer stats update added to batch:', { 
          freelancerId, 
          documentId: freelancerDoc.id,
          collection: freelancerRef.path,
          newTotalJobs, 
          newTotalReviews,
          newAverageRating: Math.round(newAverageRating * 100) / 100,
          newTotalEarnings
        });
      }
    } catch (error) {
      console.error('❌ Error updating freelancer stats:', error);
      console.error('Stack:', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Get all completed jobs pending admin approval
   */
  static async getCompletedJobsPendingApproval(): Promise<FogslyJob[]> {
    try {
      const jobsQuery = query(
        collection(db, this.JOBS_COLLECTION),
        where('status', '==', 'completed'),
        where('adminApproved', '==', false)
      );
      
      const snapshot = await getDocs(jobsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FogslyJob));
    } catch (error) {
      console.error('❌ Error fetching completed jobs:', error);
      return [];
    }
  }

  /**
   * Get all approved completed jobs
   */
  static async getApprovedCompletedJobs(): Promise<FogslyJob[]> {
    try {
      const jobsQuery = query(
        collection(db, this.JOBS_COLLECTION),
        where('status', '==', 'completed'),
        where('adminApproved', '==', true)
      );
      
      const snapshot = await getDocs(jobsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FogslyJob));
    } catch (error) {
      console.error('❌ Error fetching approved jobs:', error);
      return [];
    }
  }

  /**
   * Get reviews for a specific freelancer
   */
  static async getFreelancerReviews(freelancerId: string): Promise<FogslyJob[]> {
    try {
      // First, find all approved proposals for this freelancer
      const proposalsQuery = query(
        collection(db, 'JobsProposal'),
        where('freelancerId', '==', freelancerId),
        where('status', '==', 'approved')
      );
      
      const proposalsSnapshot = await getDocs(proposalsQuery);
      const jobIds = proposalsSnapshot.docs.map(doc => doc.data().jobId);

      if (jobIds.length === 0) {
        return [];
      }

      // Then get completed jobs with reviews for those job IDs
      // Note: We need to query in batches if jobIds > 10 due to Firestore limitations
      const batchSize = 10;
      const batches: Promise<FogslyJob[]>[] = [];

      for (let i = 0; i < jobIds.length; i += batchSize) {
        const batchJobIds = jobIds.slice(i, i + batchSize);
        
        const batchQuery = query(
          collection(db, this.JOBS_COLLECTION),
          where('id', 'in', batchJobIds),
          where('status', '==', 'completed'),
          where('clientRating', '>', 0)
        );
        
        batches.push(
          getDocs(batchQuery).then(snapshot => 
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as FogslyJob))
          )
        );
      }

      const batchResults = await Promise.all(batches);
      return batchResults.flat().sort((a, b) => {
        // Sort by completion date, newest first
        const aDate = a.completedAt instanceof Date 
          ? a.completedAt 
          : (a.completedAt as any)?.toDate?.() || new Date(0);
        const bDate = b.completedAt instanceof Date 
          ? b.completedAt 
          : (b.completedAt as any)?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
    } catch (error) {
      console.error('❌ Error fetching freelancer reviews:', error);
      return [];
    }
  }

  /**
   * Admin edits review for a completed job
   */
  static async adminEditReview(
    jobId: string,
    rating: number,
    review: string,
    adminId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const jobRef = doc(db, this.JOBS_COLLECTION, jobId);
      
      await updateDoc(jobRef, {
        clientRating: rating,
        clientReview: review,
        updatedAt: serverTimestamp(),
        // Optional: Track that admin edited this
        adminEditedAt: serverTimestamp(),
        adminEditedBy: adminId
      });

      console.log('✅ Admin edited job review successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error editing job review:', error);
      return { success: false, error: 'Failed to edit review' };
    }
  }
}

export default JobCompletionService;