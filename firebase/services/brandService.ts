import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { BrandRequest, Brand, CreateBrandRequestData, UpdateBrandData } from '../types/brand';

const BRAND_REQUESTS_COLLECTION = 'brandRequests';
const BRANDS_COLLECTION = 'brands';

/**
 * Toggle brand freeze status (admin only)
 */
export const toggleBrandFreeze = async (
  brandId: string,
  freeze: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      return {
        success: false,
        error: 'Brand not found'
      };
    }

    await updateDoc(brandRef, {
      status: freeze ? 'frozen' : 'active',
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling brand freeze:', error);
    return {
      success: false,
      error: 'Failed to update brand status. Please try again.'
    };
  }
};

/**
 * Create a new brand request
 */
export const createBrandRequest = async (
  userId: string, 
  data: CreateBrandRequestData
): Promise<{ success: boolean; error?: string; requestId?: string }> => {
  try {
    // Check if user already has a pending or approved request
    const existingRequest = await getUserBrandRequest(userId);
    if (existingRequest && (existingRequest.status === 'pending' || existingRequest.status === 'approved')) {
      return {
        success: false,
        error: 'You already have a brand request. Please wait for approval or check your existing brand.'
      };
    }

    let logoUrl = '';
    
    // Upload logo if provided
    if (data.logoFile) {
      const logoRef = ref(storage, `brand-logos/${userId}-${Date.now()}`);
      const uploadResult = await uploadBytes(logoRef, data.logoFile);
      logoUrl = await getDownloadURL(uploadResult.ref);
    }

    const brandRequestData: Omit<BrandRequest, 'id'> = {
      userId,
      brandName: data.brandName.trim(),
      tagline: data.tagline.trim(),
      description: data.description.trim(),
      whatsappChannel: data.whatsappChannel.trim(),
      logoUrl,
      categories: data.categories || [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, BRAND_REQUESTS_COLLECTION), {
      ...brandRequestData,
      createdAt: Timestamp.fromDate(brandRequestData.createdAt),
      updatedAt: Timestamp.fromDate(brandRequestData.updatedAt)
    });

    return {
      success: true,
      requestId: docRef.id
    };
  } catch (error) {
    console.error('Error creating brand request:', error);
    return {
      success: false,
      error: 'Failed to create brand request. Please try again.'
    };
  }
};

/**
 * Get user's brand request
 */
export const getUserBrandRequest = async (userId: string): Promise<BrandRequest | null> => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return null;
  }

  try {
    const q = query(
      collection(db, BRAND_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      brandName: data.brandName,
      tagline: data.tagline,
      description: data.description,
      whatsappChannel: data.whatsappChannel,
      logoUrl: data.logoUrl,
      categories: data.categories || [],
      status: data.status,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      rejectionReason: data.rejectionReason,
      adminComments: data.adminComments,
      adminId: data.adminId,
      canResubmit: data.canResubmit
    };
  } catch (error) {
    console.warn('Notice getting user brand request:', error);
    return null;
  }
};

/**
 * Get user's approved brand
 */
export const getUserBrand = async (userId: string): Promise<Brand | null> => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return null;
  }

  try {
    const q = query(
      collection(db, BRANDS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      brandName: data.brandName,
      tagline: data.tagline,
      description: data.description,
      whatsappChannel: data.whatsappChannel,
      logoUrl: data.logoUrl,
      categories: data.categories || [],
      status: data.status || 'active',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      services: data.services || [],
      stats: data.stats || {
        totalOrders: 0,
        totalEarnings: 0,
        rating: 0,
        reviews: 0
      }
    };
  } catch (error) {
    console.warn('Notice getting user brand:', error);
    return null;
  }
};

/**
 * Update brand (only for approved brands)
 */
export const updateBrand = async (
  brandId: string,
  userId: string,
  data: UpdateBrandData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists() || brandDoc.data().userId !== userId) {
      return {
        success: false,
        error: 'Brand not found or you do not have permission to edit it.'
      };
    }

    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (data.brandName) updateData.brandName = data.brandName.trim();
    if (data.tagline) updateData.tagline = data.tagline.trim();
    if (data.description) updateData.description = data.description.trim();
    if (data.whatsappChannel) updateData.whatsappChannel = data.whatsappChannel.trim();
    if (data.categories) updateData.categories = data.categories;
    
    // Handle logo update
    if (data.logoFile) {
      const logoRef = ref(storage, `brand-logos/${userId}-${Date.now()}`);
      const uploadResult = await uploadBytes(logoRef, data.logoFile);
      updateData.logoUrl = await getDownloadURL(uploadResult.ref);
      
      // Delete old logo if exists
      const oldLogoUrl = brandDoc.data().logoUrl;
      if (oldLogoUrl) {
        try {
          const oldLogoRef = ref(storage, oldLogoUrl);
          await deleteObject(oldLogoRef);
        } catch (error) {
          // Ignore errors when deleting old logo
          console.warn('Could not delete old logo:', error);
        }
      }
    }

    await updateDoc(brandRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating brand:', error);
    return {
      success: false,
      error: 'Failed to update brand. Please try again.'
    };
  }
};

// Admin functions

/**
 * Get all brand requests (Admin only)
 */
export const getAllBrandRequests = async (
  page: number = 1,
  pageSize: number = 10,
  statusFilter?: 'pending' | 'approved' | 'rejected',
  searchTerm?: string
): Promise<{
  requests: BrandRequest[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    let q = query(collection(db, BRAND_REQUESTS_COLLECTION));

    // Apply filters
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply pagination
    const offset = (page - 1) * pageSize;
    if (offset > 0) {
      // For pagination, we need to get the last document from previous page
      // This is a simplified approach - in production, you'd want to use cursor-based pagination
      const prevQuery = query(q, limit(offset));
      const prevSnapshot = await getDocs(prevQuery);
      if (!prevSnapshot.empty) {
        const lastDoc = prevSnapshot.docs[prevSnapshot.docs.length - 1];
        q = query(q, startAfter(lastDoc), limit(pageSize));
      }
    } else {
      q = query(q, limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    
    const requests: BrandRequest[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        brandName: data.brandName,
        tagline: data.tagline,
        description: data.description,
        whatsappChannel: data.whatsappChannel,
        logoUrl: data.logoUrl,
        categories: data.categories || [],
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        rejectionReason: data.rejectionReason,
        adminComments: data.adminComments,
        adminId: data.adminId,
        canResubmit: data.canResubmit
      };
    });

    // Filter by search term if provided (client-side filtering for simplicity)
    let filteredRequests = requests;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredRequests = requests.filter(request => 
        request.brandName.toLowerCase().includes(term) ||
        request.tagline.toLowerCase().includes(term) ||
        request.userId.toLowerCase().includes(term)
      );
    }

    return {
      requests: filteredRequests,
      total: filteredRequests.length,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting brand requests:', error);
    return {
      requests: [],
      total: 0,
      hasMore: false
    };
  }
};

/**
 * Approve brand request (Admin only)
 */
export const approveBrandRequest = async (
  requestId: string,
  adminId: string,
  adminComments?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, BRAND_REQUESTS_COLLECTION, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return {
        success: false,
        error: 'Brand request not found.'
      };
    }

    const requestData = requestDoc.data();
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'approved',
      adminId,
      adminComments: adminComments || '',
      updatedAt: Timestamp.fromDate(new Date())
    });

    // Create brand document in 'brands' collection with 'active' status
    const brandData: Omit<Brand, 'id'> = {
      userId: requestData.userId,
      brandName: requestData.brandName,
      tagline: requestData.tagline,
      description: requestData.description,
      whatsappChannel: requestData.whatsappChannel,
      logoUrl: requestData.logoUrl || '',
      categories: requestData.categories || [],
      status: 'active', // New brands are created with 'active' status
      createdAt: requestData.createdAt.toDate(),
      updatedAt: new Date(),
      services: [],
      stats: {
        totalOrders: 0,
        totalEarnings: 0,
        rating: 0,
        reviews: 0
      }
    };

    await addDoc(collection(db, BRANDS_COLLECTION), {
      ...brandData,
      createdAt: Timestamp.fromDate(brandData.createdAt),
      updatedAt: Timestamp.fromDate(brandData.updatedAt)
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving brand request:', error);
    return {
      success: false,
      error: 'Failed to approve brand request. Please try again.'
    };
  }
};

/**
 * Reject brand request (Admin only)
 */
export const rejectBrandRequest = async (
  requestId: string,
  adminId: string,
  rejectionReason: string,
  adminComments?: string,
  canResubmit: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, BRAND_REQUESTS_COLLECTION, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return {
        success: false,
        error: 'Brand request not found.'
      };
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      adminId,
      rejectionReason: rejectionReason.trim(),
      adminComments: adminComments || '',
      canResubmit: canResubmit,
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting brand request:', error);
    return {
      success: false,
      error: 'Failed to reject brand request. Please try again.'
    };
  }
};

/**
 * Get brand request statistics (Admin only)
 */
export const getBrandRequestStats = async (): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> => {
  try {
    const [pendingSnapshot, approvedSnapshot, rejectedSnapshot] = await Promise.all([
      getDocs(query(collection(db, BRAND_REQUESTS_COLLECTION), where('status', '==', 'pending'))),
      getDocs(query(collection(db, BRAND_REQUESTS_COLLECTION), where('status', '==', 'approved'))),
      getDocs(query(collection(db, BRAND_REQUESTS_COLLECTION), where('status', '==', 'rejected')))
    ]);

    const pending = pendingSnapshot.size;
    const approved = approvedSnapshot.size;
    const rejected = rejectedSnapshot.size;
    const total = pending + approved + rejected;

    return { pending, approved, rejected, total };
  } catch (error) {
    console.error('Error getting brand request stats:', error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
};

/**
 * Delete brand request (Admin only)
 */
export const deleteBrandRequest = async (
  requestId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, BRAND_REQUESTS_COLLECTION, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return {
        success: false,
        error: 'Brand request not found.'
      };
    }

    const requestData = requestDoc.data();
    
    // Delete logo if exists
    if (requestData.logoUrl) {
      try {
        const logoRef = ref(storage, requestData.logoUrl);
        await deleteObject(logoRef);
      } catch (error) {
        console.warn('Could not delete logo:', error);
      }
    }

    await deleteDoc(requestRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting brand request:', error);
    return {
      success: false,
      error: 'Failed to delete brand request. Please try again.'
    };
  }
};

/**
 * Delete an approved brand and all its associated services
 */
export const deleteBrand = async (
  brandId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      return {
        success: false,
        error: 'Brand not found.'
      };
    }

    const brandData = brandDoc.data();
    
    // Delete logo if exists
    if (brandData.logoUrl) {
      try {
        const logoRef = ref(storage, brandData.logoUrl);
        await deleteObject(logoRef);
      } catch (error) {
        console.warn('Could not delete brand logo:', error);
      }
    }

    // Delete all associated brand services
    try {
      const servicesQuery = query(
        collection(db, 'BrandServices'),
        where('brandId', '==', brandId)
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      
      for (const serviceDoc of servicesSnapshot.docs) {
        await deleteDoc(serviceDoc.ref);
      }
    } catch (error) {
      console.warn('Could not delete associated services:', error);
    }

    // Delete the brand document
    await deleteDoc(brandRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting brand:', error);
    return {
      success: false,
      error: 'Failed to delete brand. Please try again.'
    };
  }
};

/**
 * Get all brands (Admin only - includes all statuses)
 */
export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const brandsQuery = query(
      collection(db, BRANDS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(brandsQuery);
    
    const brands: Brand[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        brandName: data.brandName,
        tagline: data.tagline,
        description: data.description,
        whatsappChannel: data.whatsappChannel,
        logoUrl: data.logoUrl || '',
        categories: data.categories || [],
        status: data.status || 'approved',
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        services: data.services || [],
        stats: data.stats || {
          totalOrders: 0,
          totalEarnings: 0,
          rating: 0,
          reviews: 0
        }
      };
    });

    return brands;
  } catch (error) {
    console.error('Error getting all brands:', error);
    return [];
  }
};

/**
 * Follow a brand
 */
export const followBrand = async (
  brandId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      return {
        success: false,
        error: 'Brand not found'
      };
    }

    // Add userId to followers array and increment follower count
    await updateDoc(brandRef, {
      followers: arrayUnion(userId),
      'stats.followers': increment(1),
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error following brand:', error);
    return {
      success: false,
      error: 'Failed to follow brand'
    };
  }
};

/**
 * Unfollow a brand
 */
export const unfollowBrand = async (
  brandId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      return {
        success: false,
        error: 'Brand not found'
      };
    }

    // Remove userId from followers array and decrement follower count
    await updateDoc(brandRef, {
      followers: arrayRemove(userId),
      'stats.followers': increment(-1),
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error unfollowing brand:', error);
    return {
      success: false,
      error: 'Failed to unfollow brand'
    };
  }
};

/**
 * Check if user is following a brand
 */
export const isFollowingBrand = async (
  brandId: string,
  userId: string
): Promise<boolean> => {
  try {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      return false;
    }

    const brandData = brandDoc.data();
    const followers = brandData.followers || [];
    
    return followers.includes(userId);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};