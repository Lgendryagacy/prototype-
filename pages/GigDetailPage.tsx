import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../firebase/hooks/useAuth';
import { getApprovedFreelancerById, updateFreelancerStatus, ApprovedFreelancer } from '../firebase/services/approvedFreelancers';
import { getUserProfile } from '../firebase/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ReviewsList from '../components/ReviewsList';
import {
    User,
    Mail,
    Briefcase,
    DollarSign,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    Search,
    ExternalLink,
    Loader,
    AlertCircle,
    Award,
    Target,
    Calendar,
    Globe,
    ArrowLeft,
    Share2,
    Edit,
    ChevronDown,
    Pause,
    Play,
    MapPin
} from 'lucide-react';
import { type Route } from '../types';
import { toast } from 'react-hot-toast';

const GigDetailPage = ({ navigate, context }: { navigate: (route: Route, context?: any) => void; context?: any }) => {
    const { user: currentUser } = useAuth();
    const [freelancer, setFreelancer] = useState<ApprovedFreelancer | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Extract gigId from context (passed during navigation or from URL)
    console.log('GigDetailPage received context:', context);
    const gigId = context?.gigId || context;
    console.log('Extracted gigId:', gigId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (gigId) {
            fetchGigData();
        } else {
            setLoading(false);
            toast.error('No gig ID provided');
        }
    }, [gigId]);

    const fetchGigData = async () => {
        if (!gigId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const gigData = await getApprovedFreelancerById(gigId);
            setFreelancer(gigData);

            // Fetch user profile to get avatar
            if (gigData?.userId) {
                try {
                    const userProfile = await getUserProfile(gigData.userId);
                    if (userProfile) {
                        setUserAvatar(userProfile.avatarUrl || null);
                        setUserName(userProfile.name || userProfile.displayName || gigData.userName);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserName(gigData.userName);
                }
            }
        } catch (error) {
            console.error('Error fetching gig data:', error);
            toast.error('Failed to load gig data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (newStatus: 'active' | 'inactive') => {
        if (!freelancer || !freelancer.id) return;

        // Only allow the owner to toggle status
        if (currentUser?.uid !== freelancer.userId) {
            toast.error('You can only modify your own gigs');
            return;
        }

        try {
            setIsTogglingStatus(true);
            setShowStatusDropdown(false);
            await updateFreelancerStatus(freelancer.id, newStatus);
            setFreelancer({ ...freelancer, status: newStatus });
            toast.success(`Gig ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setIsTogglingStatus(false);
        }
    };

    const handleEditGig = () => {
        if (freelancer?.id) {
            navigate('edit-gig', { gigId: freelancer.id });
        }
    };

    const handleShareGig = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Gig URL copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy URL');
        });
    };

    // Filter portfolio items based on search
    const filteredPortfolio = freelancer?.portfolioItems?.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    }) || [];

    // Check if current user is the owner of this gig
    const isOwner = currentUser?.uid === freelancer?.userId;

    if (loading) {
        return (
            <div className="bg-[--color-bg-base] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-16 w-16 animate-spin text-[--color-primary] mx-auto mb-4" />
                    <p className="text-[--color-text-secondary] text-lg font-medium">Loading gig details...</p>
                </div>
            </div>
        );
    }

    if (!freelancer) {
        return (
            <div className="bg-[--color-bg-base] min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    className="text-center max-w-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="text-8xl mb-6">😞</div>
                    <h1 className="text-3xl font-black mb-3 text-[--color-text-primary]">Gig Not Found</h1>
                    <p className="text-[--color-text-secondary] mb-8 text-lg">The gig you are looking for does not exist or has been removed.</p>
                    <Button
                        onClick={() => navigate('find-work')}
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:-translate-y-1 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Find Work
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[--color-bg-base] min-h-screen relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                        top: '-10%',
                        left: '10%'
                    }}
                    animate={{
                        x: [0, 50, -30, 40, 0],
                        y: [0, -50, 30, 20, 0],
                        scale: [1, 1.1, 0.9, 1.05, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
                        top: '40%',
                        right: '10%'
                    }}
                    animate={{
                        x: [0, -40, 30, -20, 0],
                        y: [0, 40, -30, 20, 0],
                        scale: [1, 0.9, 1.1, 0.95, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                />
            </div>

            <div className="w-full relative z-10">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
                    {/* Back Button */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <button
                            onClick={() => {
                                // Check if we came from find-work page
                                const cameFromFindWork = sessionStorage.getItem('return-to-find-work-gigs') === 'true';
                                if (cameFromFindWork) {
                                    navigate('find-work');
                                } else {
                                    // Default behavior: owners go to manage-gigs, others to find-work
                                    navigate(isOwner ? 'manage-gigs' : 'find-work');
                                }
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>
                                {sessionStorage.getItem('return-to-find-work-gigs') === 'true'
                                    ? 'Back to Find Work'
                                    : isOwner
                                        ? 'Back to Manage Gigs'
                                        : 'Back to Find Work'}
                            </span>
                        </button>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[40px] p-8 md:p-12 shadow-2xl">
                                    <div className="flex flex-col lg:flex-row items-start gap-8">
                                        {/* Profile Image */}
                                        <div className="relative mx-auto lg:mx-0">
                                            {userAvatar ? (
                                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-8 ring-white/10 shadow-2xl">
                                                    <img
                                                        src={userAvatar}
                                                        alt={userName || freelancer.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center text-white font-black text-5xl ring-8 ring-white/10 shadow-2xl">
                                                    {(userName || freelancer.fullName).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {/* Status Badge */}
                                            {freelancer.status === 'active' && (
                                                <div
                                                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm md:text-lg font-bold shadow-lg ring-2 md:ring-4 ring-white/20"
                                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                                >
                                                    ✓
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 w-full">
                                            {/* Title and Name */}
                                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[--color-text-primary] tracking-tight leading-tight mb-2">{freelancer.title}</h1>
                                            <p className="text-base md:text-lg text-[--color-text-secondary] font-normal opacity-70 mb-6">
                                                {userName || freelancer.fullName} • {freelancer.experience.charAt(0).toUpperCase() + freelancer.experience.slice(1)} Level
                                            </p>

                                            {/* Stats Row */}
                                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={20} className="text-[--color-primary]" />
                                                    <span className="font-semibold text-xl text-[--color-text-primary]">
                                                        {freelancer.currency} {freelancer.hourlyRate}/hr
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[--color-text-secondary]">
                                                    <Clock size={18} />
                                                    <span className="font-semibold">{freelancer.availability}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold text-xl text-[--color-text-primary]">
                                                        {freelancer.averageRating.toFixed(1)}
                                                    </span>
                                                    <span className="text-[--color-text-secondary] font-semibold">
                                                        ({freelancer.totalReviews} reviews)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[--color-text-secondary]">
                                                    <Briefcase size={18} />
                                                    <span className="font-semibold">{freelancer.totalJobs} Jobs</span>
                                                </div>
                                            </div>

                                            {/* Categories Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {freelancer.categories.map((category, index) => (
                                                    <Badge
                                                        key={index}
                                                        className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                                                        style={{
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'var(--color-bg-primary)',
                                                            borderColor: 'var(--color-primary)'
                                                        }}
                                                    >
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Status Bar */}
                                            <div className="relative">
                                                <div className="h-3 bg-[--color-bg-secondary]/50 rounded-full overflow-hidden border-2 border-[--color-border]">
                                                    <div className="h-full bg-green-500 rounded-full shadow-lg" style={{ width: `${freelancer.status === 'active' ? '100%' : '0%'}` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Professional Bio */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                    <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Professional Bio</h2>
                                    <p className="text-sm md:text-base text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap font-normal">{freelancer.bio}</p>
                                </div>
                            </motion.div>

                            {/* Professional Stats */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                    <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Professional Stats</h2>
                                    <ul className="space-y-4">
                                        <li className="flex items-start text-[--color-text-primary]">
                                            <CheckCircle size={20} className="mr-3 mt-0.5 text-green-500 flex-shrink-0"/>
                                            <span className="font-semibold text-base">{freelancer.experience.charAt(0).toUpperCase() + freelancer.experience.slice(1)} Level Professional</span>
                                        </li>
                                        <li className="flex items-start text-[--color-text-primary]">
                                            <CheckCircle size={20} className="mr-3 mt-0.5 text-green-500 flex-shrink-0"/>
                                            <span className="font-semibold text-base">{freelancer.totalJobs} Jobs Completed</span>
                                        </li>
                                        <li className="flex items-start text-[--color-text-primary]">
                                            <CheckCircle size={20} className="mr-3 mt-0.5 text-green-500 flex-shrink-0"/>
                                            <span className="font-semibold text-base">{freelancer.totalEarnings.toFixed(0)} FOG Total Earnings</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>

                            {/* Categories */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                    <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Categories</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {freelancer.categories.map((category, index) => (
                                            <Badge
                                                key={index}
                                                className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                                                style={{
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'var(--color-bg-primary)',
                                                    borderColor: 'var(--color-primary)'
                                                }}
                                            >
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Skills */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                    <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {freelancer.skills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                                                style={{
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'var(--color-bg-primary)',
                                                    borderColor: 'var(--color-primary)'
                                                }}
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Languages */}
                            {freelancer.languages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                >
                                    <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                        <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Languages</h2>
                                        <div className="space-y-3">
                                            {freelancer.languages.map((language, index) => (
                                                <div key={index} className="text-[--color-text-primary] flex items-center gap-3">
                                                    <Globe size={18} className="text-[--color-primary]" />
                                                    <span className="font-semibold text-base">{language}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Education */}
                            {freelancer.education && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                >
                                    <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                        <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Education</h2>
                                        <p className="text-sm md:text-base text-[--color-text-secondary] leading-relaxed font-normal">{freelancer.education}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Certifications */}
                            {freelancer.certifications.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                                >
                                    <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                        <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">Certifications</h2>
                                        <ul className="space-y-3">
                                            {freelancer.certifications.map((cert, index) => (
                                                <li key={index} className="flex items-start text-[--color-text-primary]">
                                                    <Award size={20} className="mr-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                                    <span className="font-semibold text-base">{cert}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}

                            {/* Portfolio Section */}
                            {filteredPortfolio.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                                >
                                    <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                        <div className="flex items-center justify-between mb-6 md:mb-8">
                                            <h2 className="text-2xl md:text-3xl font-black text-[--color-text-primary]">Portfolio ({filteredPortfolio.length})</h2>
                                            {isOwner && <button className="text-[--color-primary] hover:opacity-80 text-sm font-bold">+ Upload portfolio</button>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {filteredPortfolio.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group"
                                                >
                                                    <div className="aspect-video bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10 overflow-hidden">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Briefcase className="w-12 h-12 text-[--color-text-secondary] opacity-50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 md:p-6">
                                                        <h3 className="font-bold text-base md:text-lg text-[--color-text-primary] mb-2 group-hover:text-[--color-primary] transition-colors">{item.title}</h3>
                                                        <p className="text-xs md:text-sm text-[--color-text-secondary] line-clamp-2 mb-3">
                                                            {item.description}
                                                        </p>
                                                        {item.link && (
                                                            <a
                                                                href={item.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-[--color-primary] hover:underline text-sm font-semibold"
                                                            >
                                                                View Project <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Reviews Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl">
                                    <h2 className="text-2xl md:text-3xl font-black text-[--color-text-primary] mb-6 md:mb-8">Client Reviews</h2>
                                    <ReviewsList
                                        freelancerId={freelancer.userId}
                                        maxReviews={5}
                                        showLoadMore={true}
                                        className=""
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar - Right Side */}
                        <aside className="lg:col-span-1 space-y-6">
                            {/* Pricing Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 shadow-xl sticky top-24">
                                    <div className="text-center py-6 border-b-2 border-white/10">
                                        <div className="text-5xl md:text-6xl font-black text-[--color-text-primary] mb-2">
                                            {freelancer.currency} {freelancer.hourlyRate}
                                        </div>
                                        <p className="text-sm md:text-base text-[--color-text-secondary] font-semibold uppercase tracking-wider opacity-70">Hourly Rate</p>
                                    </div>

                                    <div className="space-y-6 py-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">Total Jobs</span>
                                            <span className="font-black text-[--color-primary] text-lg">{freelancer.totalJobs}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">Response Time</span>
                                            <span className="font-black text-[--color-primary] text-lg">{freelancer.availability}</span>
                                        </div>
                                    </div>

                                    {!isOwner ? (
                                        <div className="space-y-3">
                                            <Button
                                                size="lg"
                                                className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all"
                                                onClick={() => {
                                                    // Navigate to messages page with this freelancer's info to open their chat
                                                    navigate('messages', {
                                                        selectedUserId: freelancer.userId,
                                                        selectedUserName: userName || freelancer.fullName,
                                                        selectedUserAvatar: userAvatar
                                                    });
                                                }}
                                            >
                                                <Mail className="w-5 h-5 mr-2" />
                                                Message Now
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all"
                                                onClick={() => navigate('public-profile', freelancer.userId)}
                                            >
                                                <User className="w-5 h-5 mr-2" />
                                                View Profile
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button
                                                size="lg"
                                                className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all"
                                                onClick={handleEditGig}
                                            >
                                                <Edit className="w-5 h-5 mr-2" />
                                                Edit Gig
                                            </Button>
                                            <div className="relative w-full" ref={dropdownRef}>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all"
                                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                    disabled={isTogglingStatus}
                                                >
                                                    {isTogglingStatus ? (
                                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                                    ) : (
                                                        <>{freelancer.status === 'active' ? <CheckCircle className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2" />}</>
                                                    )}
                                                    {freelancer.status === 'active' ? 'Active' : 'Paused'}
                                                    <ChevronDown className="w-5 h-5 ml-2" />
                                                </Button>

                                                <AnimatePresence>
                                                    {showStatusDropdown && !isTogglingStatus && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute left-0 top-full mt-2 w-full backdrop-blur-xl bg-[--color-card]/90 border-2 border-[--color-border] rounded-2xl shadow-2xl z-50 overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={() => handleToggleStatus('active')}
                                                                disabled={freelancer.status === 'active'}
                                                                className={`w-full px-4 py-3 text-left hover:bg-[--color-bg-secondary]/50 flex items-center gap-3 transition-colors text-[--color-text-primary] font-semibold ${freelancer.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <Play className="w-5 h-5 text-green-500" />
                                                                <span>Set Active</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus('inactive')}
                                                                disabled={freelancer.status === 'inactive'}
                                                                className={`w-full px-4 py-3 text-left hover:bg-[--color-bg-secondary]/50 flex items-center gap-3 transition-colors text-[--color-text-primary] font-semibold ${freelancer.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <Pause className="w-5 h-5 text-orange-500" />
                                                                <span>Pause Gig</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all mt-3"
                                        onClick={handleShareGig}
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        Share Gig
                                    </Button>
                                </div>
                            </motion.div>

                            {/* About the Freelancer */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            >
                                <div className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-full bg-[--color-primary]/10 flex items-center justify-center">
                                            <Award size={24} className="text-[--color-primary]" />
                                        </div>
                                        <h3 className="text-2xl font-black text-[--color-text-primary]">About the Freelancer</h3>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt={userName || freelancer.fullName}
                                                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/10 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-full flex items-center justify-center text-white text-2xl font-black ring-4 ring-white/10 shadow-lg">
                                                {(userName || freelancer.fullName).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-black text-lg text-[--color-text-primary]">{userName || freelancer.fullName}</h4>
                                            <p className="text-sm text-[--color-text-secondary] font-semibold">{freelancer.title}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-6">
                                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                        <span className="font-black text-lg text-[--color-text-primary]">
                                            {freelancer.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-[--color-text-secondary] font-semibold text-sm">
                                            from {freelancer.totalReviews} reviews
                                        </span>
                                    </div>

                                    <div className="pt-6 border-t-2 border-white/10 grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="font-black text-[--color-primary] text-2xl">{freelancer.totalJobs}</p>
                                            <p className="text-[--color-text-secondary] text-xs font-semibold uppercase tracking-wider">Jobs Completed</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-[--color-primary] text-2xl">{freelancer.totalEarnings.toFixed(0)}</p>
                                            <p className="text-[--color-text-secondary] text-xs font-semibold uppercase tracking-wider">FOG Earned</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t-2 border-white/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-[--color-primary]" />
                                            <p className="truncate text-[--color-text-secondary] text-sm font-medium">{freelancer.userEmail}</p>
                                        </div>
                                        {freelancer.approvedAt && (
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16} className="text-[--color-primary]" />
                                                <p className="text-[--color-text-secondary] text-sm font-medium">
                                                    Member since {freelancer.approvedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigDetailPage;
