import React from 'react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  const reviews = [
    {
      stars: "★★★★★",
      quote: "FOGSLY helped me find verified opportunities without wasting time on fake listings. The platform feels clean and trustworthy.",
      avatar: "AM",
      name: "Ayesha Malik",
      role: "UI/UX Designer"
    },
    {
      stars: "★★★★★",
      quote: "The AI posting feature saved our HR team hours. We created a clean job listing in seconds and got better candidates.",
      avatar: "HR",
      name: "Hamza Raza",
      role: "HR Manager, Nexora"
    },
    {
      stars: "★★★★★",
      quote: "As an event organizer, FOGSLY gives us direct access to a professional audience across Pakistan.",
      avatar: "SK",
      name: "Sara Khan",
      role: "Event Organizer"
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 mb-3 shadow-xs"
          >
            <img src="/images/quick-actions/value-verified-3d.png" alt="3D Trust" className="w-4 h-4 object-contain filter drop-shadow-xs" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Community Voices & Trust
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Trusted by Professionals Across Pakistan
          </motion.h2>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="text-amber-400 text-base tracking-widest mb-4 font-normal">
                  {rev.stars}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {rev.avatar}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{rev.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-normal">{rev.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
