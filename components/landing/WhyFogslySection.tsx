import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Bot, 
  TrendingUp, 
  Coins, 
  Users 
} from 'lucide-react';

interface WhyFogslySectionProps {
  navigate: (route: string) => void;
}

interface EcoVisualProps {
  type: 'coins' | 'ai' | 'refer';
  pngSrc: string;
  svgSrc: string;
  alt: string;
}

const EcoVisual: React.FC<EcoVisualProps> = ({ type, pngSrc, svgSrc, alt }) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(pngSrc);

  const handleError = () => {
    if (currentSrc === pngSrc) {
      setCurrentSrc(svgSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-36 sm:h-40 flex items-center justify-center p-3">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600/10 via-sky-500/15 to-indigo-600/20 dark:from-blue-600/25 dark:to-indigo-900/40 border border-blue-500/20 flex flex-col items-center justify-center shadow-lg">
          {type === 'coins' && <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-[#0052FF] dark:text-sky-400" />}
          {type === 'ai' && <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-sky-600 dark:text-sky-400" />}
          {type === 'refer' && <Users className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-36 sm:h-40 flex items-center justify-center my-2">
      <img
        src={currentSrc}
        alt={alt}
        loading="eager"
        referrerPolicy="no-referrer"
        onError={handleError}
        className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_16px_rgba(37,99,235,0.2)] group-hover:scale-108 transition-transform duration-300"
      />
    </div>
  );
};

export const WhyFogslySection: React.FC<WhyFogslySectionProps> = ({ navigate }) => {
  const highlightFeatures = [
    {
      id: 'verified',
      icon: <img src="/images/quick-actions/value-verified-3d.png" alt="3D Verified" className="w-6 h-6 object-contain filter drop-shadow-xs" />,
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      title: 'Verified opportunities',
      subtext: 'From verified employers & organizers',
    },
    {
      id: 'discover',
      icon: <img src="/images/quick-actions/visual-career-hub.png" alt="3D Discover" className="w-6 h-6 object-contain filter drop-shadow-xs" />,
      bgClass: 'bg-indigo-500/10 border-indigo-500/20',
      title: 'Discover & apply in one place',
      subtext: 'Jobs, webinars, expos & events',
    },
    {
      id: 'ai',
      icon: <img src="/images/quick-actions/visual-fogsly-ai-bot.png" alt="3D AI" className="w-6 h-6 object-contain filter drop-shadow-xs" />,
      bgClass: 'bg-sky-500/10 border-sky-500/20',
      title: 'AI-powered guidance',
      subtext: 'Smart assistant while you search & grow',
    },
    {
      id: 'skills',
      icon: <img src="/images/quick-actions/visual-event-creator.png" alt="3D Skills" className="w-6 h-6 object-contain filter drop-shadow-xs" />,
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Build skills & grow',
      subtext: 'Career opportunities & conferences',
    },
    {
      id: 'network',
      icon: <img src="/images/quick-actions/visual-fog-coin.png" alt="3D Earn" className="w-6 h-6 object-contain filter drop-shadow-xs" />,
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      title: 'Connect, network & earn',
      subtext: 'Community referrals & FOG Coins',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 24 },
    },
  };

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-transparent relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#0052FF] dark:text-[#3B82F6] inline-block mb-2.5"
          >
            WHY FOGSLY?
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-3"
          >
            One Platform. More Than Jobs.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-[#64748B] dark:text-slate-400 font-medium tracking-tight"
          >
            Opportunity Discovery <span className="text-[#0052FF] dark:text-[#3B82F6] mx-1">→</span> Action <span className="text-[#0052FF] dark:text-[#3B82F6] mx-1">→</span> Rewards
          </motion.p>
        </div>

        {/* Horizontal 5-Feature Bar */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {highlightFeatures.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-blue-300 dark:hover:border-blue-800/80 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 border ${item.bgClass}`}>
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-tight truncate">
                  {item.title}
                </p>
                <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 font-normal leading-tight line-clamp-1 mt-0.5">
                  {item.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 Core Ecosystem Cards (FOG COIN, FOGSLY AI, REFER & EARN) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Card 1: FOG COIN */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-blue-400/50 hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-600/5 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              {/* Header with 3D Coin Badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-blue-600 dark:text-sky-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-2 shadow-sm">
                  <img src="/images/eco-icons/fog-coins.png" alt="3D FOG Coin" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight uppercase">
                  FOG COIN
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 font-normal leading-relaxed mb-6">
                Earn rewards through your activity across Fogsly. 1 FOG = PKR 28 ($0.10 USD).
              </p>
            </div>

            {/* Visual Illustration */}
            <EcoVisual
              type="coins"
              pngSrc="/images/quick-actions/visual-fog-coin.png"
              svgSrc="/images/quick-actions/visual-fog-coin.svg"
              alt="3D FOG Coins Stack"
            />

            {/* Action Link */}
            <div className="relative z-10 pt-3">
              <button
                type="button"
                onClick={() => navigate('fog-coins')}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#0052FF] dark:text-[#3B82F6] hover:text-[#0040CC] transition-colors group/link cursor-pointer"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-200" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: FOGSLY AI (Coming Soon) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-sky-400/50 hover:shadow-[0_16px_36px_rgba(0,82,255,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-600/5 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              {/* Header with 3D AI Badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-2 shadow-sm">
                  <img src="/images/eco-icons/built-in-ai-tools.png" alt="3D Fogsly AI" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0052FF] dark:text-[#3B82F6] tracking-tight uppercase">
                  FOGSLY AI
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 font-normal leading-relaxed mb-6">
                Get intelligent guidance while you search, apply and grow.
              </p>
            </div>

            {/* Visual Illustration */}
            <EcoVisual
              type="ai"
              pngSrc="/images/quick-actions/visual-fogsly-ai-bot.png"
              svgSrc="/images/quick-actions/visual-fogsly-ai-bot.svg"
              alt="3D Fogsly AI Robot"
            />

            {/* Action: Coming Soon */}
            <div className="relative z-10 pt-3">
              <button
                type="button"
                onClick={() => navigate('ai-assistant')}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#0052FF] dark:text-[#3B82F6] hover:text-[#0040CC] transition-colors group/link cursor-pointer"
              >
                <span>Coming Soon</span>
                <Sparkles className="w-4 h-4 text-[#0052FF] dark:text-[#3B82F6] animate-pulse" />
              </button>
            </div>
          </motion.div>

          {/* Card 3: REFER & EARN */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-blue-400/50 hover:shadow-[0_16px_36px_rgba(0,82,255,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-600/5 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              {/* Header with 3D Refer Badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-2 shadow-sm">
                  <img src="/images/eco-icons/referral-sysem.png" alt="3D Refer & Earn" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0052FF] dark:text-[#3B82F6] tracking-tight uppercase">
                  REFER & EARN
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 font-normal leading-relaxed mb-6">
                Invite people, grow our community and earn FOG.
              </p>
            </div>

            {/* Visual Illustration */}
            <EcoVisual
              type="refer"
              pngSrc="/images/quick-actions/visual-refer-earn-team.png"
              svgSrc="/images/quick-actions/visual-refer-earn-team.svg"
              alt="3D Refer and Earn Team"
            />

            {/* Action Link */}
            <div className="relative z-10 pt-3">
              <button
                type="button"
                onClick={() => navigate('referrals')}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#0052FF] dark:text-[#3B82F6] hover:text-[#0040CC] transition-colors group/link cursor-pointer"
              >
                <span>Refer Now</span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-200" />
              </button>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default WhyFogslySection;
