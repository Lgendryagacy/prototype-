import React from 'react';
import { motion } from 'framer-motion';

const WhyChooseFogsly: React.FC = () => {
  const features = [
    {
      icon3d: "/images/quick-actions/value-verified-3d.png",
      alt: "3D Verified Shield",
      title: "Verified Listings",
      description: "Every job and event is reviewed by our team before publishing."
    },
    {
      icon3d: "/images/quick-actions/value-ai-3d.png",
      alt: "3D AI Sparkle",
      title: "AI-Powered",
      description: "Create professional listings in seconds with smart AI assistance."
    },
    {
      icon3d: "/images/quick-actions/value-target-3d.png",
      alt: "3D Career Target",
      title: "Career Focused",
      description: "Only real jobs, internships, events and growth opportunities."
    },
    {
      icon3d: "/images/quick-actions/value-free-3d.png",
      alt: "3D Free Checkmark",
      title: "Free to Use",
      description: "Sign up, browse and apply completely free."
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-[#090D16] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0b1220] dark:text-white tracking-tight mb-3"
          >
            Why Choose Fogsly?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-[#5b6b82] dark:text-slate-400 font-normal leading-relaxed"
          >
            Built for professionals who value quality
          </motion.p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-7 rounded-3xl bg-white dark:bg-[#131B2E] border border-[#dbe6f3] dark:border-slate-800 shadow-sm hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#edf5ff] dark:bg-blue-950/40 p-2.5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={item.icon3d}
                    alt={item.alt}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,82,255,0.2)]"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#0b1220] dark:text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5b6b82] dark:text-slate-400 font-normal leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseFogsly;
