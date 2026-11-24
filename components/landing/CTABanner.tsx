import React from 'react';
import { motion } from 'framer-motion';

interface CTABannerProps {
  navigate: (route: string) => void;
}

const CTABanner: React.FC<CTABannerProps> = ({ navigate }) => {
  return (
    <section className="py-20 sm:py-24 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b2f86, #2563eb 52%, #5b4df6)' }}>
      {/* Background dot grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:24px_24px] opacity-55 pointer-events-none" />

      {/* Floating 3D Accent - Left (FOG Coins) */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-6 lg:left-14 top-1/2 -translate-y-1/2 hidden md:block w-16 h-16 lg:w-20 lg:h-20 opacity-85 pointer-events-none drop-shadow-2xl"
      >
        <img 
          src="/images/quick-actions/badge-coins-3d.svg" 
          alt="3D FOG Coins" 
          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" 
        />
      </motion.div>

      {/* Floating 3D Accent - Right (Career Star / Badge) */}
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-6 lg:right-14 top-1/2 -translate-y-1/2 hidden md:block w-16 h-16 lg:w-20 lg:h-20 opacity-85 pointer-events-none drop-shadow-2xl"
      >
        <img 
          src="/images/quick-actions/badge-discover-3d.svg" 
          alt="3D Discover Badge" 
          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" 
        />
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight"
        >
          Ready to Find Your Next Opportunity?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
        >
          Join thousands of professionals discovering real jobs and career events on Fogsly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            id="btn-cta-signup"
            onClick={() => navigate('auth')}
            className="px-8 py-3.5 rounded-full font-semibold text-[#0b1220] bg-white shadow-xl hover:bg-white/90 hover:scale-105 transition-all text-sm cursor-pointer"
          >
            Sign Up Free
          </button>
          <button
            id="btn-cta-browse-jobs"
            onClick={() => navigate('fog-jobs')}
            className="px-8 py-3.5 rounded-full font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-md hover:bg-white/25 hover:scale-105 transition-all text-sm cursor-pointer"
          >
            Browse Jobs
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
