import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { isEligibleForRank } from "../../utils/rankUtils";
import FounderBadge from "./FounderBadge";

/**
 * Profile Rank Banner — Compact version designed specifically for profile headers (Only for first 1000 users)
 * Uses same colors and tiers as FogslyRankBanner but optimized for profile layout
 */

const TIERS = {

  founder: {
    name: "FOGSLY FOUNDER",
    bg: "from-black via-neutral-900 to-amber-700",
    frame: "bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300",
    glow: "shadow-[0_0_80px_rgba(251,191,36,0.95)]",
    text: "text-amber-100",
    accent: "bg-amber-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 text-amber-300"
        fill="currentColor"
        aria-hidden
      >
        {/* Crown + Diamond */}
        <path d="M3 7l4 4 5-6 5 6 4-4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M12 12l2 2-2 4-2-4 2-2z" />
      </svg>
    ),
  },

  legend: {
    name: "FOGSLY Legend",
    bg: "from-yellow-400 via-amber-500 to-orange-600",
    frame: "bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-200",
    text: "text-white",
    border: "border-yellow-800",
    accent: "bg-yellow-400",
    tierText: "text-black",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z" />
      </svg>
    ),
  },
  master: {
    name: "FOGSLY Master",
    bg: "from-yellow-300 via-yellow-400 to-yellow-600",
    frame: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    text: "text-yellow-900",
    accent: "bg-yellow-300",
    border: "border-yellow-900",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M12 3l2.39 4.84 5.34.78-3.87 3.77.91 5.33L12 15.9l-4.77 2.5.91-5.33L4.27 8.62l5.34-.78L12 3z" />
      </svg>
    ),
  },
  vanguard: {
    name: "FOGSLY Vanguard",
    bg: "from-gray-300 via-gray-400 to-gray-600",
    frame: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    text: "text-black/80",
    accent: "text-black",
    border: "border-white-900",

    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M13 2l-1 9h8l-9 11 1-9H4l9-11z" />
      </svg>
    ),
  },
  earlybird: {
    name: "FOGSLY EarlyBird",
    bg: "from-orange-500 via-orange-600 to-orange-700",
    frame: "bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400",
    text: "text-white",
    accent: "bg-orange-400",
    border: "border-yellow-900",

    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M22 12s-4-2-7-2c-3.87 0-7 3.13-7 7 0 0-4-2-6-2 2-3 6-10 13-10 4 0 7 2 7 2l-2 5z" />
      </svg>
    ),
  },
  champion: {
    name: "FOGSLY Champion",
    bg: "from-blue-500 via-blue-600 to-blue-800",
    frame: "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400",
    text: "text-white",
    accent: "bg-blue-400",
    border: "border-blue-900",

    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M12 2l4 8h8l-6 6 2 8-8-5-8 5 2-8-6-6h8l4-8z" />
      </svg>
    ),
  },
};

const shineVariants = {
  initial: { x: "-100%", opacity: 0 },
  animate: {
    x: "100%",
    opacity: [0, 0.8, 0],
    transition: { duration: 1.5, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 4 },
  },
};

const popIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

interface ProfileRankBannerProps {
  rank: number;
  tier?: 'founder' | 'legend' | 'master' | 'vanguard' | 'earlybird' | 'champion';
  label?: string;
}

function ProfileRankBanner({ rank, tier = "master", label }: ProfileRankBannerProps) {
  // Don't render banner if user is not eligible for rank (rank > 1000)
  if (!isEligibleForRank(rank)) {
    return null;
  }

  // Special handling for Founder (rank #0) - CEO/Founder exclusive badge
  if (rank === 0) {
    return <FounderBadge rank={rank} />;
  }

  const t = useMemo(() => TIERS[tier] ?? TIERS.master, [tier]);
  const textLabel = label || t.name;
  const rankText = `#${rank}`;

  return (
    <motion.div
      key={`profile-${tier}-${rank}`}
      variants={popIn}
      initial="initial"
      animate="animate"
      className={`relative w-full max-w-xs sm:max-w-sm overflow-hidden rounded-xl `}
    >
      {/* Outer frame */}
      <div className={`p-[1.5px] rounded-xl ${t.frame}`}>
        {/* Banner core */}
        <div className={`relative rounded-xl  px-3 py-2 sm:px-4 sm:pl-2 sm:py-3 bg-gradient-to-r ${t.bg}`}>
          {/* Subtle pattern overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Shine effect */}
          <motion.div
            className="absolute -inset-y-2 w-1/4 skew-x-12 bg-white/30 blur-sm"
            variants={shineVariants}
            initial="initial"
            animate="animate"
          />

          <div className="relative z-10 flex items-center justify-between gap-2">
            {/* Left side - Rank and Icon */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`absolute -inset-0.5 rounded-full blur-sm opacity-60 ${t.accent}`} />
                <div className={`relative rounded-full bg-white/25 backdrop-blur-sm border ${t.border} w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center`}>
                  <span className={` ${t.text} font-bold text-xs sm:text-sm drop-shadow-md`}>{rankText}</span>
                </div>
              </div>

              <div className="flex items-center ">
                {/* <span className="text-white opacity-90">{t.icon}</span> */}
                <span className={` ${t.text} font-bold text-sm sm:text-base   max-w-[170px] sm:max-w-[170px]`}>
                  {textLabel}
                </span>
              </div>
            </div>

            {/* Right side - No tier info, just minimal badge */}
            <div className="flex-shrink-0 absolute sm:-top-4 -right-4 -top-3">
              <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-black bg-white/90 shadow-sm`}>
                {tier === "founder" && "Founder"}
                {tier === "legend" && "Top 5"}
                {tier === "master" && "Top 20"}
                {tier === "vanguard" && "Top 100"}
                {tier === "earlybird" && "Top 300"}
                {tier === "champion" && "Top 1K"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileRankBanner;
