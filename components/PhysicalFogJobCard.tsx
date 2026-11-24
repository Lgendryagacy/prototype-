import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import PhysicalFogJobGlassCard from './PhysicalFogJobGlassCard';
import { Job } from './types';
import { useAuth } from '@/firebase/hooks/useAuth';
import { isJobSaved, togglePhysicalJobSave } from '@/firebase/services/savedJobs';
import { toast } from 'react-hot-toast';

interface PhysicalFogJobCardProps {
  job: Job;
  onClick: () => void;
  formatDate: (date: string) => string;
  index?: number;
  onSaveToggle?: () => void;
}

const PhysicalFogJobCard: React.FC<PhysicalFogJobCardProps> = ({
  job,
  onClick,
  formatDate,
  index = 0,
  onSaveToggle
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user && job.id) {
        const saved = await isJobSaved(user.uid, job.id);
        setIsSaved(saved);
      }
    };

    checkSavedStatus();
  }, [user, job.id]);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    if (job.status !== 'active') {
      toast.error('Cannot save inactive jobs');
      return;
    }

    setIsSaving(true);
    try {
      const newSavedState = await togglePhysicalJobSave(user.uid, job.id);
      setIsSaved(newSavedState);
      toast.success(newSavedState ? 'Job saved!' : 'Job removed from saved');
      onSaveToggle?.();
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <PhysicalFogJobGlassCard hoverable onClick={onClick} className="p-8 relative overflow-hidden group">
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      {/* Header with logo and badges */}
      <div className="flex items-start justify-between mb-6">
        {job.company_logo ? (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center  shadow-lg"
            style={{ border: '1px solid var(--color-primary)', overflow: 'hidden' }}
          >
            <img src={job.company_logo} alt={job.company_name} />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {job.company_name.charAt(0)}
          </div>
        )}

        <div className="flex flex-col items-end gap-2">
          {/* Save Button */}
          {user && job.status === 'active' && (
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSaved ? 'var(--color-primary)' : 'var(--color-card)',
                border: `1px solid ${isSaved ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isSaved ? 'white' : 'var(--color-text-primary)'
              }}
              title={isSaved ? 'Saved' : 'Save for later'}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bookmark className="w-5 h-5" fill={isSaved ? 'white' : 'none'} />
              )}
            </button>
          )}
          
          {job.verified && (
            <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1.5">
              ✓ Verified
            </span>
          )}
          {job.urgency === 'Urgent' && (
            <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20 flex items-center gap-1.5">
              ⚡ Urgent
            </span>
          )}
        </div>
      </div>

      {/* Job title and company */}
      <h3 className="text-2xl font-black mb-2 leading-tight transition-colors" style={{ color: 'var(--color-text-primary)' }}>
        {job.job_title}
      </h3>
      <p className="text-base font-semibold mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {job.company_name}
      </p>

      {/* Main tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
          📍 {job.city}, {job.country}
        </span>
        <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200">
          {job.job_type}
        </span>
        <span className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-sm font-bold flex items-center gap-2">
          💰 PKR {job.salary_min.toLocaleString()} - PKR {job.salary_max.toLocaleString()}
        </span>
      </div>

      {/* Additional info tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.accommodation && (
          <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
            🏠 Accommodation
          </span>
        )}
        {job.visa_support && (
          <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
            ✈️ Visa Support
          </span>
        )}
        <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
          {job.experience_level}
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          🕒 Posted {formatDate(job.posted_date)}
        </span>
        <button className="text-sm font-bold group-hover:underline flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </PhysicalFogJobGlassCard>
  </motion.div>
);
}

export default PhysicalFogJobCard;