import { getAllApprovedFreelancersByUserId } from '../services/approvedFreelancers';

export interface AggregatedGigStats {
  totalGigs: number;
  activeGigs: number;
  totalEarnings: number;
  totalJobs: number;
  totalReviews: number;
  averageRating: number;
}

/**
 * Fetch and aggregate stats from all user's gigs
 */
export const getAggregatedGigStats = async (userId: string): Promise<AggregatedGigStats> => {
  try {
    const gigs = await getAllApprovedFreelancersByUserId(userId);
    
    if (gigs.length === 0) {
      return {
        totalGigs: 0,
        activeGigs: 0,
        totalEarnings: 0,
        totalJobs: 0,
        totalReviews: 0,
        averageRating: 0
      };
    }

    const totalGigs = gigs.length;
    const activeGigs = gigs.filter(gig => gig.status === 'active').length;
    const totalEarnings = gigs.reduce((sum, gig) => sum + (gig.totalEarnings || 0), 0);
    const totalJobs = gigs.reduce((sum, gig) => sum + (gig.totalJobs || 0), 0);
    const totalReviews = gigs.reduce((sum, gig) => sum + (gig.totalReviews || 0), 0);
    
    // Calculate weighted average rating
    const averageRating = totalReviews > 0
      ? gigs.reduce((sum, gig) => sum + ((gig.averageRating || 0) * (gig.totalReviews || 0)), 0) / totalReviews
      : 0;

    return {
      totalGigs,
      activeGigs,
      totalEarnings,
      totalJobs,
      totalReviews,
      averageRating
    };
  } catch (error) {
    console.error('Error fetching aggregated gig stats:', error);
    return {
      totalGigs: 0,
      activeGigs: 0,
      totalEarnings: 0,
      totalJobs: 0,
      totalReviews: 0,
      averageRating: 0
    };
  }
};
