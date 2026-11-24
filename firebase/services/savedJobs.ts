import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'SavedJobs';

export type JobType = 'freelance' | 'physical' | 'gig' | 'task';

export interface SavedJob {
  id?: string;
  userId: string;
  jobId: string;
  jobType: JobType;
  savedAt: Timestamp;
}

/**
 * Save a job for a user
 */
export const saveJob = async (userId: string, jobId: string, jobType: JobType = 'freelance'): Promise<void> => {
  try {
    // Use a composite key: userId_jobId
    const docId = `${userId}_${jobId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    await setDoc(docRef, {
      userId,
      jobId,
      jobType,
      savedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

/**
 * Unsave a job for a user
 */
export const unsaveJob = async (userId: string, jobId: string): Promise<void> => {
  try {
    const docId = `${userId}_${jobId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error unsaving job:', error);
    throw error;
  }
};

/**
 * Check if a job is saved by a user
 */
export const isJobSaved = async (userId: string, jobId: string): Promise<boolean> => {
  try {
    const docId = `${userId}_${jobId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    return false;
  }
};

/**
 * Get all saved job IDs for a user
 */
export const getUserSavedJobIds = async (userId: string, jobType?: JobType): Promise<string[]> => {
  try {
    const savedJobsRef = collection(db, COLLECTION_NAME);
    const constraints = [
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    ];
    
    if (jobType) {
      constraints.splice(1, 0, where('jobType', '==', jobType));
    }
    
    const q = query(savedJobsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data().jobId);
  } catch (error) {
    console.error('Error fetching saved job IDs:', error);
    throw error;
  }
};

/**
 * Get all saved jobs for a user with full details
 */
export const getUserSavedJobs = async (userId: string, jobType?: JobType): Promise<SavedJob[]> => {
  try {
    const savedJobsRef = collection(db, COLLECTION_NAME);
    const constraints = [
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    ];
    
    if (jobType) {
      constraints.splice(1, 0, where('jobType', '==', jobType));
    }
    
    const q = query(savedJobsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedJob[];
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }
};

/**
 * Toggle save status of a job
 */
export const toggleJobSave = async (userId: string, jobId: string, jobType: JobType = 'freelance'): Promise<boolean> => {
  try {
    const isSaved = await isJobSaved(userId, jobId);
    
    if (isSaved) {
      await unsaveJob(userId, jobId);
      return false; // Now unsaved
    } else {
      await saveJob(userId, jobId, jobType);
      return true; // Now saved
    }
  } catch (error) {
    console.error('Error toggling job save:', error);
    throw error;
  }
};

/**
 * Save a physical job for a user
 */
export const savePhysicalJob = async (userId: string, jobId: string): Promise<void> => {
  return saveJob(userId, jobId, 'physical');
};

/**
 * Get all saved physical job IDs for a user
 */
export const getUserSavedPhysicalJobIds = async (userId: string): Promise<string[]> => {
  return getUserSavedJobIds(userId, 'physical');
};

/**
 * Get all saved physical jobs for a user
 */
export const getUserSavedPhysicalJobs = async (userId: string): Promise<SavedJob[]> => {
  return getUserSavedJobs(userId, 'physical');
};

/**
 * Toggle save status of a physical job
 */
export const togglePhysicalJobSave = async (userId: string, jobId: string): Promise<boolean> => {
  return toggleJobSave(userId, jobId, 'physical');
};
