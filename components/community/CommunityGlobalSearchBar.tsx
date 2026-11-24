import React, { useRef } from 'react';
import { Search, X, Tag, User, FileText, Sparkles, Filter } from 'lucide-react';

export type SearchFilterMode = 'all' | 'keywords' | 'tags' | 'authors';

interface CommunityGlobalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchMode: SearchFilterMode;
  onSearchModeChange: (mode: SearchFilterMode) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  totalMatchesCount: number;
  totalPostsCount: number;
}

const POPULAR_DISCOVERY_TAGS = [
  'Remote',
  'FogslyOfficial',
  'Grant2026',
  'Salaries',
  'Frontend',
  'Internship',
  'AI',
  'Karachi',
];

export const CommunityGlobalSearchBar: React.FC<CommunityGlobalSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  selectedTag,
  onTagSelect,
  totalMatchesCount,
  totalPostsCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilter = Boolean(searchQuery.trim() || selectedTag);

  const handleClearAll = () => {
    onSearchChange('');
    onTagSelect('');
    inputRef.current?.focus();
  };

  const getPlaceholder = () => {
    switch (searchMode) {
      case 'keywords':
        return 'Search by keywords in title or content...';
      case 'tags':
        return 'Filter posts by topic tag (e.g., remote, grant, react)...';
      case 'authors':
        return 'Find posts by author name or company...';
      default:
        return 'Search by keywords, tags (#remote), or author name...';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 mb-4 transition-colors">
      {/* 1. Main Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-sky-400 stroke-[2.2]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full pl-10 sm:pl-11 pr-20 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#0B0F19] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
            /
          </span>
        </div>
      </div>

      {/* 2. Mode Tabs & Active Summary Row */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        {/* Mode Selector Pill Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filter:
          </span>

          <button
            type="button"
            onClick={() => onSearchModeChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              searchMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={() => onSearchModeChange('keywords')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              searchMode === 'keywords'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Keywords</span>
          </button>

          <button
            type="button"
            onClick={() => onSearchModeChange('tags')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              searchMode === 'tags'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Tags</span>
          </button>

          <button
            type="button"
            onClick={() => onSearchModeChange('authors')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              searchMode === 'authors'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Authors</span>
          </button>
        </div>

        {/* Match Count & Clear Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {hasActiveFilter ? (
              <span>
                <strong className="text-blue-600 dark:text-sky-400 font-bold">{totalMatchesCount}</strong> of{' '}
                {totalPostsCount} found
              </span>
            ) : (
              <span>{totalPostsCount} discussions</span>
            )}
          </span>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-blue-600 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 font-semibold hover:underline cursor-pointer ml-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Quick Filter Tag Chips Row */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Popular tags:
        </span>

        {POPULAR_DISCOVERY_TAGS.map((tag) => {
          const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(isSelected ? '' : tag)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
