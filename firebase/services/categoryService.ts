import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config';
import { getJobCategories } from './fogslyJobsService';

/**
 * Get all unique categories from ApprovedFreelancers collection
 */
export const getFreelancerCategories = async (): Promise<string[]> => {
  try {
    const freelancersRef = collection(db, 'ApprovedFreelancers');
    const snapshot = await getDocs(freelancersRef);
    
    const categoriesSet = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((cat: string) => categoriesSet.add(cat));
      }
    });
    
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error('Error fetching freelancer categories:', error);
    return [];
  }
};

/**
 * Get all unique categories from both FogslyJobs and ApprovedFreelancers
 */
export const getAllCategories = async (): Promise<string[]> => {
  try {
    const [jobCategories, freelancerCategories] = await Promise.all([
      getJobCategories(),
      getFreelancerCategories()
    ]);
    
    // Combine and deduplicate categories
    const allCategories = new Set([...jobCategories, ...freelancerCategories]);
    
    return Array.from(allCategories).sort();
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
};
