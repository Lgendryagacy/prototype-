import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Users, Calendar, CheckCircle, Building2, Globe, CoinsIcon, Bookmark } from 'lucide-react';
import JobLocationMap from '../components/JobLocationMap';
import { JobLocation } from '../firebase/types/physicalJob';
import { getPhysicalJobById, incrementJobViews } from '../firebase/services/physicalJobRequestService';
import { checkExistingApplication } from '../firebase/services/physicalJobApplicationService';
import { isJobSaved, togglePhysicalJobSave } from '../firebase/services/savedJobs';
import { toast } from 'react-hot-toast';
import { useAuth } from '../firebase/hooks/useAuth';

interface Job {
  id: string;
  userId: string;
  company_name: string;
  company_logo?: string;
  industry: string;
  company_size: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  location?: JobLocation;
  company_description: string;
  website?: string;
  job_title: string;
  category: string;
  job_type: string;
  experience_level: string;
  employment_type: string;
  num_positions: number;
  salary_min: number;
  salary_max: number;
  urgency?: string;
  job_description: string;
  responsibilities: string;
  required_skills: string[];
  benefits?: string;
  accommodation: boolean;
  visa_support: boolean;
  deadline?: string;
  postedAt: Date;
  status: 'active' | 'paused' | 'closed';
  applicationsCount?: number;
  views?: number;
}

interface FogPhysicalJobDetailsPageProps {
  navigate: (route: string) => void;
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

interface FogPhysicalJobDetailsPageProps {
  navigate: (route: string) => void;
}

const FogPhysicalJobDetailsPage: React.FC<FogPhysicalJobDetailsPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Extract job ID from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/physical-job-details\/([^/]+)/);
    if (match && match[1]) {
      setJobId(match[1]);
    } else {
      // Fallback to query params for backward compatibility
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        setJobId(id);
      } else {
        setIsLoading(false);
        toast.error('Job ID not found');
      }
    }
  }, []);

  // Check if job is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user && jobId) {
        const saved = await isJobSaved(user.uid, jobId);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [user, jobId]);

  // Handle save button click
  const handleSaveClick = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    if (!jobId) {
      toast.error('Job ID not found');
      return;
    }

    if (job?.status !== 'active') {
      toast.error('Cannot save inactive jobs');
      return;
    }

    setIsSaving(true);
    try {
      const newSavedState = await togglePhysicalJobSave(user.uid, jobId);
      setIsSaved(newSavedState);
      toast.success(newSavedState ? 'Job saved!' : 'Job removed from saved');
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      setIsLoading(true);
      try {
        const jobData = await getPhysicalJobById(jobId);
        
        if (jobData) {
          setJob(jobData as any as Job);
          // Increment view count
          await incrementJobViews(jobId);
        } else {
          toast.error('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Check if user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (!user || !jobId || !job) return;
      
      // Don't check if user is the job poster
      if (user.uid === job.userId) return;

      try {
        const application = await checkExistingApplication(jobId, user.uid);
        if (application) {
          setExistingApplication(application);
          setHasApplied(true);
        }
      } catch (error) {
        console.error('Error checking application:', error);
      }
    };

    checkApplication();
  }, [user, jobId, job]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleBack = () => {
    navigate('fog-jobs');
  };

  const handleApply = () => {
    if (job) {
      // If user is the job poster, navigate to applications page
      if (user && user.uid === job.userId) {
        navigate(`physical-job-applicants/${job.id}`);
      } else if (hasApplied && existingApplication) {
        // If user has already applied, navigate to applications page
        navigate('my-fog-job-applications');
      } else {
        // Otherwise, navigate to application page
        navigate(`physical-job-application/${job.id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Job not found
          </h2>
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  const responsibilities = job.responsibilities.split('\n').filter(r => r.trim());
  const skills = Array.isArray(job.required_skills) ? job.required_skills : [];
  const benefits = job.benefits ? job.benefits.split('\n').filter(b => b.trim()) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-2 py-16 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
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
              {job.company_logo ? (
                <div className="w-28 h-28 rounded-2xl p-1 shadow-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
                  <img 
                    src={job.company_logo} 
                    alt={job.company_name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl p-1 shadow-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {job.company_name.charAt(0)}
                  </div>
                </div>
              )}
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
                  {job.status === 'active' && (
                    <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Active
                    </span>
                  )}
                  {job.urgency === 'High' && (
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
                    <CoinsIcon size={16} />
                    PKR {job.salary_min.toLocaleString()} - PKR {job.salary_max.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {user && user.uid !== job.userId && job.status === 'active' && (
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
                {user && user.uid === job.userId ? (
                  <button
                    onClick={handleApply}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Check Applications
                  </button>
                ) : hasApplied ? (
                  <button
                    onClick={handleApply}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    ✓ My Application
                  </button>
                ) : job.status === 'active' ? (
                  <button
                    onClick={handleApply}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Apply Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-8 py-3.5 rounded-xl font-bold text-sm text-white opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {job.status === 'paused' ? 'Job Paused' : 'Job Closed'}
                  </button>
                )}
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

                        {/* Location Map */}
            {job.location && (
              <JobLocationMap 
                location={job.location}
                companyName={job.company_name}
                showGetDirections={true}
                height="300px"
              />
            )}
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
                    <CoinsIcon size={22} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Salary Range</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      PKR {job.salary_min.toLocaleString()} - PKR {job.salary_max.toLocaleString()}
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
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatDate(job.postedAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Users size={22} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Applicants</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{job.applicationsCount || 0} applied</p>
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
                {user && user.uid === job.userId ? 'Manage Applications' : hasApplied ? 'Application Submitted' : 'Ready to Apply?'}
              </h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {user && user.uid === job.userId ? 'View and manage applications for this job.' : hasApplied ? 'You have already applied to this position.' : 'Take the next step in your career journey.'}
              </p>

              {user && user.uid === job.userId ? (
                <button
                  onClick={handleApply}
                  className="w-full px-8 py-4 rounded-xl font-bold text-base text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Check Applications →
                </button>
              ) : hasApplied ? (
                <button
                  onClick={handleApply}
                  className="w-full px-8 py-4 rounded-xl font-bold text-base text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: '#10b981' }}
                >
                  ✓ View My Application
                </button>
              ) : job.status === 'active' ? (
                <button
                  onClick={handleApply}
                  className="w-full px-8 py-4 rounded-xl font-bold text-base text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Apply Now →
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-8 py-4 rounded-xl font-bold text-base text-white opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {job.status === 'paused' ? 'Job Paused' : 'Job Closed'}
                </button>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FogPhysicalJobDetailsPage;