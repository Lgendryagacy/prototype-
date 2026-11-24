import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';

export interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

// Helper function to convert portfolioItems from map to array
const convertPortfolioItemsToArray = (portfolioItems: any): PortfolioItem[] => {
  if (Array.isArray(portfolioItems)) {
    return portfolioItems; // Already an array
  }
  if (!portfolioItems || typeof portfolioItems !== 'object') {
    return []; // No portfolio items
  }
  // Convert map to array
  return Object.values(portfolioItems);
};

export interface FreelanceRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  fullName: string;
  title: string;
  bio: string;
  skills: string[];
  categories: string[];
  experience: string;
  portfolioItems: PortfolioItem[];
  education: string;
  certifications: string[];
  hourlyRate: number;
  currency: string;
  availability: string;
  languages: string[];
  requestStatus: 'pending' | 'approved' | 'rejected';
  
  // Stats
  totalReviews: number;
  totalJobs: number;
  totalEarnings: number;
  averageRating: number;
  
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Helper function to upload base64 image to Firebase Storage
const uploadPortfolioImage = async (base64Image: string, userId: string, itemId: string): Promise<string> => {
  if (!base64Image || !base64Image.startsWith('data:image')) {
    return base64Image; // Return as-is if not a base64 image (could be a URL)
  }

  try {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Create a reference to the storage location
    const storageRef = ref(storage, `portfolioImages/${userId}/${itemId}.jpg`);
    
    // Upload the file
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading portfolio image:', error);
    throw error;
  }
};

// Submit freelance request
export const submitFreelanceRequest = async (data: Omit<FreelanceRequest, 'id' | 'createdAt'>): Promise<string> => {
  try {
    // Upload portfolio images to Firebase Storage first
    const uploadedPortfolioItems = await Promise.all(
      data.portfolioItems.map(async (item) => {
        if (item.image) {
          const uploadedImageUrl = await uploadPortfolioImage(item.image, data.userId, item.id);
          return { ...item, image: uploadedImageUrl };
        }
        return item;
      })
    );

    // Build request data
    const requestData: any = {
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      fullName: data.fullName,
      title: data.title,
      bio: data.bio,
      skills: data.skills,
      categories: data.categories,
      experience: data.experience,
      education: data.education,
      certifications: data.certifications,
      hourlyRate: data.hourlyRate,
      currency: data.currency,
      availability: data.availability,
      languages: data.languages,
      requestStatus: data.requestStatus,
      totalReviews: data.totalReviews,
      totalJobs: data.totalJobs,
      totalEarnings: data.totalEarnings,
      averageRating: data.averageRating,
      createdAt: serverTimestamp()
    };

    // Store portfolioItems as JSON (now with URLs instead of base64)
    if (uploadedPortfolioItems && uploadedPortfolioItems.length > 0) {
      requestData.portfolioItemsJson = JSON.stringify(uploadedPortfolioItems);
    }

    const docRef = await addDoc(collection(db, 'FreelanceRequests'), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting freelance request:', error);
    throw error;
  }
};

// Get all freelance requests (Admin)
export const getAllFreelanceRequests = async (): Promise<FreelanceRequest[]> => {
  try {
    const q = query(
      collection(db, 'FreelanceRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Deserialize portfolioItems from JSON string
      let portfolioItems: PortfolioItem[] = [];
      if (data.portfolioItemsJson) {
        try {
          portfolioItems = JSON.parse(data.portfolioItemsJson);
        } catch (e) {
          console.error('Error parsing portfolio items:', e);
        }
      }
      return {
        id: doc.id,
        ...data,
        portfolioItems
      } as FreelanceRequest;
    });
  } catch (error) {
    console.error('Error getting freelance requests:', error);
    throw error;
  }
};

// Get freelance request by ID
export const getFreelanceRequestById = async (id: string): Promise<FreelanceRequest | null> => {
  try {
    const docRef = doc(db, 'FreelanceRequests', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Deserialize portfolioItems from JSON string
      let portfolioItems: PortfolioItem[] = [];
      if (data.portfolioItemsJson) {
        try {
          portfolioItems = JSON.parse(data.portfolioItemsJson);
        } catch (e) {
          console.error('Error parsing portfolio items:', e);
        }
      }
      return {
        id: docSnap.id,
        ...data,
        portfolioItems
      } as FreelanceRequest;
    }
    return null;
  } catch (error) {
    console.error('Error getting freelance request:', error);
    throw error;
  }
};

// Get user's freelance request
export const getUserFreelanceRequest = async (userId: string): Promise<FreelanceRequest | null> => {
  try {
    const q = query(
      collection(db, 'FreelanceRequests'),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      // Deserialize portfolioItems from JSON string
      let portfolioItems: PortfolioItem[] = [];
      if (data.portfolioItemsJson) {
        try {
          portfolioItems = JSON.parse(data.portfolioItemsJson);
        } catch (e) {
          console.error('Error parsing portfolio items:', e);
        }
      }
      return {
        id: docSnap.id,
        ...data,
        portfolioItems
      } as FreelanceRequest;
    }
    return null;
  } catch (error) {
    console.error('Error getting user freelance request:', error);
    throw error;
  }
};

// Update freelance request status (Admin)
export const updateFreelanceRequestStatus = async (
  requestId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> => {
  try {
    const requestRef = doc(db, 'FreelanceRequests', requestId);
    await updateDoc(requestRef, {
      requestStatus: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Update freelance request
export const updateFreelanceRequest = async (
  requestId: string,
  data: Partial<FreelanceRequest>
): Promise<void> => {
  try {
    const requestRef = doc(db, 'FreelanceRequests', requestId);
    await updateDoc(requestRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating freelance request:', error);
    throw error;
  }
};

// Delete freelance request (Admin)
export const deleteFreelanceRequest = async (requestId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'FreelanceRequests', requestId));
  } catch (error) {
    console.error('Error deleting freelance request:', error);
    throw error;
  }
};

// Get requests by status
export const getFreelanceRequestsByStatus = async (
  status: 'pending' | 'approved' | 'rejected'
): Promise<FreelanceRequest[]> => {
  try {
    const q = query(
      collection(db, 'FreelanceRequests'),
      where('requestStatus', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FreelanceRequest[];
  } catch (error) {
    console.error('Error getting requests by status:', error);
    throw error;
  }
};
