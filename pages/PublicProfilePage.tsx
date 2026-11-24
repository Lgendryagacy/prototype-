import React, { useEffect, useState, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type Route } from '../types';
import { getUserProfile } from '../firebase/services/userService';
import { UserProfile } from '../firebase/types/user';
import {
  ProfileHeader,
  ProfileSidebar,
  ProfileTabs,
  Tab,
} from '../components/profile';
import FogslyRankBanner from '@/components/badges/FogslyRankBanner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load tab components
const OverviewTab = React.lazy(() => import('../components/profile/tabs/OverviewTab'));
const PortfolioTab = React.lazy(() => import('../components/profile/tabs/PortfolioTab'));
const ActiveGigsTab = React.lazy(() => import('../components/profile/tabs/ActiveGigsTab'));
const ReviewsTab = React.lazy(() => import('../components/profile/tabs/ReviewsTab'));

interface PublicProfilePageProps {
  navigate: (route: Route, context?: any) => void;
  userId?: string;
}

const PublicProfilePage = ({ navigate, userId }: PublicProfilePageProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUserProfile = async (uid: string) => {
    try {
      setIsLoading(true);
      const userData = await getUserProfile(uid);
      
      if (userData) {
        setUserProfile(userData);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="bg-[--color-bg-secondary] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[--color-primary]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !userProfile) {
    return (
      <div className="bg-[--color-bg-secondary] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-[--color-text-primary]">User Not Found</h2>
            <p className="text-[--color-text-secondary] text-center max-w-md">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleNavigateBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-4">
        
        {/* Back Button */}
        {/* <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={handleNavigateBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div> */}

        {/* Profile Header - Read-only mode */}
        <ProfileHeader
          userProfile={userProfile}
          currentUser={null} // null means read-only
          isEditing={false}
          onNavigateHome={() => navigate('home')}
          onToggleEdit={() => {}} // No edit for public view
          onNavigateToSettings={() => {}} // No settings for public view
          onAvatarUpload={async () => {}} // No upload for public view
          onCoverUpload={async () => {}} // No upload for public view
          isSaving={false}
          navigate={navigate}
        />

        {/* Fogsly Rank Banner */}
        {/* {userProfile.rank && userProfile.rank <= 1000 && (
          <div className="mb-6">
            <FogslyRankBanner rank={userProfile.rank} />
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Read-only */}
          <div className="lg:col-span-4">
            <ProfileSidebar 
              userProfile={userProfile}
              currentUser={null}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-[--color-bg-primary] rounded-lg shadow-md">
              <ProfileTabs 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {/* Tab Content */}
              <div className="p-6">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
                  </div>
                }>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === 'overview' && (
                        <OverviewTab 
                          userProfile={userProfile}
                          currentUser={null}
                        />
                      )}
                      {activeTab === 'portfolio' && (
                        <PortfolioTab 
                          userProfile={userProfile}
                          currentUser={null}
                          onTabChange={setActiveTab}
                        />
                      )}
                      {activeTab === 'active-gigs' && userId && (
                        <ActiveGigsTab 
                          userId={userId}
                          navigate={navigate}
                        />
                      )}
                      {activeTab === 'reviews' && (
                        <ReviewsTab 
                          userProfile={userProfile}
                          currentUser={null}
                        />
                      )}
                      {activeTab === 'settings' && (
                        <div className="text-center py-8 text-[--color-text-secondary]">
                          Settings are only available to the profile owner.
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right" 
        theme={document.documentElement.className as 'light' | 'dark'} 
      />
    </div>
  );
};

export default PublicProfilePage;
