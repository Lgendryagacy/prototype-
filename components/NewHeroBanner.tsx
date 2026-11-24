import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';

// Import Fogsly icons
import IconFogCoin from './icons/IconFogCoin';
import IconMarketplace from './icons/IconMarketplace';
import IconRewards from './icons/IconRewards';
import IconGlobe from './icons/IconGlobe';
import IconAiBot from './icons/IconAiBot';
import IconSecureLock from './icons/IconSecureLock';

interface NewHeroBannerProps {
    navigate: (route: Route) => void;
}

const NewHeroBanner: React.FC<NewHeroBannerProps> = ({ navigate }) => {
    // Floating animation variants for icons
    const floatVariants = {
        initial: { y: 0 },
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const rotateVariants = {
        initial: { rotate: 0 },
        animate: {
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // User avatars placeholder data
    const userCount = "60 Million";

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[--color-bg-secondary] via-[--color-bg-primary] to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 py-8 sm:py-9 md:py-7 lg:py-10">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-[--color-primary]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-[--color-accent]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">

                    {/* Left Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4 sm:space-y-5 md:space-y-5 text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block"
                        >
                            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[--color-primary] text-xs sm:text-sm font-medium border border-blue-200 dark:border-blue-800">
                                Best IT Solution Provider
                            </span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[--color-text-primary] leading-tight"
                        >
                            Freelance & Services
                            <br />
                            <span className="text-[--color-text-primary]">For Your Business</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm sm:text-base md:text-lg text-[--color-text-secondary] max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Professionally optimize interdependent intellectual introperable
                            connect best practice. Progressivley fabricate done.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center lg:justify-start gap-4"
                        >
                            <Button
                                onClick={() => navigate('fog-services')}
                                className="group bg-[--color-primary] hover:bg-[--color-primary]/90 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            >
                                Get in Touch
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>

                        {/* Rating */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3"
                        >
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>
                            <span className="text-[--color-text-primary] font-semibold text-sm sm:text-base">
                                4.8/5 Rating
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Right Section - Phone Mockups with Floating Icons */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative flex justify-center items-center min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[600px] mt-8 lg:mt-0"
                    >
                        {/* Large Blue Circle Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-full shadow-2xl"></div>

                        {/* Decorative Small Circles */}
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            className="absolute top-8 sm:top-12 left-4 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full opacity-60 blur-sm"
                        ></motion.div>
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-16 sm:bottom-20 left-8 sm:left-12 w-10 h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-full opacity-50 blur-sm"
                        ></motion.div>

                        {/* Phone Mockup 1 - Left Phone */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: -5 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute left-4 sm:left-8 md:left-12 top-12 sm:top-16 md:top-20 w-36 sm:w-48 md:w-56 h-72 sm:h-96 md:h-[450px] bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-1.5 sm:p-2 z-20"
                        >
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
                                {/* Phone Screen Content - Dashboard */}
                                <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] sm:text-xs font-semibold text-[--color-text-primary]">Dashboard</div>
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-[--color-primary] rounded-full"></div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
                                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total Earnings</div>
                                        <div className="text-sm sm:text-lg font-bold text-[--color-primary]">$12,850</div>
                                    </div>

                                    {/* Progress Bars */}
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg flex items-center justify-center">
                                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[--color-primary] rounded"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div className="h-full w-3/4 bg-[--color-primary]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/30 rounded-md sm:rounded-lg flex items-center justify-center">
                                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div className="h-full w-1/2 bg-red-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-md sm:rounded-lg flex items-center justify-center">
                                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div className="h-full w-2/3 bg-green-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-4 sm:h-6 bg-black rounded-b-xl sm:rounded-b-2xl"></div>
                        </motion.div>

                        {/* Phone Mockup 2 - Right Phone (Main) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="absolute right-2 sm:right-4 md:right-8 top-6 sm:top-8 md:top-12 w-40 sm:w-52 md:w-64 h-80 sm:h-[420px] md:h-[500px] bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-1.5 sm:p-2 z-30"
                        >
                            <div className="w-full h-full bg-gradient-to-br from-white to-blue-50 dark:from-slate-700 dark:to-slate-800 rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
                                {/* Phone Screen Content - Analytics Chart */}
                                <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] sm:text-xs font-semibold text-[--color-text-primary]">Analytics</div>
                                        <div className="flex gap-0.5 sm:gap-1">
                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full"></div>
                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full"></div>
                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm h-32 sm:h-40 md:h-48">
                                        {/* Simple Line Chart Representation */}
                                        <svg className="w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M 0 120 L 40 80 L 80 90 L 120 40 L 160 60 L 200 20 L 200 150 L 0 150 Z"
                                                fill="url(#chartGradient)"
                                            />
                                            <path
                                                d="M 0 120 L 40 80 L 80 90 L 120 40 L 160 60 L 200 20"
                                                stroke="var(--color-primary)"
                                                strokeWidth="3"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>

                                    {/* Time Buttons */}
                                    <div className="flex gap-1 sm:gap-2">
                                        <button className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-[--color-primary] text-white rounded-md sm:rounded-lg">1D</button>
                                        <button className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md sm:rounded-lg">1W</button>
                                        <button className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md sm:rounded-lg">1M</button>
                                        <button className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md sm:rounded-lg">1Y</button>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-5 sm:h-7 bg-black rounded-b-xl sm:rounded-b-2xl"></div>
                        </motion.div>

                        {/* Floating Icons Around Phones */}

                        {/* FogCoin Icon - Top Left */}
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            className="absolute top-4 sm:top-8 left-0 sm:left-0 md:left-4 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconFogCoin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[--color-primary]" />
                        </motion.div>

                        {/* Marketplace Icon - Top Right */}
                        <motion.div
                            variants={rotateVariants}
                            initial="initial"
                            animate="animate"
                            className="absolute top-2 sm:top-4 right-0 sm:right-0 md:right-4 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconMarketplace className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-500" />
                        </motion.div>

                        {/* Globe Icon - Middle Left */}
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.2 }}
                            className="absolute top-1/2 left-0 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconGlobe className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-500" />
                        </motion.div>

                        {/* AI Bot Icon - Bottom Left */}
                        <motion.div
                            variants={rotateVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-14 sm:bottom-20 md:bottom-24 left-2 sm:left-4 md:left-8 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconAiBot className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-500" />
                        </motion.div>

                        {/* Rewards Icon - Middle Right */}
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.4 }}
                            className="absolute top-1/2 right-0 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconRewards className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-500" />
                        </motion.div>

                        {/* Secure Lock Icon - Bottom Right */}
                        <motion.div
                            variants={rotateVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-12 sm:bottom-16 md:bottom-20 right-2 sm:right-4 md:right-8 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center z-40"
                        >
                            <IconSecureLock className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-500" />
                        </motion.div>

                        {/* User Count Badge - Bottom Center */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-full shadow-xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 z-40"
                        >
                            {/* Avatar Stack */}
                            <div className="flex -space-x-1.5 sm:-space-x-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                                    A
                                </div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                                    B
                                </div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                                    C
                                </div>
                            </div>

                            <div className="text-xs sm:text-sm">
                                <div className="font-bold text-[--color-text-primary]">{userCount} Users</div>
                                <div className="text-[10px] sm:text-xs text-[--color-text-secondary]">Use This Platform</div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default NewHeroBanner;
