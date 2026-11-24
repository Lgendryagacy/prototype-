import React, { useState, useEffect } from 'react';
import { Star, Calendar, User, MessageSquare, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { FogslyJob } from '../firebase/types/job';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ReviewsListProps {
  freelancerId: string;
  maxReviews?: number;
  showLoadMore?: boolean;
  className?: string;
}

interface JobReview extends FogslyJob {
  // Reviews are stored within FogslyJob documents
}

export default function ReviewsList({ 
  freelancerId, 
  maxReviews = 5, 
  showLoadMore = true, 
  className = '' 
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<JobReview[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<JobReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingAll, setShowingAll] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [freelancerId]);

  useEffect(() => {
    updateDisplayedReviews();
  }, [reviews, showingAll, maxReviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // First, find all accepted proposals for this freelancer to get job IDs
      const proposalsQuery = query(
        collection(db, 'JobProposal'),
        where('freelancerId', '==', freelancerId),
        where('status', '==', 'accepted')
      );
      
      const proposalsSnapshot = await getDocs(proposalsQuery);
      const jobIds = proposalsSnapshot.docs.map(doc => doc.data().jobId);

      if (jobIds.length === 0) {
        setLoading(false);
        return;
      }

      // Then fetch completed jobs for those job IDs that have reviews
      const jobsQuery = query(
        collection(db, 'FogslyJobs'),
        where('status', '==', 'completed'),
        where('clientRating', '>', 0),
        orderBy('clientRating', 'desc'),
        orderBy('completedAt', 'desc')
      );

      const jobsSnapshot = await getDocs(jobsQuery);
      const completedJobs = jobsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as JobReview))
        .filter(job => jobIds.includes(job.id)); // Only include jobs for this freelancer

      setReviews(completedJobs);
      calculateStats(completedJobs);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedReviews = () => {
    if (showingAll) {
      setDisplayedReviews(reviews);
    } else {
      setDisplayedReviews(reviews.slice(0, maxReviews));
    }
  };

  const calculateStats = (reviewsData: JobReview[]) => {
    if (reviewsData.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + (review.clientRating || 0), 0);
    const averageRating = totalRating / reviewsData.length;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      const rating = review.clientRating || 0;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      }
    });

    setStats({
      totalReviews: reviewsData.length,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution
    });
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-[--color-border]'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-16 h-2 bg-[--color-bg-tertiary] rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-[--color-text-secondary] min-w-[2rem]">
          {count}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[--color-bg-secondary] rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[--color-bg-secondary] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageSquare className="w-12 h-12 text-[--color-text-secondary] mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-[--color-text-primary] mb-1">No Reviews Yet</h3>
        <p className="text-[--color-text-secondary]">
          This freelancer hasn't received any reviews from completed jobs yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Statistics */}
      <div className="bg-[--color-bg-secondary] rounded-xl p-6 border border-[--color-border]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-4xl font-bold text-[--color-text-primary]">
                {stats.averageRating}
              </span>
              <div>
                {renderStars(Math.round(stats.averageRating), 'lg')}
                <p className="text-sm text-[--color-text-secondary] mt-1">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="text-[--color-text-secondary] min-w-[3rem]">
                  {rating} stars
                </span>
                {renderRatingBar(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution], stats.totalReviews)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[--color-text-primary]">
            Client Reviews ({stats.totalReviews})
          </h3>
        </div>

        {displayedReviews.map((review) => (
          <div key={review.id} className="bg-[--color-bg-secondary] rounded-lg p-6 border border-[--color-border]">
            {/* Review Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[--color-primary] flex items-center justify-center">
                  {review.clientImage ? (
                    <img 
                      src={review.clientImage} 
                      alt={review.clientName || 'Client'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-[--color-text-primary]">
                    {review.clientName || 'Anonymous Client'}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(review.completedAt)}</span>
                  </div>
                </div>
              </div>
              {renderStars(review.clientRating || 0, 'md')}
            </div>

            {/* Job Title */}
            <div className="mb-3">
              <p className="text-sm text-[--color-text-secondary]">
                Job: <span className="font-medium text-[--color-text-primary]">{review.jobTitle}</span>
              </p>
            </div>

            {/* Review Text */}
            <div className="bg-[--color-bg-tertiary] rounded-lg p-4 border border-[--color-border]">
              <p className="text-[--color-text-primary] leading-relaxed">
                {review.clientReview || 'No written review provided.'}
              </p>
            </div>

            {/* Helpful Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[--color-border]">
              <div className="flex items-center gap-4 text-sm text-[--color-text-secondary]">
                {review.budgetInFogCoins && (
                  <span>Project Budget: {review.budgetInFogCoins} FOG</span>
                )}
                {review.adminApproved && (
                  <span className="text-green-600">✓ Verified</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {showLoadMore && reviews.length > maxReviews && (
          <div className="text-center pt-4">
            <button
              onClick={() => setShowingAll(!showingAll)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[--color-bg-secondary] hover:bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg transition-colors text-[--color-text-primary]"
            >
              {showingAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All Reviews ({reviews.length - displayedReviews.length} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}