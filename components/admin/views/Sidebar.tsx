import React from 'react';
import { type AdminDashboardView } from '../../../pages/AdminDashboardPage';
import { PackageIcon, Briefcase, CheckCircle, X, ChevronDown, Gift, Calendar } from 'lucide-react';
import { useAdminNotifications } from '../../../contexts/AdminNotificationContext';
import SyncIndicator from './SyncIndicator';

// --- Custom SVG Icon Components ---

const IconDashboard = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
  </svg>
);
const IconTheme = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M17.06 6.55c-.23-.64-.53-1.23- D.9-1.76l-.01.01c-.8-1.1-1.99-1.9-3.3-2.27a.75.75 0 00-.7.09c-.2.12-.34.33-.36.56-.03.26.1.52.33.68.9.64 1.62 1.45 2.12 2.38.45.85.7 1.78.7 2.74a4.99 4.99 0 01-2.2 4.14c-.6.44-1.23.8-1.89 1.07-1.3.54-2.65.8-4 .78a.75.75 0 00-.75.75c0 .41.34.75.75.75 1.5 0 3-.28 4.4-.88 1.48-.63 2.8-1.57 3.87-2.73A6.49 6.49 0 0017.06 6.55zM5 10a1 1 0 11-2 0 1 1 0 012 0zm-2.5-3a1 1 0 11-2 0 1 1 0 012 0zm6-2.5a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);
const IconAds = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM4.032 4.28a.75.75 0 01.218-1.042l1.06-1.06a.75.75 0 111.061 1.06l-1.06 1.06a.75.75 0 01-1.279-.018zM14.75 15.81a.75.75 0 01-.218 1.042l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.278.018zM2.012 9.5a.75.75 0 01.738-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.738-.75zM15.012 9.5a.75.75 0 01.738-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.738-.75zM4.25 15.81a.75.75 0 011.042-.218l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 01.018-1.28zM15.812 4.28a.75.75 0 01-1.042.218l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06a.75.75 0 01-.018 1.28z" clipRule="evenodd" />
    <path d="M10 6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM13.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
  </svg>
);
const IconFogCoin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 3a7 7 0 100 14 7 7 0 000-14zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
    <path d="M9 13a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM7 8a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);
const IconPaymentRequests = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm12 2.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM3 8h14v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
    <circle cx="10" cy="10.5" r="1" />
  </svg>
);
const IconPaymentMethods = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5v9A1.5 1.5 0 002.5 16h15A1.5 1.5 0 0019 14.5v-9A1.5 1.5 0 0017.5 4h-15zM2 5.5a.5.5 0 01.5-.5h15a.5.5 0 01.5.5v2.25H2v-2.25zM2 9v5.5a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V9H2z" clipRule="evenodd" />
    <path d="M5 11.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" />
  </svg>
);
const IconUserManagement = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.409-1.412A6.97 6.97 0 0010 11.5a6.97 6.97 0 00-6.535 2.993z" />
  </svg>
);
const IconContentManagement = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm1 4a1 1 0 100 2h3a1 1 0 100-2H8z" clipRule="evenodd" />
  </svg>
);
const IconDisputeManagement = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 2a1.5 1.5 0 00-1.5 1.5v1.282a1 1 0 01-1.928.386l-.014-.027a.5.5 0 00-.866-.5L3.309 6.22a.5.5 0 00.5.866l1.884-1.088a1 1 0 011.02.01l.014.008a3 3 0 005.766 0l.014-.008a1 1 0 011.02-.01l1.884 1.088a.5.5 0 00.5-.866l-2.383-1.577a.5.5 0 00-.866.5l-.014.027A1 1 0 0111.5 4.782V3.5A1.5 1.5 0 0010 2zM4.75 10a.75.75 0 01.75-.75h9.055a.25.25 0 00.2-.4l-2.023-3.034a.75.75 0 111.236-.824l2.5 3.75a1.75 1.75 0 010 2.016l-2.5 3.75a.75.75 0 11-1.236-.824L14.755 10.75H5.5a.75.75 0 01-.75-.75zm-.22 4.22a.75.75 0 001.06 1.06l3-3a.75.75 0 00-1.06-1.06l-3 3z" clipRule="evenodd" />
    <path d="M11.418 10.996a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06-1.06l-3-3z" />
  </svg>
);
const IconAnalytics = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);
const IconBrand = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M15 8a3 3 0 10-6 0v2H7a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1v-4a1 1 0 00-1-1h-2V8zm-3-1a1 1 0 100-2 1 1 0 000 2z" />
    <path fillRule="evenodd" d="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-1-1H5z" clipRule="evenodd" />
  </svg>
);

const IconMarketing = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l4.95-1.414a.75.75 0 00.544-.952L7.09 2.289a.75.75 0 00-.95-.544l-3.035.862zM14.47 9.53a.75.75 0 001.06-1.06l-4.95-4.95a.75.75 0 10-1.06 1.06l4.95 4.95z" />
    <path d="M1.242 17.06a.75.75 0 011.06 0l4.243-4.242a.75.75 0 111.06 1.06l-4.243 4.243a.75.75 0 01-1.06 0zM10.13 18.25a.75.75 0 00-1.06-1.06l-4.243 4.242a.75.75 0 001.06 1.06l4.243-4.242z" />
  </svg>
);
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.49 3.17a.75.75 0 01.447.886l-.06.242a.75.75 0 00.93.93l.242-.06a.75.75 0 01.886.447l.254.846a.75.75 0 01-.13.882l-.19.243a.75.75 0 000 .931l.19.243a.75.75 0 01.13.882l-.254.846a.75.75 0 01-.886.447l-.242-.06a.75.75 0 00-.93.93l.06.242a.75.75 0 01-.447.886l-.846.254a.75.75 0 01-.882-.13l-.243-.19a.75.75 0 00-.931 0l-.243.19a.75.75 0 01-.882.13l-.846-.254a.75.75 0 01-.447-.886l.06-.242a.75.75 0 00-.93-.93l-.242.06a.75.75 0 01-.886-.447l-.254-.846a.75.75 0 01.13-.882l.19-.243a.75.75 0 000-.931l-.19-.243a.75.75 0 01-.13-.882l.254-.846a.75.75 0 01.886-.447l.242.06a.75.75 0 00.93-.93l-.06-.242a.75.75 0 01.447-.886l.846-.254a.75.75 0 01.882.13l.243.19a.75.75 0 00.931 0l.243-.19a.75.75 0 01.882-.13l.846.254zM10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
  </svg>
);

const WithdrawalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.5-11a.5.5 0 00-1 0v2.793L7.354 7.146a.5.5 0 10-.708.708l3.147 3.147a.5.5 0 00.708 0l3.147-3.147a.5.5 0 10-.708-.708L11.5 9.793V7z" clipRule="evenodd" />
  </svg>
);


interface SidebarProps {
  view: AdminDashboardView;
  setView: (view: AdminDashboardView) => void;
  isMobile?: boolean;
  onClose?: () => void; // Add this prop
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  // { id: 'theme-management', label: 'Theme Management', icon: IconTheme },
  { id: 'ads-management', label: 'Ads Management', icon: IconAds },
  { id: 'user-management', label: 'User Management', icon: IconUserManagement },
  { id: 'fog-coin-management', label: 'Fog Coin Management', icon: IconFogCoin },
  { id: 'brand-management', label: 'Brands Management', icon: PackageIcon },
  { id: 'physical-job-requests', label: 'Physical Job Requests', icon: Briefcase },
  { id: 'giveaway-management', label: 'Giveaway Requests', icon: Gift },
  // { id: 'content-management', label: 'Content Management', icon: IconContentManagement },
  // { id: 'dispute-management', label: 'Dispute Management', icon: IconDisputeManagement },
  // { id: 'analytics', label: 'Analytics', icon: IconAnalytics },
  // { id: 'marketing', label: 'Marketing', icon: IconMarketing },
  // { id: 'settings', label: 'Settings', icon: IconSettings },
];

const dropdownSections = [
  {
    id: 'freelance-hub',
    label: 'Freelance Hub',
    icon: Briefcase,
    items: [
      { id: 'job-management', label: 'Job Requests', icon: Briefcase },
      { id: 'job-completions', label: 'Completed Jobs', icon: CheckCircle },
      { id: 'freelance-management', label: 'Freelance Requests', icon: IconUserManagement },
    ]
  },
  {
    id: 'payment-management',
    label: 'Payment Management',
    icon: IconPaymentRequests,
    items: [
      { id: 'payment-requests', label: 'Payment Requests', icon: IconPaymentRequests },
      { id: 'withdrawal-management', label: 'Withdrawal Requests', icon: WithdrawalIcon },
      { id: 'payment-methods', label: 'Payment Methods', icon: IconPaymentMethods },
    ]
  },
  {
    id: 'event-management',
    label: 'Event Management',
    icon: Calendar,
    items: [
      { id: 'event-requests', label: 'Event Requests', icon: Calendar },
      { id: 'active-events', label: 'Active Events', icon: CheckCircle },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ view, setView, isMobile = false, onClose }) => {
  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
    'freelance-hub': false,
    'payment-management': false,
    'event-management': false,
  });

  const { hasNewItems, markAsViewed } = useAdminNotifications();

  const toggleDropdown = (id: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if a dropdown section has any new items
  const sectionHasNewItems = (sectionId: string): boolean => {
    if (sectionId === 'freelance-hub') {
      return hasNewItems('job-management' as AdminDashboardView) || 
             hasNewItems('job-completions' as AdminDashboardView) || 
             hasNewItems('freelance-management' as AdminDashboardView);
    }
    if (sectionId === 'payment-management') {
      return hasNewItems('payment-requests' as AdminDashboardView) || 
             hasNewItems('withdrawal-management' as AdminDashboardView);
    }
    if (sectionId === 'event-management') {
      return hasNewItems('event-requests' as AdminDashboardView) || 
             hasNewItems('active-events' as AdminDashboardView);
    }
    return false;
  };

  // Handle view change and mark as viewed
  const handleViewChange = (newView: AdminDashboardView) => {
    setView(newView);
    markAsViewed(newView);
    
    // Close sidebar on mobile
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`w-64 bg-slate-950 flex flex-col border-r border-slate-800 overflow-hidden ${isMobile
        ? 'fixed inset-0 z-50 h-screen'
        : 'hidden lg:flex h-full'
      }`}>
      {/* Mobile Header with Close Button */}
      {/* <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-white font-semibold text-lg">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div> */}


      {/* <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <p className="px-2 pt-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AdminDashboardView)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === item.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className="mr-3 w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav> */}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <p className="px-2 pt-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>

        {/* Regular nav items */}
        {navItems.map(item => {
          const showBadge = hasNewItems(item.id as AdminDashboardView);
          return (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as AdminDashboardView)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <item.icon className="mr-3 w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {showBadge && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          );
        })}

        {/* Dropdown sections */}
        {dropdownSections.map(section => {
          const showSectionBadge = sectionHasNewItems(section.id);
          return (
            <div key={section.id} className="space-y-1">
              <button
                onClick={() => toggleDropdown(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  <section.icon className="mr-3 w-5 h-5 flex-shrink-0" />
                  <span>{section.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {showSectionBadge && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openDropdowns[section.id] ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Dropdown items */}
              {openDropdowns[section.id] && (
                <div className="ml-4 space-y-1 border-l-2 border-slate-700 pl-2">
                  {section.items.map(item => {
                    const showItemBadge = hasNewItems(item.id as AdminDashboardView);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as AdminDashboardView)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {showItemBadge && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <SyncIndicator />
      </div>
    </aside>
  );
};

export default Sidebar;