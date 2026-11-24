import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, FileText, Bookmark, Search, CheckCircle } from 'lucide-react';
import PhysicalFogJobCard from './PhysicalFogJobCard';
import PhysicalFogJobSearchFilters from './PhysicalFogJobSearchFilters';
import PhysicalFogJobGlassCard from './PhysicalFogJobGlassCard';
import { Button } from './ui/Button';
import { SearchableSelect } from './ui/SearchableSelect';

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

interface FogJobsHomeProps {
  jobs: Job[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: any;
  setFilters: (f: any) => void;
  navigateToJob: (id: string) => void;
  navigate: (route: string) => void;
  formatDate: (d: string) => string;
  pendingRequestsCount: number;
  availableCountries?: string[];
  availableCategories?: string[];
  userJobsCount?: number;
  userApplicationsCount?: number;
  userSavedJobsCount?: number;
}

const FogPhysicalJobsHome: React.FC<FogJobsHomeProps> = ({
  jobs,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  navigateToJob,
  navigate,
  formatDate,
  pendingRequestsCount,
  availableCategories = [],
  userJobsCount = 0,
  userApplicationsCount = 0,
  userSavedJobsCount = 0
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = () => {
    // Apply filters
    setFilters({
      ...filters,
      category: selectedCategory === 'All Categories' ? '' : selectedCategory
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 text-center overflow-hidden">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="container mx-auto px-4"
        >
          <motion.div
            className="inline-flex items-center justify-center text-6xl mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🌍
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-[--color-text-primary]">
            Global On-Site Jobs
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-accent]">
              Work Worldwide
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-[--color-text-secondary] max-w-3xl mx-auto mb-12 font-medium opacity-80">
            Discover verified global job opportunities, including on-site and remote jobs, posted by trusted employers worldwide. Access long-term job listings, content creation roles, and professional projects on a secure online jobs platform..
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto backdrop-blur-xl bg-[--color-card]/70 rounded-3xl md:rounded-full p-3 md:p-2.5 mb-12 shadow-2xl flex items-center border-2 border-[--color-border] flex-col md:flex-row gap-3 md:gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 md:px-6 w-full">
              <Search className="text-[--color-text-secondary] flex-shrink-0" size={22} />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent py-3 md:py-3.5 text-base md:text-lg font-medium outline-none text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50"
              />
            </div>
            <div className="w-full md:w-64 flex-shrink-0 px-2">
              <SearchableSelect
                options={['All Categories', ...availableCategories]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="All Categories"
                className="w-full h-12 bg-[--color-bg-secondary]/50 text-[--color-text-primary] border-[--color-border] rounded-xl"
              />
            </div>
            <Button
              size="lg"
              className="w-full md:w-auto px-10 py-3.5 font-bold shadow-lg hover:-translate-y-0.5 transition-all rounded-xl md:rounded-full"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {pendingRequestsCount < 1 ? (
              <Button
                size="lg"
                className="px-14 py-6 font-bold text-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => navigate('post-physical-job')}
              >
                Post a Physical Job
              </Button>
            ) : (
              <Button
                size="lg"
                className="px-14 py-6 font-bold text-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => navigate('physical-job-request-status')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Request Status ({pendingRequestsCount} Pending)
              </Button>
            )}

            {userJobsCount > 0 && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 font-bold"
                onClick={() => navigate('manage-physical-jobs')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Jobs ({userJobsCount})
              </Button>
            )}

            {userApplicationsCount > 0 && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 font-bold"
                onClick={() => navigate('my-fog-job-applications')}
              >
                <FileText className="w-4 h-4 mr-2" />
                My Applications
              </Button>
            )}

            {userSavedJobsCount > 0 && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 font-bold"
                onClick={() => navigate('saved-physical-jobs')}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Jobs
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Jobs Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10 flex-wrap gap-6">
            <h2 className="text-5xl font-black text-center md:text-start" style={{ color: 'var(--color-text-primary)' }}>
              Find Your Dream Job
            </h2>
          </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
            {jobs.map((job, index) => (
              <PhysicalFogJobCard
                key={job.id}
                job={job}
                onClick={() => navigateToJob(job.id)}
                formatDate={formatDate}
                index={index}
              />
            ))}
          </div>
        ) : (
          <PhysicalFogJobGlassCard className="text-center py-24 mt-10" onClick={() => {}}>
            <div className="text-7xl mb-7 opacity-40">📭</div>
            <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
              No Jobs Found
            </h3>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Try adjusting your filters or post the first job!
            </p>
          </PhysicalFogJobGlassCard>
        )}
        </div>
      </section>
    </motion.div>
  );
};

export default FogPhysicalJobsHome;
