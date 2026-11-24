import React from 'react';

/**
 * Skeleton loading card for the CommunityPage feed.
 * Matches the refactored PostCard card-based layout with minimal, high-signal metadata.
 */
export const CommunityPostSkeleton: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-4">
      {/* Author & Header Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <div className="h-4 w-32 sm:w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-48 sm:w-56 rounded-md bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
      </div>

      {/* Post Title */}
      <div className="space-y-2 pt-1">
        <div className="h-5 w-4/5 rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Post Body Lines */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-md bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-3.5 w-11/12 rounded-md bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-3.5 w-2/3 rounded-md bg-slate-100 dark:bg-slate-800/70" />
      </div>

      {/* Tags Placeholder */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-5 w-14 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-5 w-16 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-5 w-20 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Action Row */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="hidden sm:block h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loading card for the Jobs feed.
 * Matches the clean layout of JobsExplorer job cards.
 */
export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* Logo Placeholder */}
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Job Details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="h-5 w-48 sm:w-64 rounded-md bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="h-3.5 w-28 rounded-md bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3.5 w-24 rounded-md bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3.5 w-20 rounded-md bg-slate-100 dark:bg-slate-800/60" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 w-14 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-5 w-16 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-5 w-20 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        </div>

        {/* Action Button Placeholder */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/80">
          <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-10 w-28 rounded-xl bg-[#489fff]/20 dark:bg-[#489fff]/10" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loading card for the Events feed.
 * Matches the 3-column grid layout of EventsExplorer cards.
 */
export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden animate-pulse flex flex-col justify-between">
      {/* Banner Placeholder */}
      <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative">
        <div className="absolute top-3 left-3 h-6 w-20 rounded-xl bg-slate-900/40" />
        <div className="absolute top-3 right-3 h-5 w-16 rounded-full bg-slate-900/40" />
      </div>

      {/* Event Details */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-5 w-5/6 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-4/5 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 rounded-md bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-3.5 w-16 rounded-md bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800 mt-2" />
        </div>
      </div>
    </div>
  );
};
