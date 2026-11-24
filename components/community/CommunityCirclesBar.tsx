import React from 'react';
import { Sparkles, Users, CheckCircle2 } from 'lucide-react';

export interface CommunityCircle {
  id: string;
  name: string;
  shortName: string;
  avatar: string;
  members: string;
  tagFilter?: string;
  live?: boolean;
  color: string;
}

const COMMUNITY_CIRCLES: CommunityCircle[] = [
  {
    id: 'all',
    name: 'All Community',
    shortName: 'Universal',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    members: '12.8k',
    live: true,
    color: 'from-[#0052FF] to-[#5B48EE]',
  },
  {
    id: 'nust',
    name: 'NUST Tech Circle',
    shortName: 'NUST',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
    members: '2.4k',
    tagFilter: 'Startups',
    live: true,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'fast-acm',
    name: 'FAST ACM Chapter',
    shortName: 'FAST',
    avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
    members: '1.9k',
    tagFilter: 'Nextjs',
    live: false,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'lums',
    name: 'LUMS Innovators',
    shortName: 'LUMS',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80',
    members: '1.7k',
    tagFilter: 'Startups',
    live: true,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'lahore-ai',
    name: 'Lahore AI Guild',
    shortName: 'Lahore AI',
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
    members: '3.1k',
    tagFilter: 'AI',
    live: true,
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'karachi-devs',
    name: 'Karachi Freelancers',
    shortName: 'Karachi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    members: '4.2k',
    tagFilter: 'Freelancing',
    live: true,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'islamabad-founders',
    name: 'Islamabad Founders',
    shortName: 'Islamabad',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
    members: '2.1k',
    tagFilter: 'Jobs',
    live: false,
    color: 'from-indigo-600 to-violet-700',
  },
  {
    id: 'remote-pk',
    name: 'Remote PK Network',
    shortName: 'Remote PK',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    members: '5.6k',
    tagFilter: 'RemoteWork',
    live: true,
    color: 'from-blue-500 to-emerald-500',
  },
];

interface CommunityCirclesBarProps {
  selectedCircle: string;
  onSelectCircle: (circleId: string, tagFilter?: string) => void;
}

export const CommunityCirclesBar: React.FC<CommunityCirclesBarProps> = ({
  selectedCircle,
  onSelectCircle,
}) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Campus & Specialty Circles
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          Tap circle to filter discussions
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {COMMUNITY_CIRCLES.map((circle) => {
          const isSelected = selectedCircle === circle.id;
          return (
            <button
              key={circle.id}
              onClick={() => onSelectCircle(circle.id, circle.tagFilter)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-none"
              title={`${circle.name} (${circle.members} members)`}
            >
              {/* Avatar with gradient border ring */}
              <div
                className={`relative p-0.5 rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'ring-3 ring-[#0052FF] scale-105 shadow-md'
                    : 'bg-gradient-to-tr ' + circle.color + ' opacity-90 group-hover:opacity-100 group-hover:scale-105'
                }`}
              >
                <div className="p-0.5 bg-white dark:bg-[#111827] rounded-full">
                  <img
                    src={circle.avatar}
                    alt={circle.name}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover"
                  />
                </div>

                {/* Live Dot Indicator */}
                {circle.live && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#111827] shadow-xs" />
                )}
              </div>

              {/* Circle label & member count */}
              <span
                className={`text-[11px] font-bold truncate max-w-[70px] sm:max-w-[80px] transition-colors ${
                  isSelected
                    ? 'text-[#0052FF] dark:text-blue-400 font-black'
                    : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              >
                {circle.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityCirclesBar;
