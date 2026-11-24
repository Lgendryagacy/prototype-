import { useState, useEffect } from 'react';
import { BrandService, CreateServiceData, UpdateServiceData } from '../types/service';
import { 
  getBrandServices,
  createBrandService,
  updateBrandService,
  deleteBrandService
} from '../services/brandServiceService';

export const useBrandServices = (brandId?: string) => {
  const [services, setServices] = useState<BrandService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!brandId) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedServices = await getBrandServices(brandId);
      setServices(fetchedServices);
    } catch (err) {
      console.error('Error fetching brand services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [brandId]);

  const createService = async (
    userId: string,
    serviceData: CreateServiceData
  ): Promise<{ success: boolean; error?: string; serviceId?: string }> => {
    if (!brandId) {
      return { success: false, error: 'Brand ID is required' };
    }

    try {
      const result = await createBrandService(userId, brandId, serviceData);
      if (result.success) {
        // Refresh services list
        await fetchServices();
      }
      return result;
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, error: 'Failed to create service' };
    }
  };

  const updateService = async (
    serviceId: string,
    userId: string,
    updateData: UpdateServiceData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await updateBrandService(serviceId, userId, updateData);
      if (result.success) {
        // Refresh services list
        await fetchServices();
      }
      return result;
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, error: 'Failed to update service' };
    }
  };

  const deleteService = async (
    serviceId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await deleteBrandService(serviceId, userId);
      if (result.success) {
        // Refresh services list
        await fetchServices();
      }
      return result;
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, error: 'Failed to delete service' };
    }
  };

  const refetch = () => {
    fetchServices();
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch
  };
};