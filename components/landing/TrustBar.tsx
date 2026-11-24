import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, Users, Building } from 'lucide-react';

const TrustBar: React.FC = () => {
  const stats = [
    {
      icon3d: "/images/quick-actions/visual-career-hub.png",
      value: "500+",
      label: "Verified Jobs Posted"
    },
    {
      icon3d: "/images/quick-actions/visual-live-expo.png",
      value: "200+",
      label: "Professional Events"
    },
    {
      icon3d: "/images/quick-actions/visual-refer-earn-team.png",
      value: "1,000+",
      label: "Active Professionals"
    },
    {
      icon3d: "/images/quick-actions/employer-3d.png",
      value: "50+",
      label: "Trusted Companies"
    }
  ];

  return (
    <section id="trust-bar" className="w-full py-8 text-white relative z-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b2f86, #2563eb 52%, #5b4df6)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => {
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 p-2 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <img src={stat.icon3d} alt={stat.label} className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                </div>
                <div>
                  <motion.b
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="block text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none"
                  >
                    {stat.value}
                  </motion.b>
                  <span className="block mt-1.5 text-xs sm:text-sm font-semibold text-white/90">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBar;
