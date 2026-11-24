import React from 'react';
import { Bell, CheckCircle2, MessageSquare, Users, Check, Heart, Sparkles } from 'lucide-react';
import { CommunityNotification } from './types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CommunityNotification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: CommunityNotification) => void;
  onTriggerTestNotification?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onTriggerTestNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0052FF]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Notifications ({notifications.filter((n) => !n.read).length})
          </h4>
        </div>
        <div className="flex items-center gap-3">
          {onTriggerTestNotification && (
            <button
              type="button"
              onClick={onTriggerTestNotification}
              className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Test Alert
            </button>
          )}
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <span>No notifications yet. You will get alerted in real-time when someone replies or likes your posts!</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onNotificationClick(n);
                onClose();
              }}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'like' && (
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  </div>
                )}
                {n.type === 'reply' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.type === 'comment' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.type === 'approval' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.type === 'connection' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                )}
                {(n.type === 'opportunity' || n.type === 'announcement') && (
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`text-xs font-bold truncate ${!n.read ? 'text-blue-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {n.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                  {n.message}
                </p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
