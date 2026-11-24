import React from 'react';
import { 
  X, 
  Briefcase, 
  MapPin, 
  Building, 
  DollarSign, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  Calendar,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { CommunityPost } from './types';
import { toast } from 'react-hot-toast';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onDiscussClick: (postId: string) => void;
  onApplyClick?: () => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onDiscussClick,
  onApplyClick,
}) => {
  if (!isOpen || !post || !post.opportunityData) return null;

  const { title, company, location, type, country, stipendOrSalary, description, tags } = post.opportunityData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  {type}
                </span>
                <span className="text-xs text-slate-400 font-medium">Verified Fogsly Opportunity</span>
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

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            <span>{company}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{location}, {country}</span>
          </div>
          {stipendOrSalary && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
              <span>{stipendOrSalary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Opportunity Overview
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {description}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
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
              if (onApplyClick) onApplyClick();
              else toast.success('Directing to official Fogsly Job application flow...');
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <span>Apply on Fogsly Jobs</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
