import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../config";
import { UserData, UserProfile } from "../types/user";
import { createUserWallet } from './walletService';
import { initializeUserEarnings } from './earningsService';
import { getNextUserRank, createUserRanking } from './rankingService';

// Collections
const USERS_COLLECTION = "users";
const USER_PROFILES_COLLECTION = "userProfile";

/**
 * Create a new user document in the users collection
 */
export const createUserData = async (userData: Omit<UserData, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.uid);
    
    await setDoc(userRef, {
      ...userData,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("User data created successfully");
  } catch (error) {
    console.error("Error creating user data:", error);
    throw error;
  }
};

/**
 * Create a new user profile document in the userProfile collection
 */
export const createUserProfile = async (profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, profileData.uid);
    
    await setDoc(profileRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("User profile created successfully");
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Get user data by UID
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserData;
    }
  } catch (error) {
    console.warn("Using mock user data for offline mode");
  }

  // Fallback Mock User Data
  return {
    uid: uid || 'mock-user-nain123',
    email: 'nain123@gmail.com',
    name: 'Nain',
    displayName: 'Nain',
    status: 'active',
    role: 'user',
    rank: 1,
    fogCoins: 1500,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserData;
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }
  } catch (error) {
    console.warn("Using mock profile for offline mode");
  }

  // Fallback Mock User Profile
  return {
    uid: userId || 'mock-user-nain123',
    name: 'Nain',
    email: 'nain123@gmail.com',
    role: 'Full Stack Developer',
    bio: 'Software engineer & tech enthusiast on Fogsly platform.',
    country: 'Pakistan',
    city: 'Lahore',
    location: 'Lahore, Pakistan',
    phone: '+92 300 1234567',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Framer Motion'],
    rank: 1,
    fogCoins: 1500,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserProfile;
};

/**
 * Update user data
 */
export const updateUserData = async (uid: string, updates: Partial<Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Check if user exists by email
 */
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

/**
 * Complete user setup (create both user data and profile) with ranking
 */
export const setupNewUser = async (uid: string, email: string, name: string): Promise<void> => {
  try {
    // Get the next user rank atomically
    const userRank = await getNextUserRank();
    
    // Create user data with rank
    await createUserData({
      uid,
      email,
      name,
      status: 'active',
      role: 'user', // Default role for new users (admin can change this later)
      rank: userRank
    });
    
    // Create user profile with rank
    await createUserProfile({
      uid, // Changed from userId to uid to match interface
      name,
      email,
      role: 'User', // Default display role for profile
      bio: `Hello! I'm ${name}. Welcome to my profile.`,
      rank: userRank
    });
    
    // Create user ranking record
    await createUserRanking(uid, userRank, email, name);
    
    // Create user wallet with QR code
    await createUserWallet(uid, name, email);
    
    // Initialize user earnings tracking
    await initializeUserEarnings(uid);
    
    console.log(`New user setup completed successfully - ${name} is rank #${userRank}`);
  } catch (error) {
    console.error("Error setting up new user:", error);
    throw error;
  }
};

/**
 * Upload avatar image to Firebase Storage
 */
export const uploadAvatarImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `users/${userId}/avatar.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading avatar image:', error);
    throw new Error('Failed to upload avatar image');
  }
};

/**
 * Upload cover image to Firebase Storage
 */
export const uploadCoverImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `users/${userId}/cover.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading cover image:', error);
    throw new Error('Failed to upload cover image');
  }
};

/**
 * Update user profile with new avatar URL
 */
export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      avatarUrl,
      updatedAt: serverTimestamp()
    });
    console.log('Avatar URL updated successfully');
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    throw error;
  }
};

/**
 * Update user profile with new cover URL
 */
export const updateUserCover = async (userId: string, coverUrl: string): Promise<void> => {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      coverUrl,
      updatedAt: serverTimestamp()
    });
    console.log('Cover URL updated successfully');
  } catch (error) {
    console.error('Error updating cover URL:', error);
    throw error;
  }
};

/**
 * Get all users with their ranking information for admin panel
 */
export const getAllUsersWithRanking = async (): Promise<Array<{
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  createdAt: Date;
  rank: number;
  tier: string | null;
  status: string;
}>> => {
  try {
    // Get all user profiles
    const profilesQuery = query(collection(db, USER_PROFILES_COLLECTION));
    const profilesSnapshot = await getDocs(profilesQuery);
    
    // Get all user data (for status information)
    const usersQuery = query(collection(db, USERS_COLLECTION));
    const usersSnapshot = await getDocs(usersQuery);
    
    // Create users map for quick lookup
    const usersMap = new Map();
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      usersMap.set(doc.id, {
        status: data.status || 'active',
        role: data.role
      });
    });
    
    // Get all user rankings
    const rankingsQuery = query(collection(db, 'userRankings'));
    const rankingsSnapshot = await getDocs(rankingsQuery);
    
    // Create rankings map for quick lookup
    const rankingsMap = new Map();
    rankingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      rankingsMap.set(doc.id, data.rank);
    });
    
    const users = [];
    
    for (const profileDoc of profilesSnapshot.docs) {
      const profileData = profileDoc.data() as UserProfile;
      const userId = profileDoc.id;
      const rank = rankingsMap.get(userId) || 0;
      const userData = usersMap.get(userId);
      
      // Import tier functions dynamically to avoid circular dependencies
      const { getTierFromRank, getTierLabel } = await import('../../utils/rankUtils');
      const tierType = getTierFromRank(rank);
      const tierLabel = tierType ? getTierLabel(tierType) : null;
      
      users.push({
        uid: userId,
        email: profileData.email,
        name: profileData.name || profileData.displayName || 'N/A',
        displayName: profileData.displayName,
        createdAt: profileData.createdAt && typeof profileData.createdAt === 'object' && 'toDate' in profileData.createdAt 
          ? (profileData.createdAt as any).toDate() 
          : profileData.createdAt instanceof Date 
            ? profileData.createdAt 
            : new Date(),
        rank: rank,
        tier: tierLabel,
        status: userData?.status || 'active' // Get actual status from users collection
      });
    }
    
    // Sort by rank (ascending - lower rank number = higher position)
    users.sort((a, b) => {
      if (a.rank === 0 && b.rank === 0) return 0;
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users with ranking:', error);
    throw error;
  }
};

/**
 * Get total number of users
 */
export const getTotalUsersCount = async (): Promise<number> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting total users count:', error);
    return 0;
  }
};

/**
 * Suspend a user account
 */
export const suspendUserAccount = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      status: 'suspended',
      suspendedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${uid} has been suspended`);
  } catch (error) {
    console.error("Error suspending user:", error);
    throw error;
  }
};

/**
 * Reactivate a suspended user account
 */
export const reactivateUserAccount = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      status: 'active',
      reactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${uid} has been reactivated`);
  } catch (error) {
    console.error("Error reactivating user:", error);
    throw error;
  }
};
