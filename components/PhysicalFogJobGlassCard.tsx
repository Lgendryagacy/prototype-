import React from 'react';
import { motion } from 'framer-motion';

const PhysicalFogJobGlassCard = ({ children, className = '', hoverable = false, onClick }) => (
  <motion.div
    className={`backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl ${hoverable ? 'cursor-pointer hover:bg-white/15 dark:hover:bg-black/15' : ''} transition-all duration-300 ${className}`}
    onClick={onClick}
    whileHover={hoverable ? { scale: 1.02, y: -5 } : {}}
  >
    {children}
  </motion.div>
);

export default PhysicalFogJobGlassCard;