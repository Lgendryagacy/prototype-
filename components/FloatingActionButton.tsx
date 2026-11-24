import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Headset } from 'lucide-react';
import { type Route } from '../types';
import { useScrollingNavigate } from '@/utils/navigationUtils';
import { subscribeToUnreadCount } from '../firebase/services/publicChatService';
import { User as FirebaseUser } from '../firebase/types/user';

interface FloatingActionButtonProps {
  navigate: (route: Route) => void;
  currentPath?: string;
  currentUser?: FirebaseUser | null;
}

const FloatingActionButton = ({ navigate, currentPath, currentUser }: FloatingActionButtonProps) => {
  const path = currentPath || '';
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to unread count
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUnreadCount(currentUser.uid, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Don't show FAB on admin dashboard
  if (path.startsWith('/admin-dashboard')) {
    return null;
  }

  const navigateWithScroll = useScrollingNavigate(navigate);

  const toggleOpen = () => setIsOpen(!isOpen);

  const subButtonVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: 10,
      scale: 0.9,
      transition: {
        delay: i * 0.05,
        duration: 0.15
      },
    }),
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="flex flex-col items-center gap-4 mb-4">
            <motion.button
              custom={1}
              variants={subButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => navigateWithScroll('customer-service')}
              className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[--color-card] text-[--color-text-primary] rounded-full shadow-lg hover:bg-[--color-bg-secondary] transition-colors"
              aria-label="Customer Service"
            >
              <Headset className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute right-full mr-4 px-3 py-1.5 bg-[--color-card] text-[--color-text-primary] text-xs font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Customer Service
              </span>
            </motion.button>
            <motion.button
              custom={0}
              variants={subButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => navigateWithScroll('messages')}
              className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[--color-card] text-[--color-text-primary] rounded-full shadow-lg hover:bg-[--color-bg-secondary] transition-colors"
              aria-label="Messages"
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-[--color-card]">
                    <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </div>
              <span className="absolute right-full mr-4 px-3 py-1.5 bg-[--color-card] text-[--color-text-primary] text-xs font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Messages
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        className="w-14 h-14 md:w-16 md:h-16 bg-[--color-primary] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[--color-primary]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary] focus:ring-offset-[--color-bg-primary]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Plus className="w-7 h-7 md:w-8 md:h-8" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
