import React from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  UserPlus, 
  Check, 
  MessageCircle, 
  Sparkles,
  Award
} from 'lucide-react';
import { CommunityAuthor } from './types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: CommunityAuthor | null;
  isConnected?: boolean;
  onToggleConnect?: (authorId: string) => void;
  onSendMessage?: (author: CommunityAuthor) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  author,
  isConnected,
  onToggleConnect,
  onSendMessage,
}) => {
  if (!isOpen || !author) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Header */}
        <div className="h-28 bg-gradient-to-r from-[#0052FF] via-[#5B48EE] to-[#8B5CF6] relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar positioning */}
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#111827] shadow-md"
              />
              {author.verified && (
                <CheckCircle2 className="w-6 h-6 text-[#0052FF] absolute bottom-0 right-0 fill-white dark:fill-[#111827]" />
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage(author)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              )}

              {onToggleConnect && (
                <button
                  onClick={() => onToggleConnect(author.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-[#0052FF] hover:bg-[#0043D9] text-white shadow-2xs hover:scale-[1.02]'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {author.name}
              </h3>
              {author.verified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0052FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                  Verified Member
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {author.role} {author.company && `at ${author.company}`}
            </p>
            {author.location && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {author.location}
              </p>
            )}
          </div>

          {/* Bio */}
          {author.bio && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {author.bio}
            </div>
          )}

          {/* Skills */}
          {author.skills && author.skills.length > 0 && (
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Skills & Focus Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {author.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Looking for & Offering */}
          {(author.lookingFor || author.offering) && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs">
              {author.lookingFor && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    Looking For:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {author.lookingFor}
                  </p>
                </div>
              )}
              {author.offering && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    Offering:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {author.offering}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
