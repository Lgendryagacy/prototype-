/**
 * Migration Script: Generate Referral Codes for Existing Users
 * 
 * This script generates referral codes for all users who don't have one yet.
 * It follows the same structure as the new user signup flow.
 * 
 * IMPORTANT: Run this script ONCE to migrate existing users.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { generateReferralCode } from './referralService';

interface MigrationResult {
  totalUsers: number;
  usersWithCodes: number;
  usersWithoutCodes: number;
  codesGenerated: number;
  errors: Array<{ userId: string; error: string }>;
}

/**
 * Generate referral codes for all existing users who don't have one
 */
export const generateReferralCodesForExistingUsers = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    totalUsers: 0,
    usersWithCodes: 0,
    usersWithoutCodes: 0,
    codesGenerated: 0,
    errors: []
  };

  try {
    console.log('🚀 Starting referral code migration...');

    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    result.totalUsers = usersSnapshot.size;
    console.log(`📊 Found ${result.totalUsers} total users`);

    // Track generated codes to ensure uniqueness
    const generatedCodes = new Set<string>();

    // First pass: collect existing codes
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (userData.referralCode) {
        generatedCodes.add(userData.referralCode);
        result.usersWithCodes++;
      } else {
        result.usersWithoutCodes++;
      }
    });

    console.log(`✅ Users with codes: ${result.usersWithCodes}`);
    console.log(`❌ Users without codes: ${result.usersWithoutCodes}`);

    // Second pass: generate codes for users without them
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Skip if user already has a referral code
      if (userData.referralCode) {
        console.log(`⏭️  Skipping ${userData.email || userId} - already has code: ${userData.referralCode}`);
        continue;
      }

      try {
        // Get email or name for generating code
        const identifier = userData.email || userData.name || userId;
        
        // Generate unique referral code
        let referralCode = generateReferralCode(identifier);
        let attempts = 0;
        const maxAttempts = 20;

        // Ensure uniqueness
        while (generatedCodes.has(referralCode) && attempts < maxAttempts) {
          referralCode = generateReferralCode(identifier);
          attempts++;
        }

        if (attempts >= maxAttempts) {
          result.errors.push({
            userId,
            error: 'Failed to generate unique code after 20 attempts'
          });
          console.error(`❌ Failed to generate unique code for ${userData.email || userId}`);
          continue;
        }

        // Add to generated codes set
        generatedCodes.add(referralCode);

        // Update user document
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          referralCode,
          referralCodeCreatedAt: Timestamp.now(),
          referralCodeMigrated: true // Flag to indicate this was from migration
        });

        result.codesGenerated++;
        console.log(`✅ Generated code for ${userData.email || userId}: ${referralCode}`);

      } catch (error: any) {
        result.errors.push({
          userId,
          error: error.message || 'Unknown error'
        });
        console.error(`❌ Error generating code for ${userId}:`, error);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📊 Results:`);
    console.log(`   - Total users: ${result.totalUsers}`);
    console.log(`   - Already had codes: ${result.usersWithCodes}`);
    console.log(`   - Needed codes: ${result.usersWithoutCodes}`);
    console.log(`   - Codes generated: ${result.codesGenerated}`);
    console.log(`   - Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors occurred:');
      result.errors.forEach(err => {
        console.log(`   - User ${err.userId}: ${err.error}`);
      });
    }

    return result;

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    throw error;
  }
};

/**
 * Generate referral code for a specific user
 * Useful for manual fixes or individual users
 */
export const generateReferralCodeForSingleUser = async (userId: string): Promise<string> => {
  try {
    const userRef = doc(db, 'users', userId);
    const usersRef = collection(db, 'users');

    // Get user data
    const userDoc = await getDocs(query(usersRef, where('__name__', '==', userId)));
    
    if (userDoc.empty) {
      throw new Error('User not found');
    }

    const userData = userDoc.docs[0].data();

    // Check if user already has a code
    if (userData.referralCode) {
      console.log(`User already has referral code: ${userData.referralCode}`);
      return userData.referralCode;
    }

    // Generate unique code
    const identifier = userData.email || userData.name || userId;
    let referralCode = generateReferralCode(identifier);
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isUnique && attempts < maxAttempts) {
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode(identifier);
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique referral code');
    }

    // Update user
    await updateDoc(userRef, {
      referralCode,
      referralCodeCreatedAt: Timestamp.now()
    });

    console.log(`✅ Generated referral code for user ${userId}: ${referralCode}`);
    return referralCode;

  } catch (error) {
    console.error('Error generating referral code for user:', error);
    throw error;
  }
};

/**
 * Verify all users have referral codes
 * Returns a report of the current state
 */
export const verifyReferralCodes = async (): Promise<{
  totalUsers: number;
  withCodes: number;
  withoutCodes: number;
  usersWithoutCodes: Array<{ id: string; email?: string; name?: string }>;
}> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    const report = {
      totalUsers: usersSnapshot.size,
      withCodes: 0,
      withoutCodes: 0,
      usersWithoutCodes: [] as Array<{ id: string; email?: string; name?: string }>
    };

    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (userData.referralCode) {
        report.withCodes++;
      } else {
        report.withoutCodes++;
        report.usersWithoutCodes.push({
          id: doc.id,
          email: userData.email,
          name: userData.name
        });
      }
    });

    console.log('\n📊 Referral Code Verification Report:');
    console.log(`   Total users: ${report.totalUsers}`);
    console.log(`   With codes: ${report.withCodes} (${((report.withCodes / report.totalUsers) * 100).toFixed(1)}%)`);
    console.log(`   Without codes: ${report.withoutCodes} (${((report.withoutCodes / report.totalUsers) * 100).toFixed(1)}%)`);

    if (report.withoutCodes > 0) {
      console.log('\n❌ Users without codes:');
      report.usersWithoutCodes.forEach(user => {
        console.log(`   - ${user.email || user.name || user.id}`);
      });
    }

    return report;

  } catch (error) {
    console.error('Error verifying referral codes:', error);
    throw error;
  }
};

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).generateReferralCodesForExistingUsers = generateReferralCodesForExistingUsers;
  (window as any).generateReferralCodeForSingleUser = generateReferralCodeForSingleUser;
  (window as any).verifyReferralCodes = verifyReferralCodes;
}
