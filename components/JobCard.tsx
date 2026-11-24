import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { DollarSign, Clock, MapPin, Bookmark, Calendar } from 'lucide-react';
import { type Route } from '../types';
import { FogslyJob } from '../firebase/types/job';
import { User as FirebaseUser } from '../firebase/types/user';
import { toggleJobSave, isJobSaved } from '../firebase/services/savedJobs';
import { getJobProposals } from '../firebase/services/jobProposals';
import { toast } from 'react-hot-toast';

interface JobCardProps {
    job: FogslyJob;
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
    currentUser?: FirebaseUser | null;
    onSaveToggle?: () => void;
}

// Helper function to create URL-friendly slug
const createSlug = (title: string, id: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${slug}-${id}`;
};


// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 60) return `${diffInMins} min${diffInMins !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

// Helper function to format budget display
const formatBudget = (job: FogslyJob): string => {
  if (job.budgetType === 'quote') {
    return 'Request Quote';
  }
  const amount = job.budgetAmount ? `${job.budgetCurrency} ${job.budgetAmount.toLocaleString()}` : 'Not specified';
  const type = job.budgetType === 'hourly' ? '/hr' : ' (Fixed)';
  return `${amount}${type}`;
};

export const JobCard = ({ job, navigate, currentUser, onSaveToggle }: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAcceptedProposal, setHasAcceptedProposal] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [job.id, currentUser]);

  useEffect(() => {
    if (job.status === 'closed') {
      checkForAcceptedProposal();
    }
  }, [job.id, job.status]);

  const checkIfSaved = async () => {
    if (!currentUser || !job.id) return;
    
    try {
      const saved = await isJobSaved(currentUser.uid, job.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const checkForAcceptedProposal = async () => {
    try {
      const proposals = await getJobProposals(job.id);
      const hasAccepted = proposals.some(p => p.status === 'approved');
      setHasAcceptedProposal(hasAccepted);
    } catch (error) {
      console.error('Error checking proposals:', error);
    }
  };

  const handleCardClick = () => {
    // Set sessionStorage marker to return to jobs section
    sessionStorage.setItem('return-to-find-work-jobs', 'true');
    navigate('job-detail', job.id, { name: job.jobTitle });
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please sign in to save jobs');
      navigate('auth');
      return;
    }

    if (!job.id) {
      toast.error('Unable to save this job');
      return;
    }

    try {
      setIsSaving(true);
      const nowSaved = await toggleJobSave(currentUser.uid, job.id);
      setIsSaved(nowSaved);
      
      if (nowSaved) {
        toast.success('Job saved successfully!');
      } else {
        toast.success('Job removed from saved');
      }

      // Call the callback to refresh parent if needed
      if (onSaveToggle) {
        onSaveToggle();
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.3 }} className="h-full">
      <Card
        className="p-8 rounded-[32px] cursor-pointer group relative overflow-hidden transition-all h-full flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.08)',
        }}
        onClick={handleCardClick}
      >
        {/* Monogram Overlay for Closed Jobs */}
        {job.status === 'closed' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div
              className="transform rotate-[-25deg] text-7xl font-black opacity-10 select-none"
              style={{
                color: hasAcceptedProposal ? '#22c55e' : '#ef4444',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '0.1em',
                border: hasAcceptedProposal ? '8px solid #22c55e' : '8px solid #ef4444',
                padding: '20px 40px',
                borderRadius: '12px'
              }}
            >
              {hasAcceptedProposal ? 'HIRED' : 'CLOSED'}
            </div>
          </div>
        )}

        {/* Monogram Overlay for Completed Jobs */}
        {job.status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div
              className="transform rotate-[-25deg] text-6xl font-black opacity-15 select-none"
              style={{
                color: '#10b981',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '0.1em',
                border: '6px solid #10b981',
                padding: '15px 30px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.05)'
              }}
            >
              COMPLETED
            </div>
          </div>
        )}

        {/* Top Section: Category Badge & Save Button */}
        <div className="flex justify-between items-start mb-5">
          {job.categories.length > 0 && (
            <Badge
              className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
                color: 'white'
              }}
            >
              {job.categories[0]}
            </Badge>
          )}
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="transition-all hover:scale-110 -mt-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            title={isSaved ? "Unsave job" : "Save job"}
          >
            <Bookmark
              size={20}
              className={`transition-all ${
                isSaved
                  ? 'fill-[--color-primary] text-[--color-primary]'
                  : 'text-gray-400 hover:text-[--color-primary]'
              }`}
            />
          </button>
        </div>

        {/* Job Title */}
        <h3 className="text-2xl font-black mb-5 leading-tight line-clamp-2 text-gray-900 dark:text-white">
          {job.jobTitle}
        </h3>

        {/* Budget */}
        <p className="text-2xl font-black mb-6" style={{ color: 'rgb(59, 130, 246)' }}>
          {formatBudget(job)}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
          {job.skills.slice(0, 3).map(skill => (
            <span
              key={skill}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              +{job.skills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 mt-auto border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Clock size={14} />
            <span>{formatTimeAgo(job.createdAt)}</span>
          </div>
          {job.applicationCount !== undefined && job.applicationCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-pink-500 font-medium">
              <span>📍</span>
              <span>{job.applicationCount} DAY AGO</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};