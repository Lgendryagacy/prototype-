import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Star, Sparkles, Timer, Zap, Facebook, Instagram, Youtube } from 'lucide-react';
import { XIcon, PinterestIcon, WhatsAppIcon } from '../components/icons';
import { getLaunchDate } from '../utils/launchUtils';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/fogsly' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/fogsly0/' },
  { name: 'X', icon: XIcon, href: 'https://x.com/fogsly0' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@fogsly?si=qJAtvorjuE8YF2pb' },
  { name: 'Pinterest', icon: PinterestIcon, href: 'https://www.pinterest.com/fogsly/_profile/' },
  { name: 'WhatsApp', icon: WhatsAppIcon, href: 'https://whatsapp.com/channel/0029VbB6aExCRs1pLp10wU1m' },
];

const CountdownPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLaunched, setIsLaunched] = useState(false);

  // Use the centralized launch date function
  const targetDate = getLaunchDate();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setIsLaunched(true);
        clearInterval(timer);
        // Redirect to home page when countdown ends
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isLaunched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <Sparkles className="w-24 h-24 mx-auto text-yellow-300" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🎉 FOGSLY IS NOW LIVE! 🎉
          </h1>
          <p className="text-xl md:text-2xl mb-4">
            Welcome to the future of freelancing!
          </p>
          <p className="text-lg opacity-90">
            Redirecting you to the platform...
          </p>
        </motion.div>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days, icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Hours', value: timeLeft.hours, icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { label: 'Minutes', value: timeLeft.minutes, icon: Timer, color: 'from-green-500 to-emerald-500' },
    { label: 'Seconds', value: timeLeft.seconds, icon: Zap, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-bg-primary] via-[--color-bg-secondary] to-[--color-bg-tertiary] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[--color-primary] rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl mx-auto text-center relative z-10">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-gradient-to-r from-[--color-primary] via-[--color-accent] to-[--color-primary] bg-clip-text mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ backgroundSize: '200% 200%' }}
          >
            FOGSLY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-[--color-text-secondary] font-medium"
          >
            The Future of Freelancing is Coming
          </motion.p>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-4">
            🚀 Launch Countdown 🚀
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[--color-text-secondary] max-w-3xl mx-auto leading-relaxed">
            We're putting the finishing touches on something amazing! FOGSLY will be live at{' '}
            <span className="text-[--color-primary] font-bold">10:00 AM tomorrow</span>.
            Get ready for a revolutionary freelancing experience!
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {timeBlocks.map((block, index) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 1.4 + index * 0.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className={`bg-gradient-to-br ${block.color} p-1 rounded-2xl shadow-xl`}>
                  <div className="bg-[--color-card] rounded-xl p-4 sm:p-6 md:p-8 h-full">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                      className="mb-3"
                    >
                      <block.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-[--color-primary]" />
                    </motion.div>
                    
                    <motion.div
                      key={block.value}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[--color-text-primary] mb-2"
                    >
                      {block.value.toString().padStart(2, '0')}
                    </motion.div>
                    
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-[--color-text-secondary] uppercase tracking-wider">
                      {block.label}
                    </div>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${block.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mb-12"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[--color-text-primary] mb-8">
            What's Coming Soon
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Star, title: 'FOG Coins', desc: 'Earn and spend digital currency' },
              { icon: Zap, title: 'Smart Matching', desc: 'AI-powered project matching' },
              { icon: Sparkles, title: 'Premium Features', desc: 'Advanced tools for pros' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="bg-[--color-card] border border-[--color-border] rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  <feature.icon className="w-12 h-12 text-[--color-primary] mx-auto mb-4" />
                </motion.div>
                <h4 className="text-lg font-bold text-[--color-text-primary] mb-2">
                  {feature.title}
                </h4>
                <p className="text-[--color-text-secondary]">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social/Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="text-center"
        >
          <p className="text-[--color-text-secondary] mb-6">
            Follow us for updates and be the first to know when we launch!
          </p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            {socialLinks.map(({ name, icon: Icon, href }) => (
              <motion.a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`FOGSLY on ${name}`}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <motion.div
                  className="p-3 rounded-full bg-[--color-card] border border-[--color-border] shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ 
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 20px rgba(var(--color-primary-rgb), 0.3)'
                  }}
                >
                  <Icon className="w-6 h-6 text-[--color-text-secondary] group-hover:text-[--color-primary] transition-colors duration-300" />
                </motion.div>
                
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileHover={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-[--color-bg-secondary] text-[--color-text-primary] px-3 py-1 rounded-lg text-sm font-medium shadow-lg border border-[--color-border] whitespace-nowrap"
                >
                  {name}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[--color-bg-secondary] border-l border-t border-[--color-border] rotate-45"></div>
                </motion.div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="mt-16 pt-8 border-t border-[--color-border]"
        >
          <p className="text-sm text-[--color-text-secondary]">
            © 2025 FOGSLY. Something amazing is coming your way.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CountdownPage;
