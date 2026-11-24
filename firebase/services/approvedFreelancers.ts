import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

// Helper function to convert portfolioItems from map to array
const convertPortfolioItemsToArray = (portfolioItems: any): any[] => {
  if (Array.isArray(portfolioItems)) {
    return portfolioItems; // Already an array
  }
  if (!portfolioItems || typeof portfolioItems !== 'object') {
    return []; // No portfolio items
  }
  // Convert map to array
  return Object.values(portfolioItems);
};

// Helper function to convert portfolioItems from array to map for Firestore
const convertPortfolioItemsToMap = (portfolioItems: any[]): Record<string, any> => {
  if (!Array.isArray(portfolioItems) || portfolioItems.length === 0) {
    return {}; // Return empty object if no items
  }
  return portfolioItems.reduce((acc, item, index) => {
    acc[`item_${index}`] = {
      id: item.id,
      image: item.image,
      title: item.title,
      description: item.description,
      link: item.link
    };
    return acc;
  }, {} as Record<string, any>);
};

export interface ApprovedFreelancer {
  id?: string;
  
  // User Information
  userId: string;
  userEmail: string;
  userName: string;
  fullName: string;
  title: string;
  bio: string;
  
  // Skills & Expertise
  skills: string[];
  categories: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  
  // Portfolio
  portfolioItems: {
    id: string;
    image: string;
    title: string;
    description: string;
    link: string;
  }[];
  education: string;
  certifications: string[];
  
  // Rates & Availability
  hourlyRate: number;
  currency: 'USD' | 'PKR';
  availability: string;
  languages: string[];
  
  // Status - NEW
  status: 'active' | 'inactive';
  
  // Stats
  totalReviews: number;
  totalJobs: number;
  totalEarnings: number;
  averageRating: number;
  
  // Timestamps
  approvedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION_NAME = 'ApprovedFreelancers';

/**
 * Add a freelancer to the ApprovedFreelancers collection
 */
export const addApprovedFreelancer = async (
  freelancerData: Omit<ApprovedFreelancer, 'id' | 'approvedAt' | 'createdAt'>
): Promise<string> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const newDocRef = doc(freelancersRef);

    const dataToSave = {
      ...freelancerData,
      portfolioItems: convertPortfolioItemsToMap(freelancerData.portfolioItems as any[]),
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    await setDoc(newDocRef, dataToSave);
    return newDocRef.id;
  } catch (error) {
    console.error('Error adding approved freelancer:', error);
    throw error;
  }
};

/**
 * Get all approved freelancers
 */
export const getAllApprovedFreelancers = async (): Promise<ApprovedFreelancer[]> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(freelancersRef, orderBy('approvedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    });
  } catch (error) {
    console.error('Error fetching approved freelancers:', error);
    throw error;
  }
};

/**
 * Get approved freelancer by ID
 */
export const getApprovedFreelancerById = async (
  id: string
): Promise<ApprovedFreelancer | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    }
    return null;
  } catch (error) {
    console.error('Error fetching approved freelancer:', error);
    throw error;
  }
};

/**
 * Get approved freelancer by user ID
 */
export const getApprovedFreelancerByUserId = async (
  userId: string
): Promise<ApprovedFreelancer | null> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(freelancersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    }
    return null;
  } catch (error) {
    console.error('Error fetching approved freelancer by user ID:', error);
    throw error;
  }
};

/**
 * Get ALL approved freelancer gigs by user ID (for multiple gigs)
 */
export const getAllApprovedFreelancersByUserId = async (
  userId: string
): Promise<ApprovedFreelancer[]> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(
      freelancersRef, 
      where('userId', '==', userId),
      orderBy('approvedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    });
  } catch (error) {
    console.error('Error fetching all approved freelancers by user ID:', error);
    throw error;
  }
};

/**
 * Update freelancer status (active/inactive)
 */
export const updateFreelancerStatus = async (
  freelancerId: string,
  status: 'active' | 'inactive'
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, freelancerId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating freelancer status:', error);
    throw error;
  }
};

/**
 * Get all active freelancers (for public display)
 * Optimized for fast loading with indexing
 */
export const getAllActiveFreelancers = async (): Promise<ApprovedFreelancer[]> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(
      freelancersRef,
      where('status', '==', 'active'),
      orderBy('averageRating', 'desc'),
      orderBy('approvedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    });
  } catch (error) {
    console.error('Error fetching all active freelancers:', error);
    // Fallback without ordering if indexes are not set up
    try {
      const freelancersRef = collection(db, COLLECTION_NAME);
      const q = query(
        freelancersRef,
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      // Sort in memory
      const freelancers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
        } as ApprovedFreelancer;
      });
      
      return freelancers.sort((a, b) => {
        // Sort by rating first, then by approved date
        if (b.averageRating !== a.averageRating) {
          return (b.averageRating || 0) - (a.averageRating || 0);
        }
        const aTime = a.approvedAt instanceof Timestamp ? a.approvedAt.toMillis() : 0;
        const bTime = b.approvedAt instanceof Timestamp ? b.approvedAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Update approved freelancer data
 */
export const updateApprovedFreelancer = async (
  freelancerId: string,
  updates: Partial<ApprovedFreelancer>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, freelancerId);
    
    // Convert portfolio items to map format if present in updates
    const updatesToSave: any = { ...updates };
    if (updates.portfolioItems) {
      updatesToSave.portfolioItems = convertPortfolioItemsToMap(updates.portfolioItems);
    }
    
    await updateDoc(docRef, {
      ...updatesToSave,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating approved freelancer:', error);
    throw error;
  }
};

/**
 * Delete approved freelancer
 */
export const deleteApprovedFreelancer = async (
  freelancerId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, freelancerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting approved freelancer:', error);
    throw error;
  }
};

/**
 * Get active freelancers only
 */
export const getActiveFreelancers = async (): Promise<ApprovedFreelancer[]> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(
      freelancersRef,
      where('status', '==', 'active'),
      orderBy('approvedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    });
  } catch (error) {
    console.error('Error fetching active freelancers:', error);
    throw error;
  }
};

/**
 * Get freelancers by status
 */
export const getFreelancersByStatus = async (
  status: 'active' | 'inactive'
): Promise<ApprovedFreelancer[]> => {
  try {
    const freelancersRef = collection(db, COLLECTION_NAME);
    const q = query(
      freelancersRef,
      where('status', '==', status),
      orderBy('approvedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        portfolioItems: convertPortfolioItemsToArray(data.portfolioItems)
      } as ApprovedFreelancer;
    });
  } catch (error) {
    console.error('Error fetching freelancers by status:', error);
    throw error;
  }
};
