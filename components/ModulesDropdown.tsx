import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';

interface Module {
  label: string;
  route: Route;
  description: string;
  icon: string;
}

export const ECOSYSTEM_MODULES: Module[] = [
  { label: 'Watch Ads + Q&A',  route: 'watch-ads',    icon: '/images/eco-icons/watch-ads.png',        description: 'Watch ads and earn Fog Coins rewards online.' },
  { label: 'Freelance Hub',    route: 'find-work',    icon: '/images/eco-icons/freelance-hub.png',     description: 'Hire skilled freelancers or offer your professional services.' },
  { label: 'Fog Jobs',         route: 'fog-jobs',     icon: '/images/eco-icons/fog-jobs.png',          description: 'Find or post global online jobs and freelance gigs.' },
  { label: 'Fog e-Services',   route: 'fog-services', icon: '/images/eco-icons/fog-services.png',      description: 'Digital services marketplace for content and projects.' },
  { label: 'Fog Coins',        route: 'fog-coins',    icon: '/images/eco-icons/fog-coins.png',         description: 'Earn, trade and get paid with Fog Coins instantly.' },
  { label: 'Referral System',  route: 'referrals',    icon: '/images/eco-icons/referral-sysem.png',    description: 'Invite friends and earn rewards for every referral.' },
  { label: 'Events & Expo',    route: 'events',       icon: '/images/eco-icons/events-expo.png',       description: 'Discover professional events, workshops and networking.' },
  { label: 'Fogsly Community', route: 'community',    icon: '/images/eco-icons/freelance-hub.png',     description: 'Ask questions, join discussions, poll & network.' },
  { label: 'Built-in AI Tools',route: 'ai-assistant', icon: '/images/eco-icons/built-in-ai-tools.png', description: 'AI-powered workspace tools for smarter productivity.' },
];

interface ModulesDropdownProps {
  visible: boolean;
  navigate: (route: Route) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ModulesDropdown: React.FC<ModulesDropdownProps> = ({
  visible,
  navigate,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Close on scroll
  useEffect(() => {
    if (!visible) return;
    const handler = () => onClose();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="fixed top-16 left-0 right-0 w-full backdrop-blur-xl border-b border-white/10 shadow-2xl z-[9999] px-8 py-5 overflow-hidden"
        >
          {/* Semi-transparent background layer — lets backdrop-blur show through */}
          <div
            className="absolute inset-0 -z-10"
            style={{ backgroundColor: 'var(--color-bg-primary)', opacity: 0.88 }}
          />

          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-widest mb-4">
              Fogsly Ecosystem Modules
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ECOSYSTEM_MODULES.map(module => (
                <motion.button
                  key={module.route}
                  onClick={() => { navigate(module.route); onClose(); }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[--color-bg-marketplace] border border-[--color-border] hover:border-[--color-primary] hover:shadow-lg transition-all duration-300 cursor-pointer w-full text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[--color-primary]/10 to-[--color-secondary]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={module.icon}
                      alt={module.label}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/quick-actions/badge-discover-3d.svg';
                      }}
                      className="w-9 h-9 object-contain group-hover:rotate-6 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[--color-primary] leading-tight truncate">
                      {module.label}
                    </h3>
                    <p className="text-[11px] text-[--color-text-secondary] leading-snug mt-0.5 line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModulesDropdown;
