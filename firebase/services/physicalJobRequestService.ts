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
  PhysicalJobRequest,
  CreatePhysicalJobRequestData,
  UpdatePhysicalJobRequestData,
  PhysicalJobRequestStatus
} from '../types/physicalJob';

const PHYSICAL_JOB_REQUESTS_COLLECTION = 'PhysicalJobRequests';
const FOGSLY_PHYSICAL_JOBS_COLLECTION = 'FogslyPhysicalJobs';

/**
 * Create a new physical job request
 */
export const createPhysicalJobRequest = async (
  data: CreatePhysicalJobRequestData
): Promise<{ success: boolean; jobRequestId?: string; error?: string }> => {
  try {
    const jobRequestRef = doc(collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION));
    
    const jobRequestData = {
      // IDs
      id: jobRequestRef.id,
      userId: data.userId,
      userEmail: data.userEmail,
      
      // Company Info
      company_name: data.company_name,
      company_logo: data.company_logo || null,
      industry: data.industry,
      company_description: data.company_description,
      website: data.website || null,
      company_size: data.company_size,
      email: data.email,
      phone: data.phone,
      
      // Location
      country: data.country,
      city: data.city,
      address: data.address,
      location: data.location,
      
      // Job Details
      job_title: data.job_title,
      category: data.category,
      job_type: data.job_type,
      experience_level: data.experience_level,
      employment_type: data.employment_type,
      num_positions: data.num_positions,
      
      // Compensation
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      urgency: data.urgency,
      
      // Description
      job_description: data.job_description,
      responsibilities: data.responsibilities,
      required_skills: data.required_skills,
      benefits: data.benefits || null,
      
      // Special Offers
      accommodation: data.accommodation,
      visa_support: data.visa_support,
      deadline: data.deadline,
      
      // Status
      status: 'pending' as PhysicalJobRequestStatus,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(jobRequestRef, jobRequestData);

    console.log('✅ Physical job request created:', jobRequestRef.id);

    return { success: true, jobRequestId: jobRequestRef.id };
  } catch (error) {
    console.error('❌ Error creating physical job request:', error);
    return {
      success: false,
      error: 'Failed to submit job request. Please try again.'
    };
  }
};

/**
 * Get physical job request by ID
 */
export const getPhysicalJobRequestById = async (
  requestId: string
): Promise<PhysicalJobRequest | null> => {
  try {
    const requestDoc = await getDoc(doc(db, PHYSICAL_JOB_REQUESTS_COLLECTION, requestId));
    
    if (!requestDoc.exists()) {
      return null;
    }

    const data = requestDoc.data();
    return {
      id: requestDoc.id,
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
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
      approvedBy: data.approvedBy,
      rejectedBy: data.rejectedBy
    };
  } catch (error) {
    console.error('Error fetching physical job request:', error);
    return null;
  }
};

/**
 * Get all physical job requests by user ID
 */
export const getUserPhysicalJobRequests = async (
  userId: string
): Promise<PhysicalJobRequest[]> => {
  try {
    const q = query(
      collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
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
    console.error('Error fetching user physical job requests:', error);
    return [];
  }
};

/**
 * Get pending physical job requests count for a user
 */
export const getUserPendingPhysicalJobRequestsCount = async (
  userId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching pending physical job requests count:', error);
    return 0;
  }
};

/**
 * Get all physical job requests (Admin)
 */
export const getAllPhysicalJobRequests = async (
  statusFilter?: PhysicalJobRequestStatus,
  limitCount: number = 50
): Promise<PhysicalJobRequest[]> => {
  try {
    let q = query(
      collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION),
      orderBy('submittedAt', 'desc')
    );

    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
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
    console.error('Error fetching all physical job requests:', error);
    return [];
  }
};

/**
 * Update physical job request
 */
export const updatePhysicalJobRequest = async (
  requestId: string,
  updates: UpdatePhysicalJobRequestData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, PHYSICAL_JOB_REQUESTS_COLLECTION, requestId);
    
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Physical job request updated:', requestId);

    return { success: true };
  } catch (error) {
    console.error('Error updating physical job request:', error);
    return {
      success: false,
      error: 'Failed to update job request. Please try again.'
    };
  }
};

/**
 * Get physical job requests statistics
 */
export const getPhysicalJobRequestsStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> => {
  try {
    const allSnapshot = await getDocs(collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION));
    const total = allSnapshot.size;

    const pendingSnapshot = await getDocs(
      query(collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION), where('status', '==', 'pending'))
    );
    const pending = pendingSnapshot.size;

    const approvedSnapshot = await getDocs(
      query(collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION), where('status', '==', 'approved'))
    );
    const approved = approvedSnapshot.size;

    const rejectedSnapshot = await getDocs(
      query(collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION), where('status', '==', 'rejected'))
    );
    const rejected = rejectedSnapshot.size;

    return { total, pending, approved, rejected };
  } catch (error) {
    console.error('Error fetching physical job requests stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
};

/**
 * Get previous company location for user (by email)
 */
export const getPreviousCompanyLocation = async (
  userEmail: string
): Promise<any | null> => {
  try {
    const q = query(
      collection(db, PHYSICAL_JOB_REQUESTS_COLLECTION),
      where('userEmail', '==', userEmail),
      where('status', '==', 'approved'),
      orderBy('approvedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return data.location || null;
  } catch (error) {
    console.error('Error fetching previous company location:', error);
    return null;
  }
};

/**
 * Approve physical job request (Admin)
 * Updates request status to 'approved' and creates active job in FogslyPhysicalJobs collection
 */
export const approvePhysicalJobRequest = async (
  requestId: string,
  adminId?: string
): Promise<{ success: boolean; jobId?: string; error?: string }> => {
  try {
    // Get the request
    const request = await getPhysicalJobRequestById(requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Only pending requests can be approved' };
    }

    // Create job in FogslyPhysicalJobs collection
    const jobRef = doc(collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION));
    
    const jobData = {
      // IDs and metadata
      id: jobRef.id,
      userId: request.userId,
      userEmail: request.userEmail,
      requestId: requestId,
      
      // Company Info
      company_name: request.company_name,
      company_logo: request.company_logo,
      industry: request.industry,
      company_description: request.company_description,
      website: request.website,
      company_size: request.company_size,
      email: request.email,
      phone: request.phone,
      
      // Location
      country: request.country,
      city: request.city,
      address: request.address,
      location: request.location,
      
      // Job Details
      job_title: request.job_title,
      category: request.category,
      job_type: request.job_type,
      experience_level: request.experience_level,
      employment_type: request.employment_type,
      num_positions: request.num_positions,
      
      // Compensation
      salary_min: request.salary_min,
      salary_max: request.salary_max,
      urgency: request.urgency,
      
      // Description
      job_description: request.job_description,
      responsibilities: request.responsibilities,
      required_skills: request.required_skills,
      benefits: request.benefits,
      
      // Special Offers
      accommodation: request.accommodation,
      visa_support: request.visa_support,
      deadline: request.deadline,
      
      // Job Status
      status: 'active',
      applications: [],
      applicationsCount: 0,
      views: 0,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      postedAt: serverTimestamp(),
      expiresAt: null
    };

    await setDoc(jobRef, jobData);

    // Update request status
    const requestRef = doc(db, PHYSICAL_JOB_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: adminId || 'admin',
      updatedAt: serverTimestamp(),
      jobId: jobRef.id
    });

    console.log('✅ Job request approved and job created:', jobRef.id);

    return { success: true, jobId: jobRef.id };
  } catch (error) {
    console.error('❌ Error approving job request:', error);
    return {
      success: false,
      error: 'Failed to approve job request. Please try again.'
    };
  }
};

/**
 * Reject physical job request (Admin)
 * Updates request status to 'rejected' with rejection reason
 */
export const rejectPhysicalJobRequest = async (
  requestId: string,
  rejectionReason: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, PHYSICAL_JOB_REQUESTS_COLLECTION, requestId);
    
    // Verify request exists and is pending
    const request = await getPhysicalJobRequestById(requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Only pending requests can be rejected' };
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      rejectionReason: rejectionReason,
      rejectedAt: serverTimestamp(),
      rejectedBy: adminId || 'admin',
      updatedAt: serverTimestamp()
    });

    console.log('✅ Job request rejected:', requestId);

    return { success: true };
  } catch (error) {
    console.error('❌ Error rejecting job request:', error);
    return {
      success: false,
      error: 'Failed to reject job request. Please try again.'
    };
  }
};

/**
 * Get active physical jobs with optional filters
 */
export const getActivePhysicalJobs = async (filters?: {
  country?: string;
  category?: string;
  experienceLevel?: string;
  sortBy?: 'newest' | 'salary-high' | 'salary-low';
  limitCount?: number;
}) => {
  try {
    const jobsRef = collection(db, FOGSLY_PHYSICAL_JOBS_COLLECTION);
    
    // Build query with filters
    let constraints: any[] = [where('status', '==', 'active')];
    
    if (filters?.country) {
      constraints.push(where('country', '==', filters.country));
    }
    
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters?.experienceLevel) {
      constraints.push(where('experience_level', '==', filters.experienceLevel));
    }

    // Add ordering
    if (filters?.sortBy === 'newest' || !filters?.sortBy) {
      constraints.push(orderBy('postedAt', 'desc'));
    } else if (filters?.sortBy === 'salary-high') {
      constraints.push(orderBy('salary_max', 'desc'));
    } else if (filters?.sortBy === 'salary-low') {
      constraints.push(orderBy('salary_min', 'asc'));
    }

    // Add limit
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    } else {
      constraints.push(limit(50)); // Default limit
    }

    const q = query(jobsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        postedAt: data.postedAt?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    });
  } catch (error) {
    console.error('Error fetching active physical jobs:', error);
    return [];
  }
};

/**
 * Get physical job by ID from FogslyPhysicalJobs collection
 */
export const getPhysicalJobById = async (jobId: string) => {
  try {
    const jobDoc = await getDoc(doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId));
    
    if (!jobDoc.exists()) {
      return null;
    }

    const data = jobDoc.data();
    return {
      id: jobDoc.id,
      ...data,
      postedAt: data.postedAt?.toDate?.() || new Date(),
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      expiresAt: data.expiresAt?.toDate?.() || null
    };
  } catch (error) {
    console.error('Error fetching physical job:', error);
    return null;
  }
};

/**
 * Increment job view count
 */
export const incrementJobViews = async (jobId: string) => {
  try {
    const jobRef = doc(db, FOGSLY_PHYSICAL_JOBS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (jobDoc.exists()) {
      const currentViews = jobDoc.data().views || 0;
      await updateDoc(jobRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing job views:', error);
  }
};

/**
 * Get unique countries from active physical jobs
 */
export const getUniqueJobCountries = async (): Promise<string[]> => {
  try {
    const jobsRef = collection(db, 'FogslyPhysicalJobs');
    const q = query(
      jobsRef,
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    const countries = new Set<string>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.country) {
        countries.add(data.country);
      }
    });
    
    return Array.from(countries).sort();
  } catch (error) {
    console.error('Error fetching unique countries:', error);
    return [];
  }
};

/**
 * Get unique categories (industries) from active physical jobs
 */
export const getUniqueJobCategories = async (): Promise<string[]> => {
  try {
    const jobsRef = collection(db, 'FogslyPhysicalJobs');
    const q = query(
      jobsRef,
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    const categories = new Set<string>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.industry) {
        categories.add(data.industry);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return [];
  }
};


