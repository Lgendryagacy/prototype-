import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config';
import { Brand } from '../types/brand';

export interface ApprovedBrand extends Brand {
  // Add any additional fields specific to approved brands display
}

export const useApprovedBrands = () => {
  const [brands, setBrands] = useState<ApprovedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchApprovedBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query for approved and active brands only (exclude frozen brands)
      const brandsQuery = query(
        collection(db, 'brands'),
        where('status', 'in', ['approved', 'active']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(brandsQuery);
      
      const fetchedBrands: ApprovedBrand[] = querySnapshot.docs.map(doc => {
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
          status: data.status,
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

      // Extract unique categories from all brands
      const allCategories = new Set<string>();
      fetchedBrands.forEach(brand => {
        brand.categories.forEach(category => {
          allCategories.add(category);
        });
      });

      setBrands(fetchedBrands);
      setCategories(['All', ...Array.from(allCategories).sort()]);
    } catch (err) {
      console.error('Error fetching approved brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedBrands();
  }, []);

  const getBrandsByCategory = (category: string) => {
    if (category === 'All') {
      return brands;
    }
    return brands.filter(brand => brand.categories.includes(category));
  };

  const refetch = () => {
    fetchApprovedBrands();
  };

  return {
    brands,
    categories,
    loading,
    error,
    getBrandsByCategory,
    refetch
  };
};