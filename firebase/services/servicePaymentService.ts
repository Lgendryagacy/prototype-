import { doc, updateDoc, addDoc, collection, Timestamp, getDoc, writeBatch, query, where, getDocs, increment } from 'firebase/firestore';
import { db } from '../config';
import { getFogCoinSettings } from './fogCoinSettingsService';
import { addFogslyServiceEarnings } from './earningsService';
import { getUserEarnings } from './earningsService';

const MESSAGES_COLLECTION = 'messages';
const TRANSACTIONS_COLLECTION = 'transactions';
const ADMIN_USER_ID = 'o3kGn4GMkFgNneSj1Cm8Vard99N2'; // Platform admin

/**
 * Get FOG coin conversion rate from settings
 */
export const getFogConversionRate = async (): Promise<number> => {
  try {
    const settings = await getFogCoinSettings();
    return settings.fogToPkrRate; // e.g., 28.467 (1 FOG = PKR 28.467)
  } catch (error) {
    console.error('Error getting FOG conversion rate:', error);
    // Fallback rate if settings not available
    return 28.467;
  }
};

/**
 * Convert PKR to FOG coins
 */
export const convertPKRtoFOG = async (priceInPKR: number): Promise<{
  priceInFOG: number;
  platformFee: number;
  brandReceives: number;
  conversionRate: number;
}> => {
  const conversionRate = await getFogConversionRate();
  const priceInFOG = Number((priceInPKR / conversionRate).toFixed(2));
  const platformFee = Number((priceInFOG * 0.03).toFixed(2)); // 3% platform fee
  const brandReceives = Number((priceInFOG - platformFee).toFixed(2)); // 97% to brand

  return {
    priceInFOG,
    platformFee,
    brandReceives,
    conversionRate
  };
};

/**
 * Process payment approval
 */
export const processPaymentApproval = async (
  conversationId: string,
  messageId: string,
  userId: string,
  brandId: string,
  paymentData: {
    requestId: string;
    title: string;
    priceInFOG: number;
    platformFee: number;
    brandReceives: number;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Check user's available balance
    const userEarnings = await getUserEarnings(userId);
    if (!userEarnings) {
      return { success: false, error: 'User earnings not found. Please contact support.' };
    }

    if (userEarnings.availableBalance < paymentData.priceInFOG) {
      return { 
        success: false, 
        error: `Insufficient balance! You need ${paymentData.priceInFOG.toFixed(2)} FOG but only have ${userEarnings.availableBalance.toFixed(2)} FOG. Please add more FOG coins to your wallet.` 
      };
    }

    // 2. Use batch for atomic operations
    const batch = writeBatch(db);

    // ✅ NEW STRUCTURE: Query to find actual document (userId is a FIELD, not document ID)
    const userEarningsQuery = query(
      collection(db, 'userEarnings'),
      where('userId', '==', userId)
    );
    const userEarningsSnapshot = await getDocs(userEarningsQuery);
    
    if (userEarningsSnapshot.empty) {
      return { success: false, error: 'User earnings document not found. Please contact support.' };
    }
    
    const userEarningsRef = userEarningsSnapshot.docs[0].ref;
    
    // Deduct from user's available balance and add to totalSpent
    batch.update(userEarningsRef, {
      availableBalance: increment(-paymentData.priceInFOG),
      totalSpent: increment(paymentData.priceInFOG),
      updatedAt: new Date()
    });

    // Also update walletBalances
    const walletQuery = query(
      collection(db, 'walletBalances'),
      where('userId', '==', userId)
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    if (!walletSnapshot.empty) {
      const walletRef = walletSnapshot.docs[0].ref;
      batch.update(walletRef, {
        balance: increment(-paymentData.priceInFOG),
        updatedAt: new Date()
      });
    }

    // Update message status to 'paid'
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    batch.update(messageRef, {
      'paymentData.status': 'paid',
      'paymentData.paidAt': Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });

    // Commit the batch
    await batch.commit();

    // Get brand owner's userId from the brand document
    const brandDoc = await getDoc(doc(db, 'brands', brandId));
    
    if (!brandDoc.exists()) {
      return { success: false, error: 'Brand not found. Payment was deducted but transfer failed. Please contact support.' };
    }
    
    const brandOwnerId = brandDoc.data().userId;
    if (!brandOwnerId) {
      return { success: false, error: 'Brand owner not found. Payment was deducted but transfer failed. Please contact support.' };
    }

    // 3. Transfer to brand owner's earnings (97%)
    await addFogslyServiceEarnings(
      brandOwnerId,
      paymentData.brandReceives,
      paymentData.requestId,
      `Payment for: ${paymentData.title}`
    );

    // 4. Transfer platform fee to admin (3%)
    if (paymentData.platformFee > 0) {
      await addFogslyServiceEarnings(
        ADMIN_USER_ID,
        paymentData.platformFee,
        paymentData.requestId,
        `Platform fee (3%) from: ${paymentData.title}`
      );
    }

    // 5. Create transaction record for user (deduction)
    await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      userId,
      type: 'service_payment',
      amount: -paymentData.priceInFOG,
      sourceType: 'fogslyServices',
      sourceId: paymentData.requestId,
      description: `Payment for service: ${paymentData.title}`,
      status: 'completed',
      createdAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return { 
      success: false, 
      error: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Update payment request status (for reject/cancel)
 */
export const updatePaymentRequestStatus = async (
  conversationId: string,
  messageId: string,
  status: 'rejected' | 'cancelled'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    
    const updateData: any = {
      'paymentData.status': status,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (status === 'rejected') {
      updateData['paymentData.rejectedAt'] = Timestamp.fromDate(new Date());
    } else if (status === 'cancelled') {
      updateData['paymentData.cancelledAt'] = Timestamp.fromDate(new Date());
    }

    await updateDoc(messageRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating payment status to ${status}:`, error);
    return { 
      success: false, 
      error: `Failed to ${status} payment request` 
    };
  }
};
