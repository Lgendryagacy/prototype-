import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { checkForNewItems, type NotificationBadges } from '@/firebase/services/adminNotificationService';
import { toast } from 'react-hot-toast';
import { type AdminDashboardView } from '../pages/AdminDashboardPage';

interface AdminNotificationContextType {
  badges: NotificationBadges;
  lastSyncTime: Date | null;
  isLoading: boolean;
  isSyncing: boolean;
  refreshNotifications: () => Promise<void>;
  markAsViewed: (view: AdminDashboardView) => void;
  hasNewItems: (view: AdminDashboardView) => boolean;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
  }
  return context;
};

interface AdminNotificationProviderProps {
  children: ReactNode;
}

// Auto-sync interval: 10 minutes
const AUTO_SYNC_INTERVAL = 10 * 60 * 1000;
const LAST_SYNC_KEY = 'admin_last_sync_timestamp';

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ children }) => {
  const [badges, setBadges] = useState<NotificationBadges>({
    'payment-requests': false,
    'withdrawal-management': false,
    'job-management': false,
    'job-completions': false,
    'physical-job-requests': false,
    'freelance-management': false,
    'user-management': false,
    'brand-management': false,
  });
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isFetchingRef = React.useRef(false); // Prevent parallel fetches
  const lastSyncTimestampRef = React.useRef<number>(Date.now()); // Use ref to avoid re-render loop

  // Load last sync timestamp from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        lastSyncTimestampRef.current = timestamp;
      } else {
        // First time - set to current time so we only show new items from now on
        const now = Date.now();
        lastSyncTimestampRef.current = now;
        localStorage.setItem(LAST_SYNC_KEY, now.toString());
      }
    } catch (error) {
      console.error('Error loading last sync timestamp:', error);
    }
  }, []);

  // Check for new items since last sync
  const fetchNotifications = useCallback(async (showToast = false) => {
    // Prevent parallel fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsSyncing(true);
      
      console.log('🔄 Checking for items after:', new Date(lastSyncTimestampRef.current).toLocaleString());
      
      // Pass the last sync timestamp - only check for items AFTER this time
      const newBadges = await checkForNewItems({ lastSyncTimestamp: lastSyncTimestampRef.current });
      
      console.log('📊 Badges received:', newBadges);
      console.log('🔢 Total badges TRUE:', Object.values(newBadges).filter(Boolean).length);
      
      // KEEP existing badges that are true, only ADD new ones
      setBadges(prev => {
        const updated = { ...prev };
        // For each badge, if it's already true OR newly true, keep it true
        Object.keys(newBadges).forEach(key => {
          const badgeKey = key as keyof NotificationBadges;
          if (prev[badgeKey] || newBadges[badgeKey]) {
            updated[badgeKey] = true;
          }
        });
        return updated;
      });
      
      // DON'T update lastSyncTimestampRef here - it stays at the original time
      // This way, badges persist until user clicks them
      setLastSyncTime(new Date());
      
      console.log('✅ Sync complete, badges persisted');
      
      // Count how many new badges
      const newCount = Object.values(newBadges).filter(Boolean).length;
      
      // Show toast only if there are new items
      if (showToast && newCount > 0) {
        toast.success(
          `🔔 ${newCount} new ${newCount === 1 ? 'item' : 'items'} found`,
          {
            duration: 3000,
            icon: '🔔',
          }
        );
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (showToast) {
        toast.error('Failed to sync notifications');
      }
    } finally {
      isFetchingRef.current = false;
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []); // Empty deps - use refs instead

  // Initial load - only once on mount
  useEffect(() => {
    fetchNotifications(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Auto-sync every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, AUTO_SYNC_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Manual refresh
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // Mark a view as viewed - hide badge and update timestamp for that view
  const markAsViewed = useCallback((view: AdminDashboardView) => {
    // Clear the badge
    setBadges(prev => ({
      ...prev,
      [view]: false
    }));
    
    // Update the timestamp to NOW for this specific view
    // So next sync will only show items created AFTER this point
    const now = Date.now();
    lastSyncTimestampRef.current = now;
    localStorage.setItem(LAST_SYNC_KEY, now.toString());
    
    console.log('👁️ Viewed:', view, '- Updated timestamp to:', new Date(now).toLocaleString());
  }, []);

  // Check if a view has new items
  const hasNewItems = useCallback((view: AdminDashboardView): boolean => {
    return badges[view] || false;
  }, [badges]);

  const value: AdminNotificationContextType = {
    badges,
    lastSyncTime,
    isLoading,
    isSyncing,
    refreshNotifications,
    markAsViewed,
    hasNewItems
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
