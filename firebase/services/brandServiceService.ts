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
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { BrandService, CreateServiceData, UpdateServiceData } from '../types/service';

const BRAND_SERVICES_COLLECTION = 'BrandsServices';

/**
 * Create a new brand service
 */
export const createBrandService = async (
  userId: string,
  brandId: string,
  data: CreateServiceData
): Promise<{ success: boolean; error?: string; serviceId?: string }> => {
  try {
    // Get brand details
    const brandDoc = await getDoc(doc(db, 'brands', brandId));
    if (!brandDoc.exists()) {
      return {
        success: false,
        error: 'Brand not found'
      };
    }

    const brandData = brandDoc.data();
    
    // Upload main image
    let mainImageUrl = '';
    if (data.mainImageFile) {
      const mainImageRef = ref(storage, `services/${brandId}/${Date.now()}-main`);
      const uploadResult = await uploadBytes(mainImageRef, data.mainImageFile);
      mainImageUrl = await getDownloadURL(uploadResult.ref);
    }

    // Upload thumbnail images
    const thumbnailUrls: string[] = [];
    if (data.thumbnailImageFiles && data.thumbnailImageFiles.length > 0) {
      for (let i = 0; i < data.thumbnailImageFiles.length; i++) {
        const file = data.thumbnailImageFiles[i];
        const thumbnailRef = ref(storage, `services/${brandId}/${Date.now()}-thumb-${i}`);
        const uploadResult = await uploadBytes(thumbnailRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        thumbnailUrls.push(url);
      }
    }

    const serviceData: Omit<BrandService, 'id'> = {
      title: data.title.trim(),
      description: data.description.trim(),
      categories: data.categories,
      mainImage: mainImageUrl,
      thumbnailImages: thumbnailUrls,
      pricing: data.pricing,
      faqs: data.faqs,
      
      // Brand Information
      brandId,
      brandName: brandData.brandName,
      brandTagline: brandData.tagline,
      brandLogo: brandData.logoUrl || '',
      brandDescription: brandData.description,
      userId,
      
      // Service Metadata
      status: 'active',
      soldOut: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Statistics
      stats: {
        views: 0,
        orders: 0,
        rating: 0,
        reviews: 0
      }
    };

    const docRef = await addDoc(collection(db, BRAND_SERVICES_COLLECTION), {
      ...serviceData,
      createdAt: Timestamp.fromDate(serviceData.createdAt),
      updatedAt: Timestamp.fromDate(serviceData.updatedAt)
    });

    return {
      success: true,
      serviceId: docRef.id
    };
  } catch (error) {
    console.error('Error creating brand service:', error);
    return {
      success: false,
      error: 'Failed to create service. Please try again.'
    };
  }
};

/**
 * Get services for a specific brand
 */
export const getBrandServices = async (brandId: string): Promise<BrandService[]> => {
  try {
    const q = query(
      collection(db, BRAND_SERVICES_COLLECTION),
      where('brandId', '==', brandId),
      where('status', '!=', 'frozen'),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        categories: data.categories || [],
        mainImage: data.mainImage,
        thumbnailImages: data.thumbnailImages || [],
        pricing: data.pricing,
        faqs: data.faqs || [],
        brandId: data.brandId,
        brandName: data.brandName,
        brandTagline: data.brandTagline,
        brandLogo: data.brandLogo,
        brandDescription: data.brandDescription,
        userId: data.userId,
        status: data.status,
        soldOut: data.soldOut || false,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        stats: data.stats || {
          views: 0,
          orders: 0,
          rating: 0,
          reviews: 0
        }
      };
    });
  } catch (error) {
    console.error('Error getting brand services:', error);
    return [];
  }
};

/**
 * Get all brand services for admin
 */
export const getAllBrandServices = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{
  services: BrandService[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    const q = query(
      collection(db, BRAND_SERVICES_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(pageSize * page)
    );
    
    const querySnapshot = await getDocs(q);
    
    const services: BrandService[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        categories: data.categories || [],
        mainImage: data.mainImage,
        thumbnailImages: data.thumbnailImages || [],
        pricing: data.pricing,
        faqs: data.faqs || [],
        brandId: data.brandId,
        brandName: data.brandName,
        brandTagline: data.brandTagline,
        brandLogo: data.brandLogo,
        brandDescription: data.brandDescription,
        userId: data.userId,
        status: data.status,
        soldOut: data.soldOut || false,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        stats: data.stats || {
          views: 0,
          orders: 0,
          rating: 0,
          reviews: 0
        }
      };
    });

    return {
      services,
      total: services.length,
      hasMore: querySnapshot.docs.length === pageSize * page
    };
  } catch (error) {
    console.error('Error getting all brand services:', error);
    return {
      services: [],
      total: 0,
      hasMore: false
    };
  }
};

/**
 * Update brand service
 */
export const updateBrandService = async (
  serviceId: string,
  userId: string,
  data: UpdateServiceData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const serviceRef = doc(db, BRAND_SERVICES_COLLECTION, serviceId);
    const serviceDoc = await getDoc(serviceRef);
    
    if (!serviceDoc.exists()) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    const serviceData = serviceDoc.data();
    if (serviceData.userId !== userId) {
      return {
        success: false,
        error: 'You do not have permission to update this service'
      };
    }

    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (data.title) updateData.title = data.title.trim();
    if (data.description) updateData.description = data.description.trim();
    if (data.categories) updateData.categories = data.categories;
    if (data.pricing) updateData.pricing = data.pricing;
    if (data.faqs) updateData.faqs = data.faqs;
    if (data.status) updateData.status = data.status;

    // Handle image updates
    if (data.mainImageFile) {
      const mainImageRef = ref(storage, `services/${serviceData.brandId}/${Date.now()}-main`);
      const uploadResult = await uploadBytes(mainImageRef, data.mainImageFile);
      updateData.mainImage = await getDownloadURL(uploadResult.ref);
    }

    if (data.thumbnailImageFiles && data.thumbnailImageFiles.length > 0) {
      const thumbnailUrls: string[] = [];
      for (let i = 0; i < data.thumbnailImageFiles.length; i++) {
        const file = data.thumbnailImageFiles[i];
        const thumbnailRef = ref(storage, `services/${serviceData.brandId}/${Date.now()}-thumb-${i}`);
        const uploadResult = await uploadBytes(thumbnailRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        thumbnailUrls.push(url);
      }
      updateData.thumbnailImages = thumbnailUrls;
    }

    await updateDoc(serviceRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating brand service:', error);
    return {
      success: false,
      error: 'Failed to update service. Please try again.'
    };
  }
};

/**
 * Delete brand service
 */
export const deleteBrandService = async (
  serviceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const serviceRef = doc(db, BRAND_SERVICES_COLLECTION, serviceId);
    const serviceDoc = await getDoc(serviceRef);
    
    if (!serviceDoc.exists()) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    const serviceData = serviceDoc.data();
    if (serviceData.userId !== userId) {
      return {
        success: false,
        error: 'You do not have permission to delete this service'
      };
    }

    // Delete images from storage
    try {
      if (serviceData.mainImage) {
        const mainImageRef = ref(storage, serviceData.mainImage);
        await deleteObject(mainImageRef);
      }

      if (serviceData.thumbnailImages && serviceData.thumbnailImages.length > 0) {
        for (const imageUrl of serviceData.thumbnailImages) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
      }
    } catch (imageError) {
      console.warn('Error deleting service images:', imageError);
    }

    await deleteDoc(serviceRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting brand service:', error);
    return {
      success: false,
      error: 'Failed to delete service. Please try again.'
    };
  }
};

/**
 * Admin function to freeze/unfreeze service
 */
export const toggleServiceFreeze = async (
  serviceId: string,
  freeze: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const serviceRef = doc(db, BRAND_SERVICES_COLLECTION, serviceId);
    const serviceDoc = await getDoc(serviceRef);
    
    if (!serviceDoc.exists()) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    await updateDoc(serviceRef, {
      status: freeze ? 'frozen' : 'active',
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling service freeze:', error);
    return {
      success: false,
      error: 'Failed to update service status. Please try again.'
    };
  }
};

/**
 * Toggle service sold out status
 */
export const toggleServiceSoldOut = async (
  serviceId: string,
  soldOut: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const serviceRef = doc(db, BRAND_SERVICES_COLLECTION, serviceId);
    const serviceDoc = await getDoc(serviceRef);
    
    if (!serviceDoc.exists()) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    await updateDoc(serviceRef, {
      soldOut: soldOut,
      updatedAt: Timestamp.fromDate(new Date())
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling service sold out:', error);
    return {
      success: false,
      error: 'Failed to update service sold out status. Please try again.'
    };
  }
};

/**
 * Get single service by ID
 */
export const getBrandServiceById = async (serviceId: string): Promise<BrandService | null> => {
  try {
    const serviceDoc = await getDoc(doc(db, BRAND_SERVICES_COLLECTION, serviceId));
    
    if (!serviceDoc.exists()) {
      return null;
    }

    const data = serviceDoc.data();
    return {
      id: serviceDoc.id,
      title: data.title,
      description: data.description,
      categories: data.categories || [],
      mainImage: data.mainImage,
      thumbnailImages: data.thumbnailImages || [],
      pricing: data.pricing,
      faqs: data.faqs || [],
      brandId: data.brandId,
      brandName: data.brandName,
      brandTagline: data.brandTagline,
      brandLogo: data.brandLogo,
      brandDescription: data.brandDescription,
      userId: data.userId,
      status: data.status,
      soldOut: data.soldOut || false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      stats: data.stats || {
        views: 0,
        orders: 0,
        rating: 0,
        reviews: 0
      }
    };
  } catch (error) {
    console.error('Error getting brand service:', error);
    return null;
  }
};

/**
 * Get brand services statistics for admin dashboard
 */
export const getBrandServicesStats = async (): Promise<{
  total: number;
  active: number;
  frozen: number;
}> => {
  try {
    const servicesQuery = query(collection(db, BRAND_SERVICES_COLLECTION));
    const snapshot = await getDocs(servicesQuery);
    
    let total = 0;
    let active = 0;
    let frozen = 0;
    
    snapshot.forEach(doc => {
      const service = doc.data();
      total++;
      
      if (service.status === 'active') {
        active++;
      } else if (service.status === 'frozen') {
        frozen++;
      }
    });
    
    return {
      total,
      active,
      frozen
    };
  } catch (error) {
    console.error('Error fetching services stats:', error);
    return {
      total: 0,
      active: 0,
      frozen: 0
    };
  }
};