import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  ShieldCheck, 
  CheckCheck,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { 
  CommunityCategoryTab, 
  CommunityCategoryFilter,
  CommunitySortOption, 
  CommunityViewMode,
  CommunityNotification 
} from './types';
import { NotificationDropdown } from './NotificationDropdown';

interface CommunityHeaderProps {
  activeCategory?: CommunityCategoryTab | CommunityCategoryFilter | string;
  selectedCategory?: CommunityCategoryFilter | string;
  onSelectCategory: (cat: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy?: CommunitySortOption;
  onSortChange?: (sort: CommunitySortOption) => void;
  viewMode?: CommunityViewMode;
  onViewModeChange?: (mode: CommunityViewMode) => void;
  onCreatePostClick: () => void;
  onOpenModeration?: () => void;
  onAdminModerationClick?: () => void;
  pendingCount?: number;
  unreadNotificationsCount?: number;
  notifications?: CommunityNotification[];
  onMarkAllNotificationsRead?: () => void;
  onNotificationClick?: (notif: CommunityNotification) => void;
  onTriggerTestNotification?: () => void;
  isAdmin?: boolean;
  categoryCounts?: Record<string, number>;
}

const TABS: { id: string; label: string; isExclusive?: boolean }[] = [
  { id: 'all', label: 'All Discussions' },
  { id: 'exclusive', label: 'Fogsly Official', isExclusive: true },
  { id: 'discussions', label: 'Discussions' },
  { id: 'questions', label: 'Questions' },
  { id: 'polls', label: 'Polls' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'networking', label: 'Collaboration' },
];

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  activeCategory = 'all',
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy = 'latest',
  onSortChange,
  viewMode = 'detailed',
  onViewModeChange,
  onCreatePostClick,
  onOpenModeration,
  onAdminModerationClick,
  pendingCount = 0,
  unreadNotificationsCount,
  notifications = [],
  onMarkAllNotificationsRead,
  onNotificationClick,
  onTriggerTestNotification,
  isAdmin = true,
  categoryCounts = {},
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = selectedCategory || activeCategory || 'all';

  const unreadCount = typeof unreadNotificationsCount === 'number'
    ? unreadNotificationsCount
    : notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0C1017]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo / Community Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  Community
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Network
                </span>
              </div>
            </div>
          </div>

          {/* Minimal Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search discussions, questions, tags..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 font-mono">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Moderation Link for Admins */}
            {isAdmin && (
              <button
                onClick={onAdminModerationClick || onOpenModeration}
                title="Moderation"
                className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            )}

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Notifications"
                className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                    <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={() => onMarkAllNotificationsRead && onMarkAllNotificationsRead()}
                onNotificationClick={(n) => {
                  onNotificationClick && onNotificationClick(n);
                  setIsNotifOpen(false);
                }}
                onTriggerTestNotification={onTriggerTestNotification}
              />
            </div>

            {/* Primary 'New Post' CTA */}
            <button
              onClick={onCreatePostClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Clean Minimal Category Tabs + Sort */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 border-t border-neutral-100 dark:border-neutral-800/80 gap-4">
          {/* Category Tabs */}
          <nav className="flex items-center gap-1 shrink-0">
            {TABS.map((tab) => {
              const isActive = currentCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    tab.isExclusive
                      ? isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs ring-1 ring-blue-500'
                        : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100/70'
                      : isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  {categoryCounts[tab.id] !== undefined && categoryCounts[tab.id] > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      tab.isExclusive
                        ? isActive ? 'bg-white/20 text-white font-bold' : 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : isActive ? 'bg-white/20 dark:bg-black/20 text-current' : 'bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {categoryCounts[tab.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Sort Dropdown */}
          {onSortChange && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as CommunitySortOption)}
                aria-label="Sort discussions"
                className="bg-transparent text-xs text-neutral-600 dark:text-neutral-400 font-medium py-1 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none cursor-pointer border-0"
              >
                <option value="latest" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  Latest
                </option>
                <option value="top" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  Top Voted
                </option>
                <option value="trending" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  Trending
                </option>
                <option value="discussed" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  Most Discussed
                </option>
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CommunityHeader;
