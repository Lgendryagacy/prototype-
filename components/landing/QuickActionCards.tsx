import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Briefcase, 
  Calendar
} from 'lucide-react';

interface QuickActionCardsProps {
  navigate: (route: string) => void;
}

const QuickActionCards: React.FC<QuickActionCardsProps> = ({ navigate }) => {
  return (
    <section 
      id="quick-actions-section"
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-[#F0F5FF]/80 via-[#F8FAFC] to-[#F5F3FF]/70 dark:from-[#0B101E] dark:via-[#0F172A] dark:to-[#17122E] transition-colors duration-300"
    >
      {/* Ambient 3D Glowing Background Spheres matching target mockup */}
      <div className="absolute top-[8%] left-[2%] w-36 sm:w-52 h-36 sm:h-52 rounded-full bg-gradient-to-br from-blue-300/35 to-blue-500/10 blur-2xl pointer-events-none" />
      <div className="absolute top-[40%] -left-[4%] w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-gradient-to-br from-sky-400/25 to-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[6%] w-36 sm:w-56 h-36 sm:h-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/10 blur-2xl pointer-events-none" />
      
      <div className="absolute top-[6%] right-[3%] w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-gradient-to-br from-purple-300/35 to-fuchsia-500/15 blur-2xl pointer-events-none" />
      <div className="absolute top-[42%] -right-[3%] w-44 sm:w-64 h-44 sm:h-64 rounded-full bg-gradient-to-br from-violet-400/25 to-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[8%] right-[5%] w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-gradient-to-br from-purple-400/25 to-pink-500/10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ======================================================================= */}
        {/* SECTION HEADER WITH HAND-DRAWN DOODLE ARROWS & NOTES                     */}
        {/* ======================================================================= */}
        <div className="relative text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          
          {/* Top-Left Playful Marker Doodle & Curved Arrow */}
          <div className="hidden lg:flex flex-col items-end absolute -left-28 -top-2 xl:-left-36 pointer-events-none select-none">
            <div className="text-left text-[#0052FF] font-black text-sm sm:text-base leading-[1.15] italic tracking-tight font-sans drop-shadow-xs transform -rotate-6">
              <span>More</span><br />
              <span>Opportunities</span><br />
              <span>Brighter</span><br />
              <span>Tomorrows</span>
            </div>
            {/* Curved Blue Doodle Arrow */}
            <svg 
              className="w-12 h-12 text-[#0052FF] mt-1 transform translate-x-3 rotate-12" 
              viewBox="0 0 54 54" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M 12 8 C 16 28 26 40 42 44" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              <path 
                d="M 32 36 L 43 45 L 34 50" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          {/* Top-Right Playful Marker Doodle & Curved Arrow */}
          <div className="hidden lg:flex flex-col items-start absolute -right-28 -top-2 xl:-right-36 pointer-events-none select-none">
            <div className="text-left text-[#6366F1] font-black text-sm sm:text-base leading-[1.15] italic tracking-tight font-sans drop-shadow-xs transform rotate-6">
              <span>Learn</span><br />
              <span>Connect</span><br />
              <span>Grow</span><br />
              <span>Succeed</span>
            </div>
            {/* Curved Purple Doodle Arrow */}
            <svg 
              className="w-12 h-12 text-[#6366F1] mt-1 transform -translate-x-3 -scale-x-100 rotate-12" 
              viewBox="0 0 54 54" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M 12 8 C 16 28 26 40 42 44" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              <path 
                d="M 32 36 L 43 45 L 34 50" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          {/* Eyebrow Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-900/80 shadow-[0_2px_10px_rgba(0,82,255,0.06)] text-xs sm:text-sm font-semibold text-[#0052FF] dark:text-blue-400 mb-4"
          >
            <span className="text-base leading-none">🚀</span>
            <span>Opportunities & Growth</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.18] mb-3"
          >
            Everything You Need to<br className="hidden sm:inline" />{" "}
            <span className="bg-gradient-to-r from-[#0052FF] via-[#7C3AED] to-[#C026D3] bg-clip-text text-transparent">
              Advance Your Career
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Explore jobs, events, and opportunities — or create and share your own to help others grow.
          </motion.p>
        </div>

        {/* ======================================================================= */}
        {/* 2X2 GRID OF CARDS (EXACT VISUAL SPECIFICATION FROM DESIGN MOCKUP)       */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* ======================================================================= */}
          {/* CARD 1: FOGSLY JOBS / CAREER HUB (Top Left)                             */}
          {/* ======================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative bg-white/95 dark:bg-[#13192B]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 lg:p-9 border border-white dark:border-slate-800 shadow-[0_10px_35px_rgba(0,82,255,0.06)] hover:shadow-[0_20px_45px_rgba(0,82,255,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] items-center gap-6">
              
              {/* Left Content Column */}
              <div className="flex flex-col items-start z-10">
                
                {/* Header with Squircle Icon, Badge & Title */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0052FF] dark:text-[#3B82F6] border border-blue-500/20 flex items-center justify-center shrink-0 p-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#EBF2FF] dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 mb-1 leading-tight">
                      CAREER HUB
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      Fogsly Jobs
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 max-w-[270px] leading-relaxed">
                  Find work that fits your skills and career goals.
                </p>

                {/* Features Checklist */}
                <div className="space-y-2 mb-6 w-full">
                  {[
                    'Full-time Jobs',
                    'Internships',
                    'Remote Work',
                    'Freelance Projects'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-[#0052FF] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Pill CTA Button with arrow right circle */}
                <button
                  id="btn-explore-fog-jobs"
                  onClick={() => navigate('fog-jobs')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0052FF] to-[#2563EB] hover:from-blue-700 hover:to-[#0052FF] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_20px_rgba(0,82,255,0.32)] hover:shadow-[0_10px_25px_rgba(0,82,255,0.42)] transition-all duration-200 cursor-pointer group/btn group-hover:scale-[1.02]"
                >
                  <span>Explore Jobs</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0052FF] stroke-[2.8]" />
                  </div>
                </button>
              </div>

              {/* Right Visual Column (3D Chair with Hanging Job Opportunity Sign) */}
              <div className="flex justify-center items-center w-full py-2 sm:py-0">
                <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[250px] xl:max-w-[270px] flex items-center justify-center">
                  <img
                    src="/images/quick-actions/blue-chair.png"
                    alt="Fogsly Jobs 3D Career Chair"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,82,255,0.18)] group-hover:scale-105 transition-transform duration-300 select-none"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ======================================================================= */}
          {/* CARD 2: EVENTS & EXPO / LIVE & LEARN (Top Right)                        */}
          {/* ======================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative bg-white/95 dark:bg-[#13192B]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 lg:p-9 border border-white dark:border-slate-800 shadow-[0_10px_35px_rgba(109,40,217,0.06)] hover:shadow-[0_20px_45px_rgba(109,40,217,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] items-center gap-6">
              
              {/* Left Content Column */}
              <div className="flex flex-col items-start z-10">
                
                {/* Header with Squircle Icon, Badge & Title */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 p-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#F3E8FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 mb-1 leading-tight">
                      LIVE & LEARN
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      Events & Expo
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 max-w-[270px] leading-relaxed">
                  Discover events that help you learn, connect and grow.
                </p>

                {/* Features Checklist */}
                <div className="space-y-2 mb-6 w-full">
                  {[
                    'Conferences',
                    'Webinars',
                    'Workshops',
                    'Networking & Expos'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Pill CTA Button with arrow right circle */}
                <button
                  id="btn-explore-events-action"
                  onClick={() => navigate('events')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-purple-800 hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_20px_rgba(109,40,217,0.32)] hover:shadow-[0_10px_25px_rgba(109,40,217,0.42)] transition-all duration-200 cursor-pointer group/btn group-hover:scale-[1.02]"
                >
                  <span>Explore Events</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7C3AED] stroke-[2.8]" />
                  </div>
                </button>
              </div>

              {/* Right Visual Column (3D Vintage Mic with Ticket & Calendar) */}
              <div className="flex justify-center items-center w-full py-2 sm:py-0">
                <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[250px] xl:max-w-[270px] flex items-center justify-center">
                  <img
                    src="/images/quick-actions/purple-mic.png"
                    alt="Events & Expo 3D Studio Microphone"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(109,40,217,0.18)] group-hover:scale-105 transition-transform duration-300 select-none"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ======================================================================= */}
          {/* CARD 3: POST A JOB / HIRING PORTAL (Bottom Left)                        */}
          {/* ======================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative bg-white/95 dark:bg-[#13192B]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 lg:p-9 border border-white dark:border-slate-800 shadow-[0_10px_35px_rgba(0,82,255,0.06)] hover:shadow-[0_20px_45px_rgba(0,82,255,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] items-center gap-6">
              
              {/* Left Content Column */}
              <div className="flex flex-col items-start z-10">
                
                {/* Header with Squircle Icon, Badge & Title */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0052FF] dark:text-[#3B82F6] border border-blue-500/20 flex items-center justify-center shrink-0 p-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#EBF2FF] dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 mb-1 leading-tight">
                      HIRING PORTAL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      Post a Job
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-[270px] leading-relaxed">
                  Find the best talent for your company.
                </p>

                {/* Pill CTA Button with arrow right circle */}
                <button
                  id="btn-post-job-action"
                  onClick={() => navigate('post-physical-job')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0052FF] to-[#2563EB] hover:from-blue-700 hover:to-[#0052FF] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_20px_rgba(0,82,255,0.32)] hover:shadow-[0_10px_25px_rgba(0,82,255,0.42)] transition-all duration-200 cursor-pointer group/btn group-hover:scale-[1.02]"
                >
                  <span>Post Job</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0052FF] stroke-[2.8]" />
                  </div>
                </button>
              </div>

              {/* Right Visual Column (3D Executive Briefcase with Documents) */}
              <div className="flex justify-center items-center w-full py-2 sm:py-0">
                <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[250px] xl:max-w-[270px] flex items-center justify-center">
                  <img
                    src="/images/quick-actions/blue-briefcase.png"
                    alt="Post a Job 3D Executive Briefcase"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,82,255,0.18)] group-hover:scale-105 transition-transform duration-300 select-none"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ======================================================================= */}
          {/* CARD 4: POST AN EVENT / EVENT CREATOR (Bottom Right)                    */}
          {/* ======================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group relative bg-white/95 dark:bg-[#13192B]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 lg:p-9 border border-white dark:border-slate-800 shadow-[0_10px_35px_rgba(109,40,217,0.06)] hover:shadow-[0_20px_45px_rgba(109,40,217,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] items-center gap-6">
              
              {/* Left Content Column */}
              <div className="flex flex-col items-start z-10">
                
                {/* Header with Squircle Icon, Badge & Title */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 p-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#F3E8FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 mb-1 leading-tight">
                      EVENT CREATOR
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      Post an Event
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-[270px] leading-relaxed">
                  Promote your event to thousands of people.
                </p>

                {/* Pill CTA Button with arrow right circle */}
                <button
                  id="btn-post-event-action"
                  onClick={() => navigate('create-event')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-purple-800 hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_20px_rgba(109,40,217,0.32)] hover:shadow-[0_10px_25px_rgba(109,40,217,0.42)] transition-all duration-200 cursor-pointer group/btn group-hover:scale-[1.02]"
                >
                  <span>Post Event</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs group-hover/btn:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7C3AED] stroke-[2.8]" />
                  </div>
                </button>
              </div>

              {/* Right Visual Column (3D Purple Calendar with Megaphone & Star) */}
              <div className="flex justify-center items-center w-full py-2 sm:py-0">
                <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[250px] xl:max-w-[270px] flex items-center justify-center">
                  <img
                    src="/images/quick-actions/purple-calendar.png"
                    alt="Post an Event 3D Calendar"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(109,40,217,0.18)] group-hover:scale-105 transition-transform duration-300 select-none"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default QuickActionCards;
