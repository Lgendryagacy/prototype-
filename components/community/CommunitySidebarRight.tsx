import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ArrowRight, 
  UserPlus, 
  Check, 
  Sparkles,
  Shield,
  Award,
  Coins,
  ShieldCheck,
  Flame,
  Zap
} from 'lucide-react';
import { CommunityConnection } from './types';

interface CommunitySidebarRightProps {
  connections: CommunityConnection[];
  onToggleConnect: (connectionId: string) => void;
  onTagClick: (tag: string) => void;
  selectedTag?: string;
  onViewEventClick?: () => void;
  onOpenUserProfile: (authorId: string) => void;
  onSelectCategory?: (category: any) => void;
}

const TRENDING_TOPICS = [
  { tag: 'Nextjs15', postsCount: '142', isHot: true },
  { tag: 'AIAgents', postsCount: '118', isHot: true },
  { tag: 'SystemDesign', postsCount: '95', isHot: false },
  { tag: 'EscrowContracts', postsCount: '64', isHot: false },
  { tag: 'FreelanceRates', postsCount: '52', isHot: false },
  { tag: 'SolanaWeb3', postsCount: '48', isHot: false },
];

export const CommunitySidebarRight: React.FC<CommunitySidebarRightProps> = ({
  connections,
  onToggleConnect,
  onTagClick,
  selectedTag,
  onOpenUserProfile,
  onSelectCategory,
}) => {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-28">
      {/* FOGSLY OFFICIAL HUB CARD */}
      <div className="rounded-2xl bg-white dark:bg-[#0E1526] p-5 border border-slate-200/90 dark:border-blue-500/25 shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white font-black text-[10px]">
              F
            </span>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Fogsly Official Hub
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-[#489fff] border border-blue-500/20">
            VERIFIED
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          Direct escrow grants, 15+ verified $4k–$8k/mo international contracts, and priority CTO interviews curated by Fogsly.
        </p>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
            <span>$15,000 Non-Equity Dev Grants</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
            <span>Zero Agency Cuts & Escrow Guarantees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
            <span>Direct Fast-Track CTO Interviews</span>
          </div>
        </div>

        {onSelectCategory && (
          <button
            onClick={() => onSelectCategory('exclusive')}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Official Publications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 1. FOGSLY CONTRIBUTOR STANDING CARD */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#131F37] to-[#1E293B] text-white p-5 border border-slate-700/80 shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Contributor Standing</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            PRO ARCHITECT
          </span>
        </div>

        <div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>2,450</span>
            <span className="text-xs text-slate-400 font-normal">Reputation Score</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Answer architectural questions, review code, and contribute verified solutions to earn recognition.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
          <span>Weekly Ranking:</span>
          <span className="font-semibold text-emerald-400">Top 3% Contributor</span>
        </div>
      </div>

      {/* 2. TRENDING TOPICS */}
      <div className="bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Trending Technical Tags
            </h3>
          </div>
          {selectedTag && (
            <button
              onClick={() => onTagClick('')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {TRENDING_TOPICS.map((item) => {
            const isSelected = selectedTag?.toLowerCase() === item.tag.toLowerCase();
            return (
              <button
                key={item.tag}
                onClick={() => onTagClick(isSelected ? '' : item.tag)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>#{item.tag}</span>
                  {item.isHot && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                      HOT
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {item.postsCount} posts
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SUGGESTED BUILDERS & TECH LEADERS */}
      <div className="bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Verified Builders in Hub
          </h3>
        </div>

        <div className="space-y-3.5">
          {connections.slice(0, 4).map((conn) => (
            <div key={conn.id} className="flex items-center justify-between gap-2.5">
              <button
                onClick={() => onOpenUserProfile(conn.userId)}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
              >
                <img
                  src={conn.avatar}
                  alt={conn.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    <span className="truncate">{conn.name}</span>
                    <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {conn.role}
                  </div>
                </div>
              </button>

              <button
                onClick={() => onToggleConnect(conn.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  conn.status === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
              >
                {conn.status === 'connected' ? 'Connected ✓' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ESCROW STANDARDS */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Fogsly Escrow Protection</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Collaborations originated in the community qualify for milestone escrow locking and automated dispute mediation.
        </p>
      </div>
    </aside>
  );
};

export default CommunitySidebarRight;
