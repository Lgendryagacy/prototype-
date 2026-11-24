import React from "react";
import { motion } from "framer-motion";

/**
 * ULTRA PREMIUM FOUNDER BADGE
 * Exclusive badge for Fogsly CEO/Founder with rank #0
 * Features: Diamond/Ruby design, shimmer effects, radial glow, sparkles
 */

interface FounderBadgeProps {
  rank?: number;
}

// Sparkle animation for floating particles - More contained
const sparkleVariants = {
  animate: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [0, 0.8, 0],
    x: [0, Math.sin(i) * 8, Math.sin(i) * 15],
    y: [0, -Math.cos(i) * 8, -Math.cos(i) * 15],
    transition: {
      duration: 2,
      repeat: Infinity,
      delay: i * 0.25,
      ease: "easeOut",
    },
  }),
};

// Shimmer sweep animation
const shimmerVariants = {
  animate: {
    x: ["-200%", "200%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatDelay: 1,
      ease: "easeInOut",
    },
  },
};

// Pulse glow animation
const pulseGlow = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Diamond facet shine
const diamondShine = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export default function FounderBadge({ rank = 0 }: FounderBadgeProps) {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      {/* Outer glow aura - Reduced and contained */}
      <motion.div
        variants={pulseGlow}
        animate="animate"
        className="absolute -inset-3 rounded-2xl blur-xl opacity-40"
        style={{
          background:
            "radial-gradient(ellipse, rgba(251,191,36,0.6) 0%, rgba(234,88,12,0.4) 40%, transparent 70%)",
        }}
      />

      {/* Secondary shimmer aura */}
      <motion.div
        variants={pulseGlow}
        animate="animate"
        className="absolute -inset-2 rounded-2xl blur-lg opacity-30"
        style={{
          background:
            "radial-gradient(ellipse, rgba(234,179,8,0.7) 0%, rgba(251,146,60,0.4) 50%, transparent 80%)",
        }}
      />

      {/* Sparkle particles - Smaller and closer */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={sparkleVariants}
          animate="animate"
          className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-200"
          style={{
            boxShadow: "0 0 6px rgba(250,204,21,0.6), 0 0 12px rgba(251,191,36,0.4)",
          }}
        />
      ))}

      {/* Main Badge Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Diamond facet pattern (rotating background) */}
        <motion.div
          variants={diamondShine}
          animate="animate"
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(251,191,36,0.3) 25%, transparent 50%, rgba(234,88,12,0.3) 75%, transparent 100%)",
          }}
        />

        {/* Outer frame - Multi-color gradient border (Ruby/Gold/Diamond) */}
        <div
          className="p-[3px] rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, #fbbf24 0%, #f59e0b 15%, #dc2626 30%, #b91c1c 45%, #7c2d12 60%, #fbbf24 75%, #fde047 90%, #fef3c7 100%)",
          }}
        >
          {/* Inner glow border */}
          <div
            className="p-[2px] rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.5), rgba(220,38,38,0.5), rgba(251,191,36,0.5))",
            }}
          >
            {/* Main background - Dark luxury gradient - Compact */}
            <div
              className="relative rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #0a0a0a 0%, #18181b 20%, #27272a 40%, #422006 60%, #78350f 80%, #451a03 100%)",
              }}
            >
              {/* Animated diamond pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251,191,36,0.1) 10px, rgba(251,191,36,0.1) 20px),
                    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(220,38,38,0.1) 10px, rgba(220,38,38,0.1) 20px)
                  `,
                }}
              />

              {/* Shimmer sweep effect */}
              <motion.div
                variants={shimmerVariants}
                animate="animate"
                className="absolute inset-y-0 w-[50%] skew-x-12"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), rgba(251,191,36,0.6), transparent)",
                  filter: "blur(10px)",
                }}
              />

              {/* Content Container - Compact */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                {/* Left: Rank Number with Diamond Shape */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {/* Diamond glow - Reduced */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 12px rgba(251,191,36,0.6), 0 0 24px rgba(234,88,12,0.4)",
                          "0 0 18px rgba(251,191,36,0.8), 0 0 36px rgba(234,88,12,0.6)",
                          "0 0 12px rgba(251,191,36,0.6), 0 0 24px rgba(234,88,12,0.4)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-1 rounded-lg rotate-45 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 opacity-50 blur-sm"
                    />

                    {/* Diamond container - Smaller */}
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rotate-45 rounded-md overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #dc2626 50%, #fbbf24 75%, #fef3c7 100%)",
                        }}
                      />
                      {/* Rank number (rotated back) */}
                      <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                        <span className="text-black font-black text-base sm:text-lg drop-shadow-md">
                          #{rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title with Crown Icon */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      {/* Crown + Diamond SVG */}
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="url(#crownGradient)"
                      >
                        <defs>
                          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <path d="M3 7l4 4 5-6 5 6 4-4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                        <path d="M12 12l2 2-2 4-2-4 2-2z" />
                      </svg>

                      <span
                        className="font-black text-xs sm:text-sm tracking-wide"
                        style={{
                          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 1px 2px rgba(251,191,36,0.4))",
                        }}
                      >
                        FOGSLY FOUNDER
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Founder Label - Repositioned */}
                <div className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5">
                  <motion.div
                    animate={{
                      rotate: [0, 3, 0, -3, 0],
                      scale: [1, 1.03, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-black shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #fef3c7 0%, #fde047 50%, #fbbf24 100%)",
                      boxShadow:
                        "0 2px 8px rgba(251,191,36,0.4), 0 0 15px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    Founder
                  </motion.div>
                </div>
              </div>

              {/* Bottom decorative shine line */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scaleX: [0.8, 1, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-0 left-0 right-0 h-[2px] origin-center"
                style={{
                  background: "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #dc2626, transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom reflection effect - Reduced */}
      <div
        className="absolute -bottom-2 left-0 right-0 h-4 rounded-b-2xl opacity-15 blur-lg"
        style={{
          background: "linear-gradient(180deg, rgba(251,191,36,0.3) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
