import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  MessageSquare, 
  ExternalLink,
  Sparkles,
  Eye
} from 'lucide-react';
import { CommunityPost } from './types';
import { toast } from 'react-hot-toast';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onDiscussClick: (postId: string) => void;
  onRegisterClick?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onDiscussClick,
  onRegisterClick,
}) => {
  if (!isOpen || !post || !post.eventData) return null;

  const { title, location, date, time, organizer, description } = post.eventData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-[#5B48EE]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                  Fogsly Expo
                </span>
                <span className="text-xs text-slate-400 font-medium">Physical & Virtual</span>
                {typeof post.viewsCount === 'number' && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewsCount.toLocaleString()} views</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Schedule Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5B48EE]" />
            <span>{date}</span>
          </div>
          {time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5B48EE]" />
              <span>{time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-[#5B48EE]" />
            <span>{location}</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            About the Event
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {description || post.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onDiscussClick(post.id);
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discuss in Community ({post.commentsCount})</span>
          </button>

          <button
            onClick={() => {
              if (onRegisterClick) onRegisterClick();
              else toast.success('Directing to official Fogsly Events Expo tickets & registration...');
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B48EE] hover:bg-[#4F39D6] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <span>View on Fogsly Events</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
