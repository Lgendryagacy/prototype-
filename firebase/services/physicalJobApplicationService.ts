import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import {
  PhysicalJobApplication,
  CreatePhysicalJobApplicationData,
  PhysicalJobApplicationStatus
} from '../types/physicalJob';

const APPLICATIONS_COLLECTION = 'PhysicalJobApplications';
const JOBS_COLLECTION = 'FogslyPhysicalJobs';

/**
 * Check if user has already applied for a job
 */
export const checkExistingApplication = async (
  jobId: string,
  applicantId: string
): Promise<PhysicalJobApplication | null> => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('jobId', '==', jobId),
      where('applicantId', '==', applicantId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      applicantId: data.applicantId,
      applicantEmail: data.applicantEmail,
      applicant_name: data.applicant_name,
      applicant_phone: data.applicant_phone,
      applicant_city: data.applicant_city,
      applicant_country: data.applicant_country,
      jobPosterId: data.jobPosterId,
      jobPosterEmail: data.jobPosterEmail,
      skills: data.skills || [],
      cover_letter: data.cover_letter,
      resume_url: data.resume_url,
      status: data.status,
      rejectionReason: data.rejectionReason,
      appliedAt: data.appliedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      reviewedAt: data.reviewedAt?.toDate(),
      reviewedBy: data.reviewedBy
    };
  } catch (error) {
    console.error('Error checking existing application:', error);
    return null;
  }
};

/**
 * Create a new job application
 */
export const createPhysicalJobApplication = async (
  applicationData: CreatePhysicalJobApplicationData
): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
  try {
    // Check if user already applied
    const existingApplication = await checkExistingApplication(
      applicationData.jobId,
      applicationData.applicantId
    );

    if (existingApplication) {
      return {
        success: false,
        error: 'You have already applied for this job'
      };
    }

    // Create application document
    const applicationDoc = {
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      applicantId: applicationData.applicantId,
      applicantEmail: applicationData.applicantEmail,
      applicant_name: applicationData.applicant_name,
      applicant_phone: applicationData.applicant_phone,
      applicant_city: applicationData.applicant_city,
      applicant_country: applicationData.applicant_country,
      jobPosterId: applicationData.jobPosterId,
      jobPosterEmail: applicationData.jobPosterEmail,
      skills: applicationData.skills,
      cover_letter: applicationData.cover_letter,
      resume_url: applicationData.resume_url || null,
      status: 'pending' as PhysicalJobApplicationStatus,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add application to Firestore
    const docRef = await addDoc(
      collection(db, APPLICATIONS_COLLECTION),
      applicationDoc
    );

    // Increment application count in job document
    const jobRef = doc(db, JOBS_COLLECTION, applicationData.jobId);
    await updateDoc(jobRef, {
      applicant_count: increment(1)
    });

    return {
      success: true,
      applicationId: docRef.id
    };
  } catch (error) {
    console.error('Error creating job application:', error);
    return {
      success: false,
      error: 'Failed to submit application. Please try again.'
    };
  }
};

/**
 * Get application by ID
 */
export const getApplicationById = async (
  applicationId: string
): Promise<PhysicalJobApplication | null> => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      applicantId: data.applicantId,
      applicantEmail: data.applicantEmail,
      applicant_name: data.applicant_name,
      applicant_phone: data.applicant_phone,
      applicant_city: data.applicant_city,
      applicant_country: data.applicant_country,
      jobPosterId: data.jobPosterId,
      jobPosterEmail: data.jobPosterEmail,
      skills: data.skills || [],
      cover_letter: data.cover_letter,
      resume_url: data.resume_url,
      status: data.status,
      rejectionReason: data.rejectionReason,
      appliedAt: data.appliedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      reviewedAt: data.reviewedAt?.toDate(),
      reviewedBy: data.reviewedBy
    };
  } catch (error) {
    console.error('Error getting application:', error);
    return null;
  }
};

/**
 * Get all applications for a specific user
 */
export const getUserApplications = async (
  userId: string
): Promise<PhysicalJobApplication[]> => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('applicantId', '==', userId)
    );

    const snapshot = await getDocs(q);

    const applications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        applicantId: data.applicantId,
        applicantEmail: data.applicantEmail,
        applicant_name: data.applicant_name,
        applicant_phone: data.applicant_phone,
        applicant_city: data.applicant_city,
        applicant_country: data.applicant_country,
        jobPosterId: data.jobPosterId,
        jobPosterEmail: data.jobPosterEmail,
        skills: data.skills || [],
        cover_letter: data.cover_letter,
        resume_url: data.resume_url,
        status: data.status,
        rejectionReason: data.rejectionReason,
        appliedAt: data.appliedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reviewedAt: data.reviewedAt?.toDate(),
        reviewedBy: data.reviewedBy
      };
    });

    // Sort by applied date (newest first)
    return applications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  } catch (error) {
    console.error('Error getting user applications:', error);
    return [];
  }
};

/**
 * Get all applications for a specific job
 */
export const getJobApplications = async (
  jobId: string
): Promise<PhysicalJobApplication[]> => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('jobId', '==', jobId)
    );

    const snapshot = await getDocs(q);

    const applications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        applicantId: data.applicantId,
        applicantEmail: data.applicantEmail,
        applicant_name: data.applicant_name,
        applicant_phone: data.applicant_phone,
        applicant_city: data.applicant_city,
        applicant_country: data.applicant_country,
        jobPosterId: data.jobPosterId,
        jobPosterEmail: data.jobPosterEmail,
        skills: data.skills || [],
        cover_letter: data.cover_letter,
        resume_url: data.resume_url,
        status: data.status,
        rejectionReason: data.rejectionReason,
        appliedAt: data.appliedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reviewedAt: data.reviewedAt?.toDate(),
        reviewedBy: data.reviewedBy
      };
    });

    // Sort by applied date (newest first)
    return applications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  } catch (error) {
    console.error('Error getting job applications:', error);
    return [];
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: PhysicalJobApplicationStatus,
  rejectionReason?: string,
  reviewerId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp()
    };

    if (reviewerId) {
      updateData.reviewedBy = reviewerId;
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(docRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: 'Failed to update application status'
    };
  }
};
