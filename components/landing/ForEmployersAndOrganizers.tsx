import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, Check, ArrowRight } from 'lucide-react';

interface ForEmployersAndOrganizersProps {
  navigate: (route: string) => void;
}

const BrandIconBadge: React.FC<{ type: 'employer' | 'organizer' }> = ({ type }) => {
  const [errorCount, setErrorCount] = useState(0);

  const src = errorCount === 0
    ? (type === 'employer' ? '/images/quick-actions/employer-3d.png' : '/images/quick-actions/organizer-3d.png')
    : (type === 'employer' ? '/images/quick-actions/blue-briefcase.png' : '/images/quick-actions/purple-calendar.png');

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: type === 'employer' ? -3 : 3 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2.5 flex items-center justify-center mb-6 shadow-md border ${
        type === 'employer' 
          ? 'bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/60 dark:to-indigo-950/40 border-blue-200/80 dark:border-blue-800/80 shadow-[0_8px_20px_rgba(0,82,255,0.15)]' 
          : 'bg-gradient-to-br from-purple-50 to-purple-100/60 dark:from-purple-950/60 dark:to-violet-950/40 border-purple-200/80 dark:border-purple-800/80 shadow-[0_8px_20px_rgba(124,58,237,0.15)]'
      }`}
    >
      <img
        src={src}
        alt={type === 'employer' ? '3D Employer Briefcase' : '3D Event Calendar'}
        onError={() => setErrorCount((prev) => prev + 1)}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
      />
    </motion.div>
  );
};

const ForEmployersAndOrganizers: React.FC<ForEmployersAndOrganizersProps> = ({ navigate }) => {
  return (
    <section id="employers" className="py-20 sm:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 mb-3 shadow-xs"
          >
            <img src="/images/quick-actions/badge-job-3d.svg" alt="3D Enterprise" className="w-4 h-4 object-contain filter drop-shadow-xs" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Enterprise & Partners
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Built for Employers & Organizers
          </motion.h2>
        </div>

        {/* 2 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Employers */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <BrandIconBadge type="employer" />
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60">
                  Hiring Portal • For Employers
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Hire the Right Talent
              </h3>

              <ul className="space-y-3 mb-8">
                {[
                  "Post jobs free",
                  "AI-assisted posting",
                  "Verified candidates",
                  "Application tracking",
                  "Featured listings"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300 text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="btn-employer-post-job"
              onClick={() => navigate('post-job')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm cursor-pointer w-full sm:w-auto"
            >
              <span>Post a Job →</span>
            </button>
          </motion.div>

          {/* Card 2: Event Organizers */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <BrandIconBadge type="organizer" />
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60">
                  Event Creator • For Organizers
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Promote Your Event
              </h3>

              <ul className="space-y-3 mb-8">
                {[
                  "List events free",
                  "AI-assisted posting",
                  "Professional audience",
                  "Registration tracking",
                  "Featured events"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300 text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="btn-organizer-post-event"
              onClick={() => navigate('create-event')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 shadow-sm hover:shadow-md transition-all text-sm cursor-pointer w-full sm:w-auto"
            >
              <span>Post an Event →</span>
            </button>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default ForEmployersAndOrganizers;
