// FogslyEcosystemShowcase.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { getTotalUsersCount } from '../firebase/services/userService';
import { getTotalUserCount } from '@/firebase/services/rankingService';

type Route = string;

type CardType = {
  title: string;
  desc: string;
  icon: string;
  route: Route;
  requiresAuth: boolean;
  comingSoon?: boolean;
};

const cardsData: Array<CardType> = [
  // Active modules (in order) - First row: Watch Ads | Freelance Hub | Fog Jobs | Fog e-Services
  { title: "Watch Ads + Q&A", desc: "Watch ads and earn Fog Coins rewards online. Turn your time into passive income with our secure digital earning platform.", icon: "/images/eco-icons/watch-ads.png", route: "watch-ads", requiresAuth: true, comingSoon: false },
  { title: "Freelance Hub", desc: "Hire skilled freelancers or offer your professional services on a trusted global freelance marketplace for remote work and online earning.", icon: "/images/eco-icons/freelance-hub.png", route: "find-work", requiresAuth: false, comingSoon: false },
  { title: "Fog Jobs", desc: "Find or request to post global online jobs, freelance gigs, and advertising opportunities for content creation and digital projects with ease.", icon: "/images/eco-icons/fog-jobs.png", route: "fog-jobs", requiresAuth: false, comingSoon: false },
  { title: "Fog e-Services", desc: "Find or request to post global online jobs, freelance gigs, and advertising opportunities for content creation and digital projects with ease.", icon: "/images/eco-icons/fog-services.png", route: "fog-services", requiresAuth: false, comingSoon: false },
  { title: "Fog Coins", desc: "Earn, trade, invest, or get paid instantly with Fog Coins, a secure and flexible digital currency powering the Fogsly earning ecosystem.", icon: "/images/eco-icons/fog-coins.png", route: "fog-coins", requiresAuth: false, comingSoon: false },
  { title: "Referral System", desc: "Earn, trade, invest, or get paid instantly with Fog Coins, a secure and flexible digital currency powering the Fogsly earning ecosystem.", icon: "/images/eco-icons/referral-sysem.png", route: "referrals", requiresAuth: true, comingSoon: false },
  { title: "Events & Expo", desc: "Discover and attend professional events, workshops, expos, and networking opportunities in your local area and beyond.", icon: "/images/eco-icons/events-expo.png", route: "events", requiresAuth: false, comingSoon: false },

  // Coming Soon modules
  { title: "Tasker Hub", desc: "Quick micro transactions. Hire or earn by completing short, local, physical or online tasks.", icon: "/images/eco-icons/tasker-hub.png", route: "tasker-hub", requiresAuth: false, comingSoon: true },
  { title: "Fog Shop", desc: "Mini e-commerce solution. Create your own store to sell products or provide services.", icon: "/images/eco-icons/fog-shop.png", route: "home", requiresAuth: false, comingSoon: true },
  { title: "Gamification", desc: "Conquer challenges, earn badges, and climb leaderboards for a fun, rewarding experience", icon: "/images/eco-icons/gamification.png", route: "home", requiresAuth: false, comingSoon: true },
  { title: "Built-in AI Tools", desc: "Chat with our AI assistant to get help, ask questions, and learn about Fogsly platform features", icon: "/images/eco-icons/built-in-ai-tools.png", route: "ai-assistant", requiresAuth: false, comingSoon: false },
];

export const popupData = {
  "Events & Expo": {
    title: "Events & Expo",
    description:
      "Discover and attend exciting events, workshops, and networking opportunities in your area. Connect with like-minded professionals, learn new skills, and expand your network through our curated event listings.",
    icon: "/images/eco-icons/events-expo.png",
  },
  "Watch Ads + Q&A": {
    title: "Watch Ads + Q&A",
    description:
      "Watch ads to earn rewards in Fog Coins. This feature is launching soon! Be among the first to start earning through our unique ad-watching system and turn your time into passive income.",
    icon: "/images/eco-icons/watch-ads.png",
  },
  "Freelance Hub": {
    title: "Freelance Hub",
    description:
      "A global marketplace to hire skilled freelancers or offer your services. Secure payments, job matching, and robust reviews. Connect with professionals worldwide, post projects with detailed requirements, receive competitive bids, and manage everything from our intuitive dashboard. Whether you're a client seeking talent or a freelancer looking for opportunities, our platform provides the tools you need to succeed.",
    icon: "/images/eco-icons/freelance-hub.png",
  },
  "Tasker Hub": {
    title: "Tasker Hub",
    description:
      "A micro-task marketplace to earn or hire for small, quick, local or online tasks. Perfect for quick gigs like data entry, surveys, testing, deliveries, and more. Earn extra income by completing tasks on your schedule, or find reliable help for those small jobs that need to get done. Fast payments, easy coordination, and a rating system ensure quality on both sides.",
    icon: "/images/eco-icons/tasker-hub.png",
  },
  "Fog Shop": {
    title: "Fog Shop",
    description:
      "Create a mini store and sell products with FOG Coins support. Launch your e-commerce presence without the complexity. Customize your storefront, manage inventory, process orders, and accept payments in FOG Coins or traditional methods. Perfect for entrepreneurs, small businesses, and creators looking to monetize their products and services with minimal overhead.",
    icon: "/images/eco-icons/fog-shop.png",
  },
  "Fog Jobs": {
    title: "Fog Jobs",
    description:
      "Find global job postings or promote opportunities for content creation and other projects. Browse full-time, part-time, contract, and remote positions across multiple industries. Employers can post detailed job listings, screen candidates, and hire with confidence. Job seekers get access to opportunities worldwide with powerful search and filtering tools.",
    icon: "/images/eco-icons/fog-jobs.png",
  },
  "Built-in AI Tools": {
    title: "Built-in AI Tools",
    description:
      "Chat with our intelligent AI assistant to get instant help with Fogsly platform features. Ask questions about modules, learn how to maximize your earnings, get guidance on using different features, and receive personalized recommendations. Available 24/7 to assist you.",
    icon: "/images/eco-icons/built-in-ai-tools.png",
  },
  "Gamification": {
    title: "Gamification",
    description:
      "Earn badges, complete challenges, and climb leaderboards for a fun, rewarding experience. Engage with our platform in exciting new ways as you level up, unlock achievements, and compete with others. Complete daily challenges, earn exclusive rewards, and showcase your progress. Gamification makes every interaction more enjoyable while motivating you to explore all features.",
    icon: "/images/eco-icons/gamification.png",
  },
};

interface FogslyEcosystemShowcaseProps {
  navigate: (route: Route) => void;
  isLoggedIn?: boolean;
}

const FogslyEcosystemShowcase: React.FC<FogslyEcosystemShowcaseProps> = ({ navigate, isLoggedIn = false }) => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  // EASILY CONFIGURABLE TARGET DATE AND TIME FOR WATCH ADS
  // Change these values to set your desired launch time
  const LAUNCH_YEAR = 2026;
  const LAUNCH_MONTH = 0; // December (0-indexed, so 11 = December)
  const LAUNCH_DAY = 27;
  const LAUNCH_HOUR = 20;  // 10 PM in 24-hour format
  const LAUNCH_MINUTE = 0;
  const LAUNCH_SECOND = 0;



  // Check if already unlocked on initial load
  const targetDate = new Date(LAUNCH_YEAR, LAUNCH_MONTH, LAUNCH_DAY, LAUNCH_HOUR, LAUNCH_MINUTE, LAUNCH_SECOND);
  const isAlreadyUnlocked = new Date().getTime() >= targetDate.getTime();

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [isEventsUnlocked, setIsEventsUnlocked] = useState(isAlreadyUnlocked);
  const [hasShownCongratsPopup, setHasShownCongratsPopup] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const congratsRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const checkCongratsPopupStatus = async () => {
      try {
        // Try window.storage first
        if (window.storage) {
          const result = await window.storage.get('events-expo-congrats-shown');
          console.log('Storage check result:', result);
          if (result && result.value === 'true') {
            console.log('Congrats popup was already shown, not showing again');
            setHasShownCongratsPopup(true);
            return;
          }
        }

        // Fallback to localStorage
        const localStorageValue = localStorage.getItem('events-expo-congrats-shown');
        console.log('LocalStorage check result:', localStorageValue);
        if (localStorageValue === 'true') {
          console.log('Congrats popup was already shown (from localStorage), not showing again');
          setHasShownCongratsPopup(true);
        } else {
          console.log('Congrats popup has not been shown yet');

          // If the launch time has already passed and user hasn't seen popup, show it now
          if (isAlreadyUnlocked) {
            console.log('Launch time already passed, showing congrats popup for first-time visitor');
            setShowCongratsPopup(true);
          }
        }
      } catch (error) {
        // Key doesn't exist yet, which is fine
        console.log('No congrats popup status found (first time), will show if unlocked', error);

        // If the launch time has already passed and user hasn't seen popup, show it now
        if (isAlreadyUnlocked) {
          console.log('Launch time already passed, showing congrats popup for first-time visitor');
          setShowCongratsPopup(true);
        }
      }
    };

    checkCongratsPopupStatus();
  }, [isAlreadyUnlocked]);



  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const count = await getTotalUserCount();
        setTotalUsers(count);
      } catch (error) {
        console.error('Error fetching users count:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check if congrats popup has been shown before




    // Initial fetch
    fetchUsersCount();

    // Set up interval to refresh every 1 minute (60000ms)
    const intervalId = setInterval(() => {
      fetchUsersCount();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Countdown timer effect - Configurable target time for Watch Ads
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isEventsUnlocked) {
          setIsEventsUnlocked(true);
          console.log('Events & Expo unlocked! hasShownCongratsPopup:', hasShownCongratsPopup);
          // Only show popup if it hasn't been shown before
          if (!hasShownCongratsPopup) {
            console.log('Showing congrats popup for the first time');
            setShowCongratsPopup(true);
          } else {
            console.log('NOT showing congrats popup - already shown before');
          }
        }
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEventsUnlocked, hasShownCongratsPopup]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopup(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const activeCards = useMemo(() => cardsData.filter((c) => !c.comingSoon), []);
  const comingSoonCards = useMemo(() => cardsData.filter((c) => c.comingSoon), []);

  // Events & Expo is now time-based instead of user-count based
  const isEventsAvailable = isEventsUnlocked;

  const getPopupContent = (title: string) => popupData[title];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setActivePopup(null);
  };

  const handleCongratsOverlayClick = (e: React.MouseEvent) => {
    if (e.target === congratsRef.current) setShowCongratsPopup(false);
  };

  // Mark congrats popup as shown when it's closed
  const closeCongratsPopup = async () => {
    try {
      console.log('Closing congrats popup and saving to storage');

      // Try window.storage first
      if (window.storage) {
        const result = await window.storage.set('events-expo-congrats-shown', 'true');
        console.log('Storage set result:', result);
      }

      // Also save to localStorage as backup
      localStorage.setItem('events-expo-congrats-shown', 'true');
      console.log('Saved to localStorage successfully');

      setHasShownCongratsPopup(true);
      setShowCongratsPopup(false);
    } catch (error) {
      console.error('Error saving congrats popup status:', error);
      // Even if storage fails, try localStorage
      try {
        localStorage.setItem('events-expo-congrats-shown', 'true');
        console.log('Fallback: Saved to localStorage');
      } catch (localError) {
        console.error('LocalStorage also failed:', localError);
      }
      setShowCongratsPopup(false);
    }
  };

  return (
    <section id="fogsly-ecosystem" className=" py-16 px-5 md:px-0 lg:px-10 mx-auto  bg-[--color-bg-primary] overflow-hidden relative">
      {/* Animated gradient backgrounds that scroll with the page */}
      {/* Top left gradient - original position */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          top: '30%',
          left: '18%'
        }}
        animate={{
          x: [0, 50, -30, 40, 0],
          y: [0, -50, 30, 20, 0],
          scale: [1, 1.1, 0.9, 1.05, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom right gradient - original position */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          bottom: '22%',
          right: '18%'
        }}
        animate={{
          x: [0, -40, 30, -20, 0],
          y: [0, 40, -30, 20, 0],
          scale: [1, 0.9, 1.1, 0.95, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />

      {/* Additional gradients for whole component coverage */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full opacity-45 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
          top: '10%',
          right: '10%'
        }}
        animate={{
          x: [0, -30, 40, -25, 0],
          y: [0, 30, -40, 15, 0],
          scale: [1, 1.05, 0.95, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-45 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          top: '60%',
          left: '5%'
        }}
        animate={{
          x: [0, 40, -35, 30, 0],
          y: [0, -40, 35, -20, 0],
          scale: [1, 0.95, 1.1, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          top: '80%',
          right: '25%'
        }}
        animate={{
          x: [0, 35, -25, 20, 0],
          y: [0, -25, 35, -30, 0],
          scale: [1, 1.1, 0.9, 1.05, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 12 }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.p
          className='text-md text-[--color-text-secondary]  max-w-3xl mx-auto text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Your Complete Online Earning Ecosystem
        </motion.p>

        <motion.h2
          className='text-4xl md:text-5xl font-bold mb-2 text-[--color-text-primary] text-center italic'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          One Platform. <span className='text-[--color-primary]'>Infinite Earning Opportunities </span>
        </motion.h2>

        <motion.p
          className='text-lg text-[--color-text-secondary] mb-12 max-w-3xl mx-auto text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A Suite of Interconnected Digital Tools Designed for Freelancing, Online Tasks & E-Commerce
        </motion.p>

        {/* Active Modules Section */}
        <div className="flex flex-wrap gap-6 max-w-7xl mx-auto relative ecosystem-grid mb-16 justify-center">
          <style>{`
            @media (max-width: 767px) {
              .ecosystem-grid > * {
                width: 100%;
              }
            }
            @media (min-width: 768px) and (max-width: 1023px) {
              .ecosystem-grid > * {
                width: calc(50% - 12px);
              }
            }
            @media (min-width: 1024px) {
              .ecosystem-grid > * {
                width: calc(25% - 18px);
              }
            }
            @media (max-width: 767px) {
              .coming-soon-grid > * {
                width: 100%;
              }
            }
            @media (min-width: 768px) and (max-width: 1023px) {
              .coming-soon-grid > * {
                width: calc(50% - 12px);
              }
            }
            @media (min-width: 1024px) {
              .coming-soon-grid > * {
                width: calc(25% - 18px);
              }
            }
          `}</style>

          {activeCards.map((card, index) => (
            <motion.div
              key={card.title}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div
                className={`bg-[--color-bg-marketplace] backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col items-center text-center border border-2 border-[--color-border] shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-[--color-primary] hover:scale-105 hover:-translate-y-1
      
              ${card.comingSoon ? 'comingSoonCard' : ''}`}
              >

                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-[--color-primary]/10 to-[--color-secondary]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <img src={card.icon} alt="" className="w-20 h-20 transition-transform duration-300 group-hover:rotate-12" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 text-[--color-primary]">{card.title}</h3>

                {/* Description */}
                <p className={`text-sm text-[--color-text-marketplace] flex-grow mb-4 leading-relaxed 
                  ${card.comingSoon ? 'comingSoonCard-content' : ''}`}>
                  {card.desc}
                </p>

                {/* Buttons */}
                {/* Buttons */}
                {card.title === "Events & Expo" ? (
                  <div className="mt-auto w-full">
                    {isEventsAvailable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sessionStorage.setItem('return-to-ecosystem', 'true');
                          if (card.requiresAuth && !isLoggedIn) navigate('auth');
                          else navigate(card.route);
                        }}
                        className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] hover:opacity-90 text-sm font-semibold rounded-lg'
                      >
                        {card.requiresAuth && !isLoggedIn ? 'Login to Explore' : 'Click to Explore'}
                      </button>
                    ) : (
                      <button
                        className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] text-sm font-semibold rounded-lg opacity-70 cursor-not-allowed'
                        title={`Launches in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}
                        onClick={(e) => { e.stopPropagation(); setActivePopup(card.title); }}
                      >
                        Launches in {countdown.days}d:{countdown.hours}h:{countdown.minutes}m:{countdown.seconds}s
                      </button>
                    )}
                  </div>
                ) : card.title === "Watch Ads + Q&A" ? (
                  <div className="mt-auto w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sessionStorage.setItem('return-to-ecosystem', 'true');
                        if (!isLoggedIn) navigate('auth');
                        else navigate(card.route);
                      }}
                      className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] hover:opacity-90 text-sm font-semibold rounded-lg'
                    >
                      {isLoggedIn ? 'Click to Explore' : 'Login to Explore'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sessionStorage.setItem('return-to-ecosystem', 'true');
                        if (card.requiresAuth && !isLoggedIn) navigate('auth');
                        else navigate(card.route);
                      }}
                      className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] hover:opacity-90 text-sm font-semibold rounded-lg'
                    >
                      {card.requiresAuth && !isLoggedIn ? 'Login to Explore' : 'Click to Explore'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        {comingSoonCards.length > 0 && (
          <>
            <motion.h2
              className='text-4xl md:text-5xl font-bold mb-12 text-[--color-text-primary] text-center italic mt-16'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Coming <span className='text-[--color-primary]'>Soon</span>
            </motion.h2>

            <div className="flex flex-wrap gap-6 max-w-7xl mx-auto relative coming-soon-grid justify-center">
              {comingSoonCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div
                    className={`bg-[--color-bg-marketplace] backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col items-center text-center border border-2 border-[--color-border] shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-[--color-primary] hover:scale-105 hover:-translate-y-1 comingSoonCard`}
                  >
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[--color-primary]/10 to-[--color-secondary]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <img src={card.icon} alt="" className="w-20 h-20 transition-transform duration-300 group-hover:rotate-12" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 text-[--color-primary]">{card.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-[--color-text-marketplace] flex-grow mb-4 leading-relaxed comingSoonCard-content">
                      {card.desc}
                    </p>

                    {/* Button */}
                    <div className="mt-auto w-full comingSoonCard-content">
                      {card.title === "Watch Ads + Q&A" ? (
                        loading ? (
                          <button
                            disabled
                            className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] text-sm font-semibold rounded-lg opacity-70 cursor-not-allowed'
                          >
                            Loading...
                          </button>
                        ) : isWatchAdsAvailable ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sessionStorage.setItem('return-to-ecosystem', 'true');
                              if (!isLoggedIn) navigate('auth');
                              else navigate(card.route);
                            }}
                            className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] hover:opacity-90 text-sm font-semibold rounded-lg'
                          >
                            {isLoggedIn ? 'Click to Explore' : 'Login to Explore'}
                          </button>
                        ) : (
                          <button
                            className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] text-sm font-semibold rounded-lg opacity-70 cursor-not-allowed'
                            title={`This feature will be unlocked after 1000 users. Currently at ${totalUsers.toLocaleString()} users • ${remaining.toLocaleString()} more to go`}
                            onClick={(e) => { e.stopPropagation(); setActivePopup(card.title); }}
                          >
                            Unlocks at {totalUsers.toLocaleString()}/1000
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopup(card.title);
                          }}
                          className='w-full px-4 py-2.5 bg-[--color-btn-marketplace] text-[--color-text-marketplace-btn] text-sm font-semibold rounded-lg opacity-90'
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Popup */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={overlayRef}
            onMouseDown={handleOverlayClick}
          >
            {/* Enhanced backdrop with image overlay and blur circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-black/75 backdrop-blur-lg"
              />


              {/* Optional pattern overlay */}
              <div
                className="absolute inset-0 opacity-7"
                style={{
                  backgroundImage: 'url(/images/backdrop-pattern.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>

            <motion.div
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Glass effect background layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-transparent backdrop-blur-xl" />

              {/* Solid background layer for better readability */}
              <div className="absolute inset-0 bg-[--color-bg-secondary]/98" />

              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[--color-primary]/40"
                style={{
                  boxShadow: '0 0 50px rgba(var(--color-primary-rgb, 59, 130, 246), 0.2)'
                }}
              />

              {/* Content container - Card Style */}
              <div className="relative p-6 md:p-8">

                {/* Close button - Top Right */}
                <button
                  onClick={() => setActivePopup(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[--color-popup-text] hover:text-[--color-primary] hover:bg-[--color-primary]/10 transition-all duration-200 z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Icon - Centered at Top */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[--color-primary]/20 blur-xl rounded-full" />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[--color-primary]/20 to-[--color-accent]/20 rounded-3xl p-4 border-2 border-[--color-primary]/30 shadow-2xl">
                      <img src={popupData[activePopup].icon} className="w-full h-full object-contain" alt="" />
                    </div>
                  </div>
                </div>

                {/* Title - Centered */}
                <h3 className="text-2xl md:text-3xl font-bold text-[--color-popup-text] mb-4 text-center drop-shadow-sm">
                  {popupData[activePopup].title}
                </h3>

                {/* Description - Centered */}
                <p className="text-sm md:text-base text-[--color-popup-text] opacity-90 leading-relaxed text-center mb-6  mx-auto">
                  {popupData[activePopup].description}
                </p>

                {/* Countdown Display - Only for Watch Ads + Q&A */}
                {/* Countdown Display - For Events & Expo and Watch Ads + Q&A */}
                {activePopup === "Events & Expo" && !isEventsAvailable && (
                  <div className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-[--color-primary]/10 border border-[--color-primary]/20">
                    <svg className="w-5 h-5 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex items-center gap-2 text-[--color-popup-text] font-semibold">
                      <span className="text-lg">{countdown.days}</span>
                      <span className="text-xs opacity-70">days</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.hours}</span>
                      <span className="text-xs opacity-70">hrs</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.minutes}</span>
                      <span className="text-xs opacity-70">min</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.seconds}</span>
                      <span className="text-xs opacity-70">sec</span>
                    </div>
                  </div>
                )}
                {activePopup === "Watch Ads + Q&A" && !isWatchAdsAvailable && (
                  <div className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-[--color-primary]/10 border border-[--color-primary]/20">
                    <svg className="w-5 h-5 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex items-center gap-2 text-[--color-popup-text] font-semibold">
                      <span className="text-lg">{countdown.days}</span>
                      <span className="text-xs opacity-70">days</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.hours}</span>
                      <span className="text-xs opacity-70">hrs</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.minutes}</span>
                      <span className="text-xs opacity-70">min</span>
                      <span className="opacity-50">:</span>
                      <span className="text-lg">{countdown.seconds}</span>
                      <span className="text-xs opacity-70">sec</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-[--color-primary]/20">
                  <button
                    onClick={() => setActivePopup(null)}
                    className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Got It!
                  </button>
                  <button
                    onClick={() => setActivePopup(null)}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-[--color-primary]/10 text-[--color-popup-text] border border-[--color-primary]/30 hover:bg-[--color-primary]/20 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Congratulations Popup - Events & Expo Launch */}
      <AnimatePresence>
        {showCongratsPopup && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={congratsRef}
            onMouseDown={handleCongratsOverlayClick}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" />

              {/* Optional pattern overlay */}
              <div
                className="absolute inset-0 opacity-7"
                style={{
                  backgroundImage: 'url(/images/backdrop-pattern.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>

            {/* Animated Party Poppers - Confetti Effect - Left Side */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`confetti-left-${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA', '#95E1D3'][i % 7],
                  top: `${15 + (i % 3) * 10}%`,
                  left: `${5 + (i % 8) * 5}%`,
                }}
                animate={{
                  y: [0, 600],
                  x: [0, (i % 2 === 0 ? 120 : -80)],
                  rotate: [0, 720],
                  opacity: [1, 0],
                  scale: [1, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.06,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                }}
              />
            ))}

            {/* Animated Party Poppers - Right Side */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`confetti-right-${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#FFB6B9', '#FEC8D8', '#FFDFD3', '#C7CEEA', '#B4F8C8', '#A0E7E5'][i % 6],
                  top: `${15 + (i % 3) * 10}%`,
                  right: `${5 + (i % 8) * 5}%`,
                }}
                animate={{
                  y: [0, 600],
                  x: [0, (i % 2 === 0 ? -120 : 80)],
                  rotate: [0, -720],
                  opacity: [1, 0],
                  scale: [1, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.06 + 0.2,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                }}
              />
            ))}

            {/* Top Burst Confetti */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`confetti-top-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#C780FA'][i % 5],
                  top: '10%',
                  left: `${30 + i * 3}%`,
                }}
                animate={{
                  y: [0, 400],
                  x: [0, (i - 7) * 30],
                  rotate: [0, 360],
                  opacity: [1, 0],
                  scale: [1.2, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.04,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            ))}

            {/* Popup Card */}
            <motion.div
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Glass effect background layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-transparent backdrop-blur-xl" />

              {/* Solid background layer for better readability */}
              <div className="absolute inset-0 bg-[--color-bg-secondary]/98" />

              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[--color-primary]/40"
                style={{
                  boxShadow: '0 0 50px rgba(var(--color-primary-rgb, 59, 130, 246), 0.2)'
                }}
              />

              {/* Content container */}
              <div className="relative p-8 md:p-10">
                {/* Close button - Top Right */}
                <button
                  onClick={closeCongratsPopup}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[--color-popup-text] hover:text-[--color-primary] hover:bg-[--color-primary]/10 transition-all duration-200 z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Celebration Icon - Centered */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="relative"
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1.05, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <div className="absolute inset-0 bg-[--color-primary]/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[--color-primary]/20 to-[--color-accent]/20 rounded-3xl p-4 border-2 border-[--color-primary]/30 shadow-2xl flex items-center justify-center">
                      <span className="text-6xl md:text-7xl">🎉</span>
                    </div>
                  </motion.div>
                </div>

                {/* Title - Centered */}
                <h3 className="text-3xl md:text-4xl font-bold text-[--color-popup-text] mb-3 text-center drop-shadow-sm">
                  Congratulations! 🎊
                </h3>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl font-semibold text-[--color-primary] mb-4 text-center">
                  Events & Expo is Now Live!
                </p>

                {/* Description */}
                <p className="text-sm md:text-base text-[--color-popup-text] opacity-90 leading-relaxed text-center mb-6 max-w-xl mx-auto">
                  Discover amazing workshops, conferences, and networking opportunities. Connect with like-minded professionals, learn new skills, and expand your network through our curated event listings.
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-[--color-primary]/10 border border-[--color-primary]/20 text-[--color-popup-text] text-sm font-medium">
                    🎪 Live Events
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-[--color-primary]/10 border border-[--color-primary]/20 text-[--color-popup-text] text-sm font-medium">
                    🎯 Workshops
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-[--color-primary]/10 border border-[--color-primary]/20 text-[--color-popup-text] text-sm font-medium">
                    🤝 Networking
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-[--color-primary]/20">
                  <button
                    onClick={() => {
                      closeCongratsPopup();
                      navigate('events');
                    }}
                    className="flex-1 px-6 py-3.5 rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Explore Events Now →
                  </button>
                  <button
                    onClick={closeCongratsPopup}
                    className="px-6 py-3.5 rounded-xl text-sm md:text-base font-semibold bg-[--color-primary]/10 text-[--color-popup-text] border border-[--color-primary]/30 hover:bg-[--color-primary]/20 transition-all duration-200"
                  >
                    Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section >
  );
};

export default FogslyEcosystemShowcase;