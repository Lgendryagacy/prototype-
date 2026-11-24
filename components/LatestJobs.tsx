import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Briefcase, Archive } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';
import { JobCard } from './JobCard';
import { getActiveFogslyJobs, getAllFogslyJobs } from '../firebase/services/fogslyJobsService';
import { FogslyJob } from '../firebase/types/job';
import { useAuth } from '../firebase/hooks/useAuth';

const JOBS_PER_PAGE = 10;

interface LatestJobsProps {
  navigate: (route: Route, context?: any) => void;
  searchQuery?: string;
  categoryFilter?: string;
}

const LatestJobs = ({ navigate, searchQuery = '', categoryFilter = '' }: LatestJobsProps) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [jobs, setJobs] = useState<FogslyJob[]>([]);
  const [closedJobs, setClosedJobs] = useState<FogslyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchJobs();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const activeJobs = await getActiveFogslyJobs(100);
      const allClosedJobs = await getAllFogslyJobs('closed', '', 100);
      const allCompletedJobs = await getAllFogslyJobs('completed', '', 100);
      
      // Combine closed and completed jobs
      const combinedClosedJobs = [...allClosedJobs, ...allCompletedJobs];
      
      console.log('✅ Active jobs count:', activeJobs.length);
      console.log('✅ Closed jobs count:', allClosedJobs.length);
      console.log('✅ Completed jobs count:', allCompletedJobs.length);
      console.log('✅ Total closed+completed:', combinedClosedJobs.length);
      
      setJobs(activeJobs);
      setClosedJobs(combinedClosedJobs);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
      setClosedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering with useMemo
  const filteredJobs = useMemo(() => {
    let filtered = activeTab === 'active' ? jobs : closedJobs;

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(job => 
        job.jobTitle.toLowerCase().includes(query) ||
        job.jobDescription.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query)) ||
        job.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter.trim() && categoryFilter !== 'All Categories') {
      const category = categoryFilter.toLowerCase().trim();
      filtered = filtered.filter(job => 
        job.categories.some(cat => cat.toLowerCase() === category)
      );
    }

    return filtered;
  }, [jobs, closedJobs, activeTab, searchQuery, categoryFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const currentJobs = showAll ? filteredJobs.slice(startIndex, endIndex) : filteredJobs.slice(0, 3);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAll = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <section>
        {/* Tab Navigation - Show even during loading */}
        <div className="flex gap-2 border-b border-slate-700 mb-6">
          <button
            disabled
            className="px-6 py-3 font-medium text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Active Jobs
            </div>
          </button>
          <button
            disabled
            className="px-6 py-3 font-medium text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Closed Jobs
            </div>
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[--color-text-primary]">
            {searchQuery || categoryFilter ? 'Search Results' : 'Latest Jobs'}
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary]"></div>
        </div>
      </section>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <section>
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-700 mb-6">
          <button
            onClick={() => {
              setActiveTab('active');
              setCurrentPage(1);
              setShowAll(false);
            }}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'active'
                ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Active Jobs ({jobs.length})
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('closed');
              setCurrentPage(1);
              setShowAll(false);
            }}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'closed'
                ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Closed Jobs ({closedJobs.length})
            </div>
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[--color-text-primary] mb-2">
            Latest Jobs
          </h2>
          <p className="text-[--color-text-secondary] text-lg">
            {searchQuery || categoryFilter ? 'Search Results' : activeTab === 'active' ? 'Discover amazing opportunities' : 'Browse completed projects'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-20 bg-gradient-to-br from-[--color-bg-secondary] to-[--color-bg-tertiary] rounded-2xl border-2 border-dashed border-[--color-border]"
        >
          <div className="max-w-md mx-auto px-4">
            <div className="mb-6">
              <Briefcase className="w-20 h-20 mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
            </div>
            <h3 className="text-2xl font-bold text-[--color-text-primary] mb-3">
              {searchQuery || categoryFilter
                ? 'No Jobs Match Your Search'
                : activeTab === 'active'
                  ? 'No Active Jobs Right Now'
                  : 'No Closed Jobs Available'}
            </h3>
            <p className="text-[--color-text-secondary] mb-6 leading-relaxed">
              {searchQuery || categoryFilter
                ? 'Try adjusting your search terms or browse all available jobs to find your perfect match.'
                : activeTab === 'active'
                  ? 'New opportunities are posted regularly. Check back soon or create a job alert to get notified!'
                  : 'There are no completed or closed jobs at the moment. Check the active jobs tab for current opportunities.'}
            </p>
            {(searchQuery || categoryFilter) && (
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                size="lg"
              >
                Clear Filters & View All Jobs
              </Button>
            )}
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section>
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 mb-6">
        <button
          onClick={() => {
            setActiveTab('active');
            setCurrentPage(1);
            setShowAll(false);
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'active'
              ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Active Jobs ({jobs.length})
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('closed');
            setCurrentPage(1);
            setShowAll(false);
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'closed'
              ? 'text-[--color-primary] border-b-2 border-[--color-primary]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Closed Jobs ({closedJobs.length})
          </div>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-4xl font-bold text-[--color-text-primary] mb-2">
              Latest Jobs
            </h2>
            <p className="text-[--color-text-secondary] text-lg">
              {searchQuery || categoryFilter
                ? `Found ${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} matching your search`
                : activeTab === 'active'
                  ? `${filteredJobs.length} amazing opportunities waiting for you`
                  : `${filteredJobs.length} completed projects`}
            </p>
          </div>
          {!showAll && filteredJobs.length > 3 && (
            <Button variant="link" onClick={handleViewAll}>
              View all jobs ({filteredJobs.length}) <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Show active filters */}
      {(searchQuery || categoryFilter) && (
        <div className="mb-4 flex gap-2 items-center flex-wrap">
          <span className="text-sm text-[--color-text-secondary]">Active filters:</span>
          {searchQuery && (
            <span className="px-3 py-1 bg-[--color-primary]/10 text-[--color-primary] rounded-full text-sm">
              Search: "{searchQuery}"
            </span>
          )}
          {categoryFilter && (
            <span className="px-3 py-1 bg-[--color-primary]/10 text-[--color-primary] rounded-full text-sm">
              Category: {categoryFilter}
            </span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <JobCard job={job} navigate={navigate} currentUser={currentUser} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {showAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {showAll && (
        <div className="text-center mt-4">
          <p className="text-sm text-[--color-text-secondary]">
            Showing {startIndex + 1} to {Math.min(endIndex, jobs.length)} of {jobs.length} jobs
          </p>
        </div>
      )}
    </section>
  );
};

export default LatestJobs;