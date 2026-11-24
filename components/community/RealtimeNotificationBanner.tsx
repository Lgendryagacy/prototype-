import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Bell, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { CommunityNotification } from './types';

interface RealtimeNotificationBannerProps {
  notification: CommunityNotification | null;
  onDismiss: () => void;
  onView: (targetPostId?: string) => void;
}

export const RealtimeNotificationBanner: React.FC<RealtimeNotificationBannerProps> = ({
  notification,
  onDismiss,
  onView,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isLike = notification.type === 'like';
  const isReply = notification.type === 'reply' || notification.type === 'comment';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.94 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-sm sm:max-w-md w-auto select-none pointer-events-auto shadow-2xl"
      >
        <div className="relative rounded-2xl bg-white dark:bg-[#0F172A] border border-blue-500/30 dark:border-blue-400/30 p-4 shadow-[0_12px_36px_rgba(0,82,255,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

          <div className="flex items-start gap-3">
            {/* Action Icon / Avatar */}
            <div className="relative shrink-0 mt-0.5">
              {notification.senderAvatar ? (
                <img
                  src={notification.senderAvatar}
                  alt={notification.senderName || 'Member'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                    isLike
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                      : isReply
                      ? 'bg-gradient-to-br from-blue-600 to-sky-500'
                      : 'bg-gradient-to-br from-indigo-600 to-blue-700'
                  }`}
                >
                  {isLike ? (
                    <Heart className="w-5 h-5 fill-white text-white" />
                  ) : isReply ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>
              )}

              {/* Mini corner badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] border-2 border-white dark:border-[#0F172A] ${
                  isLike
                    ? 'bg-rose-500 text-white'
                    : isReply
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {isLike ? '♥' : '💬'}
              </div>
            </div>

            {/* Notification Text Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  Live Activity
                </span>
                <span className="text-[10px] text-slate-400">{notification.timestamp}</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {notification.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {notification.message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onView(notification.targetPostId);
                    onDismiss();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>View Discussion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close notification"
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated 6-second progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-100 dark:bg-slate-800">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              className="h-full bg-blue-600 dark:bg-sky-400"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
