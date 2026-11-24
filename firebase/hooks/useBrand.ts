import { useState, useEffect } from 'react';
import { 
  getUserBrandRequest, 
  getUserBrand, 
  createBrandRequest, 
  updateBrand 
} from '../services/brandService';
import { BrandRequest, Brand, CreateBrandRequestData, UpdateBrandData } from '../types/brand';

export const useBrand = (userUid?: string | null) => {
  const [brandRequest, setBrandRequest] = useState<BrandRequest | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brand data when user changes
  useEffect(() => {
    if (!userUid) {
      setBrandRequest(null);
      setBrand(null);
      setLoading(false);
      return;
    }

    fetchBrandData();
  }, [userUid]);

  const fetchBrandData = async () => {
    if (!userUid) return;

    try {
      setLoading(true);
      setError(null);

      // First check for brand request in 'brandRequests' collection
      const request = await getUserBrandRequest(userUid);
      setBrandRequest(request);

      // If request is approved, fetch the actual brand from 'brands' collection
      // The brand in 'brands' collection can have status: 'active' | 'frozen'
      if (request?.status === 'approved') {
        const userBrand = await getUserBrand(userUid);
        setBrand(userBrand);
      } else {
        setBrand(null);
      }
    } catch (err) {
      console.error('Error fetching brand data:', err);
      setError('Failed to load brand data');
    } finally {
      setLoading(false);
    }
  };

  const submitBrandRequest = async (data: CreateBrandRequestData) => {
    if (!userUid) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createBrandRequest(userUid, data);
      
      if (result.success) {
        await fetchBrandData(); // Refresh data
        return { success: true };
      } else {
        setError(result.error || 'Failed to submit brand request');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to submit brand request';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateBrandData = async (data: UpdateBrandData) => {
    if (!userUid || !brand) {
      throw new Error('User not authenticated or no brand found');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateBrand(brand.id, userUid, data);
      
      if (result.success) {
        await fetchBrandData(); // Refresh data
        return { success: true };
      } else {
        setError(result.error || 'Failed to update brand');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to update brand';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshBrandData = () => {
    fetchBrandData();
  };

  // Helper to determine brand status
  const getBrandStatus = () => {
    // Priority: Check actual brand status first (from 'brands' collection)
    // This handles cases where brand was approved, then frozen, then unfrozen
    if (brand) {
      // If brand exists, use its status (approved/active/frozen)
      // Map 'active' to 'approved' for consistency with button logic
      return brand.status === 'active' ? 'approved' : brand.status;
    }
    
    // Fallback to brand request status if no brand exists yet
    if (!brandRequest) return 'none';
    return brandRequest.status;
  };

  // Helper to check if user can create brand
  const canCreateBrand = () => {
    // If user already has an approved brand (in 'brands' collection), they cannot create another
    if (brand) return false;
    
    if (!brandRequest) return true; // No previous request
    if (brandRequest.status === 'approved') return false; // Already approved
    if (brandRequest.status === 'pending') return false; // Currently pending
    if (brandRequest.status === 'rejected') {
      // If rejected, check if they can resubmit
      return brandRequest.canResubmit !== false; // Default to true if not specified
    }
    return true;
  };

  // Helper to check if user can edit brand
  const canEditBrand = () => {
    // Can edit if:
    // 1. Brand exists in 'brands' collection
    // 2. Brand request is approved
    // 3. Brand is not frozen
    return brand && brandRequest?.status === 'approved' && brand.status !== 'frozen';
  };

  return {
    brandRequest,
    brand,
    loading,
    error,
    submitBrandRequest,
    updateBrandData,
    refreshBrandData,
    getBrandStatus,
    canCreateBrand,
    canEditBrand
  };
};