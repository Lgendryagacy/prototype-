import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, AlertTriangle, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { type Route } from '../types';
import { useScrollingNavigate } from '../utils/navigationUtils';

interface NotFoundPageProps {
  navigate: (route: Route) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  const navigateWithScroll = useScrollingNavigate(navigate);

  const popularPages = [
    { label: 'Home', route: 'home' as Route, icon: Home },
    { label: 'FOG Coins', route: 'fog-coins' as Route, icon: Search },
    { label: 'Watch Ads', route: 'watch-ads' as Route, icon: Compass },
    { label: 'Profile', route: 'profile' as Route, icon: Home },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-bg-primary] via-[--color-bg-secondary] to-[--color-bg-tertiary] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.h1
              className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-bold text-transparent bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text leading-none"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              404
            </motion.h1>
            
            {/* Floating warning icon */}
            <motion.div
              className="absolute top-4 right-4 sm:top-8 sm:right-8 md:top-12 md:right-12"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-orange-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[--color-text-secondary] max-w-2xl mx-auto leading-relaxed px-4">
            The page you're looking for seems to have wandered off into the digital fog. 
            Don't worry though - we'll help you find your way back to the amazing FOGSLY experience!
          </p>
        </motion.div>

        {/* Error Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto">
            {/* Animated circles */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[--color-primary] opacity-20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-[--color-accent] opacity-30"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-8 rounded-full bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Compass className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[--color-primary]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigateWithScroll('home')}
              className="w-full sm:w-auto flex items-center gap-2 px-6 py-3 text-base font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center gap-2 px-6 py-3 text-base font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
          </div>
        </motion.div>

        {/* Popular Pages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-[--color-text-primary] mb-6">
            Or explore these popular pages:
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {popularPages.map((page, index) => (
              <motion.button
                key={page.route}
                onClick={() => navigateWithScroll(page.route)}
                className="group p-4 sm:p-6 bg-[--color-card] hover:bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <page.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[--color-primary] mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm sm:text-base font-medium text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors duration-200">
                  {page.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-16 pt-8 border-t border-[--color-border]"
        >
          <p className="text-sm text-[--color-text-secondary]">
            Need help? Contact our{' '}
            <button
              onClick={() => navigateWithScroll('customer-service')}
              className="text-[--color-primary] hover:text-[--color-accent] font-medium underline decoration-dotted underline-offset-2 transition-colors duration-200"
            >
              support team
            </button>
            {' '}for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
