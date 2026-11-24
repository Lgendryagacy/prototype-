import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const data = [
    {
        place: 'FREELANCE HUB',
        title: ['Global Talent', 'At Your Fingertips'],
        description: 'Hire expert freelancers for any digital project. From web development to graphic design, find the perfect professional to bring your vision to life.',
        imageUrl: 'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?w=1600&q=80',
        link: '/find-work',
        showPopup: false,
    },
    {
        place: 'TASKER HUB',
        title: ['Local Tasks,', 'Done Right'],
        description: 'Need a handyman, a cleaner, or someone to run errands? Post any task and get instant offers from trusted local Taskers in your community.',
        imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1600&q=80',
        link: '/tasker-hub',
        showPopup: true,
        icon: '/images/icons/tasker.png',
    },
    {
        place: 'FOG SERVICES',
        title: ['Premium Services,', 'Verified Quality'],
        description: 'Browse and buy fixed-price services from our network of verified, top-tier brands. No negotiations, just guaranteed results with escrow protection.',
        imageUrl: 'https://images.unsplash.com/photo-1639539420800-41be0c3a6d03?w=1600&q=80',
        link: '/fog-services',
        showPopup: false,
    },
    {
        place: 'FOG COINS',
        title: ['Work & Earn,', 'In FOG Coins'],
        description: 'Our native FOG Coins for zero-fee transactions, rewards, and exclusive access. HODL your coins to earn passive income.',
        imageUrl: 'https://images.unsplash.com/photo-1669951584605-4deba095a87f?w=1600&q=80',
        link: '/fog-coins',
        showPopup: false,
    },
    {
        place: 'AI-POWERED',
        title: ['Work Smarter,', 'Not Harder'],
        description: 'Leverage our built-in AI tools for everything from generating proposals to creating content. Boost your productivity and creativity on a single platform.',
        imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=1600&q=80',
        link: '/ai-powered',
        showPopup: true,
        icon: '/images/icons/aitool.png',
    },
];

const popupData = {
    "TASKER HUB": {
        title: "Tasker Hub",
        description: "A micro-task marketplace to earn or hire for small, quick, local or online tasks. Perfect for quick gigs like data entry, surveys, testing, deliveries, and more. Earn extra income by completing tasks on your schedule, or find reliable help for those small jobs that need to get done. Fast payments, easy coordination, and a rating system ensure quality on both sides.",
        icon: "/images/icons/tasker.png",
    },
    "AI-POWERED": {
        title: "Built-in AI Tools",
        description: "Generate content and automate workflows with built-in AI tools. Leverage powerful artificial intelligence for copywriting, image generation, data analysis, code assistance, and more. Affordable pricing and seamless integration mean you can boost productivity without switching platforms. Create marketing content, automate repetitive tasks, and unlock new possibilities with cutting-edge AI.",
        icon: "/images/icons/aitool.png",
    },
};

const DURATION = 6000;

const TimedCardsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activePopup, setActivePopup] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const startTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            setActiveIndex(prev => (prev + 1) % data.length);
        }, DURATION);
    }, []);
 
    const resetTimer = useCallback(() => {
        startTimer();
    }, [startTimer]);

    useEffect(() => {
        data.forEach(item => { (new Image()).src = item.imageUrl; });
        startTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTimer]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActivePopup(null);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const handleDetailCardClick = (index: number) => {
        setActiveIndex(index);
        resetTimer();
    };

    const handleExploreClick = () => {
        const activeItem = data[activeIndex];
        if (activeItem.showPopup) {
            setActivePopup(activeItem.place);
        } else {
            // Save marker to return to this section
            sessionStorage.setItem('return-to-timedcards', 'true');
            window.location.href = activeItem.link;
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) setActivePopup(null);
    };

    const activeItem = data[activeIndex];

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1 + 0.5, duration: 0.6, ease: 'easeOut' },
        }),
    };

    return (
        <>
            <div id="timed-cards-section" className="timed-cards-container relative">
                <AnimatePresence>
                    <motion.div
                        key={activeIndex}
                        className="timed-card"
                        style={{ backgroundImage: `url(${activeItem.imageUrl})` }}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                </AnimatePresence>

                <div className="timed-card-content">
                    <motion.p custom={0} variants={contentVariants} initial="hidden" animate="visible" key={`${activeIndex}-place`} className="content-place">
                        {activeItem.place}
                    </motion.p>
                    <h1 className="content-title">
                        {activeItem.title.map((line, index) => (
                            <motion.div key={index} custom={index + 1} variants={contentVariants} initial="hidden" animate="visible" >
                                {line}
                            </motion.div>
                        ))}
                    </h1>
                    <motion.p custom={activeItem.title.length + 1} variants={contentVariants} initial="hidden" animate="visible" key={`${activeIndex}-desc`} className="content-description">
                        {activeItem.description}
                    </motion.p>
                    <motion.button 
                        custom={activeItem.title.length + 2} 
                        variants={contentVariants} 
                        initial="hidden" 
                        animate="visible" 
                        key={`${activeIndex}-button`} 
                        className="content-button"
                        onClick={handleExploreClick}
                    >
                        {activeItem.showPopup ? 'Coming Soon' : 'Explore Now'}
                    </motion.button>
                </div>

                <div className="details-wrapper">
                    <div className="details-container">
                        {data.map((item, index) => (
                            <motion.div
                                key={item.title.join(' ')}
                                className={`detail-card ${index === activeIndex ? 'active' : ''}`}
                                style={{ backgroundImage: `url(${item.imageUrl})` }}
                                onClick={() => handleDetailCardClick(index)}
                                layout
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="detail-card-content">
                                    <h4 className="detail-card-title">{item.title.join(' ')}</h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="progress-container">
                        <div className="details-counter">{String(activeIndex + 1).padStart(2, '0')}</div>
                        <div className="progress-bar-background">
                            <motion.div
                                key={activeIndex}
                                className="progress-bar"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: DURATION / 1000, ease: 'linear' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup */}
            <AnimatePresence>
                {activePopup && popupData[activePopup] && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        ref={overlayRef}
                        onMouseDown={handleOverlayClick}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" />
                            <div
                                className="absolute inset-0 opacity-7"
                                style={{
                                    backgroundImage: 'url(/images/backdrop-pattern.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    mixBlendMode: 'overlay'
                                }}
                            />
                        </div>

                        <motion.div
                            className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 10, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            {/* Glass effect background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-transparent backdrop-blur-xl" />
                            <div className="absolute inset-0 bg-[--color-bg-secondary]/98" />
                            <div className="absolute inset-0 rounded-2xl border-2 border-[--color-primary]/40"
                                style={{
                                    boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)'
                                }}
                            />

                            {/* Content */}
                            <div className="relative p-6 md:p-8">
                                {/* Close button */}
                                <button
                                    onClick={() => setActivePopup(null)}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[--color-popup-text] hover:text-[--color-primary] hover:bg-[--color-primary]/10 transition-all duration-200 z-10"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[--color-primary]/20 blur-xl rounded-full" />
                                        <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[--color-primary]/20 to-[--color-accent]/20 rounded-3xl p-4 border-2 border-[--color-primary]/30 shadow-2xl">
                                            <img src={popupData[activePopup].icon} className="w-full h-full object-contain" alt="" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl md:text-3xl font-bold text-[--color-popup-text] mb-4 text-center drop-shadow-sm">
                                    {popupData[activePopup].title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm md:text-base text-[--color-popup-text] opacity-90 leading-relaxed text-center mb-6 mx-auto">
                                    {popupData[activePopup].description}
                                </p>

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-4 border-t border-[--color-primary]/20">
                                    <button
                                        onClick={() => setActivePopup(null)}
                                        className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        Notify Me When Live
                                    </button>
                                    <button
                                        onClick={() => setActivePopup(null)}
                                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-[--color-primary]/10 text-[--color-popup-text] border border-[--color-primary]/30 hover:bg-[--color-primary]/20 transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TimedCardsSection;