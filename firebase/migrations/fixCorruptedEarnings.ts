/**
 * Fix Corrupted Earnings Data
 * 
 * This script fixes the "[object Object]" issue in userEarnings documents
 * caused by incorrect data types in Firestore.
 * 
 * It will:
 * 1. Find all documents with string values containing "[object Object]"
 * 2. Parse and clean all numeric fields
 * 3. Recalculate availableBalance and lifetimeEarnings
 * 4. Update documents with correct numeric values
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config';

interface CleanupResult {
  totalChecked: number;
  fixed: number;
  errors: number;
  errorDetails: Array<{ userId: string; error: string }>;
}

/**
 * Helper to extract number from corrupted string
 */
const extractNumber = (value: any): number => {
  // If already a number, return it
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  // If null or undefined, return 0
  if (value === null || value === undefined) {
    return 0;
  }

  // If string, try to extract the first number
  if (typeof value === 'string') {
    // Remove "[object Object]" and other garbage
    const cleaned = value.replace(/\[object Object\]/g, '');
    
    // Try to parse the remaining number
    const match = cleaned.match(/^[\d.]+/);
    if (match) {
      const num = parseFloat(match[0]);
      return isNaN(num) ? 0 : num;
    }
  }

  // Default to 0 if can't parse
  return 0;
};

/**
 * Clean and fix corrupted userEarnings documents
 */
export const fixCorruptedEarnings = async (): Promise<CleanupResult> => {
  const result: CleanupResult = {
    totalChecked: 0,
    fixed: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    console.log('🔄 Starting cleanup of corrupted userEarnings...\n');
    
    // Get all userEarnings documents
    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));
    result.totalChecked = earningsSnapshot.size;
    
    console.log(`📊 Checking ${result.totalChecked} documents...\n`);

    for (const docSnapshot of earningsSnapshot.docs) {
      const userId = docSnapshot.id;
      const data = docSnapshot.data();

      try {
        // Check if document has corruption
        const hasCorruption = 
          (typeof data.availableBalance === 'string' && data.availableBalance.includes('[object Object]')) ||
          (typeof data.lifetimeEarnings === 'string' && data.lifetimeEarnings.includes('[object Object]')) ||
          Object.keys(data).some(key => 
            typeof data[key] === 'string' && data[key].includes('[object Object]')
          );

        if (!hasCorruption) {
          console.log(`  ✅ ${userId}: Already clean`);
          continue;
        }

        console.log(`  🔧 ${userId}: Found corruption, cleaning...`);

        // Clean all earning fields
        const cleanedData: any = {
          updatedAt: new Date()
        };

        // Current balance fields
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
          const cleaned = extractNumber(data[field]);
          cleanedData[field] = cleaned;
          if (typeof data[field] === 'string' && data[field].includes('[object Object]')) {
            console.log(`     • ${field}: "${data[field]}" → ${cleaned}`);
          }
        }

        // Lifetime total fields
        const lifetimeFields = [
          'totalAdsEarnings',
          'totalReferralEarnings',
          'totalTaskEarnings',
          'totalBonusEarnings',
          'totalDepositEarnings',
          'totalFreelanceJobsEarnings',
          'totalFogslyServicesEarnings',
          'totalFogslyPhysicalEarnings'
        ];

        for (const field of lifetimeFields) {
          const cleaned = extractNumber(data[field]);
          cleanedData[field] = cleaned;
          if (typeof data[field] === 'string' && data[field].includes('[object Object]')) {
            console.log(`     • ${field}: "${data[field]}" → ${cleaned}`);
          }
        }

        // Recalculate availableBalance (sum of all current balances)
        cleanedData.availableBalance = 
          cleanedData.adsEarnings +
          cleanedData.referralEarnings +
          cleanedData.taskEarnings +
          cleanedData.bonusEarnings +
          cleanedData.depositEarnings +
          cleanedData.freelanceJobsEarnings +
          cleanedData.fogslyServicesEarnings +
          cleanedData.fogslyPhysicalEarnings;

        console.log(`     • availableBalance: "${data.availableBalance}" → ${cleanedData.availableBalance}`);

        // Recalculate lifetimeEarnings (sum of all lifetime totals)
        cleanedData.lifetimeEarnings =
          cleanedData.totalAdsEarnings +
          cleanedData.totalReferralEarnings +
          cleanedData.totalTaskEarnings +
          cleanedData.totalBonusEarnings +
          cleanedData.totalDepositEarnings +
          cleanedData.totalFreelanceJobsEarnings +
          cleanedData.totalFogslyServicesEarnings +
          cleanedData.totalFogslyPhysicalEarnings;

        console.log(`     • lifetimeEarnings: "${data.lifetimeEarnings}" → ${cleanedData.lifetimeEarnings}`);

        // Clean other fields
        cleanedData.totalWithdrawn = extractNumber(data.totalWithdrawn);
        cleanedData.totalSpent = extractNumber(data.totalSpent);

        // Update document
        await updateDoc(doc(db, 'userEarnings', userId), cleanedData);
        
        result.fixed++;
        console.log(`  ✅ ${userId}: Fixed successfully!\n`);

      } catch (error) {
        result.errors++;
        result.errorDetails.push({
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
        console.error(`  ❌ ${userId}: Error -`, error, '\n');
      }
    }

    console.log('='.repeat(80));
    console.log('✅ CLEANUP COMPLETE!\n');
    console.log(`📊 Results:`);
    console.log(`   Total checked: ${result.totalChecked}`);
    console.log(`   Fixed: ${result.fixed}`);
    console.log(`   Already clean: ${result.totalChecked - result.fixed - result.errors}`);
    console.log(`   Errors: ${result.errors}`);

    if (result.errorDetails.length > 0) {
      console.log('\n❌ Errors:');
      result.errorDetails.forEach(({ userId, error }) => {
        console.log(`   ${userId}: ${error}`);
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
};

/**
 * Fix wallet balances to match cleaned earnings
 */
export const syncWalletBalancesAfterCleanup = async (): Promise<{ synced: number; errors: number }> => {
  const result = { synced: 0, errors: 0 };

  try {
    console.log('\n🔄 Syncing wallet balances with cleaned earnings...\n');

    const earningsSnapshot = await getDocs(collection(db, 'userEarnings'));

    for (const docSnapshot of earningsSnapshot.docs) {
      const userId = docSnapshot.id;
      const earningsData = docSnapshot.data();

      try {
        const walletRef = doc(db, 'walletBalances', userId);
        const walletDoc = await getDoc(walletRef);

        const expectedBalance = extractNumber(earningsData.availableBalance);

        if (walletDoc.exists()) {
          const walletData = walletDoc.data();
          const currentBalance = extractNumber(walletData.totalBalance);
          
          if (currentBalance !== expectedBalance) {
            await updateDoc(walletRef, {
              totalBalance: expectedBalance,
              availableBalance: expectedBalance,
              lastUpdated: new Date()
            });
            result.synced++;
            console.log(`  ✅ ${userId}: Synced wallet (${currentBalance} → ${expectedBalance} FOG)`);
          }
        }
      } catch (error) {
        result.errors++;
        console.error(`  ❌ ${userId}: Error -`, error);
      }
    }

    console.log(`\n✅ Wallet sync complete: ${result.synced} synced, ${result.errors} errors\n`);
    return result;

  } catch (error) {
    console.error('❌ Wallet sync failed:', error);
    throw error;
  }
};

/**
 * Run full cleanup
 */
export const runFullCleanup = async (): Promise<void> => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 STARTING EARNINGS CLEANUP');
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Fix corrupted earnings
    const cleanupResult = await fixCorruptedEarnings();

    // Step 2: Sync wallet balances
    const walletResult = await syncWalletBalancesAfterCleanup();

    console.log('='.repeat(80));
    console.log('🎉 ALL CLEANUP COMPLETE!\n');
    console.log('Summary:');
    console.log(`  Earnings: ${cleanupResult.fixed} fixed, ${cleanupResult.errors} errors`);
    console.log(`  Wallets: ${walletResult.synced} synced, ${walletResult.errors} errors`);
    console.log('\n✅ Your data has been cleaned and is ready to use!');

  } catch (error) {
    console.error('\n❌ CLEANUP FAILED:', error);
    throw error;
  }
};

// For browser console testing
if (typeof window !== 'undefined') {
  (window as any).runCleanup = runFullCleanup;
  (window as any).fixEarnings = fixCorruptedEarnings;
  (window as any).syncWallets = syncWalletBalancesAfterCleanup;
}
