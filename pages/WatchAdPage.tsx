import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RadioGroup } from '../components/ui/RadioGroup';
import { Textarea } from '../components/ui/Textarea';
import {
  getAvailableAdsForUser,
  getUserAdStats,
  getUserCompletedAdIds,
  getCompletedAdsWithDetails,
  watchAd
} from '../firebase/services/adService';
import { getUserProfile } from '../firebase/services/userService';
import { Ad, UserAdStats } from '../firebase/types/ads';
import { UserProfile } from '../firebase/types/user';
import { Route } from '../types';
import { toast } from 'react-hot-toast';
import { useScrollingNavigate, scrollToTop } from '@/utils/navigationUtils';
import {
  Play,
  Clock,
  DollarSign,
  Eye,
  TrendingUp,
  Award,
  Check,
  Gift,
  ArrowLeft,
  User,
  Pause,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Phone,
  Globe
} from 'lucide-react';

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
        top: '-10%',
        left: '10%'
      }}
      animate={{
        x: [0, 50, -30, 40, 0],
        y: [0, -50, 30, 20, 0],
        scale: [1, 1.1, 0.9, 1.05, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        top: '20%',
        right: '15%'
      }}
      animate={{
        x: [0, -40, 30, -20, 0],
        y: [0, 40, -30, 20, 0],
        scale: [1, 0.9, 1.1, 0.95, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
    <motion.div
      className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
        bottom: '10%',
        left: '20%'
      }}
      animate={{
        x: [0, 30, -40, 25, 0],
        y: [0, -30, 40, -15, 0],
        scale: [1, 1.05, 0.9, 1.1, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
    />
  </div>
);

interface AdCardProps {
  ad: Ad;
  isCompleted: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  onWatch: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, isCompleted, isDisabled, disabledReason, onWatch }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;

    if (isDisabled) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    onWatch(ad);
  };
  return (
    <div className="relative h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={isCompleted || isDisabled ? {} : { scale: 1.02, y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
      >
        <div
          className={`backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group h-full flex flex-col ${
            isCompleted ? 'opacity-75' : isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white/15 dark:hover:bg-black/15'
          } transition-all duration-300`}
          onClick={handleClick}
        >
          {/* Top gradient bar */}
          {!isCompleted && !isDisabled && (
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
          )}

          {/* Ad Preview Image */}
          <div className="relative h-64 rounded-t-3xl overflow-hidden">
            {isCompleted ? (
              <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
                <Check className="w-12 h-12 text-white bg-green-600 rounded-full p-2 mb-2" />
                <span className="text-white font-semibold text-lg">Completed</span>
              </div>
            ) : isDisabled ? (
              <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
                <AlertTriangle className="w-12 h-12 text-white bg-red-600 rounded-full p-2 mb-2" />
                <span className="text-white font-semibold text-lg">Profile Required</span>
              </div>
            ) : null}

            {ad.previewImage ? (
              <img
                src={ad.previewImage}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
                <Play className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {!isCompleted && !isDisabled && (
              <>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white text-xs px-3 py-2 rounded-xl font-bold">
                  <Clock className="w-3 h-3" />
                  <span>15s</span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-yellow-500 text-white text-xs px-3 py-2 rounded-xl font-bold">
                  <DollarSign className="w-3 h-3" />
                  <span>{ad.totalReward} FOG</span>
                </div>
              </>
            )}
          </div>

          {/* Card Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Ad Title */}
            <h3 className="text-2xl font-black mb-2 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {ad.title}
            </h3>

            {/* Ad Description */}
            <p
              className="text-base font-medium mb-4 overflow-hidden"
              style={{
                color: 'var(--color-text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis'
              }}
            >
              {ad.description}
            </p>

            {/* Spacer to push tags and footer to bottom */}
            <div className="flex-1"></div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {isCompleted ? (
                <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-sm font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Completed
                </span>
              ) : isDisabled ? (
                <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Complete Profile Required
                </span>
              ) : (
                <>
                  <span className="px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    <Award className="w-4 h-4" />
                    {ad.questions.length} Questions
                  </span>
                  <span className="px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    <Eye className="w-4 h-4" />
                    {ad.totalViews || 0} Views
                  </span>
                </>
              )}
            </div>

            {/* Footer */}
            {!isCompleted && !isDisabled && (
              <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <Gift className="w-4 h-4" />
                  Earn {ad.totalReward} FOG
                </span>
                <button className="text-sm font-bold group-hover:underline flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                  Watch Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tooltip for disabled state */}
      {showTooltip && isDisabled && disabledReason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
        >
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs text-center">
            {disabledReason}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Completed Ad Card Component
interface CompletedAdCardProps {
  ad: Ad & { earnedAmount: number; completedAt: Date };
}

const CompletedAdCard: React.FC<CompletedAdCardProps> = ({ ad }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden opacity-90 h-full flex flex-col">
        {/* Ad Preview Image */}
        <div className="relative h-64 rounded-t-3xl overflow-hidden">
          {/* Green completed overlay */}
          <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
            <Check className="w-12 h-12 text-white bg-green-600 rounded-full p-2 mb-2" />
            <span className="text-white font-semibold text-lg">Completed</span>
          </div>

          {ad.previewImage ? (
            <img
              src={ad.previewImage}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
              <Play className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Ad Title */}
          <h3 className="text-2xl font-black mb-2 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            {ad.title}
          </h3>

          {/* Ad Description */}
          <p
            className="text-base font-medium mb-4 overflow-hidden"
            style={{
              color: 'var(--color-text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis'
            }}
          >
            {ad.description}
          </p>

          {/* Spacer to push tags and footer to bottom */}
          <div className="flex-1"></div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-sm font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Completed
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-sm font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earned {ad.earnedAmount} FOG
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Clock className="w-4 h-4" />
              {ad.completedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

type WatchPhase = 'list' | 'video' | 'questions' | 'thankyou';

const WatchAdPage: React.FC<{ navigate: (route: Route) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigateWithScroll  = useScrollingNavigate(navigate);
  
  // State management
  const [ads, setAds] = useState<Ad[]>([]);
  const [completedAdIds, setCompletedAdIds] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserAdStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Ad watching state
  const [phase, setPhase] = useState<WatchPhase>('list');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer?: number; textAnswer?: string; }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);

  // Video player state
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Page protection state
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  
  // Completed ads state
  const [completedAds, setCompletedAds] = useState<(Ad & { earnedAmount: number; completedAt: Date })[]>([]);
  const [completedAdsLoading, setCompletedAdsLoading] = useState(false);

  // localStorage keys for state persistence
  const AD_WATCHING_STATE_KEY = 'fogsly_ad_watching_state';
  const AD_SESSION_KEY = 'fogsly_ad_session';

  // Save ad watching state to localStorage
  const saveAdWatchingState = (state: {
    adId: string;
    phase: WatchPhase;
    videoEnded: boolean;
    currentQuestionIndex: number;
    answers: typeof answers;
    videoProgress: number;
    videoCurrentTime: number;
  }) => {
    localStorage.setItem(AD_WATCHING_STATE_KEY, JSON.stringify({
      ...state,
      timestamp: Date.now(),
      userId: user?.uid
    }));
  };

  // Load ad watching state from localStorage
  const loadAdWatchingState = () => {
    try {
      const saved = localStorage.getItem(AD_WATCHING_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if it's for the current user and within the last hour
        if (state.userId === user?.uid && (Date.now() - state.timestamp) < 3600000) {
          return state;
        }
      }
    } catch (error) {
      console.error('Error loading ad watching state:', error);
    }
    return null;
  };

  // Clear ad watching state
  const clearAdWatchingState = () => {
    localStorage.removeItem(AD_WATCHING_STATE_KEY);
    localStorage.removeItem(AD_SESSION_KEY);
    setIsWatchingAd(false);
  };

  // Handle page protection
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isWatchingAd && phase !== 'list' && phase !== 'thankyou') {
      e.preventDefault();
      e.returnValue = 'You are currently watching an ad. Please complete all questions to earn your reward. Are you sure you want to leave?';
      return e.returnValue;
    }
  };

  // Handle browser back button
  const handlePopState = (e: PopStateEvent) => {
    if (isWatchingAd && phase !== 'list' && phase !== 'thankyou') {
      e.preventDefault();
      setShowExitWarning(true);
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    console.log('User changed:', user?.uid);
    if (user) {
      loadData();
      loadCompletedAds(); // Load completed ads when component loads
    } else {
      // Reset loading state when no user
      setLoading(false);
      setAds([]);
      setUserStats(null);
      setUserProfile(null);
      setCompletedAdIds([]);
      setCompletedAds([]);
    }
  }, [user]);

  // Separate useEffect for state restoration after ads are loaded
  useEffect(() => {
    console.log('State restoration check:', {
      hasUser: !!user,
      adsLength: ads.length,
      hasSelectedAd: !!selectedAd,
      loading
    });
    
    if (user && ads.length > 0 && !selectedAd && !loading) { // Only run if no ad is selected yet and not loading
      // Try to restore previous ad watching state
      const savedState = loadAdWatchingState();
      console.log('Saved state found:', !!savedState);
      if (savedState) {
        // Find the ad from the saved state
        const ad = ads.find(a => a.id === savedState.adId);
        if (ad) {
          console.log('Restoring ad session for:', ad.title);
          toast('Resuming your previous ad session...', {
            icon: '🔄',
            duration: 3000
          });
          setSelectedAd(ad);
          setPhase(savedState.phase);
          setVideoEnded(savedState.videoEnded);
          setCurrentQuestionIndex(savedState.currentQuestionIndex);
          setAnswers(savedState.answers);
          setVideoProgress(savedState.videoProgress);
          setVideoCurrentTime(savedState.videoCurrentTime);
          setIsWatchingAd(true);
        } else {
          console.log('Saved ad not found, clearing state');
          clearAdWatchingState();
        }
      }
    }
  }, [user, ads.length, selectedAd, loading]); // Add loading to dependencies

  // Page protection effects
  useEffect(() => {
    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Add a history entry to capture back button
    if (isWatchingAd && phase !== 'list' && phase !== 'thankyou') {
      window.history.pushState(null, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isWatchingAd, phase]);

  // Save state whenever watching state changes
  useEffect(() => {
    if (isWatchingAd && selectedAd && phase !== 'list' && phase !== 'thankyou') {
      saveAdWatchingState({
        adId: selectedAd.id,
        phase,
        videoEnded,
        currentQuestionIndex,
        answers,
        videoProgress,
        videoCurrentTime
      });
    }
  }, [isWatchingAd, selectedAd, phase, videoEnded, currentQuestionIndex, answers, videoProgress, videoCurrentTime]);

  // Helper function to check profile completeness
  const getProfileMissingFields = (profile: UserProfile | null): string[] => {
    if (!profile) return ['country', 'city', 'phone'];

    const missingFields: string[] = [];

    if (!profile.country || profile.country.trim() === '') {
      missingFields.push('country');
    }

    if (!profile.city || profile.city.trim() === '') {
      missingFields.push('city');
    }

    if (!profile.phone || profile.phone.trim() === '') {
      missingFields.push('phone');
    }

    return missingFields;
  };

  const isProfileComplete = (profile: UserProfile | null): boolean => {
    return getProfileMissingFields(profile).length === 0;
  };

  const getMissingFieldsText = (missingFields: string[]): string => {
    if (missingFields.length === 0) return '';

    const fieldNames = missingFields.map(field => {
      switch (field) {
        case 'country': return 'Country';
        case 'city': return 'City';
        case 'phone': return 'Phone Number';
        default: return field;
      }
    });

    if (fieldNames.length === 1) {
      return fieldNames[0];
    } else if (fieldNames.length === 2) {
      return `${fieldNames[0]} and ${fieldNames[1]}`;
    } else {
      return `${fieldNames.slice(0, -1).join(', ')}, and ${fieldNames[fieldNames.length - 1]}`;
    }
  };

  const loadData = async () => {
    if (!user) {
      console.log('No user found, skipping load data');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading ads data for user:', user.uid);
      console.log('Starting Promise.all for data loading...');
      
      const [availableAds, stats, profile, completedIds] = await Promise.all([
        getAvailableAdsForUser(user.uid),
        getUserAdStats(user.uid),
        getUserProfile(user.uid),
        getUserCompletedAdIds(user.uid)
      ]);

      console.log('Promise.all completed successfully');
      console.log('Loaded data:', {
        availableAds: availableAds.length,
        adsArray: availableAds,
        stats,
        profile: !!profile,
        completedIds: completedIds.length
      });

      // 🔍 DEBUG: Log questions structure for each ad
      availableAds.forEach((ad, index) => {
        console.log(`🔍 Ad ${index + 1} (${ad.title}) questions:`, ad.questions);
        ad.questions.forEach((q, qIndex) => {
          console.log(`   📝 Question ${qIndex + 1}:`, {
            id: q.id,
            type: q.type,
            question: q.question,
            optionsLength: q.options?.length || 0,
            hasOptions: !!q.options
          });
        });
      });

      setAds(availableAds);
      setUserStats(stats);
      setUserProfile(profile);
      setCompletedAdIds(completedIds);
      
      console.log('State updated successfully');
    } catch (error) {
      console.error('Error loading ads data:', error);
      toast.error('Failed to load ads');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const loadCompletedAds = async () => {
    if (!user) return;

    try {
      setCompletedAdsLoading(true);
      console.log('Loading completed ads for user:', user.uid);
      
      // Get completed ad interactions with earnings
      const completedAdsData = await getCompletedAdsWithDetails(user.uid);
      
      console.log('Loaded completed ads:', completedAdsData);
      setCompletedAds(completedAdsData);
    } catch (error) {
      console.error('Error loading completed ads:', error);
      toast.error('Failed to load completed ads');
    } finally {
      setCompletedAdsLoading(false);
    }
  };

  const handleWatchAd = (ad: Ad) => {
    // Check if profile is complete before allowing ad watching
    if (!isProfileComplete(userProfile)) {
      const missingFields = getProfileMissingFields(userProfile);
      toast.error(`Please complete your profile first. Missing: ${getMissingFieldsText(missingFields)}`);
      return;
    }

    console.log('Opening ad for watching:', ad);
    console.log('Ad video URL:', ad.videoUrl);
    console.log('Ad preview image:', ad.previewImage);

    // Set watching state to enable page protection
    setIsWatchingAd(true);
    
    setSelectedAd(ad);
    setPhase('video');
    setVideoEnded(false);
    
    // Scroll to top when starting to watch video
    setTimeout(() => {
      scrollToTop();
    }, 100);
    setCurrentQuestionIndex(0);
    
    // 🔍 DEBUG: Initialize answers with proper debugging
    console.log('🎯 Initializing answers for ad:', ad.title);
    console.log('📝 Questions:', ad.questions);
    const initialAnswers = ad.questions.map(q => ({ questionId: q.id }));
    console.log('📋 Initial answers array:', initialAnswers);
    setAnswers(initialAnswers);
    
    setVideoProgress(0);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setIsVideoPlaying(false);

    // Show initial toast about protection
    toast('Ad session started. Please complete all questions to earn your reward!', {
      duration: 4000,
      icon: '📺'
    });
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    setIsVideoPlaying(false);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setVideoCurrentTime(currentTime);
      if (duration) {
        setVideoProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      console.log('Video metadata loaded, duration:', videoRef.current.duration);
      // Auto play after metadata loads
      videoRef.current.play().catch(error => {
        console.log('Auto-play prevented by browser:', error);
        // This is normal - browsers often prevent auto-play
      });
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuestions = () => {
    setPhase('questions');
  };

  const handleAnswerChange = (questionId: string, value: string | number, isTextAnswer: boolean = false) => {
    console.log('🔄 Answer change:', { questionId, value, isTextAnswer });
    console.log('📋 Current answers before update:', answers);
    
    setAnswers(prev => {
      const updated = prev.map(answer =>
        answer.questionId === questionId
          ? {
            ...answer,
            [isTextAnswer ? 'textAnswer' : 'selectedAnswer']: value,
          }
          : answer
      );
      console.log('📋 Updated answers:', updated);
      return updated;
    });
  };

  const nextQuestion = () => {
    if (selectedAd && currentQuestionIndex < selectedAd.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!selectedAd || !user) return;

    setIsSubmitting(true);
    try {
      // Prepare user contact details
      const userDetails = {
        email: userProfile?.email || user.email || '',
        phone: userProfile?.phone || undefined,
        address: userProfile?.city && userProfile?.country
          ? `${userProfile.city}, ${userProfile.country}`
          : undefined
      };

      const result = await watchAd(user.uid, selectedAd.id, answers, userDetails);
      setEarnedAmount(result.earnedAmount);
      setPhase('thankyou');
      
      // Clear watching state as ad is completed
      clearAdWatchingState();
      
      toast.success(`Great! You earned ${result.earnedAmount} FOG coins!`);

      // Add this ad to completed list
      setCompletedAdIds(prev => [...prev, selectedAd.id]);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToList = () => {
    // Clear watching state when going back to list
    window.location.reload();
    clearAdWatchingState();
    
    setPhase('list');
    setSelectedAd(null);
    loadData(); // Refresh data
    
    // Scroll to top when going back to ads list
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  const goToProfile = () => {
    navigateWithScroll('profile');
  };

  const replacePlaceholders = (text: string): string => {
    if (!userProfile) return text;

    return text
      .replace(/\{userName\}/g, userProfile.name || userProfile.displayName || 'User')
      .replace(/\{userAge\}/g, 'N/A') // Age property not available in UserProfile
      .replace(/\{userLocation\}/g, userProfile.city && userProfile.country ? `${userProfile.city}, ${userProfile.country}` : 'N/A');
  };

  // Get current question and answer
  const currentQuestion = selectedAd?.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isCurrentQuestionAnswered = currentAnswer &&
    (currentAnswer.selectedAnswer !== undefined || currentAnswer.textAnswer?.trim());

  // 🔍 DEBUG: Log current answer lookup
  console.log('🎯 Current Question Answer Debug:');
  console.log('📝 Current question ID:', currentQuestion?.id);
  console.log('📋 All answers:', answers);
  console.log('🎯 Found current answer:', currentAnswer);
  console.log('✅ Is answered:', isCurrentQuestionAnswered);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg-primary]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[--color-text-primary] mb-4">Please Login</h2>
          <p className="text-[--color-text-secondary] mb-6">You need to be logged in to watch ads and earn rewards.</p>
          <Button onClick={() => navigateWithScroll('auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Render different phases
  if (phase === 'video' && selectedAd) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <AnimatedBackground />

        <div className="relative z-10 py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 dark:border-white/10 flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowExitWarning(true)} className="flex items-center gap-2 text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Ads</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <h2 className="text-base sm:text-lg font-bold text-[--color-text-primary] text-center flex-1 mx-2 truncate">{selectedAd.title}</h2>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 whitespace-nowrap">
                  <Gift className="w-4 h-4" />
                  {selectedAd.totalReward} FOG Coins
                </div>
              </div>

              {/* Video Section */}
              <div className="p-2 md:p-6">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-4 relative">
                {selectedAd.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={selectedAd.videoUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                      preload="metadata"
                      onEnded={handleVideoEnded}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onLoadStart={() => console.log('Video load started')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => {
                        console.error('Video error:', e);
                        console.log('Video URL:', selectedAd.videoUrl);
                        const video = e.target as HTMLVideoElement;
                        console.log('Video error details:', video.error);
                        toast.error('Error loading video. Please try again.');
                        // Set video ended to allow proceeding
                        setVideoEnded(true);
                      }}
                    />

                    {/* Play Button Overlay */}
                    {!isVideoPlaying && !videoEnded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.play().catch(error => {
                                console.error('Error playing video:', error);
                                toast.error('Unable to play video automatically. Please check your media permissions.');
                              });
                            }
                          }}
                          className="bg-white/90 hover:bg-white text-black rounded-full p-4"
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                    )}

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 md:bottom-4 left-4 right-4">
                      {/* Progress Bar */}
                      <div className="bg-black/50 rounded-lg p-1 md:p-3">
                        <div className="flex items-center gap-3 mb-0 md:mb-2">
                          <span className="text-white text-sm font-medium">
                            {isVideoPlaying ? (
                              <div className="flex items-center gap-1">
                                <Pause className="w-3 h-3" />
                                Playing
                              </div>
                            ) : videoEnded ? (
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Completed
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Paused
                              </div>
                            )}
                          </span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* {!videoEnded && (
                          <div className="text-center">
                            <p className="text-white/80 text-sm">
                              Watch the complete video to continue
                            </p>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No video available</p>
                      <Button onClick={() => setVideoEnded(true)} className="mt-4">
                        Continue to Questions
                      </Button>
                    </div>
                  </div>
                )}
              </div>

                {selectedAd.description && (
                  <p className="text-[--color-text-secondary] mb-4">{selectedAd.description}</p>
                )}

                {videoEnded ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Button onClick={startQuestions} className="px-8 py-3">
                      Start Questions
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center text-[--color-text-secondary]">
                    <Clock className="w-4 h-4 mr-2" />
                    Please watch the content completely to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'questions' && selectedAd && currentQuestion) {
    // 🔍 DEBUG: Log current question data structure
    console.log('🔍 Current Question Debug Info:');
    console.log('📋 All questions:', selectedAd.questions);
    console.log('📝 Current question index:', currentQuestionIndex);
    console.log('🎯 Current question object:', currentQuestion);
    console.log('🔤 Question type:', currentQuestion.type);
    console.log('📊 Question options:', currentQuestion.options);
    console.log('❓ Question text:', currentQuestion.question);

    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <AnimatedBackground />

        <div className="relative z-10 py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 dark:border-white/10 flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowExitWarning(true)} className="flex items-center gap-2 text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Ads</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <h2 className="text-base sm:text-lg font-bold text-[--color-text-primary] text-center flex-1 mx-2 truncate">{selectedAd.title}</h2>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 whitespace-nowrap">
                  <Gift className="w-4 h-4" />
                  {selectedAd.totalReward} FOG Coins
                </div>
              </div>

              {/* Progress */}
              <div className="p-6 border-b border-white/20 dark:border-white/10">
                <div className="flex justify-between text-sm font-medium text-[--color-text-secondary] mb-2">
                  <span>Question {currentQuestionIndex + 1} of {selectedAd.questions.length}</span>
                  <span className="font-bold">{Math.round(((currentQuestionIndex + 1) / selectedAd.questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-[--color-primary] to-[--color-accent]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / selectedAd.questions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-[--color-text-primary] mb-4 sm:mb-6">
                  {replacePlaceholders(currentQuestion.question)}
                </h3>

              {(currentQuestion.type === 'multiple-choice' || (!currentQuestion.type && currentQuestion.options && currentQuestion.options.length > 0)) && currentQuestion.options && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`${currentQuestion.id}_${index}`}
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={currentAnswer?.selectedAnswer === index}
                        onChange={(e) => {
                          console.log('🔘 Radio button clicked:', { 
                            questionId: currentQuestion.id, 
                            selectedIndex: index, 
                            value: parseInt(e.target.value),
                            currentSelectedAnswer: currentAnswer?.selectedAnswer 
                          });
                          handleAnswerChange(currentQuestion.id, parseInt(e.target.value));
                        }}
                        className="w-4 h-4 text-[--color-primary] border-[--color-border] focus:ring-[--color-primary]"
                      />
                      <label
                        htmlFor={`${currentQuestion.id}_${index}`}
                        className="text-[--color-text-primary] cursor-pointer flex-1"
                      >
                        {replacePlaceholders(option)}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'feedback' || (!currentQuestion.type && (!currentQuestion.options || currentQuestion.options.length === 0))) && (
                <>
                  <div className="mb-6">
                    <Textarea
                      value={currentAnswer?.textAnswer || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, true)}
                      placeholder="Please provide your feedback..."
                      className="w-full min-h-[100px]"
                      maxLength={500}
                    />
                  </div>

                  {/* User Details Section - Only show on feedback question */}
                  <div className="mb-6 p-4 bg-[--color-bg-secondary] rounded-lg border">
                    <h4 className="text-md font-semibold text-[--color-text-primary] mb-4">
                      Contact Information (Required for Ad Completion)
                    </h4>
                    <div className="space-y-3">
                      {/* Email */}
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-[--color-primary] rounded flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[--color-text-secondary]">Share email:</span>
                        <span className="text-sm text-[--color-text-primary]">
                          {userProfile?.email || user?.email || 'N/A'}
                        </span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-[--color-primary] rounded flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[--color-text-secondary]">Share phone:</span>
                        <span className="text-sm text-[--color-text-primary]">
                          {userProfile?.phone || 'Please update your phone in profile settings'}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-[--color-primary] rounded flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[--color-text-secondary]">Share address:</span>
                        <span className="text-sm text-[--color-text-primary]">
                          {userProfile?.city && userProfile?.country
                            ? `${userProfile.city}, ${userProfile.country}`
                            : 'Please update your address in profile settings'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> This information will be shared with the advertiser to help them understand their audience and improve their services. Your privacy is important to us.
                      </p>
                    </div>
                  </div>
                </>
              )}

                {/* Next Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={nextQuestion}
                    disabled={!isCurrentQuestionAnswered || isSubmitting}
                    className="px-8 py-3"
                  >
                    {isSubmitting ? 'Submitting...' :
                      currentQuestionIndex === selectedAd.questions.length - 1 ? 'Submit Answers' : 'Next Question'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'thankyou') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center py-6">
          <div className="max-w-2xl mx-auto px-4 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <Check className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-black text-[--color-text-primary] mb-4">
                Thank You!
              </h2>

              <p className="text-lg text-[--color-text-secondary] mb-6">
                You have successfully completed the ad and answered all questions.
              </p>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-green-500/20 border-2 border-yellow-500/30 rounded-2xl p-4 sm:p-6 mb-8"
              >
                <div className="flex items-center justify-center gap-3 text-yellow-600 dark:text-yellow-400">
                  <Gift className="w-6 sm:w-7 h-6 sm:h-7" />
                  <span className="font-black text-xl sm:text-2xl">You earned {earnedAmount} FOG Coins!</span>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button variant="outline" onClick={goBackToList} className="w-full sm:w-auto px-8">
                  Watch More Ads
                </Button>
                <Button onClick={goToProfile} className="flex items-center gap-2 w-full sm:w-auto justify-center px-8">
                  <User className="w-4 h-4" />
                  Go to Profile
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Default list view
  console.log('Rendering WatchAdPage with state:', {
    loading,
    adsLength: ads.length,
    hasUser: !!user,
    phase,
    hasSelectedAd: !!selectedAd
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 text-center overflow-hidden">
          {/* Back Button */}
          <div className="container mx-auto px-4 pt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigateWithScroll('home')}
                className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="container mx-auto px-4"
          >
            <motion.div
              className="inline-flex items-center justify-center text-6xl mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              📺
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-[--color-text-primary]">
              Watch Ads &  
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-accent]">
               Earn FOG Coins
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-[--color-text-secondary] max-w-3xl mx-auto mb-12 font-medium opacity-80">
             Complete ads and answer quick questions to earn FOG Coins. Turn your time into passive income online with FOGSLY’s secure digital earning platform.
            </p>
          </motion.div>
        </section>

        {/* Profile Completion Warning */}
        {!loading && userProfile && !isProfileComplete(userProfile) && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Complete Your Profile to Watch Ads
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  To ensure quality ad experiences and proper targeting, please complete your profile information.
                  You're missing: <strong>{getMissingFieldsText(getProfileMissingFields(userProfile))}</strong>.
                </p>
                {/* <div className="flex flex-wrap gap-3 mb-4">
                  {getProfileMissingFields(userProfile).map(field => (
                    <div key={field} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      {field === 'country' && <Globe className="w-4 h-4" />}
                      {field === 'city' && <MapPin className="w-4 h-4" />}
                      {field === 'phone' && <Phone className="w-4 h-4" />}
                      <span className="capitalize">{field === 'phone' ? 'Phone Number' : field}</span>
                    </div>
                  ))}
                </div> */}
                <button
                  onClick={() => navigateWithScroll('profile')}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Complete Profile Now
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        )}

        {/* Ads Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Section Title */}
            <div className="flex justify-between items-center mb-10 flex-wrap gap-6">
              <h2 className="text-5xl font-black text-center md:text-start" style={{ color: 'var(--color-text-primary)' }}>
                {activeTab === 'available' ? 'Available Ads' : 'Completed Ads'}
              </h2>
            </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.totalAdsWatched || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Ads Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.totalEarned || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userProfile?.balance || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Available Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[--color-text-primary]">{userStats?.todaysCount || 0}</p>
                  <p className="text-[--color-text-secondary] text-sm">Today's Count</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

            {/* Tab Navigation */}
            <div className="flex justify-start space-x-1 backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-full p-1.5 mb-10 w-fit shadow-lg">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-3 px-8 text-base font-bold rounded-full transition-all ${
                  activeTab === 'available'
                    ? 'bg-[--color-primary] text-white shadow-md'
                    : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                }`}
              >
                Available Ads ({ads.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-3 px-8 text-base font-bold rounded-full transition-all ${
                  activeTab === 'completed'
                    ? 'bg-[--color-primary] text-white shadow-md'
                    : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                }`}
              >
                Completed Ads ({completedAds.length})
              </button>
            </div>

            {/* Available Ads Tab */}
            {activeTab === 'available' && (
              <>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-pulse">
                        <div className="h-64 bg-[--color-bg-tertiary] rounded-t-3xl"></div>
                        <div className="p-5">
                          <div className="h-6 bg-[--color-bg-tertiary] rounded-lg mb-3"></div>
                          <div className="h-4 bg-[--color-bg-tertiary] rounded-lg w-3/4 mb-4"></div>
                          <div className="h-10 bg-[--color-bg-tertiary] rounded-xl"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ads.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl text-center py-24 mt-10">
                    <div className="text-7xl mb-7 opacity-40">📭</div>
                    <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
                      No Ads Available
                    </h3>
                    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                      There are no ads available for you to watch right now. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
                    {ads.map((ad) => {
                      const missingFields = getProfileMissingFields(userProfile);
                      const isDisabled = missingFields.length > 0;
                      const disabledReason = isDisabled
                        ? `Complete your profile first. Missing: ${getMissingFieldsText(missingFields)}`
                        : undefined;

                      return (
                        <AdCard
                          key={ad.id}
                          ad={ad}
                          isCompleted={completedAdIds.includes(ad.id)}
                          isDisabled={isDisabled}
                          disabledReason={disabledReason}
                          onWatch={handleWatchAd}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Completed Ads Tab */}
            {activeTab === 'completed' && (
              <>
                {completedAdsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-pulse">
                        <div className="h-64 bg-[--color-bg-tertiary] rounded-t-3xl"></div>
                        <div className="p-5">
                          <div className="h-6 bg-[--color-bg-tertiary] rounded-lg mb-3"></div>
                          <div className="h-4 bg-[--color-bg-tertiary] rounded-lg w-3/4 mb-4"></div>
                          <div className="h-10 bg-[--color-bg-tertiary] rounded-xl"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : completedAds.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl text-center py-24 mt-10">
                    <div className="text-7xl mb-7 opacity-40">✅</div>
                    <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
                      No Completed Ads
                    </h3>
                    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                      You haven't completed any ads yet. Start watching ads to earn FOG coins!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
                    {completedAds.map((ad) => (
                      <CompletedAdCard
                        key={ad.id}
                        ad={ad}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[--color-bg-primary] rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-[--color-text-primary]">
                  Exit Ad Session?
                </h3>
              </div>
              
              <p className="text-[--color-text-secondary] mb-6">
                You are currently watching an ad. Please complete all questions to earn your reward. 
                If you leave now, you won't receive any FOG coins for this ad.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowExitWarning(false)}
                  className="px-4 py-2"
                >
                  Stay & Continue
                </Button>
                <Button
                  onClick={() => {
                    setShowExitWarning(false);
                    goBackToList();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  Leave Session
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchAdPage;
