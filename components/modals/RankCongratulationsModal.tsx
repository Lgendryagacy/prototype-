import React, { useEffect, useState } from 'react';
import { X, Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';
import { Button } from '../ui/Button';
import FogslyRankBanner from '../badges/FogslyRankBanner';
import { getRankData, getTierFromRank } from '../../utils/rankUtils';

interface RankCongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRank: number;
  userName: string;
  isNewUser?: boolean;
}

const RankCongratulationsModal = ({
  isOpen,
  onClose,
  userRank,
  userName,
  isNewUser = false
}: RankCongratulationsModalProps) => {
  const [showContent, setShowContent] = useState(false);

  // Determine tier based on rank - using utility function
  const tier = getTierFromRank(userRank);

  // Get congratulatory messages based on tier and new user status
  const getMessages = () => {
    const baseMessages = {
      legend: {
        title: "🏅FOGSLY LEGEND ACHIEVED! 🏅",
        subtitle: `Welcome to the elite, ${userName}!`,
        achievement: "Top 5 Worldwide",
        description: "You've reached the pinnacle of FOGSLY! As a Legend, you're among the top 5 users globally. Your expertise and dedication have earned you the highest honors."
      },
      master: {
        title: "👑FOGSLY MASTER STATUS! 👑",
        subtitle: `Outstanding achievement, ${userName}!`,
        achievement: "Top 20 Worldwide",
        description: "Exceptional! You've mastered the FOGSLY platform and earned your place among the top 20 users. Your skills are truly remarkable."
      },
      vanguard: {
        title: "⚡FOGSLY VANGUARD ELITE! ⚡",
        subtitle: `Impressive progress, ${userName}!`,
        achievement: "Top 100 Worldwide",
        description: "You're leading the way! As a Vanguard member, you're in the top 100 users, setting the standard for excellence on FOGSLY."
      },
      earlybird: {
        title: "�FOGSLY EARLY BIRD! �",
        subtitle: `Great start, ${userName}!`,
        achievement: "Top 300 Worldwide",
        description: "You're off to a fantastic start! Your early adoption and engagement have earned you a spot in the top 300 users."
      },
      champion: {
        title: "�FOGSLY CHAMPION RANK! �",
        subtitle: `Well done, ${userName}!`,
        achievement: "Top 1000 Worldwide",
        description: "Congratulations on becoming a Champion! You're among the top 1000 users, showcasing your commitment to the FOGSLY community."
      },
      rookie: {
        title: "🌱WELCOME ROOKIE! 🌱",
        subtitle: `Great to have you, ${userName}!`,
        achievement: "New Member",
        description: "Welcome to FOGSLY! You're starting your journey with unlimited potential. Every expert was once a beginner!"
      }
    };

    const messages = baseMessages[tier as keyof typeof baseMessages];

    // If no message found for tier, return a default message
    if (!messages) {
      return {
        title: "🎉 WELCOME TO FOGSLY! 🎉",
        subtitle: `Great to have you, ${userName}!`,
        achievement: `Member #${userRank}`,
        description: "Thank you for joining our community! Your journey with FOGSLY begins now."
      };
    }

    // Customize for new users
    if (isNewUser) {
      return {
        ...messages,
        title: ` ${messages.title} `,
        subtitle: `Welcome to FOGSLY, ${userName}!`,
        description: `${messages.description} Your adventure begins now!`
      };
    }

    return messages;
  };

  const messages = getMessages();

  // Trigger content animation after modal appears (simplified - no animation just timing)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Don't render modal if not open
  if (!isOpen) {
    return null;
  }
  
  // Prevent closing when clicking on modal content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Floating elements (no animation, just static decoration)
  const floatingElements = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className="absolute opacity-40"
      style={{
        left: `${10 + (i * 10)}%`,
        top: `${15 + (i % 3) * 20}%`,
      }}
    >
      {i % 4 === 0 ? (
        <Star className="w-4 h-4 text-yellow-400" />
      ) : i % 4 === 1 ? (
        <Sparkles className="w-4 h-4 text-blue-400" />
      ) : i % 4 === 2 ? (
        <Trophy className="w-3 h-3 text-yellow-500" />
      ) : (
        <PartyPopper className="w-4 h-4 text-purple-400" />
      )}
    </div>
  ));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop with celebratory effect */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Floating celebration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements}
      </div>

      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto modal-scrollable"
        onClick={handleContentClick}
      >
        {/* Main content with scroll */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-white/10 shadow-md">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors hover:scale-110"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              {/* Header */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2 px-2 leading-tight">
                  {messages.title}
                </h1>
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-semibold px-2">
                  {messages.subtitle}
                </p>
              </div>

              {/* Rank Banner */}
              <div className="px-2">
                <FogslyRankBanner
                  rank={userRank}
                  tier={tier}
                  label={getRankData(userRank).label}
                  compact={false}
                />
              </div>

              {/* Achievement badge */}
              <div className="flex justify-center px-2">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-300 font-bold text-sm sm:text-base md:text-lg">
                    {messages.achievement}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-2">
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  {messages.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-2">
                <Button
                  onClick={onClose}
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-sm transform transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-gray-600 text-gray-300 hover:bg-gray-800 text-sm sm:text-base rounded-lg sm:rounded-xl"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankCongratulationsModal;
