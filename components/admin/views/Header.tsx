import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import { type AdminDashboardView, ADMIN_VIEW_TITLES } from '../../../pages/AdminDashboardPage';
import { type Route } from '@/types';
import { User } from '../../../firebase/types/user';
import { UserProfile } from '../../../firebase/types/user';
import { useAdminNotifications } from '../../../contexts/AdminNotificationContext';

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

interface HeaderProps {
  currentView: AdminDashboardView;
  navigate: (route: Route) => void;
  currentUser: User | null;
  userProfile: UserProfile | null;
  onLogout: () => Promise<void>;
  onRefreshData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, navigate, currentUser, userProfile, onLogout, onRefreshData }) => {
  const title = ADMIN_VIEW_TITLES[currentView] || 'Admin';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const { badges, lastSyncTime, isSyncing, refreshNotifications, hasNewItems } = useAdminNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = userProfile?.name || currentUser?.displayName || 'Admin';
  const adminEmail = currentUser?.email || 'admin@fogsly.com';
  const adminInitial = adminName.charAt(0).toUpperCase();

  const handleLogoutClick = async () => {
    setIsDropdownOpen(false);
    await onLogout();
  };

  const handleRefreshClick = async () => {
    await refreshNotifications();
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const getNotificationItems = () => {
    const items = [];
    
    if (badges['payment-requests']) {
      items.push({
        id: 'payment-requests',
        title: 'Payment Requests',
        icon: '💰',
        color: 'text-green-400'
      });
    }
    
    if (badges['withdrawal-management']) {
      items.push({
        id: 'withdrawal-management',
        title: 'Withdrawal Requests',
        icon: '💸',
        color: 'text-yellow-400'
      });
    }
    
    if (badges['job-management']) {
      items.push({
        id: 'job-management',
        title: 'Job Applications',
        icon: '💼',
        color: 'text-blue-400'
      });
    }
    
    if (badges['job-completions']) {
      items.push({
        id: 'job-completions',
        title: 'Completed Jobs',
        icon: '✅',
        color: 'text-green-400'
      });
    }
    
    if (badges['physical-job-requests']) {
      items.push({
        id: 'physical-job-requests',
        title: 'Physical Jobs',
        icon: '🏗️',
        color: 'text-orange-400'
      });
    }
    
    if (badges['freelance-management']) {
      items.push({
        id: 'freelance-management',
        title: 'Freelance Gigs',
        icon: '👨‍💻',
        color: 'text-purple-400'
      });
    }
    
    if (badges['user-management']) {
      items.push({
        id: 'user-management',
        title: 'New Users',
        icon: '👤',
        color: 'text-indigo-400'
      });
    }
    
    return items;
  };

  const notificationItems = getNotificationItems();
  const hasAnyNewItems = notificationItems.length > 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">

      {/* Breadcrumb - hide on mobile */}
      <div className="hidden sm:flex items-center text-sm text-gray-400">
        <span className="font-medium text-gray-500">Admin</span>
        <span className="mx-2 text-gray-600">/</span>
        <span className="font-semibold text-white">{title}</span>
      </div>

      <div className="flex items-center gap-4">

        
        {/* Search bar */}
        <div className="relative w-[70%] sm:w-64 ml-[45px] sm:ml-0 z-10">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-950 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all duration-300 focus:w-full sm:focus:w-62"
          />
        </div>



        {/* Notification Icon */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <Bell size={20} />
            {hasAnyNewItems && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {lastSyncTime && (
                    <p className="text-xs text-gray-400">
                      Last synced {formatTimeAgo(lastSyncTime)}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRefreshClick}
                  disabled={isSyncing}
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  title="Refresh notifications"
                >
                  <RefreshCw 
                    size={16} 
                    className={`text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto">
                {notificationItems.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No new notifications</p>
                    <p className="text-gray-500 text-xs mt-1">Auto-syncs every 10 minutes</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {notificationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsNotificationOpen(false);
                          // Navigate to the specific view
                          // This would need to be connected to setView from parent
                        }}
                        className="w-full px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`font-medium ${item.color}`}>{item.title}</p>
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                            </div>
                            <p className="text-sm text-gray-400">
                              New items pending review
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notificationItems.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
                  <p className="text-xs text-center text-gray-400">
                    🔔 Auto-sync enabled • Updates every 10 minutes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500">
              {adminInitial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-white font-medium text-sm">Fogsly Admin</div>
              <div className="text-gray-400 text-xs">{adminEmail}</div>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white">
                    {adminInitial}
                  </div>
                  <div>
                    <div className="text-white font-medium">{adminName}</div>
                    <div className="text-gray-400 text-sm">{adminEmail}</div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {onRefreshData && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onRefreshData();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                  >
                    <RefreshCw size={16} />
                    <span>Refresh Data</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('home');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Site</span>
                </button>

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
