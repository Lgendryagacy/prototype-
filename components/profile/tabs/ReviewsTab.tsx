import React from 'react';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import ReviewsList from '../../ReviewsList';

interface ReviewsTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const ReviewsTab = React.memo(({ userProfile, currentUser }: ReviewsTabProps) => {
  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-[--color-text-secondary]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <ReviewsList 
        freelancerId={userProfile.uid}
        maxReviews={10}
        showLoadMore={true}
        className=""
      />
    </div>
  );
});

ReviewsTab.displayName = 'ReviewsTab';

export default ReviewsTab;
