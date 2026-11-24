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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import {
  FogslyPhysicalJob,
  PhysicalJobRequest,
  FogslyPhysicalJobStatus
} from '../types/physicalJob';

const FOGSLY_PHYSICAL_JOBS_COLLECTION = 'FogslyPhysicalJobs';

/**
 * Create a new active physical job (from approved request)
 */
export const createFogslyPhysicalJob = async (
  jobRequest: PhysicalJobRequest,
  adminId: string
): Promise<{ success: boolean; jobId?: string; error?: string }> => {
  try {
    const jobRef = doc(collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION));
    
    const jobData = {
      // IDs
      id: jobRef.id,
      physicalJobRequestId: jobRequest.id,
      userId: jobRequest.userId,
      userEmail: jobRequest.userEmail,
      
      // Company Info (from request)
      company_name: jobRequest.company_name,
      company_logo: jobRequest.company_logo || null,
      industry: jobRequest.industry,
      company_description: jobRequest.company_description,
      website: jobRequest.website || null,
      company_size: jobRequest.company_size,
      email: jobRequest.email,
      phone: jobRequest.phone,
      
      // Location (from request)
      country: jobRequest.country,
      city: jobRequest.city,
      address: jobRequest.address,
      location: jobRequest.location,
      
      // Job Details (from request)
      job_title: jobRequest.job_title,
      category: jobRequest.category,
      job_type: jobRequest.job_type,
      experience_level: jobRequest.experience_level,
      employment_type: jobRequest.employment_type,
      num_positions: jobRequest.num_positions,
      
      // Compensation (from request)
      salary_min: jobRequest.salary_min,
      salary_max: jobRequest.salary_max,
      urgency: jobRequest.urgency,
      
      // Description (from request)
      job_description: jobRequest.job_description,
      responsibilities: jobRequest.responsibilities,
      required_skills: jobRequest.required_skills,
      benefits: jobRequest.benefits || null,
      
      // Special Offers (from request)
      accommodation: jobRequest.accommodation,
      visa_support: jobRequest.visa_support,
      deadline: jobRequest.deadline,
      
      // Active Job Status
      status: 'active' as FogslyPhysicalJobStatus,
      paused_reason: null,
      
      // Metadata
      posted_date: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approvedAt: jobRequest.approvedAt ? Timestamp.fromDate(jobRequest.approvedAt) : serverTimestamp(),
      approvedBy: adminId,
      verified: true,
      
      // Tracking
      applicant_count: 0,
      viewCount: 0
    };

    await setDoc(jobRef, jobData);

    console.log('✅ Fogsly physical job created:', jobRef.id);

    return { success: true, jobId: jobRef.id };
  } catch (error) {
    console.error('❌ Error creating Fogsly physical job:', error);
    return {
      success: false,
      error: 'Failed to create active job listing. Please try again.'
    };
  }
};

/**
 * Get physical job by ID
 */
export const getFogslyPhysicalJobById = async (
  jobId: string
): Promise<FogslyPhysicalJob | null> => {
  try {
    const jobDoc = await getDoc(doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId));
    
    if (!jobDoc.exists()) {
      return null;
    }

    const data = jobDoc.data();
    return {
      id: jobDoc.id,
      physicalJobRequestId: data.physicalJobRequestId,
      userId: data.userId,
      userEmail: data.userEmail,
      
      company_name: data.company_name,
      company_logo: data.company_logo,
      industry: data.industry,
      company_description: data.company_description,
      website: data.website,
      company_size: data.company_size,
      email: data.email,
      phone: data.phone,
      
      country: data.country,
      city: data.city,
      address: data.address,
      location: data.location,
      
      job_title: data.job_title,
      category: data.category,
      job_type: data.job_type,
      experience_level: data.experience_level,
      employment_type: data.employment_type,
      num_positions: data.num_positions,
      
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      urgency: data.urgency,
      
      job_description: data.job_description,
      responsibilities: data.responsibilities,
      required_skills: data.required_skills || [],
      benefits: data.benefits,
      
      accommodation: data.accommodation,
      visa_support: data.visa_support,
      deadline: data.deadline,
      
      status: data.status,
      paused_reason: data.paused_reason,
      
      posted_date: data.posted_date?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || new Date(),
      approvedBy: data.approvedBy,
      verified: data.verified,
      
      applicant_count: data.applicant_count || 0,
      viewCount: data.viewCount || 0,
      
      hired_date: data.hired_date?.toDate(),
      completed_date: data.completed_date?.toDate()
    };
  } catch (error) {
    console.error('Error fetching Fogsly physical job:', error);
    return null;
  }
};

/**
 * Get all physical jobs by user ID
 */
export const getUserPhysicalJobs = async (
  userId: string
): Promise<FogslyPhysicalJob[]> => {
  try {
    const q = query(
      collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        physicalJobRequestId: data.physicalJobRequestId,
        userId: data.userId,
        userEmail: data.userEmail,
        
        company_name: data.company_name,
        company_logo: data.company_logo,
        industry: data.industry,
        company_description: data.company_description,
        website: data.website,
        company_size: data.company_size,
        email: data.email,
        phone: data.phone,
        
        country: data.country,
        city: data.city,
        address: data.address,
        location: data.location,
        
        job_title: data.job_title,
        category: data.category,
        job_type: data.job_type,
        experience_level: data.experience_level,
        employment_type: data.employment_type,
        num_positions: data.num_positions,
        
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        urgency: data.urgency,
        
        job_description: data.job_description,
        responsibilities: data.responsibilities,
        required_skills: data.required_skills || [],
        benefits: data.benefits,
        
        accommodation: data.accommodation,
        visa_support: data.visa_support,
        deadline: data.deadline,
        
        status: data.status,
        paused_reason: data.paused_reason,
        
        posted_date: data.posted_date?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date(),
        approvedBy: data.approvedBy,
        verified: data.verified,
        
        applicant_count: data.applicant_count || 0,
        viewCount: data.viewCount || 0,
        
        hired_date: data.hired_date?.toDate(),
        completed_date: data.completed_date?.toDate()
      };
    });
    
    // Sort by posted_date in descending order (newest first)
    jobs.sort((a, b) => b.posted_date.getTime() - a.posted_date.getTime());
    
    return jobs;
  } catch (error) {
    console.error('Error fetching user physical jobs:', error);
    return [];
  }
};

/**
 * Get all active physical jobs (public)
 */
export const getAllActivePhysicalJobs = async (
  limitCount: number = 50
): Promise<FogslyPhysicalJob[]> => {
  try {
    // Remove orderBy to avoid composite index requirement
    const q = query(
      collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION),
      where('status', '==', 'active'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        physicalJobRequestId: data.physicalJobRequestId,
        userId: data.userId,
        userEmail: data.userEmail,
        
        company_name: data.company_name,
        company_logo: data.company_logo,
        industry: data.industry,
        company_description: data.company_description,
        website: data.website,
        company_size: data.company_size,
        email: data.email,
        phone: data.phone,
        
        country: data.country,
        city: data.city,
        address: data.address,
        location: data.location,
        
        job_title: data.job_title,
        category: data.category,
        job_type: data.job_type,
        experience_level: data.experience_level,
        employment_type: data.employment_type,
        num_positions: data.num_positions,
        
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        urgency: data.urgency,
        
        job_description: data.job_description,
        responsibilities: data.responsibilities,
        required_skills: data.required_skills || [],
        benefits: data.benefits,
        
        accommodation: data.accommodation,
        visa_support: data.visa_support,
        deadline: data.deadline,
        
        status: data.status,
        paused_reason: data.paused_reason,
        
        posted_date: data.posted_date?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date(),
        approvedBy: data.approvedBy,
        verified: data.verified,
        
        applicant_count: data.applicant_count || 0,
        viewCount: data.viewCount || 0,
        
        hired_date: data.hired_date?.toDate(),
        completed_date: data.completed_date?.toDate()
      };
    });

    // Sort by posted_date in memory (newest first)
    const sortedJobs = jobs.sort((a, b) => b.posted_date.getTime() - a.posted_date.getTime());
    
    return sortedJobs;
  } catch (error) {
    console.error('Error fetching active physical jobs:', error);
    return [];
  }
};

/**
 * Get all physical jobs (Admin - all statuses)
 */
export const getAllPhysicalJobs = async (
  statusFilter?: FogslyPhysicalJobStatus,
  limitCount: number = 100
): Promise<FogslyPhysicalJob[]> => {
  try {
    // Build query without orderBy to avoid composite index requirement
    let q = query(collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION));

    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        physicalJobRequestId: data.physicalJobRequestId,
        userId: data.userId,
        userEmail: data.userEmail,
        
        company_name: data.company_name,
        company_logo: data.company_logo,
        industry: data.industry,
        company_description: data.company_description,
        website: data.website,
        company_size: data.company_size,
        email: data.email,
        phone: data.phone,
        
        country: data.country,
        city: data.city,
        address: data.address,
        location: data.location,
        
        job_title: data.job_title,
        category: data.category,
        job_type: data.job_type,
        experience_level: data.experience_level,
        employment_type: data.employment_type,
        num_positions: data.num_positions,
        
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        urgency: data.urgency,
        
        job_description: data.job_description,
        responsibilities: data.responsibilities,
        required_skills: data.required_skills || [],
        benefits: data.benefits,
        
        accommodation: data.accommodation,
        visa_support: data.visa_support,
        deadline: data.deadline,
        
        status: data.status,
        paused_reason: data.paused_reason,
        
        posted_date: data.posted_date?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || new Date(),
        approvedBy: data.approvedBy,
        verified: data.verified,
        
        applicant_count: data.applicant_count || 0,
        viewCount: data.viewCount || 0,
        
        hired_date: data.hired_date?.toDate(),
        completed_date: data.completed_date?.toDate()
      };
    });

    // Sort by posted_date in memory (newest first)
    const sortedJobs = jobs.sort((a, b) => b.posted_date.getTime() - a.posted_date.getTime());
    
    return sortedJobs;
  } catch (error) {
    console.error('Error fetching all physical jobs:', error);
    return [];
  }
};

/**
 * Update physical job status
 */
export const updatePhysicalJobStatus = async (
  jobId: string,
  status: FogslyPhysicalJobStatus,
  pausedReason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const jobRef = doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId);
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'paused' && pausedReason) {
      updateData.paused_reason = pausedReason;
    }

    if (status === 'hired') {
      updateData.hired_date = serverTimestamp();
    }

    if (status === 'completed') {
      updateData.completed_date = serverTimestamp();
    }

    await updateDoc(jobRef, updateData);

    console.log(`✅ Physical job status updated to: ${status}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating physical job status:', error);
    return {
      success: false,
      error: 'Failed to update job status. Please try again.'
    };
  }
};

/**
 * Update physical job details
 */
export const updatePhysicalJob = async (
  jobId: string,
  jobData: Partial<FogslyPhysicalJob>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const jobRef = doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId);
    
    const updateData: any = {
      ...jobData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(jobRef, updateData);

    console.log(`✅ Physical job updated: ${jobId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating physical job:', error);
    return {
      success: false,
      error: 'Failed to update job. Please try again.'
    };
  }
};

/**
 * Increment view count for a job
 */
export const incrementJobViewCount = async (jobId: string): Promise<void> => {
  try {
    const jobRef = doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (jobDoc.exists()) {
      const currentCount = jobDoc.data().viewCount || 0;
      await updateDoc(jobRef, {
        viewCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
