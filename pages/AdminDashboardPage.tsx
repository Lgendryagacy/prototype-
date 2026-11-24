import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/admin/views/Sidebar';
import Header from '../components/admin/views/Header';
import DashboardView from '../components/admin/views/DashboardView';
import AdsManagementView from '../components/admin/views/AdsManagementView';
import FogCoinManagementView from '../components/admin/views/FogCoinManagementView';
import ThemeManagementView from '../components/admin/views/ThemeManagementView';
import PaymentRequestsView from '../components/admin/views/PaymentRequestsView';
import PaymentMethodsView from '../components/admin/views/PaymentMethodsView';
import WithdrawalManagementView from '../components/admin/views/WithdrawalManagementView';
import UserManagementView from '../components/admin/views/UserManagementView';
import ContentManagementView from '../components/admin/views/ContentManagementView';
import DisputeManagementView from '../components/admin/views/DisputeManagementView';
import MarketingView from '../components/admin/views/MarketingView';
import SettingsView from '../components/admin/views/SettingsView';
import BrandManagementView from '../components/admin/views/BrandManagementView';
import JobManagementView from '../components/admin/views/JobManagementView';
import JobCompletionsView from '../components/admin/views/JobCompletionsView';
import FreelanceManagementView from '../components/admin/views/FreelanceManagementView';
import PhysicalJobRequestsView from '../components/admin/views/PhysicalJobRequestsView';
import EventRequestsView from '../components/admin/views/EventRequestsView';
import ActiveEventsView from '../components/admin/views/ActiveEventsView';
import GiveawayManagementView from '../components/admin/views/GiveawayManagementView';
import { onAuthStateChange, signOutUser } from '../firebase/services/authService';
import { isUserAdmin } from '../firebase/services/adminPromotion';
import { getUserProfile } from '../firebase/services/userService';
import { User } from '../firebase/types/user';
import { UserProfile } from '../firebase/types/user';
// import { toast } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import { runAllMigrations } from '../firebase/migrations/migrateEarningsStructure';
import { runFullCleanup } from '../firebase/migrations/fixCorruptedEarnings';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';

import { type Route } from '../types';

export type AdminDashboardView =
  | 'dashboard'
  | 'theme-management'
  | 'ads-management'
  | 'fog-coin-management'
  | 'brand-management'
  | 'job-management'
  | 'job-completions'
  | 'freelance-management'
  | 'physical-job-requests'
  | 'event-requests'
  | 'active-events'
  | 'giveaway-management'
  | 'payment-requests'
  | 'payment-methods'
  | 'withdrawal-management'
  | 'user-management'
  | 'content-management'
  | 'dispute-management'
  | 'marketing'
  | 'settings';

interface AdminDashboardPageProps {
  navigate: (route: Route) => void;
}

export const ADMIN_VIEW_TITLES: Record<AdminDashboardView, string> = {
  'dashboard': 'Dashboard',
  'theme-management': 'Theme Management',
  'ads-management': 'Ads Management',
  'fog-coin-management': 'FOG Coin Management',
  'brand-management': 'Brand Management',
  'job-management': 'Job Requests',
  'job-completions': 'Completed Jobs',
  'freelance-management': 'Freelance Requests',
  'physical-job-requests': 'Physical Job Requests',
  'event-requests': 'Event Requests',
  'active-events': 'Active Events',
  'giveaway-management': 'Giveaway Requests',
  'payment-requests': 'Payment Requests',
  'payment-methods': 'Payment Methods',
  'withdrawal-management': 'Withdrawal Management',
  'user-management': 'User Management',
  'content-management': 'Content Management',
  'dispute-management': 'Dispute Management',
  'marketing': 'Marketing',
  'settings': 'Settings'
};

export default function AdminDashboardPage({ navigate }: AdminDashboardPageProps) {
  const [view, setView] = useState<AdminDashboardView>('dashboard');
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);



  // Verify admin access on component mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const verifyAdminAccess = async () => {
      try {
        unsubscribe = onAuthStateChange(async (user) => {
          if (!user) {
            console.log('No user logged in, redirecting to home');
            navigate('home');
            return;
          }

          const adminStatus = await isUserAdmin(user.uid);
          if (!adminStatus) {
            console.log('User is not admin, redirecting to home');
            navigate('home');
            return;
          }

          // Set current user
          setCurrentUser({
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || undefined,
            emailVerified: user.emailVerified
          });

          // Fetch user profile for additional info
          try {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }

          setHasAccess(true);
          setIsVerifyingAccess(false);
        });
      } catch (error) {
        console.error('Error verifying admin access:', error);
        navigate('home');
      }
    };

    verifyAdminAccess();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Signed out successfully');
      navigate('auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Handle refresh data
  const handleRefreshData = () => {
    console.log('Refreshing admin data...');
    toast.success('Data refreshed successfully');
    // Force refresh by re-triggering the auth state change
    window.location.reload();
  };

  // Handle data migration
  const handleMigration = async () => {
    if (!confirm('⚠️ Start data migration to new earnings structure?\n\n✅ This is SAFE and will preserve all data\n✅ Fixes depositEarnings bug\n✅ Adds new earning sources\n✅ Safe to run multiple times\n\nCheck browser console for detailed progress.')) {
      return;
    }

    const loadingToast = toast.loading('🚀 Running migration... Check console for progress');

    try {
      console.log('\n' + '='.repeat(80));
      console.log('🚀 STARTING DATA MIGRATION');
      console.log('='.repeat(80) + '\n');

      await runAllMigrations();

      toast.dismiss(loadingToast);
      toast.success('✅ Migration completed! Check console for details', { duration: 5000 });

      console.log('\n' + '='.repeat(80));
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80) + '\n');

    } catch (error) {
      console.error('\n❌ MIGRATION FAILED:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Migration failed. Check console for details');
    }
  };

  // Handle cleanup of corrupted data
  const handleCleanup = async () => {
    if (!confirm('🔧 Fix corrupted earnings data?\n\n✅ Fixes "[object Object]" issues\n✅ Recalculates all balances\n✅ Syncs wallet balances\n✅ Safe to run multiple times\n\nThis will fix the string corruption in availableBalance and lifetimeEarnings.\n\nCheck browser console for detailed progress.')) {
      return;
    }

    const loadingToast = toast.loading('🔧 Cleaning corrupted data... Check console');

    try {
      console.log('\n' + '='.repeat(80));
      console.log('🔧 STARTING DATA CLEANUP');
      console.log('='.repeat(80) + '\n');

      await runFullCleanup();

      toast.dismiss(loadingToast);
      toast.success('✅ Cleanup completed! All data fixed', { duration: 5000 });

      console.log('\n' + '='.repeat(80));
      console.log('✅ CLEANUP COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80) + '\n');

    } catch (error) {
      console.error('\n❌ CLEANUP FAILED:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Cleanup failed. Check console for details');
    }
  };

  // Show loading while verifying access
  if (isVerifyingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render if no access (should have already redirected)
  if (!hasAccess) {
    return null;
  }

  const handleCreateNewAd = () => {
    // TODO: Open create ad modal or navigate to create ad page
    console.log('Create new ad');
  };

  const handleEditAd = (ad: any) => {
    console.log('Edit ad:', ad);
    // TODO: Navigate to edit ad page or open edit modal
  };

  const handleViewAd = (ad: any) => {
    console.log('View ad:', ad);
    // TODO: Navigate to ad details page or open view modal
  };

  const handleViewAnalytics = (adId: string) => {
    // Navigate to the dedicated AdAnalyticsPage
    window.location.href = `/admin/ad-analytics/${adId}`;
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'ads-management': return (
        <AdsManagementView
          onCreateNew={handleCreateNewAd}
          onEditAd={handleEditAd}
          onViewAd={handleViewAd}
          onViewAnalytics={handleViewAnalytics}
        />
      );
      case 'fog-coin-management': return <FogCoinManagementView />;
      case 'theme-management': return <ThemeManagementView />;
      case 'brand-management': return <BrandManagementView />;
      case 'job-management': return <JobManagementView />;
      case 'job-completions': return <JobCompletionsView />;
      case 'freelance-management': return <FreelanceManagementView />;
      case 'physical-job-requests': return <PhysicalJobRequestsView />;
      case 'event-requests': return <EventRequestsView />;
      case 'active-events': return <ActiveEventsView />;
      case 'giveaway-management': return <GiveawayManagementView navigate={navigate} />;
      case 'payment-requests': return <PaymentRequestsView />;
      case 'payment-methods': return <PaymentMethodsView />;
      case 'withdrawal-management': return <WithdrawalManagementView />;
      case 'user-management': return <UserManagementView />;
      case 'content-management': return <ContentManagementView />;
      case 'dispute-management': return <DisputeManagementView />;
      case 'marketing': return <MarketingView />;
      case 'settings': return <SettingsView />;
      default:
        // FIX: The switch is exhaustive, so TypeScript infers `view` as type `never`.
        // We cast it to a string to allow this fallback logic to work if a new AdminView type is added without a corresponding case.
        const title = (view as string).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return <div className="text-white">Page not found: {title}</div>;
    }
  };

  return (

    <>

      <ToastContainer />
      <div className="relative flex bg-slate-900 min-h-screen font-sans overflow-hidden">
        <AdminNotificationProvider>
          {/* Unified Hamburger Button - Works for both Mobile and Desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute top-4 z-50 p-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300 ${sidebarOpen ? 'left-[200px]' : 'left-4'
              }`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} className="text-slate-300" /> : <Menu size={20} className="text-slate-300" />}
          </button>

          {/* Overlay for mobile */}
          {/* Overlay for mobile - only show on mobile when sidebar is open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar - Responsive drawer */}
          {sidebarOpen && (
            <aside
              className="fixed top-0 left-0 z-40 min-h-screen transition-transform duration-300 ease-in-out lg:sticky lg:top-0"
            >
              <Sidebar
                view={view}
                setView={(newView) => {
                  setView(newView);
                  // Close sidebar on mobile when item is clicked
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                isMobile={window.innerWidth < 1024}
                onClose={() => setSidebarOpen(false)}
              />
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <div className={`transition-all duration-300 ${sidebarOpen ? 'pl-0' : 'pl-0'}`}>
              <Header
                currentView={view}
                navigate={navigate}
                currentUser={currentUser}
                userProfile={userProfile}
                onLogout={handleLogout}
                onRefreshData={handleRefreshData}
              />
            </div>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300">
              {/* Rest of the content... */}
              {/* Migration Notice - Only show on dashboard view */}
              {/* {view === 'dashboard' && (
            <div className="space-y-4 mb-6">
             
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      🚀 New Earnings System Available
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      Migrate your existing user data to the new 8-source earnings structure. This will:
                    </p>
                    <ul className="text-slate-300 text-sm space-y-1 mb-3 ml-4">
                      <li>✅ Fix depositEarnings field name bug</li>
                      <li>✅ Add FreelanceJobs, FogslyServices, FogslyPhysical earning sources</li>
                      <li>✅ Enable automatic wallet transfers</li>
                      <li>✅ Preserve all existing user balances</li>
                      <li>✅ Safe to run multiple times</li>
                    </ul>
                    <button
                      onClick={handleMigration}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Run Data Migration
                    </button>
                    <a
                      href="/DATA_MIGRATION_GUIDE.md"
                      target="_blank"
                      className="ml-3 text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      View Migration Guide
                    </a>
                  </div>
                </div>
              </div>

             
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      🔧 Fix Corrupted Earnings Data
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      If you see "[object Object]" in availableBalance or lifetimeEarnings fields, run this cleanup:
                    </p>
                    <ul className="text-slate-300 text-sm space-y-1 mb-3 ml-4">
                      <li>✅ Fixes string corruption in numeric fields</li>
                      <li>✅ Recalculates availableBalance and lifetimeEarnings</li>
                      <li>✅ Syncs wallet balances with earnings</li>
                      <li>✅ Extracts correct numbers from corrupted data</li>
                      <li>✅ Safe to run multiple times</li>
                    </ul>
                    <button
                      onClick={handleCleanup}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Fix Corrupted Data
                    </button>
                    <span className="ml-3 text-slate-400 text-xs">
                      Run this if you see data corruption issues
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )} */}

              {renderContent()}
            </main>
          </div>
        </AdminNotificationProvider>
      </div>
    </>
  );
}