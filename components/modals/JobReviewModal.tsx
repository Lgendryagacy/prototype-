import React, { useState } from 'react';
import { X, Star, Loader2, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface JobReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  jobTitle: string;
  freelancerName: string;
  freelancerImage?: string;
  initialRating?: number;
  initialReview?: string;
  isSubmitting?: boolean;
}

export default function JobReviewModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  freelancerName,
  freelancerImage,
  initialRating = 0,
  initialReview = '',
  isSubmitting = false
}: JobReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!review.trim()) {
      alert('Please write a review');
      return;
    }

    await onSubmit(rating, review.trim());
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`p-1 transition-colors ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isSubmitting}
        >
          <Star 
            className={`w-8 h-8 transition-colors ${
              isActive 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-[--color-border] hover:text-yellow-300'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[--color-bg-primary] rounded-xl shadow-2xl w-full max-w-md border border-[--color-border] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
          <div>
            <h2 className="text-xl font-semibold text-[--color-text-primary]">Rate & Review</h2>
            <p className="text-sm text-[--color-text-secondary] mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[--color-bg-secondary] rounded-full transition-colors disabled:opacity-50 text-[--color-text-secondary]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Freelancer Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-[--color-bg-secondary] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[--color-primary] flex items-center justify-center overflow-hidden">
              {freelancerImage ? (
                <img 
                  src={freelancerImage} 
                  alt={freelancerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[--color-text-primary]">{freelancerName}</h3>
              <p className="text-sm text-[--color-text-secondary]">Freelancer</p>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[--color-text-primary] mb-3">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-3 text-sm text-[--color-text-secondary]">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Review Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[--color-text-primary] mb-3">
              Review *
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience working with this freelancer. What did they do well? How was the communication and quality of work?"
              rows={5}
              className="w-full px-4 py-3 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] text-[--color-text-primary] placeholder:text-[--color-text-secondary] resize-none"
              required
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-[--color-text-secondary]">
                Be honest and constructive in your feedback
              </p>
              <p className="text-xs text-[--color-text-secondary]">
                {review.length}/1000
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || !review.trim() || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}