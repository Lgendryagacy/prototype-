import React from 'react';
import { 
  Home, 
  Compass, 
  Activity, 
  Bookmark, 
  Users, 
  CheckCircle2, 
  Globe,
  Award,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CommunitySidebarTab } from './types';

interface CommunitySidebarLeftProps {
  activeTab: CommunitySidebarTab;
  onSelectTab: (tab: CommunitySidebarTab) => void;
  savedCount: number;
  connectionsCount: number;
  activeCircle?: string;
  onSelectCircle?: (circleId: string) => void;
}

export const CommunitySidebarLeft: React.FC<CommunitySidebarLeftProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  connectionsCount,
  activeCircle = 'all',
  onSelectCircle,
}) => {
  const navItems: { id: CommunitySidebarTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Main Feed', icon: <Home className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover & Trending', icon: <Compass className="w-4 h-4" /> },
    { id: 'my-activity', label: 'My Submissions', icon: <Activity className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Bookmarks', icon: <Bookmark className="w-4 h-4" />, badge: savedCount },
    { id: 'my-connections', label: 'My Network', icon: <Users className="w-4 h-4" />, badge: connectionsCount },
  ];

  const POPULAR_HUBS = [
    { id: 'all', name: 'Universal Feed', badge: 'All' },
    { id: 'tech-ai', name: 'AI & Engineering', badge: '5.2k' },
    { id: 'freelance-remotework', name: 'Freelance & Remote', badge: '4.8k' },
    { id: 'startups-founders', name: 'Startups & Scaleups', badge: '2.9k' },
    { id: 'students-grads', name: 'Universities & Careers', badge: '3.4k' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto community-scroll-rail pr-1 flex flex-col gap-4">
      {/* Active Community Hub Selector Card */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#5B48EE] flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Active Network
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Fogsly Universal
            </h3>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Community
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
            v2.4
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="bg-white dark:bg-[#111827] p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0052FF]/10 dark:bg-[#0052FF]/20 text-[#0052FF] dark:text-blue-400 font-black shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#0052FF] dark:text-blue-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialty Hubs Quick Access */}
      {onSelectCircle && (
        <div className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0052FF]" />
              Specialty Hubs
            </span>
          </div>
          <div className="space-y-1">
            {POPULAR_HUBS.map((hub) => {
              const isSelected = activeCircle === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => onSelectCircle(hub.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{hub.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{hub.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Quality Standard Card */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/20 p-4 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-[#5B48EE] dark:text-[#818CF8]" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quality Standard
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Fogsly Community upholds 100% verified value:
        </p>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Clear Asks & Offers:</strong> Actionable peer discussions.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Zero Spam Policy:</strong> Proactive AI & admin queue.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Direct Work Links:</strong> Jobs & events connected.</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default CommunitySidebarLeft;
