import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Star, DollarSign, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllApprovedFreelancersByUserId, ApprovedFreelancer } from '../../../firebase/services/approvedFreelancers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { type Route } from '../../../types';

interface ActiveGigsTabProps {
  userId: string;
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
}

const ITEMS_PER_PAGE = 6;

const ActiveGigsTab: React.FC<ActiveGigsTabProps> = ({ userId, navigate }) => {
  const [gigs, setGigs] = useState<ApprovedFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUserGigs();
  }, [userId]);

  const fetchUserGigs = async () => {
    try {
      setLoading(true);
      const userGigs = await getAllApprovedFreelancersByUserId(userId);
      setGigs(userGigs);
    } catch (error) {
      console.error('Error fetching user gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGig = (gig: ApprovedFreelancer) => {
    const slug = `${gig.title.toLowerCase().replace(/\s+/g, '-')}-${gig.id}`;
    navigate('gig-detail', { gigId: gig.id, slug }, { name: gig.title });
  };

  // Pagination
  const totalPages = Math.ceil(gigs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGigs = gigs.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-[--color-text-secondary] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-[--color-text-primary] mb-2">
          No Active Gigs
        </h3>
        <p className="text-[--color-text-secondary]">
          This user hasn't created any gigs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gigs Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {currentGigs.map((gig, index) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{gig.title}</CardTitle>
                    <Badge 
                      variant={gig.status === 'active' ? 'success' : 'secondary'}
                      className="ml-2 flex-shrink-0"
                    >
                      {gig.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Bio Preview */}
                  <p className="text-sm text-[--color-text-secondary] line-clamp-2">
                    {gig.bio}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {gig.categories.slice(0, 3).map((category, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {gig.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{gig.categories.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-[--color-border]">
                    <div className="flex items-center gap-1 text-[--color-text-secondary]">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">
                        {gig.averageRating ? gig.averageRating.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-xs">({gig.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[--color-text-secondary]">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs">{gig.totalJobs || 0} jobs</span>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-[--color-text-primary]">
                        ${gig.hourlyRate}/hr
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewGig(gig)}
                      className="group-hover:bg-[--color-primary] group-hover:text-white transition-colors"
                    >
                      View Gig
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-[--color-primary] text-white'
                    : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-[--color-text-secondary] pt-2">
        Showing {startIndex + 1}-{Math.min(endIndex, gigs.length)} of {gigs.length} gigs
      </div>
    </div>
  );
};

export default ActiveGigsTab;
