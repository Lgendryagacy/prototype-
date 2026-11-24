import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Bookmark,
  Share2,
  Filter,
  ArrowRight,
  Building2,
  ExternalLink,
  Sparkles,
  Users,
  Coins,
  X,
  Send,
  Plus,
  ChevronDown,
  UploadCloud,
  Check,
  Globe,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  FileText,
  SlidersHorizontal,
  BadgeCheck,
  ArrowUpRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { INITIAL_JOBS, JobItem } from './jobsData';
import { toast } from 'react-hot-toast';
import { Route } from '../../types';
import { JobCardSkeleton } from '../common/FeedSkeletons';

interface JobsExplorerProps {
  navigate: (route: Route | string) => void;
  currentUser?: any;
}

export const JobsExplorer: React.FC<JobsExplorerProps> = ({ navigate, currentUser }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobItem[]>(() => {
    const saved = localStorage.getItem('fogsly-all-jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_JOBS;
      }
    }
    return INITIAL_JOBS;
  });

  const [activeHubTab, setActiveHubTab] = useState<'all' | 'freelance' | 'tasker' | 'fulltime' | 'saved' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [urgentOnlyFilter, setUrgentOnlyFilter] = useState(false);
  const [escrowOnlyFilter, setEscrowOnlyFilter] = useState(false);

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fogsly-saved-job-ids');
    return saved ? JSON.parse(saved) : ['job-1', 'job-3'];
  });

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    const applied = localStorage.getItem('fogsly-applied-job-ids');
    return applied ? JSON.parse(applied) : ['job-2'];
  });

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobItem | null>(null);
  const [jobToApply, setJobToApply] = useState<JobItem | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // Application form state
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form');
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || currentUser?.name || 'Farhan Tariq');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || 'farhan.tariq@fogsly.pro');
  const [applicantPortfolio, setApplicantPortfolio] = useState('https://github.com/farhan-builder');
  const [applicantPitch, setApplicantPitch] = useState('');
  const [applicantRate, setApplicantRate] = useState('');
  const [applicantPitchTone, setApplicantPitchTone] = useState<'senior' | 'fast' | 'creative'>('senior');
  const [isGeneratingAiPitch, setIsGeneratingAiPitch] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>('Farhan_Tariq_Staff_Engineer_CV.pdf');
  const [confirmedAppId, setConfirmedAppId] = useState('');

  // Post Job form state
  const [newJobMode, setNewJobMode] = useState<'Freelance' | 'Tasker' | 'Full-Time'>('Freelance');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobCategory, setNewJobCategory] = useState<JobItem['category']>('AI & ML');
  const [newJobType, setNewJobType] = useState<JobItem['jobType']>('Remote');
  const [newJobExp, setNewJobExp] = useState<JobItem['experienceLevel']>('Senior / Lead');
  const [newJobLocation, setNewJobLocation] = useState('Worldwide (Remote)');
  const [newJobSalaryMin, setNewJobSalaryMin] = useState('120000');
  const [newJobSalaryMax, setNewJobSalaryMax] = useState('160000');
  const [newJobFogBonus, setNewJobFogBonus] = useState('3500');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobTags, setNewJobTags] = useState('React, Next.js, AI, TypeScript, Escrow');

  // Initial fetch simulation for smooth perceived performance
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Persist saved jobs
  useEffect(() => {
    localStorage.setItem('fogsly-saved-job-ids', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  // Persist applied jobs
  useEffect(() => {
    localStorage.setItem('fogsly-applied-job-ids', JSON.stringify(appliedJobIds));
  }, [appliedJobIds]);

  // Persist all jobs
  useEffect(() => {
    localStorage.setItem('fogsly-all-jobs', JSON.stringify(jobs));
  }, [jobs]);

  const toggleSaveJob = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (savedJobIds.includes(id)) {
      setSavedJobIds(savedJobIds.filter(item => item !== id));
      toast.success('Removed from saved roles');
    } else {
      setSavedJobIds([...savedJobIds, id]);
      toast.success('Saved to your bookmarked roles');
    }
  };

  const handleShareJob = (job: JobItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/#fog-jobs?id=${job.id}`);
    toast.success(`Share link copied: ${job.title} at ${job.companyName}`);
  };

  const openApplyModal = (job: JobItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setJobToApply(job);
    setApplyStep('form');
    setApplicantRate(`$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`);
    setApplicantPitch(`Hello ${job.companyName} Team,\n\nI am thrilled to submit my application for the ${job.title} role. With over 6+ years specializing in ${job.tags.slice(0, 3).join(', ')}, I have engineered production applications handling high concurrency, resilient microservices, and AI-accelerated workflows.\n\nI would love to walk you through my portfolio and discuss how I can immediately contribute to your roadmaps.`);
  };

  const generateAiPitch = () => {
    if (!jobToApply) return;
    setIsGeneratingAiPitch(true);
    setTimeout(() => {
      let pitch = '';
      if (applicantPitchTone === 'senior') {
        pitch = `Dear ${jobToApply.companyName} Hiring Leadership,\n\nI am writing to express my strong candidacy for the ${jobToApply.title} opportunity. Having led core engineering initiatives across ${jobToApply.category} with a focus on ${jobToApply.tags.slice(0, 2).join(' and ')}, I bring direct experience scaling systems under strict latency and uptime constraints.\n\nMy approach centers on architectural rigor, automated testing pipelines, and rapid feedback loops. I am fully aligned with your milestone-based delivery and look forward to delivering immediate value.`;
      } else if (applicantPitchTone === 'fast') {
        pitch = `Hi ${jobToApply.companyName} Team,\n\nI saw your ${jobToApply.isUrgent ? 'urgent ' : ''}opening for ${jobToApply.title} and can start immediately. I have shipped production applications with ${jobToApply.tags.join(', ')} and have proven experience hitting tight delivery milestones under Fogsly escrow.\n\nReady for a quick 10-minute technical sync anytime this week. Check out my attached portfolio!`;
      } else {
        pitch = `Hello ${jobToApply.companyName}!\n\nWhat caught my attention about this ${jobToApply.title} role is your bold mission in ${jobToApply.category}. Having crafted award-winning digital solutions with ${jobToApply.tags.slice(0, 3).join(', ')}, I excel at marrying human-centered product craft with rock-solid underlying engineering.\n\nLet's connect and build something iconic together.`;
      }
      setApplicantPitch(pitch);
      setIsGeneratingAiPitch(false);
      toast.success('AI Pitch crafted tailored to this position!');
    }, 600);
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToApply) return;

    if (!appliedJobIds.includes(jobToApply.id)) {
      setAppliedJobIds([...appliedJobIds, jobToApply.id]);
    }

    // Update job applicants count locally
    setJobs(prevJobs =>
      prevJobs.map(j =>
        j.id === jobToApply.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j
      )
    );

    const generatedId = `FOG-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedAppId(generatedId);
    setApplyStep('success');
    toast.success('Application registered with smart-contract escrow verification!');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobCompany.trim() || !newJobDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const parsedTags = newJobTags.split(',').map(t => t.trim()).filter(Boolean);

    const createdJob: JobItem = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      companyName: newJobCompany.trim(),
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      companyWebsite: 'https://fogsly.com',
      companySize: '10-50 employees',
      headquarters: 'Global & Remote',
      category: newJobCategory,
      jobType: newJobType,
      experienceLevel: newJobExp,
      salaryMin: parseInt(newJobSalaryMin) || 95000,
      salaryMax: parseInt(newJobSalaryMax) || 140000,
      salaryCurrency: '$',
      salaryPeriod: 'year',
      fogCoinBonus: parseInt(newJobFogBonus) || 3000,
      location: newJobLocation.trim() || 'Worldwide (Remote)',
      postedDate: new Date().toISOString().split('T')[0],
      postedTimeAgo: 'Just now',
      applicantsCount: 0,
      isFeatured: true,
      isUrgent: true,
      verified: true,
      shortDescription: newJobDescription.slice(0, 160) + '...',
      fullDescription: newJobDescription,
      responsibilities: [
        'Lead key features and delivery milestones from architectural planning to production.',
        'Collaborate across decentralized teams under transparent milestone reviews.',
        'Champion code quality, security standards, and seamless documentation.'
      ],
      requirements: [
        'Proven track record in equivalent commercial or freelance projects.',
        'Autonomous problem-solving capability and clear, asynchronous communication.',
        'Familiarity with modern toolchains and milestone verification.'
      ],
      benefits: [
        'Competitive base compensation with instant smart-contract milestone payouts.',
        'FOG Coin grant incentives on successful milestone delivery.',
        '100% remote flexibility with async-first working hours.'
      ],
      tags: parsedTags.length > 0 ? parsedTags : ['Remote', 'Freelance', 'Fogsly Escrow']
    };

    setJobs([createdJob, ...jobs]);
    setIsPostJobModalOpen(false);
    toast.success('Opportunity published to Fogsly live marketplace!');

    // Reset
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobDescription('');
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Tab filter
      if (activeHubTab === 'saved' && !savedJobIds.includes(job.id)) return false;
      if (activeHubTab === 'applied' && !appliedJobIds.includes(job.id)) return false;
      if (activeHubTab === 'freelance' && job.jobType !== 'Contract' && job.jobType !== 'Remote') return false;
      if (activeHubTab === 'fulltime' && job.jobType !== 'Full-Time') return false;
      if (activeHubTab === 'tasker' && !job.tags.some(t => t.toLowerCase().includes('task') || t.toLowerCase().includes('contract') || t.toLowerCase().includes('gig'))) {
        // Also allow local/hybrid if tasker
        if (job.jobType !== 'Contract' && job.jobType !== 'Hybrid') return false;
      }

      if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
      if (selectedType !== 'All' && job.jobType !== selectedType) return false;
      if (selectedExperience !== 'All' && job.experienceLevel !== selectedExperience) return false;
      if (minSalaryFilter > 0 && job.salaryMin < minSalaryFilter) return false;
      if (urgentOnlyFilter && !job.isUrgent) return false;
      if (escrowOnlyFilter && !job.verified) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesLoc = job.location.toLowerCase().includes(q);
        const matchesTags = job.tags.some(t => t.toLowerCase().includes(q));
        const matchesDesc = job.shortDescription.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesLoc && !matchesTags && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, activeHubTab, savedJobIds, appliedJobIds, selectedCategory, selectedType, selectedExperience, minSalaryFilter, urgentOnlyFilter, escrowOnlyFilter, searchQuery]);

  const categoriesList = [
    'All',
    'AI & ML',
    'Engineering & IT',
    'UI/UX & Design',
    'Growth & Marketing',
    'Web3 & Blockchain',
    'Operations & Finance'
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#080B11] text-slate-900 dark:text-slate-100 pt-20 pb-28 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. ATMOSPHERIC HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0D1424] to-[#080B11] text-white border-b border-slate-800/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8 shadow-2xl">
        {/* Subtle dynamic background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-blue-600/15 dark:bg-blue-500/20 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-500/10 blur-[110px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-7xl mx-auto space-y-8">
          {/* Top Breadcrumb & Trust Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>FOGSLY FREELANCE & TASKER HUB</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Escrow Protected
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="hidden sm:inline">P2P Escrow Protocol</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-amber-400 font-mono">
                FOG v3.2 Mainnet
              </span>
            </div>
          </div>

          {/* Main Headline & CTAs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Where Top Builders Find <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Verified High-Ticket Opportunities
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl font-normal">
                Discover curated freelance contracts, local tasker bounties, and enterprise careers. Get paid instantly in USD or FOG Coins with guaranteed smart-contract milestone protection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post an Opportunity</span>
              </button>

              <button
                onClick={() => {
                  setActiveHubTab('freelance');
                  const el = document.getElementById('marketplace-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Browse Freelance Gigs</span>
              </button>
            </div>
          </div>

          {/* Live Ecosystem Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Active Positions</span>
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {jobs.length} Openings
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% KYC Vetted
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Escrow Protected Today</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                $540,000+
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero payment disputes
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>FOG Coin Bounty Pool</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-1.5">
                85,000 <span className="text-xs font-bold text-slate-400">FOG</span>
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">
                Milestone bonus grants
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg. Payout Release</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                &lt; 15 Mins
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Instant wallet settlement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARKETPLACE HUB VIEW CONTROLS */}
      <div id="marketplace-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Hub Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveHubTab('all')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Opportunities</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-bold">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveHubTab('freelance')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'freelance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-blue-500" />
            <span>Freelance & Contracts</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
              High-Ticket
            </span>
          </button>

          <button
            onClick={() => setActiveHubTab('tasker')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'tasker'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Tasker Hub (Gigs & Local)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-mono">
              Instant
            </span>
          </button>

          <button
            onClick={() => setActiveHubTab('fulltime')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'fulltime'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>Full-Time Careers</span>
          </button>

          <button
            onClick={() => setActiveHubTab('saved')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'saved'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved Roles</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold">
              {savedJobIds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveHubTab('applied')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeHubTab === 'applied'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>My Applications</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold">
              {appliedJobIds.length}
            </span>
          </button>
        </div>

        {/* 3. SEARCH & ADVANCED FILTER PANEL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title, technologies (Next.js, Python, Figma), company, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Quick Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Workplace</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Workplaces</option>
                <option value="Remote">Remote Only</option>
                <option value="Contract">Contract / Gigs</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Seniority</label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Seniorities</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior / Lead">Senior / Lead</option>
                <option value="Staff / Executive">Staff / Executive</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Min. Base</label>
              <select
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="0">Any Compensation</option>
                <option value="80000">$80,000+ / yr</option>
                <option value="120000">$120,000+ / yr</option>
                <option value="150000">$150,000+ / yr</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgentOnlyFilter}
                  onChange={(e) => setUrgentOnlyFilter(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Urgent Only</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={escrowOnlyFilter}
                  onChange={(e) => setEscrowOnlyFilter(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Escrow Verified</span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setSelectedExperience('All');
                  setMinSalaryFilter(0);
                  setUrgentOnlyFilter(false);
                  setEscrowOnlyFilter(false);
                  setSearchQuery('');
                }}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-center transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredJobs.length}</span> verified {filteredJobs.length === 1 ? 'position' : 'positions'}
          </div>
          <div className="flex items-center gap-2">
            <span>Marketplace:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Live Escrow Network</span>
          </div>
        </div>

        {/* 4. JOB CARDS LIST */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <JobCardSkeleton key={n} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No opportunities match these parameters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Try relaxing your category selection, removing the salary threshold, or switching between Freelance, Tasker, and Full-time tabs.
            </p>
            <button
              onClick={() => {
                setActiveHubTab('all');
                setSelectedCategory('All');
                setSelectedType('All');
                setSelectedExperience('All');
                setMinSalaryFilter(0);
                setUrgentOnlyFilter(false);
                setEscrowOnlyFilter(false);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const isApplied = appliedJobIds.includes(job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobForDetail(job)}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/60 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Company Branding & Primary Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 p-1 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {/* Company row + Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {job.companyName}
                          </span>
                          {job.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/80">
                              <BadgeCheck className="w-3 h-3 text-blue-500" />
                              Fogsly Verified
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Escrow Backed
                          </span>
                          {job.isUrgent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80">
                              <Zap className="w-3 h-3 text-amber-500" />
                              Urgent Hire
                            </span>
                          )}
                          {isApplied && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/80">
                              <Check className="w-3 h-3 text-purple-500" />
                              Applied
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h2>

                        {/* Location & Seniority Metadata */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {job.jobType}
                          </span>
                          <span>•</span>
                          <span>{job.experienceLevel}</span>
                          <span>•</span>
                          <span className="text-slate-400">{job.postedTimeAgo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remuneration & Actions */}
                    <div className="flex lg:flex-col lg:items-end justify-between items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {job.salaryCurrency}{job.salaryMin.toLocaleString()} - {job.salaryCurrency}{job.salaryMax.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500"> / {job.salaryPeriod}</span>
                        </div>

                        {job.fogCoinBonus && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/70 mt-1">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            +{job.fogCoinBonus.toLocaleString()} FOG Milestone Bonus
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleSaveJob(job.id, e)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isSaved
                              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                          title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => handleShareJob(job, e)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => openApplyModal(job, e)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                            isApplied
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-blue-600/40'
                          }`}
                        >
                          {isApplied ? 'Applied ✓' : 'Quick Apply'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Tag Pills */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-3xl leading-relaxed">
                      {job.shortDescription}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      {job.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                      {job.tags.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{job.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. JOB DETAIL MODAL */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-[#0A0E17]">
              <div className="flex items-start gap-4">
                <img
                  src={selectedJobForDetail.companyLogo}
                  alt={selectedJobForDetail.companyName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{selectedJobForDetail.companyName}</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      Verified Enterprise
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedJobForDetail.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{selectedJobForDetail.location}</span>
                    <span>•</span>
                    <span>{selectedJobForDetail.jobType}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{selectedJobForDetail.salaryCurrency}{selectedJobForDetail.salaryMin.toLocaleString()} - {selectedJobForDetail.salaryCurrency}{selectedJobForDetail.salaryMax.toLocaleString()} / {selectedJobForDetail.salaryPeriod}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
              {/* Escrow Guarantee Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fogsly Smart-Contract Escrow Protected</h4>
                    <p className="text-[11px] text-slate-500">Milestone funds are locked in advance and released instantly upon your verified deliverables.</p>
                  </div>
                </div>
                {selectedJobForDetail.fogCoinBonus && (
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Coins className="w-4 h-4" /> +{selectedJobForDetail.fogCoinBonus} FOG
                    </div>
                    <div className="text-[10px] text-slate-400">Bonus Grant</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role Overview</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedJobForDetail.fullDescription}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Deliverables & Responsibilities</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  {selectedJobForDetail.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Qualifications</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  {selectedJobForDetail.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Culture, Equity & Benefits</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  {selectedJobForDetail.benefits.map((ben, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0E17] flex items-center justify-between gap-3">
              <button
                onClick={(e) => toggleSaveJob(selectedJobForDetail.id, e)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>{savedJobIds.includes(selectedJobForDetail.id) ? 'Saved' : 'Save'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const j = selectedJobForDetail;
                    setSelectedJobForDetail(null);
                    openApplyModal(j);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Apply with Fogsly Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SMART APPLICATION & AI PITCH MODAL */}
      {jobToApply && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {applyStep === 'form' ? (
              <form onSubmit={submitApplication} className="space-y-5 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Direct Escrow Proposal
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Apply for {jobToApply.title}
                    </h2>
                    <p className="text-xs text-slate-500">{jobToApply.companyName} • {jobToApply.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJobToApply(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Links & Expected Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Portfolio / GitHub / LinkedIn</label>
                    <input
                      type="url"
                      value={applicantPortfolio}
                      onChange={(e) => setApplicantPortfolio(e.target.value)}
                      placeholder="https://github.com/yourhandle"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expected Rate / Compensation</label>
                    <input
                      type="text"
                      value={applicantRate}
                      onChange={(e) => setApplicantRate(e.target.value)}
                      placeholder="$120k/yr or $65/hr"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* AI Pitch Generator Toolbar */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Fogsly AI Proposal Assistant</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setApplicantPitchTone('senior')}
                        className={`px-2 py-0.5 rounded ${applicantPitchTone === 'senior' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}
                      >
                        Architect
                      </button>
                      <button
                        type="button"
                        onClick={() => setApplicantPitchTone('fast')}
                        className={`px-2 py-0.5 rounded ${applicantPitchTone === 'fast' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}
                      >
                        Fast Gig
                      </button>
                      <button
                        type="button"
                        onClick={() => setApplicantPitchTone('creative')}
                        className={`px-2 py-0.5 rounded ${applicantPitchTone === 'creative' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}
                      >
                        Creative
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generateAiPitch}
                    disabled={isGeneratingAiPitch}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAiPitch ? 'Crafting Targeted Pitch...' : 'Generate Instant AI Pitch for this Role'}</span>
                  </button>
                </div>

                {/* Cover Pitch */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cover Pitch & Qualifications</label>
                  <textarea
                    rows={4}
                    required
                    value={applicantPitch}
                    onChange={(e) => setApplicantPitch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Resume simulator */}
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#070A10] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-mono">{resumeFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFileName(`Updated_CV_${Date.now().toString().slice(-4)}.pdf`);
                      toast.success('CV file attachment updated');
                    }}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Replace PDF
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setJobToApply(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verified Proposal</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Success confirmation view */
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Proposal Successfully Dispatched!</h2>
                  <p className="text-xs text-slate-500">
                    Your application for <span className="font-bold text-slate-800 dark:text-slate-200">{jobToApply.title}</span> at {jobToApply.companyName} is registered under Fogsly escrow.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proposal Tracking ID:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{confirmedAppId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Escrow Milestone Status:</span>
                    <span className="font-semibold text-emerald-500">Pre-authorized & Protected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recruiter Response Time:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Within 24 - 48 Hours</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setJobToApply(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  Done & Return to Explorer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. POST A ROLE MODAL */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Publish an Opportunity on Fogsly
                  </h2>
                  <p className="text-xs text-slate-500">
                    Reach over 14,000+ verified software engineers, taskers, and AI builders with smart-contract escrow protection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Opportunity Type */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Freelance', 'Tasker', 'Full-Time'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewJobMode(m)}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      newJobMode === m
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m === 'Freelance' ? '⚡ Freelance Contract' : m === 'Tasker' ? '🛠️ Tasker Hub Gig' : '🏢 Full-Time Career'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Position / Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Smart Contract Auditor"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company or Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Labs"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Domain</label>
                  <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="AI & ML">AI & ML</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                    <option value="UI/UX & Design">UI/UX & Design</option>
                    <option value="Growth & Marketing">Growth & Marketing</option>
                    <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                    <option value="Operations & Finance">Operations & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Format</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Seniority</label>
                  <select
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior / Lead">Senior / Lead</option>
                    <option value="Staff / Executive">Staff / Executive</option>
                  </select>
                </div>
              </div>

              {/* Compensation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Base Min ($)</label>
                  <input
                    type="number"
                    value={newJobSalaryMin}
                    onChange={(e) => setNewJobSalaryMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Base Max ($)</label>
                  <input
                    type="number"
                    value={newJobSalaryMax}
                    onChange={(e) => setNewJobSalaryMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">FOG Coin Bonus</label>
                  <input
                    type="number"
                    value={newJobFogBonus}
                    onChange={(e) => setNewJobFogBonus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Role Description & Deliverables *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline key project deliverables, expected milestones, and required tech stack..."
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newJobTags}
                  onChange={(e) => setNewJobTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Publish & Escrow Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsExplorer;
