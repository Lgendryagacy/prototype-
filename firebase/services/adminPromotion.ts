import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config";

// Collections
const USERS_COLLECTION = "users";
const USER_PROFILES_COLLECTION = "userProfile";
const USER_RANKINGS_COLLECTION = "userRankings";

/**
 * Promote a regular user to admin and remove their rank
 * This removes them from the ranking system entirely
 */
export const promoteUserToAdmin = async (userId: string): Promise<void> => {
  try {
    console.log(`Promoting user ${userId} to admin...`);

    // 1. Update user data - change role to admin and remove rank
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      role: 'admin',
      rank: 0, // Set rank to 0 for admin (not part of ranking system)
      updatedAt: serverTimestamp()
    });
    console.log("✅ Updated user role to admin and set rank to 0");

    // 2. Update user profile - change role to admin and remove rank
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      role: 'Admin', // Display role
      rank: 0, // Set rank to 0 for admin
      updatedAt: serverTimestamp()
    });
    console.log("✅ Updated user profile role to Admin and set rank to 0");

    // 3. Remove from rankings collection (admins don't participate in ranking)
    const rankingRef = doc(db, USER_RANKINGS_COLLECTION, userId);
    await deleteDoc(rankingRef);
    console.log("✅ Removed user from rankings collection");

    console.log(`🎉 User ${userId} has been successfully promoted to admin!`);
    console.log("Admin user now has:");
    console.log("- role: 'admin' in users collection");
    console.log("- role: 'Admin' in userProfile collection"); 
    console.log("- rank: 0 in both collections");
    console.log("- Removed from userRankings collection");

  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
};

/**
 * Check if user is admin by checking their role
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
};

/**
 * Browser console helper function
 * Usage: promoteToAdmin('user-uid-here')
 */
export const promoteToAdmin = async (userId: string) => {
  try {
    await promoteUserToAdmin(userId);
    console.log("✅ User promotion completed successfully!");
  } catch (error) {
    console.error("❌ Failed to promote user:", error);
  }
};

// Make function available in browser console for development
if (typeof window !== 'undefined') {
  (window as any).promoteToAdmin = promoteToAdmin;
}
