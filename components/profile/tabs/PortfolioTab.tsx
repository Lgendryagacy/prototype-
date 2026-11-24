import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { getAllApprovedFreelancersByUserId } from '../../../firebase/services/approvedFreelancers';
import { staticPortfolio, Tab } from '../types';

interface PortfolioTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  onTabChange: (tab: Tab) => void;
}

interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  gigTitle?: string;
}

const ITEMS_PER_SLIDE = 2;
const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

const PortfolioTab = React.memo(({ userProfile, currentUser, onTabChange }: PortfolioTabProps) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchPortfolioFromGigs();
    } else {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || portfolioItems.length === 0) {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
      return;
    }

    autoScrollRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isPaused, portfolioItems.length]);

  const fetchPortfolioFromGigs = async () => {
    try {
      setLoading(true);
      const gigs = await getAllApprovedFreelancersByUserId(userProfile!.uid);
      
      // Collect all portfolio items from all gigs
      const allItems: PortfolioItem[] = [];
      gigs.forEach(gig => {
        if (gig.portfolioItems && gig.portfolioItems.length > 0) {
          gig.portfolioItems.forEach(item => {
            allItems.push({
              ...item,
              gigTitle: gig.title
            });
          });
        }
      });

      // Sort by most recent (assuming IDs are chronological) and take first 6
      const recentItems = allItems.slice(0, 6);
      setPortfolioItems(recentItems);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSlides = Math.ceil(portfolioItems.length / ITEMS_PER_SLIDE);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const getCurrentItems = () => {
    const startIdx = currentSlide * ITEMS_PER_SLIDE;
    return portfolioItems.slice(startIdx, startIdx + ITEMS_PER_SLIDE);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-[--color-text-secondary] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-[--color-text-primary] mb-2">
          No Portfolio Items
        </h3>
        <p className="text-[--color-text-secondary] mb-4">
          {currentUser?.uid === userProfile?.uid 
            ? 'Add portfolio items to your gigs to showcase your work.'
            : 'This user hasn\'t added any portfolio items yet.'}
        </p>
        {currentUser?.uid === userProfile?.uid && (
          <Button 
            variant="outline" 
            onClick={() => onTabChange('active-gigs')}
          >
            Manage Gigs
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carousel Container */}
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              {getCurrentItems().map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all">
                  <div className="aspect-video overflow-hidden bg-[--color-bg-tertiary] relative">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {item.gigTitle && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.gigTitle}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-[--color-text-primary] mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[--color-text-secondary] mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    {item.link && (
                      <a 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[--color-primary] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Project
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 lg:-translate-x-12 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[--color-bg-primary] border border-[--color-border] shadow-lg flex items-center justify-center hover:bg-[--color-primary] hover:text-white transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 lg:translate-x-12 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[--color-bg-primary] border border-[--color-border] shadow-lg flex items-center justify-center hover:bg-[--color-primary] hover:text-white transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide 
                  ? 'bg-[--color-primary] w-8' 
                  : 'bg-[--color-border] hover:bg-[--color-text-secondary]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-center text-sm text-[--color-text-secondary]">
        Showing {portfolioItems.length} recent portfolio {portfolioItems.length === 1 ? 'item' : 'items'}
        {isPaused && totalSlides > 1 && ' • Paused'}
      </p>
    </div>
  );
});

PortfolioTab.displayName = 'PortfolioTab';

export default PortfolioTab;
