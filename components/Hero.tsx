import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, PlayCircle, Youtube, Gift } from "lucide-react";
import { Button } from "./ui/Button";
import { type Route } from "../types";
import { getFogCoinSettings } from "../firebase/services/fogCoinSettingsService";
import { Link } from "react-router-dom";
import { YouTubeIcon } from "./icons";

const Hero = ({ navigate }: { navigate: (route: Route) => void }) => {
  const [fogPriceInPKR, setFogPriceInPKR] = useState<number>(28); // Default value
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [isFullHDResolution, setIsFullHDResolution] = useState<boolean>(false);
  const [isHDResolution, setIsHDResolution] = useState<boolean>(false);

  // Fetch FOG coin price and convert to PKR
  const fetchFogCoinPrice = async () => {
    try {
      const settings = await getFogCoinSettings();
      if (settings && settings.fogToPkrRate) {
        // Use the pre-calculated FOG to PKR rate from settings
        setFogPriceInPKR(Math.round(settings.fogToPkrRate)); // Round to nearest whole number
      }
    } catch (error) {
      console.error('Error fetching FOG coin price:', error);
      // Keep default value on error
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Detect if screen is 1920×1080 or 1366×768 resolution
  useEffect(() => {
    const checkResolution = () => {
      const width = window.screen.width;
      const height = window.screen.height;
      const isFullHD = width === 1920 && height === 1080;
      const isHD = width === 1366 && height === 768;
      setIsFullHDResolution(isFullHD);
      setIsHDResolution(isHD);
    };

    checkResolution();
    window.addEventListener('resize', checkResolution);

    return () => window.removeEventListener('resize', checkResolution);
  }, []);

  // Fetch price on mount and set up 30-second refresh
  useEffect(() => {
    fetchFogCoinPrice();

    // Refresh every 30 seconds to match FogCoinsPage
    const intervalId = setInterval(() => {
      fetchFogCoinPrice();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className={`relative overflow-hidden home-hero items-center ${isFullHDResolution ? 'pt-2 pb-0' : isHDResolution ? 'pt-6 pb-0' : 'pt-4 pb-16'}`}>
      {/* Enhanced Background Gradient with Fade */}
      <div className="absolute inset-0 bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[--color-accent]/3 via-transparent to-[--color-primary]/3"></div>

      {/* Bottom Fade to blend with next section - removed for Full HD and HD */}
      {!isFullHDResolution && !isHDResolution && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[--color-bg]"></div>
      )}
      
      {/* Radial Glow Effects */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', opacity: 0.15 }}>
      </div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', opacity: 0.18 }}>
      </div>

      <div className={`relative z-10 container mx-auto px-5 md:px-0 lg:px-10 max-w-7xl ${isHDResolution ? 'py-0' : ''}`}>
        <div className={`grid grid-cols-1 lg:grid-cols-2 items-center ${isFullHDResolution ? 'gap-6' : isHDResolution ? 'gap-1' : 'gap-10'}`}>

          {/* LEFT CONTENT */}
          <div className={`text-center lg:text-left ${isFullHDResolution ? 'space-y-3' : isHDResolution ? 'space-y-0.5' : 'space-y-4'}`}>

            <button className="cursor-default">
              <span
                className={`
                  inline-block
                  rounded-full
                  font-semibold
                  border
                  bg-[--color-badge-herobg]
                  text-[--color-badge-text]
                  border-[--color-badge-border]
                  transition-colors
                  duration-300
                  italic
                  font-bold
                  mb-0
                  ${isHDResolution ? 'px-3 py-2 text-xs' : 'px-5 py-3 text-sm'}
                `}
              >
                {isLoadingPrice ? 'Loading...' : `1 Fog Coin = ${fogPriceInPKR} PKR`}
              </span>
            </button>


            {/* Main Heading */}
            <motion.h1
              className={`font-bold leading-tight text-[--color-text-hero] italic mt-0 ${isHDResolution ? 'text-[28px] sm:text-4xl md:text-5xl' : 'text-[37px] sm:text-6xl md:text-7xl'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className=" text-[--color-text-hero-title]  italic">
                Freelance. <br />
              </span>{" "}
              On-Demand.
              <div>Global Services.</div>
            </motion.h1>

            {/* Sub Heading */}
            <motion.h2
              className={`font-kalam text-[--color-text-hero-subtitle] sm:mt-0 ${isHDResolution ? 'text-xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-5xl md:text-6xl'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            >
              Loyalty & Yield.
            </motion.h2>

            {/* Paragraph */}
            <motion.p
              className={`text-[--color-text-hero-desc] md:max-w-xl mx-auto lg:mx-0 ${isHDResolution ? 'text-xs sm:text-sm' : 'text-base text-lg sm:text-xl'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              FOGSLY is the premier platform for professionals. Hire expert
              freelancers for digital projects or find reliable taskers for
              local, physical jobs. No distractions, just results.
            </motion.p>

            {/* Buttons */}
            <motion.div
              className={`flex flex-col sm:flex-row justify-center lg:justify-start ${isHDResolution ? 'gap-2 pt-1' : 'gap-4 pt-2'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Find out More Button with Right-to-Left Glass Shimmer */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => navigate("about")}
                  className={`relative overflow-hidden rounded-[34px] font-semibold shadow-lg group inline-flex items-center justify-center border transition-all duration-300 bg-[--color-badge-herobg] text-[--color-badge-text] border-[--color-badge-border] backdrop-blur-sm ${isHDResolution ? 'h-9 px-3 text-xs' : 'h-12 px-6'}`}
                >
                  {/* Glass gradient overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                  {/* Right-to-Left Shimmer effect with glass appearance */}
                  <span className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 75%, transparent 100%)', width: '200%' }}></span>

                  <span className="relative z-10 flex items-center">
                    Find out More
                  </span>
                </button>
              </motion.div>

              {/* Giveaways Button with Right-to-Left Glass Shimmer */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => navigate("giveaways")}
                  className={`relative overflow-hidden rounded-[34px] font-semibold shadow-lg group inline-flex items-center justify-center border transition-all duration-300 bg-[--color-badge-herobg] text-[--color-badge-text] border-[--color-badge-border] backdrop-blur-sm ${isHDResolution ? 'h-9 px-3 text-xs' : 'h-12 px-6'}`}
                >
                  {/* Sparkle elements - using theme color */}
                  <span className="absolute top-1 left-4 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '0s' }}></span>
                  <span className="absolute top-3 right-6 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '0.3s' }}></span>
                  <span className="absolute bottom-2 left-8 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0.6s' }}></span>
                  <span className="absolute bottom-3 right-4 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0.9s' }}></span>

                  {/* Glass gradient overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                  {/* Right-to-Left Shimmer effect with glass appearance */}
                  <span className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 75%, transparent 100%)', width: '200%' }}></span>

                  <span className="relative z-10 flex items-center">
                    <Gift className="mr-2 w-5 h-5" />
                    Giveaways
                  </span>
                </button>
              </motion.div>

              {/* Learn About Fogsly Button with Right-to-Left Glass Shimmer */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  className={`relative overflow-hidden rounded-[34px] font-semibold shadow-lg group inline-flex items-center justify-center border transition-all duration-300 bg-[--color-badge-herobg] text-[--color-badge-text] border-[--color-badge-border] backdrop-blur-sm ${isHDResolution ? 'h-9 px-3 text-xs' : 'h-12 px-6'}`}
                >
                  {/* Glass gradient overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                  {/* Right-to-Left Shimmer effect with glass appearance */}
                  <span className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 75%, transparent 100%)', width: '200%' }}></span>

                  <a href="https://www.youtube.com/@Fogsly-Marketplace" target="_blank" className="relative z-10 flex items-center" style={{ fill: "#FF0000" }}>
                    <YouTubeIcon className="mr-2 w-6 h-6" style={{ color: "#FF0000" }} />
                    Learn About Fogsly
                  </a>
                </button>
              </motion.div>

              {/* <Button
                size="lg"
                variant="ghost"
                className="group text-[--color-text-hero] hover:text-[--color-primary]"
              >
                <a href="https://www.youtube.com/@Fogsly" target="_blank">
                  Watch Demo
                </a>
                <Play className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button> */}
            </motion.div>
          </div>

          {/* RIGHT IMAGES SECTION */}
          <motion.div
            className={`relative justify-center items-center hidden sm:flex ${isFullHDResolution ? 'mt-0' : isHDResolution ? 'mt-0' : 'mt-3'}`}  // hide in mobile
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Enhanced Gradient Behind Images */}
            <div className="absolute inset-0 -z-10 rounded-full blur-3xl scale-125" 
                 style={{
                   background: 'radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 50%)',
                   opacity: 0.90
                 }}>
            </div>
            
            {/* MAIN BIG IMAGE */}
            <motion.img
              src="/images/hero-image.png"
              alt="Hero Globe"
              className={`${isHDResolution ? 'w-[180px] sm:w-[240px] md:w-[280px] lg:w-[260px] mt-0' : 'w-[200px] sm:w-[360px] md:w-[400px] lg:w-[380px] mt-2'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
            />

            {/* FLOATING SMALL IMAGE */}
            <motion.img
              src="/images/hero-objects.png"
              alt="Hero Icon"
              className={`absolute ${isHDResolution ? 'top-[-15px] sm:top-[-20px] md:top-[-18px] right-4 sm:right-6 md:right-8 lg:right-6 w-[150px] sm:w-[200px] md:w-[240px] lg:w-[350px]' : 'top-[0px] sm:top-[-40px] md:top-[-35px] right-5 sm:right-10 md:right-16 lg:right-14 w-[220px] sm:w-[280px] md:w-[320px] lg:w-[500px]'}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
            />
          </motion.div>




        </div>
      </div>
    </section>
  );
};

export default Hero;
