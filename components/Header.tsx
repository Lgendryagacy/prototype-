import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  PlayCircle,
  BadgeDollarSign,
  LogOut,
  LogIn,
  Sparkles,
  HeadphonesIcon,
  Home,
  UserCircle,
  HelpCircle,
  Settings,
  Clipboard,
  Package,
  MessageCircle,
  Loader2,
  Gift,
  Bookmark,
  Briefcase,
  LucideLayoutDashboard,
  UserSearch,
  Users,
  Bell
} from 'lucide-react';
import { type Theme, type Route } from '../types';
import { Button } from './ui/Button';
import { User as FirebaseUser } from '../firebase/types/user';
import { getUserData } from '../firebase/services/userService';
import { subscribeToUnreadCount as subscribeToP2PUnreadCount, subscribeToConversations as subscribeToP2PConversations } from '../firebase/services/publicChatService';
import { subscribeToConversations as subscribeToBrandConversations } from '../firebase/services/messageService';
import { useScrollingNavigate } from '../utils/navigationUtils';
import { useBrand } from '../firebase/hooks/useBrand';
import { getUserEarnings } from '../firebase/services/earningsService';
import { formatFog } from '../utils/fogCoinUtils';

interface HeaderProps {
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  navigate: (route: Route, authMode?: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUser: FirebaseUser | null;
  enableBottomMobileBar?: boolean;
  currentRoute?: Route;
}



// Bottom navigation items for mobile
const bottomNavItems: { label: string; route: Route; icon: React.ReactNode; authRequired?: boolean; isMessagesButton?: boolean }[] = [
  { label: 'Home', route: 'home', icon: <Home className="w-5 h-5" /> },
  { label: 'Coin', route: 'fog-coins', icon: <BadgeDollarSign className="w-5 h-5" /> },
  { label: 'Messages', route: 'chat', icon: <MessageCircle className="w-5 h-5" />, authRequired: true, isMessagesButton: true },
  { label: 'Profile', route: 'profile', icon: <UserCircle className="w-5 h-5" />, authRequired: true },
];

const themeSwatches: { value: Theme; label: string; colorClass: string }[] = [
  { value: 'light', label: 'Light', colorClass: 'bg-white border border-slate-300' },
  { value: 'dark', label: 'Dark', colorClass: 'bg-[#081440] border border-[#489fff]' },
];



export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  setCurrentTheme,
  navigate,
  isLoggedIn,
  onLogout,
  currentUser,
  enableBottomMobileBar = true,
  currentRoute = 'home',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Array<{
    id: string;
    type: 'p2p' | 'brand';
    otherUser?: {
      id: string;
      displayName?: string;
      name?: string;
      avatar?: string;
    };
    brandData?: {
      brandId: string;
      brandName: string;
      brandLogo?: string;
    };
    lastMessage: string;
    unreadCount: number;
    timestamp: Date;
  }>>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Use brand hook to check if user has a brand
  const { brand, loading: brandLoading } = useBrand(currentUser?.uid);

  const navLinks: { label: string; route: Route; icon: React.ReactNode }[] = [
    { label: 'Community', route: 'community', icon: <Users className="w-5 h-5" /> },
    { label: 'Buy Coin', route: 'fog-coins', icon: <HeadphonesIcon className="w-5 h-5" /> },
    // { label: 'Help & Payments', route: 'customer-service', icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Dashboard', route: 'dashboard', icon: <LucideLayoutDashboard className="w-5 h-5" /> },
  ];

  // Mobile sidebar links - includes all modules
  const mobileSidebarLinks: { label: string; route: Route; icon: React.ReactNode }[] = [
    { label: 'Jobs', route: 'fog-jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Events', route: 'events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Community', route: 'community', icon: <Users className="w-5 h-5" /> },
    { label: 'Buy Coin', route: 'fog-coins', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { label: 'Help & Payments', route: 'customer-service', icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Dashboard', route: 'dashboard', icon: <LucideLayoutDashboard className="w-5 h-5" /> },
    { label: 'Fog e-Services', route: 'fog-services', icon: <Package className="w-5 h-5" /> },
    { label: 'Fog Coins', route: 'fog-coins', icon: <BadgeDollarSign className="w-5 h-5" /> },
    { label: 'Referral System', route: 'referral', icon: <Gift className="w-5 h-5" /> },
    { label: 'Freelance Hub', route: 'find-work', icon: <UserSearch className="w-5 h-5" /> },
  ];

  // Enhanced navigate function with scroll-to-top
  const navigateWithScroll = useScrollingNavigate(navigate);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser?.uid) {
        try {
          const userData = await getUserData(currentUser.uid);
          setIsAdmin(userData?.role === 'admin');
          setHasReferralCode(!!userData?.referralCode);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setHasReferralCode(false);
        }
      } else {
        setIsAdmin(false);
        setHasReferralCode(false);
      }
    };
    checkAdminStatus();
  }, [currentUser]);

  // Fetch user balance with auto-refresh every 1 minute
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!currentUser?.uid) {
        setUserBalance(0);
        setIsLoadingBalance(false);
        return;
      }

      try {
        setIsLoadingBalance(true);
        const userEarnings = await getUserEarnings(currentUser.uid);
        setUserBalance(userEarnings?.availableBalance || 0);
      } catch (error) {
        console.error('Error fetching user balance:', error);
        setUserBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    // Initial fetch
    fetchUserBalance();

    // Set up auto-refresh every 1 minute (60000 milliseconds)
    const intervalId = setInterval(() => {
      fetchUserBalance();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Subscribe to unread chat count and recent messages (both P2P and Brand)
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribers: (() => void)[] = [];
    let p2pUnreadCount = 0;
    let brandUnreadCount = 0;
    let p2pMessages: any[] = [];
    let brandMessages: any[] = [];

    // Subscribe to P2P conversations
    const unsubP2PCount = subscribeToP2PUnreadCount(currentUser.uid, (count) => {
      p2pUnreadCount = count;
      setUnreadCount(p2pUnreadCount + brandUnreadCount);
    });
    unsubscribers.push(unsubP2PCount);

    const unsubP2PConvos = subscribeToP2PConversations(currentUser.uid, (convos) => {
      // Get P2P conversations with unread messages
      p2pMessages = convos
        .filter(c => c.unreadCount[currentUser.uid] > 0)
        .map(c => {
          const otherUserId = c.participants.find((p: string) => p !== currentUser.uid);
          const otherUser = c.participantsData[otherUserId];
          return {
            id: c.id,
            type: 'p2p' as const,
            otherUser: otherUser ? {
              id: otherUserId,
              displayName: otherUser.displayName,
              name: otherUser.name,
              avatar: otherUser.avatar
            } : undefined,
            lastMessage: c.lastMessage?.text || 'Media file',
            unreadCount: c.unreadCount[currentUser.uid] || 0,
            timestamp: new Date(c.updatedAt)
          };
        });
      
      // Merge and sort all messages
      const merged = [...p2pMessages, ...brandMessages]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5); // Show top 5 recent messages
      setRecentMessages(merged);
    });
    unsubscribers.push(unsubP2PConvos);

    // Subscribe to Brand conversations
    const unsubBrandConvos = subscribeToBrandConversations(currentUser.uid, (convos) => {
      // Count unread brand messages
      brandUnreadCount = convos.reduce((sum, c) => {
        return sum + (c.unreadBy === 'user' ? c.unreadCount : 0);
      }, 0);
      setUnreadCount(p2pUnreadCount + brandUnreadCount);

      // Get brand conversations with unread messages
      brandMessages = convos
        .filter(c => c.unreadBy === 'user' && c.unreadCount > 0)
        .map(c => ({
          id: c.id,
          type: 'brand' as const,
          brandData: {
            brandId: c.brandId,
            brandName: c.brandName,
            brandLogo: c.brandLogo
          },
          lastMessage: c.lastMessage || 'New message',
          unreadCount: c.unreadCount,
          timestamp: c.lastMessageTime
        }));
      
      // Merge and sort all messages
      const merged = [...p2pMessages, ...brandMessages]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5); // Show top 5 recent messages
      setRecentMessages(merged);
    });
    unsubscribers.push(unsubBrandConvos);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add('overflow-hidden', 'touch-none');
    } else {
      document.documentElement.classList.remove('overflow-hidden', 'touch-none');
    }
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    if (showProfileDropdown || showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const toggleMobile = () => setMobileOpen(o => !o);

  const handleNavClick = (route: Route) => {
    if ((route === 'dashboard' || route === 'earnings-dashboard') && !isLoggedIn) {
      navigateWithScroll('auth', 'login');
    } else {
      navigateWithScroll(route);
    }
    setMobileOpen(false);
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      navigateWithScroll('admin-dashboard');
    } else {
      navigateWithScroll('profile');
    }
    setMobileOpen(false);
  };

  const handleBottomNavClick = (route: Route, authRequired?: boolean) => {
    if (authRequired && !isLoggedIn) {
      navigateWithScroll('auth');
    } else if (route === 'profile') {
      if (isAdmin) {
        navigateWithScroll('admin-dashboard');
      } else {
        navigateWithScroll('profile');
      }
    } else if (route === 'messages') {
      handleMessagesClick();
    } else {
      navigateWithScroll(route);
    }
  };

  const handleMessagesClick = () => {
    if (!isLoggedIn) {
      navigateWithScroll('auth', 'login');
      return;
    }

    if (brand && brand.status !== 'frozen') {
      navigateWithScroll('brand-messages');
    } else {
      navigateWithScroll('messages');
    }
  };

  const ThemeSelector = () => (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-[--color-bg-secondary]/70 backdrop-blur-sm">
        {themeSwatches.map(ts => (
          <motion.button
            key={ts.value}
            onClick={() => setCurrentTheme(ts.value)}
            className={`w-4 h-4 md:w-6 md:h-6 rounded-full transition-all border border-transparent ${currentTheme === ts.value
              ? 'ring-2 ring-[--color-primary] ring-offset-2 ring-offset-[--color-bg-secondary]'
              : 'hover:ring-2 hover:ring-[--color-primary]/50'
              } ${ts.colorClass}`}
            aria-label={`${ts.label} theme`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      <motion.button
        onClick={() => {
          const order: Theme[] = ['light', 'dark'];
          const idx = order.indexOf(currentTheme);
          const next = order[(idx + 1) % order.length];
          setCurrentTheme(next);
        }}
        whileTap={{ scale: 0.9 }}
        className="md:hidden relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[--color-bg-secondary]/70 backdrop-blur-sm border border-white/10 hover:border-[--color-primary]/50 transition"
        aria-label="Cycle theme"
      >
        <Sparkles className="w-5 h-5 text-[--color-primary]" />
        <span className="sr-only">Change theme</span>
      </motion.button>
    </div>
  );

  return (
    <>
      <style>{`
        @supports (height: 100dvh) {
          .mobile-sidebar {
            height: 100dvh !important;
            max-height: 100dvh !important;
          }
        }
        @supports not (height: 100dvh) {
          .mobile-sidebar {
            height: 100vh !important;
            max-height: 100vh !important;
          }
        }
        /* Fix for iOS Safari */
        @media screen and (max-width: 768px) {
          .mobile-sidebar {
            height: 100vh !important;
            height: calc(var(--vh, 1vh) * 100) !important;
          }
        }
      `}</style>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[--color-bg-primary]/70 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border-b border-white/5'
            : 'bg-transparent',
        ].join(' ')}
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <motion.button
            onClick={() => {
              navigateWithScroll('home');
              setMobileOpen(false);
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/images/quick-actions/badge-discover-3d.svg" 
                alt="FOGSLY 3D Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,82,255,0.25)]" 
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text text-transparent">
              FOGSLY
            </span>
          </motion.button>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Primary">
            {currentRoute === 'events' ? (
              <>
                <motion.button
                  onClick={() => handleNavClick('fog-jobs')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-sm font-medium text-[--color-text-primary]/80 hover:text-[#489fff] transition-colors py-1"
                >
                  Jobs
                </motion.button>
                <motion.button
                  onClick={() => handleNavClick('events')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-sm font-semibold text-[#1677ff] border border-blue-400/80 dark:border-blue-500 rounded-full px-4 py-1 bg-blue-50/50 dark:bg-blue-950/40 transition-colors"
                >
                  Events
                </motion.button>
                <motion.button
                  onClick={() => handleNavClick('fog-coins')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-sm font-medium text-[--color-text-primary]/80 hover:text-[#489fff] transition-colors py-1"
                >
                  Buy Coin
                </motion.button>
              </>
            ) : (
              <>
                {/* Jobs */}
                <motion.button
                  onClick={() => handleNavClick('fog-jobs')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    currentRoute === 'fog-jobs' || currentRoute === 'jobs'
                      ? 'text-[#489fff] font-bold'
                      : 'text-[--color-text-primary]/80 hover:text-[#489fff]'
                  }`}
                >
                  Jobs
                  {(currentRoute === 'fog-jobs' || currentRoute === 'jobs') && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#489fff] to-[#081440] rounded-full"
                    />
                  )}
                </motion.button>

                {/* Events */}
                <motion.button
                  onClick={() => handleNavClick('events')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    currentRoute === 'events'
                      ? 'text-[#489fff] font-bold'
                      : 'text-[--color-text-primary]/80 hover:text-[#489fff]'
                  }`}
                >
                  Events
                  {currentRoute === 'events' && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#489fff] to-[#081440] rounded-full"
                    />
                  )}
                </motion.button>

                {/* Community - Highlighted when active */}
                <motion.button
                  onClick={() => handleNavClick('community')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    currentRoute === 'community'
                      ? 'text-[#489fff] font-bold'
                      : 'text-[--color-text-primary]/80 hover:text-[#489fff]'
                  }`}
                >
                  Community
                  {currentRoute === 'community' && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#489fff] to-[#081440] rounded-full"
                    />
                  )}
                </motion.button>

                {/* Dashboard */}
                <motion.button
                  onClick={() => handleNavClick('dashboard')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-sm font-medium text-[--color-text-primary]/80 hover:text-[--color-primary] transition-colors"
                >
                  Dashboard
                </motion.button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-0.5 md:gap-3">
            {currentRoute === 'events' ? (
              <Button
                size="sm"
                onClick={() => handleNavClick('fog-coins')}
                className="block bg-[#1677ff] hover:bg-blue-600 text-white rounded-[34px] text-xs font-bold px-4 py-1.5 shadow-sm cursor-pointer"
              >
                Wallet: 79.80
              </Button>
            ) : (
              isLoggedIn && (
                <Button
                  size="sm"
                  onClick={() => handleNavClick('fog-coins')}
                  className="block bg-[--color-badge-herobg] text-[--color-badge-text] rounded-[34px] text-xs md:text-md p-0 font-bold cursor-pointer"
                >
                  {isLoadingBalance ? 'Loading...' : `Wallet: ${formatFog(userBalance, true)}`}
                </Button>
              )
            )}
            <ThemeSelector />
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn || currentRoute === 'events' ? (
                <>
                  {/* Notification Bell with Dropdown */}
                  <div className="relative" ref={notificationDropdownRef}>
                    <motion.button
                      onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10 relative"
                      title="Messages"
                    >
                      <Bell className="w-5 h-5 text-[--color-text-primary]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[--color-bg-primary]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {showNotificationDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-80 bg-[--color-bg-primary] border border-[--color-border] rounded-lg shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-3 border-b border-[--color-border] flex items-center justify-between">
                            <h3 className="font-semibold text-[--color-text-primary]">Recent Messages</h3>
                            <button
                              onClick={() => {
                                setShowNotificationDropdown(false);
                                navigate('messages');
                              }}
                              className="text-xs text-blue-500 hover:text-blue-400"
                            >
                              View All
                            </button>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {recentMessages.length === 0 ? (
                              <div className="p-6 text-center text-[--color-text-secondary] text-sm">
                                No new messages
                              </div>
                            ) : (
                              recentMessages.map((message) => {
                                // Handle P2P conversation
                                if (message.type === 'p2p' && message.otherUser) {
                                  return (
                                    <button
                                      key={message.id}
                                      onClick={() => {
                                        setShowNotificationDropdown(false);
                                        navigate('messages', { selectedUserId: message.otherUser!.id });
                                      }}
                                      className="w-full p-3 hover:bg-[--color-bg-secondary] transition-colors flex items-start gap-3 border-b border-[--color-border]"
                                    >
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {message.otherUser.avatar ? (
                                          <img src={message.otherUser.avatar} alt={message.otherUser.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                          message.otherUser.displayName?.charAt(0)?.toUpperCase() || message.otherUser.name?.charAt(0)?.toUpperCase() || '?'
                                        )}
                                      </div>
                                      <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center justify-between">
                                          <p className="font-semibold text-sm text-[--color-text-primary] truncate">
                                            {message.otherUser.displayName || message.otherUser.name}
                                          </p>
                                          <span className="text-xs text-[--color-text-secondary] ml-2 flex-shrink-0">
                                            {message.unreadCount > 0 && (
                                              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full text-white font-bold text-[10px]">
                                                {message.unreadCount}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-xs text-[--color-text-secondary] truncate">
                                          {message.lastMessage}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded-full">
                                          CHAT
                                        </span>
                                      </div>
                                    </button>
                                  );
                                }
                                
                                // Handle Brand conversation
                                if (message.type === 'brand' && message.brandData) {
                                  return (
                                    <button
                                      key={message.id}
                                      onClick={() => {
                                        setShowNotificationDropdown(false);
                                        navigate('messages', { brandId: message.brandData!.brandId });
                                      }}
                                      className="w-full p-3 hover:bg-[--color-bg-secondary] transition-colors flex items-start gap-3 border-b border-[--color-border]"
                                    >
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {message.brandData.brandLogo ? (
                                          <img src={message.brandData.brandLogo} alt={message.brandData.brandName} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                          message.brandData.brandName.charAt(0).toUpperCase()
                                        )}
                                      </div>
                                      <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center justify-between">
                                          <p className="font-semibold text-sm text-[--color-text-primary] truncate">
                                            {message.brandData.brandName}
                                          </p>
                                          <span className="text-xs text-[--color-text-secondary] ml-2 flex-shrink-0">
                                            {message.unreadCount > 0 && (
                                              <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-500 rounded-full text-white font-bold text-[10px]">
                                                {message.unreadCount}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-xs text-[--color-text-secondary] truncate">
                                          {message.lastMessage}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-semibold rounded-full">
                                          BRAND
                                        </span>
                                      </div>
                                    </button>
                                  );
                                }
                                
                                return null;
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Button - Just show icon without dropdown */}
                  <motion.button
                    onClick={handleProfileClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10"
                  >
                    <User className="w-5 h-5 text-[--color-text-primary]" />
                  </motion.button>
                  <Button variant="ghost" onClick={onLogout}>
                    <LogOut className="w-4 h-4" /> Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigateWithScroll('auth', 'login')}>
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                  <Button onClick={() => navigateWithScroll('auth', 'signup')}>
                    <span>Sign Up</span>
                  </Button>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center gap-1">
              {!isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs pr-0 px-1 py-1.5 h-8 "
                  >
                    <LogIn className="w-3 h-3" />
                    <div className="seperate flex gap-1">
                      <span className="ml-1"
                        onClick={() => navigateWithScroll('auth', 'login')}
                      >Login</span> / <span onClick={() => navigateWithScroll('auth', 'signup')}> Sign Up</span>
                    </div>

                  </Button>
                </>

              ) : (
                <>
                  {/* Messages Icon for Mobile - Next to hamburger menu */}
                  {/* <motion.button
                    onClick={handleMessagesClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10"
                    disabled={brandLoading}
                    title={brandLoading ? 'Loading...' : 'Messages'}
                  >
                    {brandLoading ? (
                      <Loader2 className="w-4 h-4 text-[--color-text-primary] animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-[--color-text-primary]" />
                    )}
                  </motion.button> */}
                </>
              )}
              <motion.button
                onClick={toggleMobile}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-[--color-bg-secondary]"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                key="panel"
                className="mobile-sidebar fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-[--color-bg-primary] border-l border-[--color-border] flex flex-col overflow-hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[--color-border] flex-shrink-0">
                  <button
                    onClick={() => {
                      navigateWithScroll('home');
                      setMobileOpen(false);
                    }}
                    className="text-lg font-bold bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text text-transparent"
                  >
                    FOGSLY
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileOpen(false)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 min-h-0">
                  <ul className="space-y-2">
                    {mobileSidebarLinks.map(link => (
                      <li key={link.label}>
                        <motion.button
                          onClick={() => handleNavClick(link.route)}
                          whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left hover:bg-white/[0.06] text-[--color-text-primary]"
                        >
                          {link.icon}
                          {link.label}
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Auth Buttons inside Sidebar - Always visible at bottom */}
                <div className="flex-shrink-0 p-5 border-t border-[--color-border] space-y-3 bg-[--color-bg-primary]"
                  style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
                >
                  {isLoggedIn ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={onLogout}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleProfileClick}
                      >
                        <User className="w-4 h-4" /> Profile
                      </Button>

                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          navigateWithScroll('auth', 'login');
                          setMobileOpen(false);
                        }}
                      >
                        <LogIn className="w-4 h-4" /> Log In
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          navigateWithScroll('auth', 'signup');
                          setMobileOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />

      {/* Mobile Bottom Navigation */}
      {enableBottomMobileBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="bg-[--color-bg-primary]/95 backdrop-blur-md border-t border-[--color-border] px-2 py-1"
            style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-around">
              {bottomNavItems.map((item) => {
                const isActive = currentRoute === item.route ||
                  (item.isMessagesButton && (currentRoute === 'messages' || currentRoute === 'brand-messages'));

                return (
                  <motion.button
                    key={item.route}
                    onClick={() => handleBottomNavClick(item.route, item.authRequired)}
                    whileTap={{ scale: 0.9 }}
                    disabled={item.isMessagesButton && brandLoading}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${isActive
                      ? 'text-[--color-primary] bg-[--color-primary]/10'
                      : 'text-[--color-text-secondary] hover:text-[--color-primary] hover:bg-[--color-bg-secondary]/50'
                      } ${item.isMessagesButton && brandLoading ? 'opacity-50' : ''}`}
                  >
                    <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                      <div className={`w-5 h-5 ${isActive ? 'text-[--color-primary]' : ''}`}>
                        {item.isMessagesButton && brandLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          item.icon
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-[--color-primary]' : ''}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

