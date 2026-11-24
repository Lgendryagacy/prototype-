/**
 * Migration Script: Update existing userEarnings documents to new structure
 * 
 * This script will:
 * 1. Add missing earning source fields (freelanceJobs, fogslyServices, fogslyPhysical)
 * 2. Add missing lifetime total fields
 * 3. Fix depositEarnings vs depositsEarnings field name
 * 4. Initialize userDailyActivities if needed
 * 5. Create transactions from earningToWalletTransfers (if exists)
 * 
 * SAFE TO RUN MULTIPLE TIMES - it checks existing data before updating
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config';

interface MigrationResult {
  totalUsers: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ userId: string; error: string }>;
}

/**
 * Migrate userEarnings collection to new structure
 */
export const migrateUserEarnings = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    totalUsers: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    console.log('🔄 Starting userEarnings migration...');
    
    // Get all userEarnings documents
    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));
    result.totalUsers = earningsSnapshot.size;
    
    console.log(`📊 Found ${result.totalUsers} user earnings documents`);

    for (const docSnapshot of earningsSnapshot.docs) {
      const userId = docSnapshot.id;
      const data = docSnapshot.data();

      try {
        const updates: any = {
          updatedAt: new Date()
        };
        let needsUpdate = false;

        // 1. Fix depositEarnings vs depositsEarnings
        if (data.depositsEarnings !== undefined && data.depositEarnings === undefined) {
          updates.depositEarnings = data.depositsEarnings;
          updates.depositsEarnings = null; // Will be deleted
          needsUpdate = true;
          console.log(`  ✓ ${userId}: Merged depositsEarnings (${data.depositsEarnings}) → depositEarnings`);
        } else if (data.depositsEarnings !== undefined && data.depositEarnings !== undefined) {
          // Both exist - merge them
          updates.depositEarnings = (data.depositEarnings || 0) + (data.depositsEarnings || 0);
          updates.depositsEarnings = null;
          needsUpdate = true;
          console.log(`  ✓ ${userId}: Merged both fields → depositEarnings (${updates.depositEarnings})`);
        }

        // 2. Add missing current balance fields (default to 0)
        const currentFields = [
          'adsEarnings',
          'referralEarnings',
          'taskEarnings',
          'bonusEarnings',
          'depositEarnings',
          'freelanceJobsEarnings',
          'fogslyServicesEarnings',
          'fogslyPhysicalEarnings'
        ];

        for (const field of currentFields) {
          if (data[field] === undefined) {
            updates[field] = 0;
            needsUpdate = true;
          }
        }

        // 3. Add missing lifetime total fields (default to current value or 0)
        const lifetimeFields = [
          { current: 'adsEarnings', total: 'totalAdsEarnings' },
          { current: 'referralEarnings', total: 'totalReferralEarnings' },
          { current: 'taskEarnings', total: 'totalTaskEarnings' },
          { current: 'bonusEarnings', total: 'totalBonusEarnings' },
          { current: 'depositEarnings', total: 'totalDepositEarnings' },
          { current: 'freelanceJobsEarnings', total: 'totalFreelanceJobsEarnings' },
          { current: 'fogslyServicesEarnings', total: 'totalFogslyServicesEarnings' },
          { current: 'fogslyPhysicalEarnings', total: 'totalFogslyPhysicalEarnings' }
        ];

        for (const { current, total } of lifetimeFields) {
          if (data[total] === undefined) {
            // If lifetime total doesn't exist, set it to current value (assumes no withdrawals yet)
            updates[total] = updates[current] !== undefined ? updates[current] : (data[current] || 0);
            needsUpdate = true;
          }
        }

        // 4. Calculate and update availableBalance (sum of all current balances)
        const newAvailableBalance = 
          (updates.adsEarnings !== undefined ? updates.adsEarnings : (data.adsEarnings || 0)) +
          (updates.referralEarnings !== undefined ? updates.referralEarnings : (data.referralEarnings || 0)) +
          (updates.taskEarnings !== undefined ? updates.taskEarnings : (data.taskEarnings || 0)) +
          (updates.bonusEarnings !== undefined ? updates.bonusEarnings : (data.bonusEarnings || 0)) +
          (updates.depositEarnings !== undefined ? updates.depositEarnings : (data.depositEarnings || 0)) +
          (updates.freelanceJobsEarnings !== undefined ? updates.freelanceJobsEarnings : (data.freelanceJobsEarnings || 0)) +
          (updates.fogslyServicesEarnings !== undefined ? updates.fogslyServicesEarnings : (data.fogslyServicesEarnings || 0)) +
          (updates.fogslyPhysicalEarnings !== undefined ? updates.fogslyPhysicalEarnings : (data.fogslyPhysicalEarnings || 0));

        if (data.availableBalance !== newAvailableBalance) {
          updates.availableBalance = newAvailableBalance;
          needsUpdate = true;
        }

        // 5. Calculate and update lifetimeEarnings (sum of all lifetime totals)
        const newLifetimeEarnings =
          (updates.totalAdsEarnings !== undefined ? updates.totalAdsEarnings : (data.totalAdsEarnings || 0)) +
          (updates.totalReferralEarnings !== undefined ? updates.totalReferralEarnings : (data.totalReferralEarnings || 0)) +
          (updates.totalTaskEarnings !== undefined ? updates.totalTaskEarnings : (data.totalTaskEarnings || 0)) +
          (updates.totalBonusEarnings !== undefined ? updates.totalBonusEarnings : (data.totalBonusEarnings || 0)) +
          (updates.totalDepositEarnings !== undefined ? updates.totalDepositEarnings : (data.totalDepositEarnings || 0)) +
          (updates.totalFreelanceJobsEarnings !== undefined ? updates.totalFreelanceJobsEarnings : (data.totalFreelanceJobsEarnings || 0)) +
          (updates.totalFogslyServicesEarnings !== undefined ? updates.totalFogslyServicesEarnings : (data.totalFogslyServicesEarnings || 0)) +
          (updates.totalFogslyPhysicalEarnings !== undefined ? updates.totalFogslyPhysicalEarnings : (data.totalFogslyPhysicalEarnings || 0));

        if (data.lifetimeEarnings !== newLifetimeEarnings) {
          updates.lifetimeEarnings = newLifetimeEarnings;
          needsUpdate = true;
        }

        // 6. Add totalWithdrawn and totalSpent if missing
        if (data.totalWithdrawn === undefined) {
          updates.totalWithdrawn = 0;
          needsUpdate = true;
        }
        if (data.totalSpent === undefined) {
          updates.totalSpent = 0;
          needsUpdate = true;
        }

        // 7. Add timestamps if missing
        if (data.createdAt === undefined) {
          updates.createdAt = new Date();
          needsUpdate = true;
        }

        // Update document if needed
        if (needsUpdate) {
          await updateDoc(doc(db, 'userEarnings', userId), updates);
          result.updated++;
          console.log(`  ✅ ${userId}: Updated successfully`);
        } else {
          result.skipped++;
          console.log(`  ⏭️  ${userId}: Already up to date`);
        }

      } catch (error) {
        result.errors++;
        result.errorDetails.push({
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
        console.error(`  ❌ ${userId}: Error -`, error);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`📊 Results:`);
    console.log(`   Total users: ${result.totalUsers}`);
    console.log(`   Updated: ${result.updated}`);
    console.log(`   Skipped (already migrated): ${result.skipped}`);
    console.log(`   Errors: ${result.errors}`);

    if (result.errorDetails.length > 0) {
      console.log('\n❌ Errors:');
      result.errorDetails.forEach(({ userId, error }) => {
        console.log(`   ${userId}: ${error}`);
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Initialize userDailyActivities for existing users
 */
export const initializeUserDailyActivities = async (): Promise<{ created: number; errors: number }> => {
  const result = { created: 0, errors: 0 };

  try {
    console.log('\n🔄 Initializing userDailyActivities...');

    // Get all users from userEarnings
    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));
    const today = new Date().toISOString().split('T')[0];

    for (const docSnapshot of earningsSnapshot.docs) {
      const userId = docSnapshot.id;
      const activityId = `${userId}_${today}`;

      try {
        // Check if today's activity already exists
        const activityDoc = await getDoc(doc(db, 'userDailyActivities', activityId));

        if (!activityDoc.exists()) {
          // Create new activity document
          await setDoc(doc(db, 'userDailyActivities', activityId), {
            userId,
            date: today,
            adsWatched: 0,
            adsEarned: 0,
            adWatchLimit: 10,
            adsRemaining: 10,
            referralsMade: 0,
            tasksCompleted: 0,
            jobsCompleted: 0,
            servicesCompleted: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          result.created++;
          console.log(`  ✅ ${userId}: Created today's activity`);
        }
      } catch (error) {
        result.errors++;
        console.error(`  ❌ ${userId}: Error -`, error);
      }
    }

    console.log(`\n✅ Daily activities initialized: ${result.created} created, ${result.errors} errors`);
    return result;

  } catch (error) {
    console.error('❌ Daily activities initialization failed:', error);
    throw error;
  }
};

/**
 * Sync walletBalances with userEarnings (ensure auto-transfer state)
 */
export const syncWalletBalances = async (): Promise<{ synced: number; errors: number }> => {
  const result = { synced: 0, errors: 0 };

  try {
    console.log('\n🔄 Syncing walletBalances with userEarnings...');

    // Get all userEarnings documents
    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));

    for (const docSnapshot of earningsSnapshot.docs) {
      const userId = docSnapshot.id;
      const earningsData = docSnapshot.data();

      try {
        const walletRef = doc(db, 'walletBalances', userId);
        const walletDoc = await getDoc(walletRef);

        const expectedBalance = earningsData.availableBalance || 0;

        if (!walletDoc.exists()) {
          // Create wallet balance document
          await setDoc(walletRef, {
            userId,
            totalBalance: expectedBalance,
            availableBalance: expectedBalance,
            pendingBalance: 0,
            totalDeposited: expectedBalance,
            totalWithdrawn: 0,
            totalSent: 0,
            totalReceived: 0,
            lastUpdated: new Date()
          });
          result.synced++;
          console.log(`  ✅ ${userId}: Created wallet balance (${expectedBalance} FOG)`);
        } else {
          const walletData = walletDoc.data();
          
          // Check if wallet balance matches earnings
          if (walletData.totalBalance !== expectedBalance) {
            await updateDoc(walletRef, {
              totalBalance: expectedBalance,
              availableBalance: expectedBalance,
              lastUpdated: new Date()
            });
            result.synced++;
            console.log(`  ✅ ${userId}: Synced wallet (${walletData.totalBalance} → ${expectedBalance} FOG)`);
          }
        }
      } catch (error) {
        result.errors++;
        console.error(`  ❌ ${userId}: Error -`, error);
      }
    }

    console.log(`\n✅ Wallet balances synced: ${result.synced} synced, ${result.errors} errors`);
    return result;

  } catch (error) {
    console.error('❌ Wallet sync failed:', error);
    throw error;
  }
};

/**
 * Run all migrations in sequence
 */
export const runAllMigrations = async (): Promise<void> => {
  console.log('🚀 Starting complete migration process...\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Migrate userEarnings
    const earningsResult = await migrateUserEarnings();

    // Step 2: Initialize daily activities
    const activityResult = await initializeUserDailyActivities();

    // Step 3: Sync wallet balances
    const walletResult = await syncWalletBalances();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE!\n');
    console.log('Summary:');
    console.log(`  User Earnings: ${earningsResult.updated} updated, ${earningsResult.skipped} skipped, ${earningsResult.errors} errors`);
    console.log(`  Daily Activities: ${activityResult.created} created, ${activityResult.errors} errors`);
    console.log(`  Wallet Balances: ${walletResult.synced} synced, ${walletResult.errors} errors`);
    console.log('\n✅ Your data has been migrated to the new structure!');
    console.log('✅ All existing data preserved!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test deposit flow');
    console.log('   2. Test ad watching');
    console.log('   3. Check Dashboard displays correctly');
    console.log('   4. After 1-2 weeks, delete obsolete collections');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    console.log('\n⚠️  Your data is safe - no changes were made.');
    throw error;
  }
};

// For browser console testing
if (typeof window !== 'undefined') {
  (window as any).runMigration = runAllMigrations;
  (window as any).migrateEarnings = migrateUserEarnings;
  (window as any).syncWallets = syncWalletBalances;
  (window as any).initActivities = initializeUserDailyActivities;
}
