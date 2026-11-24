import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
    Copy, Users, DollarSign, Gift, ArrowLeft, Share2,
    Check, Twitter, Facebook, Linkedin, Send, Trophy, Zap,
    TrendingUp, ExternalLink, Layers
} from 'lucide-react';
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserReferrals, createReferralCodeForUser } from '../firebase/services/referralService';
import { getUserData } from '../firebase/services/userService';
import { ReferralStats } from '../firebase/types/referral';

// --- 3D Tilt Wrapper (Local Component) ---
const TiltCard = ({ children, className = "" }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 400, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 400, damping: 30 });

    function onMouseMove(event) {
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - left - width / 2);
        y.set(event.clientY - top - height / 2);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
    const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

    return (
        <motion.div
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative transition-all duration-300 ease-out ${className}`}
        >
            {children}
        </motion.div>
    );
};

const ReferralsPage = ({ navigate }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [referralCode, setReferralCode] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string>('');
    const [isTierModalOpen, setIsTierModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [isViewingAll, setIsViewingAll] = useState(false);

    useEffect(() => {
        if (user) {
            loadReferralData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadReferralData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Check if user has referral code
            const userDoc = await getUserData(user.uid);

            if (!userDoc) {
                setError('User data not found. Please try again.');
                setLoading(false);
                return;
            }

            let code = userDoc?.referralCode || '';

            // Generate referral code if user doesn't have one
            if (!code) {
                setGenerating(true);
                try {
                    code = await createReferralCodeForUser(
                        user.uid,
                        userDoc?.name || '',
                        user.email || ''
                    );
                } catch (codeError) {
                    console.error('Error generating referral code:', codeError);
                    setError('Failed to generate referral code. Please try again later.');
                }
                setGenerating(false);
            }

            setReferralCode(code);

            // Load referral stats
            const referralStats = await getUserReferrals(user.uid);
            setStats(referralStats);
        } catch (error) {
            console.error('Error loading referral data:', error);
            setError('Failed to load referral data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const referralLink = referralCode ? `${window.location.origin}/auth?ref=${referralCode}` : '';

    const handleCopy = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSocialShare = (platform) => {
        let url = "";

        switch (platform) {
            case 'twitter': {
                // Twitter supports text + URL
                const twitterText = `🚀 Join me on FOGSLY - The future of freelance work!\n\n✨ Earn FOG Coins\n💼 Find amazing opportunities\n🌟 Build your career\n\nSign up with my link and get exclusive benefits! 🎁`;
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText + '\n\n' + referralLink)}&hashtags=FOGSLY,Freelance,FOGCoin`;
                break;
            }
            case 'facebook': {
                // Facebook only shares URL (no pre-filled text due to their policy)
                // Users will need to add their own message
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                break;
            }
            case 'linkedin': {
                // LinkedIn share with URL only (they removed text support)
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
                break;
            }
            case 'whatsapp': {
                // WhatsApp supports full text + link
                const whatsappText = `🎉 Hey! I'm using FOGSLY - the future of freelance work!\n\n🚀 Amazing opportunities\n💰 Earn FOG Coins\n🌟 Exclusive benefits\n\nJoin me using this link and unlock special perks:`;
                url = `https://wa.me/?text=${encodeURIComponent(whatsappText + '\n\n' + referralLink)}`;
                break;
            }
        }

        if (url) {
            // Open in popup window for better UX
            window.open(url, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    // ADD THIS ENTIRE BLOCK
    const tierData = [
        {
            name: "Starter Tier",
            icon: "starter",
            color: "#94a3b8",
            bgGradient: "from-slate-400 to-slate-500",
            referrals: "0-9 Referrals",
            minReferrals: 0,
            maxReferrals: 9,
            commission: "0%",
            isCurrent: false
        },
        {
            name: "Bronze Tier",
            icon: "bronze",
            color: "#cd7f32",
            bgGradient: "from-[#cd7f32] to-[#8b5a2b]",
            referrals: "10-19 Referrals",
            minReferrals: 10,
            maxReferrals: 19,
            commission: "0.5%",
            isCurrent: false
        },
        {
            name: "Silver Tier",
            icon: "silver",
            color: "#C0C0C0",
            bgGradient: "from-[#E8E8E8] to-[#A0A0A0]",
            referrals: "20-49 Referrals",
            minReferrals: 20,
            maxReferrals: 49,
            commission: "1%",
            isCurrent: false
        },
        {
            name: "Gold Tier",
            icon: "gold",
            color: "#FFD700",
            bgGradient: "from-[#FFD700] to-[#FFA500]",
            referrals: "50-99 Referrals",
            minReferrals: 50,
            maxReferrals: 99,
            commission: "1.5%",
            isCurrent: false
        },
        {
            name: "Sapphire Tier",
            icon: "sapphire",
            color: "#0F52BA",
            bgGradient: "from-[#0F52BA] to-[#082c5c]",
            referrals: "100-199 Referrals",
            minReferrals: 100,
            maxReferrals: 199,
            commission: "2%",
            isCurrent: false
        },
        {
            name: "Ruby Tier",
            icon: "ruby",
            color: "#E0115F",
            bgGradient: "from-[#E0115F] to-[#990033]",
            referrals: "200-349 Referrals",
            minReferrals: 200,
            maxReferrals: 349,
            commission: "2.5%",
            isCurrent: false
        },
        {
            name: "Emerald Tier",
            icon: "emerald",
            color: "#50C878",
            bgGradient: "from-[#50C878] to-[#2d8659]",
            referrals: "350-499 Referrals",
            minReferrals: 350,
            maxReferrals: 499,
            commission: "3%",
            isCurrent: false
        },
        {
            name: "Diamond Tier",
            icon: "diamond",
            color: "#B9F2FF",
            bgGradient: "from-[#B9F2FF] to-[#00bfff]",
            referrals: "500-749 Referrals",
            minReferrals: 500,
            maxReferrals: 749,
            commission: "3.5%",
            isCurrent: false
        },
        {
            name: "Platinum Tier",
            icon: "platinum",
            color: "#E5E4E2",
            bgGradient: "from-white to-[#c0c0c0]",
            referrals: "750-999 Referrals",
            minReferrals: 750,
            maxReferrals: 999,
            commission: "4%",
            isCurrent: false
        },
        {
            name: "Black Diamond Tier",
            icon: "blackdiamond",
            color: "#1a1a1a",
            bgGradient: "from-[#2d2d2d] to-black",
            referrals: "1000-1499 Referrals",
            minReferrals: 1000,
            maxReferrals: 1499,
            commission: "4.5%",
            isCurrent: false
        },
        {
            name: "Legendary Tier",
            icon: "legendary",
            color: "#FFD700",
            bgGradient: "from-[#FFD700] via-[#FF6B6B] to-[#4ECDC4]",
            referrals: "1500+ Referrals",
            minReferrals: 1500,
            maxReferrals: Infinity,
            commission: "5%",
            isCurrent: false,
            isLegendary: true
        }
    ];


    // Calculate current tier based on referrals
    const getCurrentTier = (referralCount) => {
        for (let i = tierData.length - 1; i >= 0; i--) {
            if (referralCount >= tierData[i].minReferrals) {
                return { ...tierData[i], isCurrent: true };
            }
        }
        return { ...tierData[0], isCurrent: true };
    };

    // Get next tier info
    const getNextTier = (referralCount) => {
        for (let tier of tierData) {
            if (referralCount < tier.minReferrals) {
                return tier;
            }
        }
        return null; // Already at max tier
    };

    // Calculate progress to next tier
    const calculateTierProgress = (referralCount, currentTier, nextTier) => {
        if (!nextTier) return 100; // Max tier reached
        const tierRange = nextTier.minReferrals - currentTier.minReferrals;
        const currentProgress = referralCount - currentTier.minReferrals;
        return Math.min((currentProgress / tierRange) * 100, 100);
    };



    // Use dynamic tier data
    const currentTier = getCurrentTier(stats?.totalReferrals || 0);
    const nextTier = getNextTier(stats?.totalReferrals || 0);
    const tierProgress = calculateTierProgress(stats?.totalReferrals || 0, currentTier, nextTier);

    // Update tierData with current tier marker
    const updatedTierData = tierData.map(tier => ({
        ...tier,
        isCurrent: tier.name === currentTier.name
    }));

    // ADD THIS ENTIRE BLOCK
    const termsData = [
        {
            title: "1. Introduction",
            content: "Fogsly Marketplace is an online earning and service ecosystem where users can work, hire, sell digital services, open shops, complete tasks, and access earning tools. By registering or using Fogsly, you agree to comply with all terms, policies, and rules defined in this document."
        },
        {
            title: "2. Eligibility",
            content: "Users must be at least 18 years old or have legal guardian consent. You must provide accurate information, maintain only one account, and agree that Fogsly reserves the right to verify identities or suspend accounts that violate platform rules."
        },
        {
            title: "3. User Responsibilities",
            content: "Users must use Fogsly ethically, avoid fraud, spam, duplicate accounts, misuse of services, and illegal activities. Every user is responsible for maintaining account security, passwords, device access, and avoiding unauthorized logins."
        },
        {
            title: "4. Marketplace Rules",
            content: "Freelancers, taskers, and sellers must deliver genuine work, avoid copied or AI-generated work without disclosure, maintain professional conduct, and complete orders on time. Buyers must pay for orders, avoid false disputes, and follow fair usage."
        },
        {
            title: "5. Commission & Earnings",
            content: "Fogsly charges platform commissions, service fees, and transaction charges where applicable. Earnings will follow Fogsly's updated withdrawal policies. Referral commissions are percentage-based and capped according to the official Fogsly Referral Program."
        },
        {
            title: "6. Withdrawal Policy",
            content: "Minimum withdrawal limits, processing time, verification documents, and supported payment methods are subject to change. Users must avoid chargebacks, illegal withdrawals, or suspicious financial behavior that may result in account review."
        },
        {
            title: "7. Referral Program Terms",
            content: "Referral earnings depend on active users joining via your link and completing paid activities. Fraud, fake accounts, self-referrals, or incentivized sign-up abuse will result in referral earnings being removed and possible account warnings or bans."
        },
        {
            title: "8. Tasker & On-site Job Rules",
            content: "On-site job workers and taskers must follow job descriptions, arrive on time, maintain professionalism, and complete work as agreed. Failure to show up or complete tasks may result in negative reviews, payment holds, or account restrictions."
        }
    ];

    // const currentTierProgress = 65; // %


    // ADD THIS ENTIRE FUNCTION
    const TierIcon = ({ tier }) => {
        const iconClass = `w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.bgGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`;

        if (tier.icon === "starter") {
            return (
                <div className={iconClass} style={{ boxShadow: `0 8px 20px ${tier.color}66` }}>
                    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.3" />
                        <path d="M50 20 L60 40 L80 40 L65 55 L72 75 L50 62 L28 75 L35 55 L20 40 L40 40 Z" fill="white" opacity="0.8" />
                    </svg>
                </div>
            );
        }

        if (tier.icon === "legendary") {
            return (
                <div className={`${iconClass} animate-pulse`} style={{
                    boxShadow: `0 10px 30px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 107, 107, 0.4), 0 0 50px rgba(78, 205, 196, 0.3)`,
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                        <path d="M50 10 L55 22 L68 24 L59 33 L61 46 L50 40 L39 46 L41 33 L32 24 L45 22 Z" fill="#FFD700" />
                        <circle cx="50" cy="32" r="8" fill="#4ECDC4" opacity="0.8" />
                        <path d="M42 55 L50 48 L58 55 L56 64 L50 60 L44 64 Z" fill="#FF6B6B" opacity="0.8" />
                    </svg>
                </div>
            );
        }

        // Default tier icon with number
        const tierNumber = tier.name.includes("Bronze") ? "3" :
            tier.name.includes("Silver") ? "2" :
                tier.name.includes("Gold") ? "1" : "★";

        return (
            <div className={iconClass} style={{ boxShadow: `0 8px 25px ${tier.color}99` }}>
                <span className="text-3xl font-bold">{tierNumber}</span>
            </div>
        );
    };

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };


    return (
        <div className="bg-[--color-bg-base] min-h-screen pb-20 selection:bg-[--color-primary] selection:text-white">

            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
                        <p className="text-[--color-text-secondary]">Loading your referral dashboard...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => loadReferralData()}
                            className="px-6 py-2 bg-[--color-primary] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* --- Hero Section --- */}
                    <div className="relative pt-6 md:pt-10 pb-8 md:pb-16 overflow-hidden">
                        {/* Background Blobs */}
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[--color-primary]/20 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute top-20 right-1/4 w-72 h-72 bg-[--color-accent]/20 rounded-full blur-[80px] pointer-events-none" />

                        <div className="container mx-auto px-4 relative z-10">
                            <div className="mb-6 md:mb-8">
                                <button onClick={() => navigate('home')} className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-transparent hover:bg-[--color-bg-secondary] px-3 md:px-4 py-2 text-xs md:text-sm backdrop-blur-sm bg-[--color-card]/50 border border-[--color-border]">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                                </button>
                            </div>

                            <div className="text-center max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[--color-primary]/10 text-[--color-primary] text-xs md:text-sm font-bold mb-4 md:mb-6 border border-[--color-primary]/20 backdrop-blur-md"
                                >
                                    <Gift size={16} /> Referral Program
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 md:mb-6 text-[--color-text-primary] tracking-tight px-4"
                                >
                                    Invite Friends. <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-accent]">Earn FOG Coin Forever.</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-sm md:text-lg text-[--color-text-secondary] max-w-2xl mx-auto leading-relaxed px-4"
                                >
                                    Grow your network and earn 5% lifetime commissions on every transaction your referrals make.
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">

                        {/* --- Stats Grid --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                            <TiltCard>
                                <div className="glass-panel border-[--glass-border] h-full shadow-lg rounded-xl bg-[--color-card]">
                                    <div className="p-4 md:p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs md:text-sm font-medium text-[--color-text-secondary]">Total Referrals</p>
                                            <h3 className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mt-1">{stats?.totalReferrals || 0}</h3>
                                        </div>
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Users size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                            <TiltCard>
                                <div className="glass-panel border-[--glass-border] h-full shadow-lg rounded-xl bg-[--color-card]">
                                    <div className="p-4 md:p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs md:text-sm font-medium text-[--color-text-secondary]">Active Referrals</p>
                                            <h3 className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mt-1">{stats?.activeReferrals || 0}</h3>
                                        </div>
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                                            <DollarSign size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                            <TiltCard>
                                <div className="glass-panel border-[--glass-border] h-full shadow-lg rounded-xl bg-[--color-card]">
                                    <div className="p-4 md:p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs md:text-sm font-medium text-[--color-text-secondary]">This Month</p>
                                            <h3 className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mt-1">{stats?.thisMonthReferrals || 0}</h3>
                                        </div>
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Zap size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">

                            {/* --- Left: Share Link --- */}
                            <div className="lg:col-span-7 space-y-6 md:space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="glass-panel border-[--glass-border] overflow-hidden rounded-xl bg-[--color-card]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[--color-primary]/20 to-transparent rounded-full blur-[60px] pointer-events-none" />
                                        <div className="p-4 md:p-6">
                                            <h3 className="text-lg md:text-xl font-bold text-[--color-text-primary] md:text-2xl">Your Referral Code & Link</h3>
                                            <p className="text-xs md:text-sm text-[--color-text-secondary] mt-1">Share your code or link to start earning.</p>
                                        </div>
                                        <div className="p-4 md:p-6 pt-0 space-y-4 md:space-y-6 relative z-10">
                                            {/* Referral Code Display */}
                                            {generating ? (
                                                <div className="bg-[--color-bg-secondary] rounded-lg p-4 text-center">
                                                    <p className="text-[--color-text-secondary]">Generating your unique referral code...</p>
                                                </div>
                                            ) : referralCode && (
                                                <div className="bg-gradient-to-r from-[--color-primary]/10 to-[--color-accent]/10 rounded-lg p-4 border border-[--color-primary]/20">
                                                    <p className="text-xs text-[--color-text-secondary] mb-2">Your Referral Code:</p>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <code className="text-xl md:text-2xl font-mono font-bold tracking-wider text-[--color-primary]">{referralCode}</code>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(referralCode);
                                                                setCopied(true);
                                                                setTimeout(() => setCopied(false), 2000);
                                                            }}
                                                            className="bg-[--color-primary]/10 hover:bg-[--color-primary]/20 p-2 rounded-lg transition-colors"
                                                        >
                                                            {copied ? <Check size={18} className="text-[--color-primary]" /> : <Copy size={18} className="text-[--color-primary]" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Referral Link */}
                                            <div className="flex flex-col md:flex-row gap-2">
                                                <div className="relative flex-1">
                                                    <input readOnly value={referralLink} className="w-full px-3 py-2 md:py-3 rounded-lg border bg-[--color-bg-base] text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] h-10 md:h-12 pl-3 md:pl-4 pr-3 md:pr-4 bg-[--color-bg-tertiary] border-[--color-border] font-mono text-xs md:text-sm text-[--color-primary]" />
                                                </div>
                                                <button onClick={handleCopy} className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-[--color-primary] text-white hover:bg-[--color-primary]/90 w-full md:w-32 transition-all ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                                                    {copied ? <><Check size={18} className="mr-2" /> Copied</> : <><Copy size={18} className="mr-2" /> Copy</>}
                                                </button>
                                            </div>

                                            <div className="pt-3 border-t border-[--color-border]">
                                                <p className="text-xs md:text-sm font-medium text-[--color-text-secondary] mb-3 md:mb-4 uppercase tracking-wider">Share directly</p>
                                                <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-3">
                                                    <button className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-3 text-sm border border-[--color-border] bg-transparent hover:bg-[--color-bg-secondary] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/10" onClick={() => handleSocialShare('twitter')}>
                                                        <Twitter size={18} className="mr-2" /> Twitter
                                                    </button>
                                                    <button className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-3 text-sm border border-[--color-border] bg-transparent hover:bg-[--color-bg-secondary] hover:text-[#25D366] hover:border-[#25D366]/50 hover:bg-[#25D366]/10" onClick={() => handleSocialShare('whatsapp')}>
                                                        <Send size={18} className="mr-2" /> WhatsApp
                                                    </button>
                                                    <button className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-3 text-sm border border-[--color-border] bg-transparent hover:bg-[--color-bg-secondary] hover:text-[#0077b5] hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10" onClick={() => handleSocialShare('linkedin')}>
                                                        <Linkedin size={18} className="mr-2" /> LinkedIn
                                                    </button>
                                                    <button className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-3 text-sm border border-[--color-border] bg-transparent hover:bg-[--color-bg-secondary] hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10" onClick={() => handleSocialShare('facebook')}>
                                                        <Facebook size={18} className="mr-2" /> Facebook
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Recent History */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="glass-panel border-[--glass-border] rounded-xl bg-[--color-card] overflow-hidden">
                                        <div className="p-4 md:p-6 flex flex-row justify-between items-center border-b border-[--color-border]">
                                            <h3 className="text-lg md:text-xl font-bold text-[--color-text-primary]">Recent Referrals</h3>
                                            {stats?.referrals && stats.referrals.length > 4 && (
                                                <button
                                                    onClick={() => setIsViewingAll(!isViewingAll)}
                                                    className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-3 py-1.5 text-xs bg-transparent hover:bg-[--color-bg-secondary] gap-2"
                                                >
                                                    <span>{isViewingAll ? 'Show Less' : 'View All'}</span>
                                                    <svg
                                                        className={`w-4 h-4 transition-transform duration-300 ${isViewingAll ? 'rotate-180' : ''}`}
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Fixed height container - scrollbar only when viewing all */}
                                        <div
                                            className={`h-[340px] custom-scrollbar ${isViewingAll ? 'overflow-y-auto' : 'overflow-hidden'}`}
                                            style={{
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: 'var(--color-primary) transparent'
                                            }}
                                        >
                                            <style>{`
                                        .custom-scrollbar::-webkit-scrollbar {
                                            width: 8px;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-track {
                                            background: var(--color-bg-secondary);
                                            border-radius: 10px;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-thumb {
                                            background: linear-gradient(180deg, var(--color-primary), var(--color-accent));
                                            border-radius: 10px;
                                            transition: background 0.3s;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                            background: linear-gradient(180deg, var(--color-accent), var(--color-primary));
                                        }
                                    `}</style>

                                            <div className="overflow-x-hidden">
                                                <table className="w-full text-xs md:text-sm text-left">
                                                    <thead className="text-xs text-[--color-text-secondary] uppercase bg-[--color-bg-secondary]/50 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-3 md:px-6 py-3 md:py-4">User</th>
                                                            <th className="px-3 md:px-6 py-3 md:py-4">Date</th>
                                                            <th className="px-3 md:px-6 py-3 md:py-4">Status</th>
                                                            <th className="px-3 md:px-6 py-3 md:py-4 text-right">Earning</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[--color-border]">
                                                        {stats?.referrals && stats.referrals.length > 0 ? (
                                                            (isViewingAll ? stats.referrals : stats.referrals.slice(0, 4)).map((referral, index) => (
                                                                <motion.tr
                                                                    key={referral.id}
                                                                    initial={isViewingAll && index >= 4 ? { opacity: 0, x: -20 } : {}}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{
                                                                        delay: isViewingAll && index >= 4 ? (index - 4) * 0.05 : 0,
                                                                        type: "spring",
                                                                        stiffness: 100
                                                                    }}
                                                                    className="hover:bg-[--color-bg-secondary]/50 transition-all duration-200 group"
                                                                >
                                                                    <td className="px-3 md:px-6 py-3 md:py-4 font-medium group-hover:text-[--color-primary] transition-colors">
                                                                        {referral.referredUserName}
                                                                    </td>
                                                                    <td className="px-3 md:px-6 py-3 md:py-4 text-[--color-text-secondary]">
                                                                        {formatDate(referral.timestamp)}
                                                                    </td>
                                                                    <td className="px-3 md:px-6 py-3 md:py-4">
                                                                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${referral.status === 'active'
                                                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 group-hover:bg-green-500/20'
                                                                            : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:bg-orange-500/20'
                                                                            }`}>
                                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${referral.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                                                                                } ${referral.status === 'active' ? 'animate-pulse' : ''}`}></span>
                                                                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-bold text-[--color-text-primary] group-hover:scale-105 transition-transform">
                                                                        ---
                                                                    </td>
                                                                </motion.tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <Users className="w-12 h-12 text-[--color-text-secondary] opacity-50 mb-3" />
                                                                        <p className="text-[--color-text-secondary] text-sm">No referrals yet</p>
                                                                        <p className="text-[--color-text-secondary] text-xs mt-1">Start sharing your link to see referrals here</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* --- Right: Tiers & Gamification --- */}
                            <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-xl relative overflow-hidden rounded-xl bg-[--color-card]">
                                        <div
                                            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px]"
                                            style={{ background: `${currentTier.color}33` }}
                                        ></div>
                                        <div className="p-4 md:p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg md:text-xl font-bold text-[--color-text-primary] text-white flex items-center gap-2">
                                                        <Trophy style={{ color: currentTier.color }} size={18} /> Referral Tier
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-[--color-text-secondary] mt-1 text-slate-400">Level up to earn higher commission rates.</p>
                                                </div>
                                                <span
                                                    className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium border-none font-bold"
                                                    style={{
                                                        background: currentTier.color,
                                                        color: currentTier.isLegendary || currentTier.name.includes("Platinum") || currentTier.name.includes("Diamond") ? '#000' : '#fff'
                                                    }}
                                                >
                                                    {currentTier.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 md:p-6 pt-0">
                                            <div className="space-y-4 md:space-y-6">
                                                {nextTier ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs md:text-sm">
                                                            <span className="text-slate-300">Next: {nextTier.name}</span>
                                                            <span
                                                                className="font-bold"
                                                                style={{ color: currentTier.color }}
                                                            >
                                                                {stats?.totalReferrals || 0} / {nextTier.minReferrals} Ref
                                                            </span>
                                                        </div>
                                                        <div className="h-2 md:h-3 bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${tierProgress}%` }}
                                                                transition={{ duration: 1, delay: 0.5 }}
                                                                className={`h-full bg-gradient-to-r ${currentTier.bgGradient}`}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-400 text-right">
                                                            {nextTier.minReferrals - (stats?.totalReferrals || 0)} referrals to unlock {nextTier.commission} commission
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 via-red-500 to-cyan-500 rounded-full text-white font-bold text-sm animate-pulse">
                                                            <Trophy size={18} />
                                                            Maximum Tier Reached! 🎉
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Rate</div>
                                                        <div className="text-lg md:text-xl font-bold text-white">{currentTier.commission}</div>
                                                    </div>
                                                    {nextTier && (
                                                        <div
                                                            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 relative overflow-hidden group"
                                                        >
                                                            <div
                                                                className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform"
                                                                style={{ background: `${nextTier.color}1A` }}
                                                            ></div>
                                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 relative z-10">Next Rate</div>
                                                            <div
                                                                className="text-lg md:text-xl font-bold flex items-center gap-1 relative z-10"
                                                                style={{ color: nextTier.color }}
                                                            >
                                                                {nextTier.commission} <TrendingUp size={14} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => setIsTierModalOpen(true)}
                                                    className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-2 text-xs md:text-sm w-full border"
                                                    style={{
                                                        background: `${currentTier.color}1A`,
                                                        color: currentTier.color,
                                                        borderColor: `${currentTier.color}4D`
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = `${currentTier.color}33`}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = `${currentTier.color}1A`}
                                                >
                                                    <Layers size={16} className="mr-2" /> View All Tier Rewards
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="glass-panel border-[--glass-border] rounded-xl bg-[--color-card]">
                                        {/* <div className="p-4 md:p-6">
                                    <h3 className="text-lg md:text-xl font-bold text-[--color-text-primary]">How it Works</h3>
                                </div> */}
                                        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-0">
                                            <h3 className="text-lg md:text-xl font-bold text-[--color-text-primary]">How it Works</h3>
                                        </div>

                                        <div className="p-4 md:p-6 pt-0">
                                            <div className="relative space-y-6 md:space-y-8 pl-2">
                                                {/* Vertical Line */}
                                                <div className="absolute left-[19px] md:left-[27px] top-2 bottom-4 w-0.5 bg-[--color-border]"></div>

                                                <div className="flex gap-3 md:gap-4 relative">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[--color-primary] text-white flex items-center justify-center font-bold flex-shrink-0 z-10 shadow-lg shadow-[--color-primary]/20 text-sm md:text-base">1</div>
                                                    <div>
                                                        <h4 className="font-bold text-[--color-text-primary] text-sm md:text-base">Invite Friends</h4>
                                                        <p className="text-xs md:text-sm text-[--color-text-secondary]">Share your unique link via social media or email.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 md:gap-4 relative">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[--color-bg-secondary] border-2 border-[--color-primary] text-[--color-primary] flex items-center justify-center font-bold flex-shrink-0 z-10 bg-[--color-card] text-sm md:text-base">2</div>
                                                    <div>
                                                        <h4 className="font-bold text-[--color-text-primary] text-sm md:text-base">They Join & Act</h4>
                                                        <p className="text-xs md:text-sm text-[--color-text-secondary]">Friends sign up and complete their first job or purchase.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 md:gap-4 relative">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[--color-bg-secondary] border-2 border-[--color-primary] text-[--color-primary] flex items-center justify-center font-bold flex-shrink-0 z-10 bg-[--color-card] text-sm md:text-base">3</div>
                                                    <div>
                                                        <h4 className="font-bold text-[--color-text-primary] text-sm md:text-base">You Earn Rewards</h4>
                                                        <p className="text-xs md:text-sm text-[--color-text-secondary]">Receive lifetime commissions paid instantly in FOG Coins.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[--color-border]">
                                                <button
                                                    onClick={() => setIsTermsModalOpen(true)}
                                                    className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-2 text-xs md:text-sm bg-[--color-bg-secondary] text-[--color-text-primary] hover:bg-[--color-bg-tertiary] w-full"
                                                >
                                                    Read Full Terms <ExternalLink size={14} className="ml-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Modal */}
                    <AnimatePresence>
                        {isTierModalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 md:p-6"
                                onClick={() => setIsTierModalOpen(false)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="bg-[--color-card] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl relative z-[9999]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header - Sticky */}
                                    <div className="sticky top-0 bg-[--color-card] border-b border-[--color-border] p-6 md:p-8 flex justify-between items-start z-10">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-[--color-text-primary] mb-2">All Tier Rewards</h2>
                                            <p className="text-sm text-[--color-text-secondary]">Earn higher commissions as you refer more friends</p>
                                        </div>
                                        <button
                                            onClick={() => setIsTierModalOpen(false)}
                                            className="w-10 h-10 rounded-full bg-[--color-bg-tertiary] hover:bg-[--color-primary] hover:text-white transition-all duration-300 flex items-center justify-center group"
                                        >
                                            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Modal Body - Scrollable */}
                                    <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 md:p-8">
                                        <div className="space-y-5">
                                            {updatedTierData.map((tier, index) => (
                                                <motion.div
                                                    key={tier.name}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`
                                                relative overflow-hidden rounded-2xl p-5 md:p-6 
                                                border-2 transition-all duration-300 hover:-translate-y-1
                                                ${tier.isCurrent
                                                            ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500 shadow-lg shadow-yellow-500/20'
                                                            : 'bg-gradient-to-br from-[--color-primary]/5 to-[--color-accent]/5 border-[--color-border] hover:border-[--color-primary] hover:shadow-lg hover:shadow-[--color-primary]/15'
                                                        }
                                                ${tier.isLegendary ? 'animate-pulse bg-gradient-to-br from-yellow-500/10 via-red-500/10 to-cyan-500/10' : ''}
                                            `}
                                                    style={tier.isCurrent ? {
                                                        boxShadow: '0 0 0 4px rgba(234, 179, 8, 0.1)'
                                                    } : {}}
                                                >
                                                    {/* Current Tier Badge */}
                                                    {tier.isCurrent && (
                                                        <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
                                                            YOUR TIER
                                                        </div>
                                                    )}

                                                    {/* Legendary Glow Effect */}
                                                    {tier.isLegendary && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-red-500/5 to-cyan-500/5 blur-2xl"></div>
                                                    )}

                                                    <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center relative z-10">
                                                        {/* Tier Icon */}
                                                        <TierIcon tier={tier} />

                                                        {/* Tier Info */}
                                                        <div>
                                                            <h3 className={`text-xl font-bold mb-1.5 ${tier.isLegendary ? 'bg-gradient-to-r from-yellow-500 via-red-500 to-cyan-500 bg-clip-text text-transparent' : 'text-[--color-text-primary]'}`}>
                                                                {tier.name}
                                                            </h3>
                                                            <p className="text-sm text-[--color-text-secondary] mb-3">
                                                                {tier.isLegendary ? 'The ultimate referral champion 👑' :
                                                                    tier.isCurrent ? 'Premium rewards and recognition' :
                                                                        tier.name.includes("Starter") ? 'Build your network to start earning' :
                                                                            tier.name.includes("Bronze") ? 'Start earning commissions' :
                                                                                tier.name.includes("Silver") ? 'Unlock doubled commission rate' :
                                                                                    tier.name.includes("Sapphire") ? 'Exclusive benefits and higher earnings' :
                                                                                        tier.name.includes("Ruby") ? 'Elite status with premium perks' :
                                                                                            tier.name.includes("Emerald") ? 'Distinguished network builder' :
                                                                                                tier.name.includes("Diamond") ? 'Prestigious recognition and rewards' :
                                                                                                    tier.name.includes("Platinum") ? 'Master networker with exceptional reach' :
                                                                                                        tier.name.includes("Black") ? 'Ultra-rare achievement status' :
                                                                                                            'Grow your referral network'}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[--color-bg-tertiary] rounded-lg text-xs font-semibold text-[--color-text-secondary]">
                                                                    <Users size={12} />
                                                                    {tier.referrals}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Commission Display */}
                                                        <div className="text-center md:text-right">
                                                            <div className={`text-4xl font-extrabold mb-1 ${tier.isLegendary ? 'bg-gradient-to-r from-yellow-500 via-red-500 to-cyan-500 bg-clip-text text-transparent' : 'text-transparent bg-clip-text bg-gradient-to-br from-[--color-primary] to-[--color-accent]'}`}>
                                                                {tier.commission}
                                                            </div>
                                                            <div className="text-xs text-[--color-text-secondary] uppercase tracking-wider font-semibold">
                                                                {tier.isLegendary ? 'Max Commission' : 'Commission'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Terms & Conditions Modal */}
                    <AnimatePresence>
                        {isTermsModalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 md:p-6"
                                onClick={() => setIsTermsModalOpen(false)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="bg-[--color-card] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl relative z-[9999]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header - Sticky */}
                                    <div className="sticky top-0 bg-[--color-card] border-b border-[--color-border] p-6 md:p-8 flex justify-between items-start z-10">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-[--color-text-primary] mb-2">
                                                Fogsly Marketplace - Terms & Conditions
                                            </h2>
                                            {/* <span className="inline-block bg-[--color-primary]/10 text-[--color-primary] px-3 py-1 rounded-lg text-xs font-semibold border border-[--color-primary]/20">
                                        Version 1.0
                                    </span> */}
                                        </div>
                                        <button
                                            onClick={() => setIsTermsModalOpen(false)}
                                            className="w-10 h-10 rounded-full bg-[--color-bg-tertiary] hover:bg-[--color-primary] hover:text-white transition-all duration-300 flex items-center justify-center group"
                                        >
                                            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Modal Body - Scrollable */}
                                    <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 md:p-8">
                                        <div className="space-y-3">
                                            {termsData.map((term, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border border-[--color-border] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                                                >
                                                    {/* Accordion Header */}
                                                    <button
                                                        onClick={() => toggleAccordion(index)}
                                                        className={`w-full px-5 md:px-6 py-4 md:py-5 flex justify-between items-center transition-all duration-300 ${activeAccordion === index
                                                            ? 'bg-[--color-primary] text-white'
                                                            : 'bg-[--color-bg-secondary] text-[--color-text-primary] hover:bg-[--color-bg-tertiary]'
                                                            }`}
                                                    >
                                                        <h3 className="text-left font-bold text-sm md:text-base">
                                                            {term.title}
                                                        </h3>
                                                        <svg
                                                            className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 flex-shrink-0 ml-4 ${activeAccordion === index ? 'rotate-180' : ''
                                                                }`}
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <polyline points="6 9 12 15 18 9" />
                                                        </svg>
                                                    </button>

                                                    {/* Accordion Content */}
                                                    <AnimatePresence>
                                                        {activeAccordion === index && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-5 md:px-6 py-4 md:py-6 bg-[--color-card] text-[--color-text-primary] text-sm md:text-base leading-relaxed">
                                                                    {term.content}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default ReferralsPage;