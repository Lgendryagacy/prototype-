import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Job {
  id: string;
  type: 'job';
  company_id: string;
  company_name: string;
  company_logo: string;
  industry: string;
  company_size: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  company_description: string;
  website: string;
  job_title: string;
  category: string;
  job_type: string;
  experience_level: string;
  employment_type: string;
  num_positions: number;
  salary_min: number;
  salary_max: number;
  urgency: string;
  job_description: string;
  responsibilities: string;
  required_skills: string;
  benefits: string;
  accommodation: boolean;
  visa_support: boolean;
  deadline: string;
  posted_date: string;
  status: 'active' | 'paused' | 'closed';
  applicant_count: number;
  verified: boolean;
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
  <motion.div
    className={`
      bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px]
      border border-blue-500/[0.15] dark:border-white/[0.1]
      rounded-[24px] shadow-[0_2px_8px_rgba(59,130,246,0.08)]
      dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
      transition-all duration-400
      ${className}
    `}
  >
    {children}
  </motion.div>
);

interface FogJobsEditProps {
  job: Job | null;
  navigateBack: () => void;
  onSaveJob: (jobId: string, updatedData: Partial<Job>) => void;
}

const FogPhysicalJobsEdit: React.FC<FogJobsEditProps> = ({ job, navigateBack, onSaveJob }) => {
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        job_title: job.job_title,
        category: job.category,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        num_positions: job.num_positions,
        status: job.status,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        job_description: job.job_description,
        responsibilities: job.responsibilities,
        required_skills: job.required_skills,
        benefits: job.benefits,
      });
    }
  }, [job]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSaving(true);
    setTimeout(() => {
      onSaveJob(job.id, formData);
      setIsSaving(false);
      navigateBack();
    }, 1000);
  };

  if (!job) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 px-4"
      >
        <GlassCard className="p-14 text-center">
          <p className="text-gray-600 dark:text-gray-300">No job selected</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-16 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={navigateBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base text-gray-900 dark:text-white hover:-translate-x-1 transition-all duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <GlassCard className="p-14 text-center mb-14">
          <h2 className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent mb-4" style={{ letterSpacing: '-0.02em' }}>
            Edit Job Posting
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Update your job details
          </p>
        </GlassCard>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <GlassCard className="p-14 mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-7 pb-4 border-b-2 border-blue-500/[0.15] dark:border-white/[0.1]">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.job_title || ''}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="IT">IT & Tech</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employment_type || ''}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.experience_level || ''}
                  onChange={(e) => handleChange('experience_level', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                >
                  <option value="">Select Level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Number of Positions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.num_positions || 1}
                  onChange={(e) => handleChange('num_positions', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Salary Min <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.salary_min || 0}
                  onChange={(e) => handleChange('salary_min', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Salary Max <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.salary_max || 0}
                  onChange={(e) => handleChange('salary_max', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all"
                />
              </div>
            </div>
          </GlassCard>

          {/* Job Details */}
          <GlassCard className="p-14 mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-7 pb-4 border-b-2 border-blue-500/[0.15] dark:border-white/[0.1]">
              Job Details
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.job_description || ''}
                  onChange={(e) => handleChange('job_description', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.responsibilities || ''}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.required_skills || ''}
                  onChange={(e) => handleChange('required_skills', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Benefits
                </label>
                <textarea
                  rows={4}
                  value={formData.benefits || ''}
                  onChange={(e) => handleChange('benefits', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[10px] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all resize-vertical"
                />
              </div>
            </div>
          </GlassCard>

          {/* Form Actions */}
          <div className="flex gap-4 justify-between">
            <button
              type="button"
              onClick={navigateBack}
              className="px-9 py-5 rounded-2xl font-bold text-base bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] text-gray-900 dark:text-white border border-blue-500/[0.15] dark:border-white/[0.1] hover:bg-white/[0.95] dark:hover:bg-white/[0.08] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-9 py-5 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:shadow-[0_20px_60px_rgba(6,182,212,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default FogPhysicalJobsEdit;
