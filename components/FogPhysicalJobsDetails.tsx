import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Users, Calendar, CheckCircle, Building2, Globe, Bookmark } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { isJobSaved, togglePhysicalJobSave } from '@/firebase/services/savedJobs';
import { toast } from 'react-hot-toast';

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
  <div
    className={`backdrop-blur-[20px] rounded-[24px] shadow-lg transition-all duration-400 ${className}`}
    style={{
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)'
    }}
  >
    {children}
  </div>
);

interface FogJobsDetailsProps {
  job: Job;
  navigateBack: () => void;
  setCurrentPage: (p: string) => void;
  formatDate: (d: string) => string;
}

const FogPhysicalJobsDetails: React.FC<FogJobsDetailsProps> = ({ job, navigateBack, setCurrentPage, formatDate }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const responsibilities = job.responsibilities.split('\n').filter(r => r.trim());
  const skills = job.required_skills.split(',').map(s => s.trim()).filter(s => s);
  const benefits = job.benefits.split('\n').filter(b => b.trim());

  // Check if job is saved on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user && job.id) {
        const saved = await isJobSaved(user.uid, job.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [user, job.id]);

  // Handle save button click
  const handleSaveClick = async () => {
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
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={navigateBack}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Jobs</span>
        </motion.button>

        {/* Header Card with Banner */}
        <GlassCard className="overflow-hidden mb-8">
          {/* Top Gradient Banner */}
          <div className="h-40 relative" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="absolute -bottom-14 left-8">
              <div className="w-28 h-28 rounded-2xl p-1 shadow-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
                  {job.company_name.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Job Info Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                {/* Title with badges */}
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <h1 className="text-4xl lg:text-5xl font-black leading-tight" style={{ letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                    {job.job_title}
                  </h1>
                  {job.verified && (
                    <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Verified
                    </span>
                  )}
                  {job.urgency === 'Urgent' && (
                    <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20 flex items-center gap-1.5 animate-pulse">
                      ⚡ Urgent
                    </span>
                  )}
                </div>

                <p className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {job.company_name} • {job.city}, {job.country}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2.5 mb-4">
                  <span className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    <MapPin size={16} />
                    {job.city}, {job.country}
                  </span>
                  <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    {job.job_type}
                  </span>
                  <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    {job.employment_type}
                  </span>
                  <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    {job.experience_level}
                  </span>
                </div>

                {/* Additional benefit tags */}
                <div className="flex flex-wrap gap-2.5">
                  {job.accommodation && (
                    <span className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-500/20">
                      🏠 Accommodation
                    </span>
                  )}
                  {job.visa_support && (
                    <span className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold border border-purple-500/20">
                      ✈️ Visa Support
                    </span>
                  )}
                  <span className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-sm font-bold flex items-center gap-2">
                    <DollarSign size={16} />
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {user && job.status === 'active' && (
                  <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      backgroundColor: isSaved ? 'var(--color-primary)' : 'var(--color-card)',
                      color: isSaved ? 'white' : 'var(--color-text-primary)',
                      border: `1px solid ${isSaved ? 'var(--color-primary)' : 'var(--color-border)'}`
                    }}
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'white' : 'none'} />
                    )}
                    {isSaved ? 'Saved' : 'Save Job'}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage('PhysicalFogJob-Application')}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Job Description
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {job.job_description}
              </p>
            </GlassCard>

            {/* Responsibilities */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Key Responsibilities
              </h2>
              <ul className="space-y-3.5">
                {responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="text-green-600 dark:text-green-400 font-black text-xl mt-0.5">✓</span>
                    <span className="flex-1">{resp}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Benefits */}
            {benefits.length > 0 && (
              <GlassCard className="p-8">
                <h2 className="text-3xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>
                  Benefits & Perks
                </h2>
                <ul className="space-y-3.5">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="text-blue-600 dark:text-cyan-400 font-black text-xl mt-0.5">★</span>
                      <span className="flex-1">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* About Company */}
            <GlassCard className="p-8">
              <h2 className="text-3xl font-black mb-5 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                <Building2 size={28} style={{ color: 'var(--color-primary)' }} />
                About {job.company_name}
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {job.company_description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Users size={18} />
                  <span className="text-sm font-semibold">{job.company_size} employees</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Building2 size={18} />
                  <span className="text-sm font-semibold">{job.industry}</span>
                </div>
                {job.website && (
                  <a href={job.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: 'var(--color-primary)' }}>
                    <Globe size={18} />
                    <span className="text-sm font-semibold">Visit Website</span>
                  </a>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Job Overview */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Job Overview
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <DollarSign size={22} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Salary Range</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Briefcase size={22} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Job Type</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{job.employment_type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Location</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{job.city}, {job.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Calendar size={22} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Posted</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatDate(job.posted_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Users size={22} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Applicants</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{job.applicant_count} applied</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Required Skills */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Apply CTA */}
            <GlassCard className="p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--color-primary)' }} />

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white text-2xl mb-5 shadow-[0_0_40px_rgba(59,130,246,0.25)]" style={{ backgroundColor: 'var(--color-primary)' }}>
                🎯
              </div>

              <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Ready to Apply?
              </h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Take the next step in your career journey.
              </p>

              <button
                onClick={() => ('PhysicalFogJob-Application')}
                className="w-full px-8 py-4 rounded-xl font-bold text-base text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Apply Now →
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FogPhysicalJobsDetails;