import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Sparkles,
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  Coins,
  Compass,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Video
} from 'lucide-react';

interface HeroSectionProps {
  navigate: (route: string) => void;
  isLoading?: boolean;
}

// Hero Skeleton Placeholder Component
export const HeroSkeleton: React.FC = () => {
  return (
    <div 
      aria-label="Loading Hero Section"
      className="relative z-10 w-full max-w-4xl min-h-0 mx-auto grid grid-cols-1 justify-items-center gap-y-5 sm:gap-y-6 text-center px-2 sm:px-4 animate-pulse"
    >
      {/* Badge Skeleton */}
      <div className="h-8 w-64 sm:w-80 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50" />

      {/* Main Title Skeleton (2 lines) */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-3">
        <div className="h-10 sm:h-14 md:h-16 w-11/12 rounded-2xl bg-slate-200/90 dark:bg-slate-800/90" />
        <div className="h-10 sm:h-14 md:h-16 w-3/4 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>

      {/* Subtitle Skeleton */}
      <div className="w-full max-w-xl min-h-[48px] sm:min-h-[54px] flex flex-col items-center justify-center gap-2">
        <div className="h-4 sm:h-5 w-5/6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="h-4 sm:h-5 w-2/3 rounded-lg bg-slate-200/60 dark:bg-slate-800/60" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="w-full max-w-2xl mx-auto h-14 sm:h-16 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60" />

      {/* Triple CTA Buttons Skeleton */}
      <div className="flex flex-nowrap items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-4xl min-h-[44px]">
        <div className="h-10 sm:h-12 w-28 sm:w-36 rounded-full bg-[#489fff]/30 shrink-0" />
        <div className="h-10 sm:h-12 w-28 sm:w-36 rounded-full bg-slate-200/60 dark:bg-[#081440]/60 border border-[#489fff]/30 shrink-0" />
        <div className="h-10 sm:h-12 w-32 sm:w-40 rounded-full bg-[#081440]/30 border border-[#489fff]/20 shrink-0" />
      </div>

      {/* Popular Tags Skeleton */}
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 max-w-3xl w-full min-h-[64px]">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <div className="h-7 w-14 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-7 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-7 w-28 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-7 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-7 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-7 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <div className="h-7 w-22 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-7 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
};

// Staggered Container Animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// Item Fade-In & Slide-Up Animation
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 180,
    },
  },
};

// Subtitle Typewriter
const SUBTITLE_MESSAGES = [
  "Connect directly with top tier recruiters, global founders & industry mentors in real-time.",
  "Explore verified jobs, internships & high-demand freelance gigs across top companies.",
  "Discover premier conferences, workshops, webinars & tech expos in your city."
];

const TypewriterSubtitle: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(40);

  useEffect(() => {
    const fullText = SUBTITLE_MESSAGES[currentMessageIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
        setTypingSpeed(32);

        if (displayedText.length === fullText.length) {
          setTypingSpeed(2600);
          setIsDeleting(true);
        }
      } else {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
        setTypingSpeed(16);

        if (displayedText.length === 0) {
          setIsDeleting(false);
          setCurrentMessageIndex((prev) => (prev + 1) % SUBTITLE_MESSAGES.length);
          setTypingSpeed(400);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentMessageIndex, typingSpeed]);

  return (
    <p 
      style={{
        fontSize: 'clamp(1rem, 1vw + 0.65rem, 1.22rem)',
        lineHeight: '1.6'
      }}
      className="text-slate-800 dark:text-slate-200 font-bold italic tracking-wide max-w-2xl mx-auto text-center"
    >
      <span>"{displayedText}"</span>
      <span className="inline-block w-[2.5px] h-4 sm:h-5 bg-[#0052FF] ml-1 align-middle animate-pulse not-italic" />
    </p>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ navigate, isLoading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  // Gentle scroll-triggered parallax for background decorative elements
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yGlow = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yTriangle = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yCapsule = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yCircle = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yMatrix = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('fog-jobs');
  };

  const popularTagsRow1 = [
    { 
      label: "Community", 
      route: "community", 
      icon: <img src="/images/icons/referral.png" alt="3D Community" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
    { 
      label: "Internships", 
      route: "fog-jobs", 
      icon: <img src="/images/eco-icons/fog-services.png" alt="3D Internships" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
    { 
      label: "Remote Jobs", 
      route: "fog-jobs", 
      icon: <img src="/images/icons/jobs.png" alt="3D Jobs" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
    { 
      label: "Lahore", 
      route: "fog-jobs", 
      icon: <img src="/images/eco-icons/tasker-hub.png" alt="3D Local" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
    { 
      label: "Workshops", 
      route: "events", 
      icon: <img src="/images/eco-icons/events-expo.png" alt="3D Events" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
  ];

  const popularTagsRow2 = [
    { 
      label: "Webinars", 
      route: "events", 
      icon: <img src="/images/icons/aitool.png" alt="3D Webinars" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
    { 
      label: "Rewards & Coins", 
      route: "fog-coins", 
      icon: <img src="/images/icons/coin.png" alt="3D Coin" className="w-4 h-4 object-contain filter drop-shadow-xs" /> 
    },
  ];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full flex flex-col justify-start items-center overflow-hidden pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 select-none bg-[#FAFAFA] dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 transition-colors duration-300 min-h-[85vh] flex items-center justify-center"
    >
      {/* Background Dot Matrix Pattern & Responsive Decorative Elements with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none w-full h-full max-w-full select-none">
        <motion.div 
          style={{ y: yMatrix }}
          className="absolute inset-0 opacity-[0.45] dark:opacity-[0.15] w-full h-full max-w-full"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(currentColor 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center top'
            }}
          />
        </motion.div>

        {/* Ambient Top Light Glow with parallax */}
        <motion.div 
          style={{ y: yGlow }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(700px,90vw)] max-w-[700px] h-[min(350px,45vh)] max-h-[350px] min-h-[180px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" 
        />

        {/* Floating 3D Career Hub Glass Badge (Left) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[2%] lg:left-[4%] top-[34%] hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl pointer-events-none z-10 hover:scale-105 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-indigo-500/20 dark:bg-blue-500/25 flex items-center justify-center shrink-0 border border-blue-500/25 shadow-inner">
            <img 
              src="/images/quick-actions/blue-briefcase.png" 
              alt="3D Career Hub" 
              className="w-8 h-8 object-contain drop-shadow-[0_4px_8px_rgba(0,82,255,0.35)]" 
            />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-[#0052FF] dark:text-[#3B82F6] uppercase tracking-wider leading-tight">Career Hub</span>
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">Verified Jobs</span>
          </div>
        </motion.div>

        {/* Floating 3D Live Expo Glass Badge (Right) */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="absolute right-[2%] lg:right-[4%] top-[36%] hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl pointer-events-none z-10 hover:scale-105 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-pink-500/20 dark:bg-purple-500/25 flex items-center justify-center shrink-0 border border-purple-500/25 shadow-inner">
            <img 
              src="/images/quick-actions/purple-mic.png" 
              alt="3D Live Expo" 
              className="w-8 h-8 object-contain drop-shadow-[0_4px_8px_rgba(124,58,237,0.35)]" 
            />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-[#4F28D9] dark:text-purple-400 uppercase tracking-wider leading-tight">Live Expo</span>
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">Events & Meetups</span>
          </div>
        </motion.div>

        {/* Floating 3D FOG Coin Chip (Bottom Left) */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute left-[3%] xl:left-[6%] bottom-[14%] hidden xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-200/60 dark:border-blue-500/30 shadow-lg pointer-events-none z-10"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/25">
            <img 
              src="/images/quick-actions/visual-fog-coin.png" 
              alt="3D FOG Coin" 
              className="w-7 h-7 object-contain drop-shadow-[0_2px_6px_rgba(245,158,11,0.35)]" 
            />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider leading-tight">FOG Currency</span>
            <span className="block text-xs font-bold text-blue-700 dark:text-sky-300 leading-tight">1 FOG = PKR 28</span>
          </div>
        </motion.div>

        {/* Floating 3D AI Assistant Badge (Bottom Right) */}
        <motion.div
          animate={{ y: [0, 8, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute right-[3%] xl:right-[6%] bottom-[14%] hidden xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-200/60 dark:border-sky-500/30 shadow-lg pointer-events-none z-10"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center shrink-0 border border-sky-500/25">
            <img 
              src="/images/quick-actions/visual-fogsly-ai-bot.png" 
              alt="3D FOGSLY AI" 
              className="w-7 h-7 object-contain drop-shadow-[0_2px_6px_rgba(14,165,233,0.35)]" 
            />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider leading-tight">Smart Career AI</span>
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Instant Match</span>
          </div>
        </motion.div>

        {/* Top-Right Triangle Accent with parallax */}
        <motion.div 
          style={{ y: yTriangle }}
          className="absolute top-[6%] right-[15%] text-[#3B82F6] opacity-80 max-w-[16px] max-h-[16px] hidden md:block"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,22 2,22" />
          </svg>
        </motion.div>
        
        {/* Top-Right Capsule Accent with parallax */}
        <motion.div 
          style={{ y: yCapsule }}
          className="absolute top-[13%] right-[12%] w-2 h-4.5 max-w-[8px] max-h-[18px] bg-[#818CF8] rounded-full rotate-12 opacity-80 hidden md:block" 
        />

        {/* Bottom-Right Blue Quarter Circle Accent with parallax */}
        <motion.div 
          style={{ y: yCircle }}
          className="absolute -bottom-10 -right-10 w-28 h-28 max-w-[112px] max-h-[112px] min-h-[80px] min-w-[80px] rounded-full bg-[#0052FF] opacity-90 hidden sm:block" 
        />
      </div>

      {/* Main Centered Content or Skeleton */}
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-4xl min-h-0 mx-auto grid grid-cols-1 justify-items-center gap-y-5 sm:gap-y-6 text-center px-2 sm:px-4"
        >
        {/* Top Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-full"
        >
          <img 
            src="/images/quick-actions/badge-verified-3d.svg" 
            alt="3D Verified" 
            className="w-5 h-5 object-contain shrink-0 filter drop-shadow-xs" 
          />
          <span 
            style={{ fontSize: 'clamp(0.75rem, 0.35vw + 0.65rem, 0.875rem)' }}
            className="font-semibold text-slate-900 dark:text-white truncate"
          >
            Pakistan's Premier Careers & Events Network
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
        </motion.div>

        {/* Main Headline with Uniform Fluid Typography Scale */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(2.1rem, 4vw + 0.8rem, 4.3rem)',
            lineHeight: '1.15',
          }}
          className="w-full max-w-5xl font-black tracking-tight text-[#0F172A] dark:text-white uppercase text-center"
        >
          <span className="block">
            <span>FIND </span>
            <span className="text-[#489fff]">JOBS. </span>
            <span>DISCOVER </span>
            <span className="text-[#489fff]">EVENTS.</span>
          </span>
          <span className="block">
            <span>BUILD SKILLS. </span>
            <span className="text-[#489fff]">EARN & GROW.</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div 
          variants={itemVariants} 
          className="w-full max-w-2xl min-h-[48px] sm:min-h-[54px] flex items-center justify-center"
        >
          <TypewriterSubtitle />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl mx-auto min-h-[48px]"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="w-full bg-white dark:bg-slate-900 px-4 sm:px-5 py-3.5 sm:py-4 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-[#489fff]/30 focus-within:border-[#489fff]"
          >
            <Search className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0 stroke-[2.2]" />
            <input
              type="text"
              placeholder="Search jobs, internships, events, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: 'clamp(0.875rem, 0.35vw + 0.75rem, 1rem)' }}
              className="w-full min-w-0 bg-transparent text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal focus:outline-none"
            />
          </form>
        </motion.div>

        {/* Primary CTA Pill Buttons (1 Single Line) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-4xl min-h-[48px] py-1.5 px-2"
        >
          {/* Browse Jobs Button */}
          <button
            id="btn-browse-jobs-hero"
            onClick={() => navigate('fog-jobs')}
            className="group/btn shrink-0 whitespace-nowrap bg-gradient-to-r from-[#0052FF] to-[#1E6BFF] hover:from-[#0047E0] hover:to-[#0052FF] text-white font-bold pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full shadow-[0_8px_22px_rgba(0,82,255,0.32)] hover:shadow-[0_12px_28px_rgba(0,82,255,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm tracking-wide"
          >
            <span>Browse Jobs</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0052FF] stroke-[2.8]" />
            </div>
          </button>

          {/* Explore Events Button */}
          <button
            id="btn-explore-events-hero"
            onClick={() => navigate('events')}
            className="group/btn shrink-0 whitespace-nowrap bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.32)] hover:shadow-[0_12px_28px_rgba(124,58,237,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm tracking-wide"
          >
            <span>Explore Events</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7C3AED] stroke-[2.8]" />
            </div>
          </button>

          {/* Community Button */}
          <button
            id="btn-community-hero"
            onClick={() => navigate('community')}
            className="group/btn shrink-0 whitespace-nowrap bg-gradient-to-r from-[#081440] to-[#1E293B] hover:from-[#0F2366] hover:to-[#334155] text-white font-bold pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full border border-blue-400/20 shadow-[0_8px_22px_rgba(8,20,64,0.35)] hover:shadow-[0_12px_28px_rgba(8,20,64,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm tracking-wide"
          >
            <span>Community</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#081440] stroke-[2.8]" />
            </div>
          </button>
        </motion.div>

        {/* Popular Tags */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 max-w-3xl w-full min-h-[64px]"
        >
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span 
              style={{ fontSize: 'clamp(0.75rem, 0.35vw + 0.65rem, 0.875rem)' }}
              className="text-[#0F172A] dark:text-white font-bold mr-1"
            >
              Popular:
            </span>
            {popularTagsRow1.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(tag.route)}
                style={{ fontSize: 'clamp(0.75rem, 0.35vw + 0.65rem, 0.875rem)' }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0052FF] dark:hover:text-[#0052FF] border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all cursor-pointer font-medium"
              >
                {tag.icon}
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {popularTagsRow2.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(tag.route)}
                style={{ fontSize: 'clamp(0.75rem, 0.35vw + 0.65rem, 0.875rem)' }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0052FF] dark:hover:text-[#0052FF] border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all cursor-pointer font-medium"
              >
                {tag.icon}
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
