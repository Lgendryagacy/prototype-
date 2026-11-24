import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Gift, Users, Clock, ShieldCheck, Star,
  ArrowLeft, PartyPopper, CheckCircle2, AlertCircle, Info,
  Coins, LayoutGrid, Zap, Sparkles, Plus, ListChecks, Settings
} from 'lucide-react';
import { type Route } from '../types';
import type { Giveaway, ActiveGiveaway } from '../types/giveaway';
import { User } from '../firebase/types/user';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { giveawaysData, userNftStatus } from '../constants';
import ProfileRankBanner from '../components/badges/ProfileRankBanner';
import { getRankData } from '../utils/rankUtils';
import { auth } from '../firebase/config';
import { getUserData } from '../firebase/services/userService';
import PostGiveawayModal from '../components/PostGiveawayModal';
import { getAllActiveGiveaways, getUserActiveGiveaways, updateGiveawayStatus, addParticipant } from '../firebase/services/activeGiveawayService';
import { getUserGiveawayRequests } from '../firebase/services/giveawayRequestService';

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[80px]"
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
      className="absolute w-[400px] h-[400px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        top: '20%',
        right: '15%'
      }}
      animate={{
        x: [0, -40, 30, -20, 0],
        y: [0, 40, -30, 20, 0],
        scale: [1, 0.9, 1.1, 0.95, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
    <motion.div
      className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
        bottom: '10%',
        left: '20%'
      }}
      animate={{
        x: [0, 30, -40, 25, 0],
        y: [0, -30, 40, -15, 0],
        scale: [1, 1.05, 0.9, 1.1, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
    />
  </div>
);

// FIX: Added interface for GiveawayCard props and used explicitly defined Giveaway type from types.ts
interface GiveawayCardProps {
    giveaway: ActiveGiveaway;
    isEligible: boolean;
    currentUser: User | null;
    navigate: (route: Route) => void;
    onAutoClosed?: () => void;
}

// FIX: Explicitly defined GiveawayCard as React.FC to handle React-reserved props like 'key' when used in lists and resolve assignment error.
const GiveawayCard: React.FC<GiveawayCardProps> = ({ giveaway, isEligible, currentUser, navigate, onAutoClosed }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [hasEntered, setHasEntered] = useState(false);
    const [isEntering, setIsEntering] = useState(false);
    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const isCreator = currentUser?.uid === giveaway.userId;
    
    // Check if current user has already participated
    const hasParticipated = currentUser ? giveaway.participants.some(p => p.id === currentUser.uid) : false;

    useEffect(() => {
        const timer = setInterval(() => {
            const end = new Date(giveaway.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft("ENDED");
                
                // Auto-close the giveaway if it's still active and hasn't been auto-closed yet
                if (giveaway.status === 'active' && giveaway.id && !hasAutoClosed) {
                    setHasAutoClosed(true);
                    updateGiveawayStatus(giveaway.id, 'closed')
                        .then(() => {
                            console.log(`Giveaway ${giveaway.id} automatically closed`);
                            // Trigger refresh in parent component
                            if (onAutoClosed) {
                                onAutoClosed();
                            }
                        })
                        .catch((error) => {
                            console.error('Error auto-closing giveaway:', error);
                        });
                }
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                if (days > 0) setTimeLeft(`${days}d ${hours}h`);
                else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [giveaway.endTime, giveaway.id, giveaway.status, hasAutoClosed]);

    const handleParticipate = async () => {
        if (!currentUser || !giveaway.id) return;
        
        setIsEntering(true);
        
        try {
            // Store participant data
            await addParticipant(
                giveaway.id,
                currentUser.uid,
                currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                currentUser.email || ''
            );
            
            // Format WhatsApp number (remove spaces, ensure it starts with country code)
            const formattedNumber = giveaway.whatsappNumber.replace(/\s+/g, '').replace(/^0/, '92');
            
            // Create custom message for this giveaway
            const message = `Hi! I'm interested in participating in the *${giveaway.title}* giveaway.%0A%0A` +
                `Please confirm my participation. Thank you! \ud83d\ude80`;
            
            // Open WhatsApp with pre-filled message
            const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');

            window.location.reload(); // Refresh to update participation status
            
            setTimeout(() => {
                setHasEntered(true);
                setIsEntering(false);
            }, 1200);
        } catch (error) {
            console.error('Error participating in giveaway:', error);
            setIsEntering(false);
        }
    };

    const typeColors: Record<string, string> = {
        coins: "from-yellow-400 to-amber-600",
        nft: "from-purple-500 to-indigo-700",
        service: "from-blue-500 to-cyan-600"
    };

    const typeIcons: Record<string, any> = {
        coins: <Coins className="text-yellow-500" />,
        nft: <Trophy className="text-purple-500" />,
        service: <Zap className="text-blue-500" />
    };

    return (
        <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="rounded-[40px] glass-panel shadow-2xl h-full flex flex-col overflow-hidden bg-[--color-card] border-0">
                <div className={`h-2 w-full bg-gradient-to-r ${typeColors[giveaway.type]}`} />

                <CardContent className="pt-10 px-8 pb-8 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-[--color-bg-tertiary] flex items-center justify-center border border-[--color-border] shadow-inner`}>
                            {React.cloneElement(typeIcons[giveaway.type], { size: 28 })}
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="mb-2 font-black border-2 border-green-500/30 text-green-500 animate-pulse">LIVE NOW</Badge>
                            <p className="text-[10px] font-black text-[--color-text-secondary] uppercase tracking-widest flex items-center justify-end gap-1">
                                <Clock size={10} /> {timeLeft}
                            </p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-semibold text-[--color-text-primary] mb-2 leading-tight group-hover:text-[--color-primary] transition-colors">{giveaway.title}</h3>
                    <p className="text-sm text-[--color-text-secondary] mb-8 font-medium opacity-80 leading-relaxed line-clamp-2">
                        {giveaway.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
                            <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">Pool size</p>
                            <p className="text-lg font-semibold text-[--color-text-primary]">
                                {giveaway.totalCoins > 0 ? `${giveaway.totalCoins} FOG` : giveaway.winnersCount + " Slots"}
                            </p>
                        </div>
                        <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
                            <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">Joined</p>
                            <p className="text-lg font-semibold text-[--color-text-primary]">{giveaway.totalParticipated.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <AnimatePresence mode="wait">
                            {isCreator ? (
                                <Button 
                                    className="w-full h-14 rounded-2xl font-black text-white shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600"
                                    onClick={() => navigate('manage-my-giveaways')}
                                >
                                    <Settings size={18} className="mr-2" /> Manage Giveaway
                                </Button>
                            ) : hasParticipated ? (
                                <Button 
                                    className="w-full h-14 rounded-2xl font-black text-white shadow-xl bg-gradient-to-r from-green-600 to-emerald-600"
                                    disabled
                                >
                                    <CheckCircle2 size={18} className="mr-2" /> Participated
                                </Button>
                            ) : hasEntered ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 py-4 bg-green-500/10 text-green-600 rounded-2xl border-2 border-green-500/20 font-black">
                                    <CheckCircle2 size={18} /> Entry Confirmed
                                </motion.div>
                            ) : (
                                <Button 
                                    className={`w-full h-14 rounded-2xl font-black text-white shadow-xl ${isEligible ? 'bg-[--color-primary]' : 'bg-slate-400 grayscale'}`}
                                    disabled={!isEligible || isEntering}
                                    onClick={handleParticipate}
                                >
                                    {isEntering ? 'Processing...' : isEligible ? 'Participate' : 'Ineligible'}
                                </Button>
                            )}
                        </AnimatePresence>
                        <p className="text-[10px] text-center mt-3 font-bold text-[--color-text-secondary] opacity-50 uppercase tracking-widest">
                            {hasParticipated ? 'Participated - Awaiting results' : `Requires: ${giveaway.requiredNft}`}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const GiveawaysPage = ({ navigate, currentUser }: { navigate: (route: Route) => void; currentUser: User | null }) => {
    const [userRank, setUserRank] = useState<number | null>(null);
    const [rankData, setRankData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [activeGiveaways, setActiveGiveaways] = useState<ActiveGiveaway[]>([]);
    const [loadingGiveaways, setLoadingGiveaways] = useState(true);
    
    // Validation states
    const [hasSubmittedRequests, setHasSubmittedRequests] = useState(false);
    const [hasPendingRequests, setHasPendingRequests] = useState(false);
    const [hasActiveNfts, setHasActiveNfts] = useState(false);
    const [checkingValidation, setCheckingValidation] = useState(true);

    // Fetch active giveaways from Firebase
    const fetchGiveaways = async () => {
        try {
            setLoadingGiveaways(true);
            const giveaways = await getAllActiveGiveaways();
            // Only show active giveaways (not paused or closed)
            const activeOnly = giveaways.filter(g => g.status === 'active');
            setActiveGiveaways(activeOnly);
        } catch (error) {
            console.error('Error fetching active giveaways:', error);
        } finally {
            setLoadingGiveaways(false);
        }
    };

    useEffect(() => {
        fetchGiveaways();
    }, []);

    // Fetch actual user rank from Firebase
    useEffect(() => {
        const fetchUserRank = async () => {
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userData = await getUserData(currentUser.uid);
                    if (userData && typeof userData.rank === 'number') {
                        setUserRank(userData.rank);
                        const data = getRankData(userData.rank);
                        setRankData(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching user rank:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserRank();
    }, []);

    // Check user's giveaway validation status
    useEffect(() => {
        const checkUserGiveaways = async () => {
            if (!auth.currentUser) {
                setCheckingValidation(false);
                return;
            }

            try {
                setCheckingValidation(true);
                
                // Check if user has submitted any requests
                const userRequests = await getUserGiveawayRequests(auth.currentUser.uid);
                setHasSubmittedRequests(userRequests.length > 0);
                
                // Check if user has any pending requests
                const pendingRequests = userRequests.filter(r => r.status === 'pending');
                setHasPendingRequests(pendingRequests.length > 0);
                
                // Check if user has any active NFTs/giveaways
                const userActiveGiveaways = await getUserActiveGiveaways(auth.currentUser.uid);
                setHasActiveNfts(userActiveGiveaways.length > 0);
                
            } catch (error) {
                console.error('Error checking user giveaways:', error);
            } finally {
                setCheckingValidation(false);
            }
        };

        checkUserGiveaways();
    }, []);

    // Logic to check eligibility based on constants
    const userMeetsCriteria = (required: string) => {
        if (required === "Any Fogsly NFT") return userNftStatus.hasNft;
        if (required === "Level_1_to_307") return userNftStatus.hasNft && parseInt(userNftStatus.level) >= 1;
        return userNftStatus.nftType === required;
    };

    const handlePostGiveaway = () => {
        if (!currentUser) {
            // Redirect to auth if not logged in
            navigate('auth');
            return;
        }
        setShowPostModal(true);
    };

    return (
        <div className="min-h-screen relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <AnimatedBackground />

            <div className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    {/* Back Button */}
                    <motion.div
                        className="absolute top-6 left-6 z-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm backdrop-blur-[20px] hover:scale-105 transition-all duration-300 shadow-lg"
                            style={{
                                backgroundColor: 'var(--color-card)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Home</span>
                        </button>
                    </motion.div>

                    <div className="max-w-6xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-7 py-3 backdrop-blur-[20px] rounded-full text-sm font-semibold mb-3 md:mb-8 shadow-sm"
                            style={{
                                backgroundColor: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-primary)'
                            }}
                        >
                            🎁 Community Rewards
                        </motion.div>

                        <motion.h1
                            className="text-6xl md:text-7xl font-black mb-3 md:mb-7 leading-tight"
                            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Fogsly Giveaways
                        </motion.h1>

                        <motion.p
                            className="text-xl max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Exclusive decentralized rewards for the Fogsly community. Participate in multiple drops for tokens, NFTs, and elite service passes.
                        </motion.p>
                    </div>
                </section>

                <div className="container mx-auto px-4 pb-32">
                <div className="grid lg:grid-cols-12 gap-10">
                    
                    {/* Main Giveaway Grid */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-4 mb-8 flex-wrap">
                            <h2 className="text-4xl font-black tracking-tighter text-[--color-text-primary]">Active Drops</h2>
                            <div className="h-px flex-1 bg-[--color-border] opacity-50" />
                            <Badge variant="default" className="px-4 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white border-0">
                                {loadingGiveaways ? '...' : activeGiveaways.length} Live
                            </Badge>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                {/* Post Giveaway Button - Hidden if user has pending requests */}
                                {!hasPendingRequests && (
                                    <Button
                                        onClick={handlePostGiveaway}
                                        className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-bold bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        Post Giveaway
                                    </Button>
                                )}
                                
                                {/* My Requests Button - Only show if user has submitted any requests */}
                                {currentUser && hasSubmittedRequests && (
                                    <Button
                                        onClick={() => navigate('my-giveaway-requests')}
                                        variant="outline"
                                        className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-bold border-2 border-[--color-border] hover:border-[--color-primary] transition-all"
                                    >
                                        <ListChecks size={18} className="mr-2" />
                                        My Requests
                                    </Button>
                                )}
                                
                                {/* Manage Giveaways Button - Only show if user has active NFTs */}
                                {currentUser && hasActiveNfts && (
                                    <Button
                                        onClick={() => navigate('manage-my-giveaways')}
                                        variant="outline"
                                        className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-bold border-2 border-[--color-border] hover:border-[--color-primary] transition-all"
                                    >
                                        <Settings size={18} className="mr-2" />
                                        Manage
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {loadingGiveaways ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary]"></div>
                            </div>
                        ) : activeGiveaways.length === 0 ? (
                            <div className="text-center py-20 bg-[--color-card] rounded-3xl border border-[--color-border]">
                                <Gift size={64} className="mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
                                <h3 className="text-2xl font-bold text-[--color-text-primary] mb-2">No Active Giveaways</h3>
                                <p className="text-[--color-text-secondary]">Check back soon for new drops!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {activeGiveaways.map(giveaway => (
                                    <GiveawayCard 
                                        key={giveaway.id} 
                                        giveaway={giveaway} 
                                        isEligible={userMeetsCriteria(giveaway.requiredNft)} 
                                        currentUser={currentUser}
                                        navigate={navigate}
                                        onAutoClosed={fetchGiveaways}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Permanent Eligibility Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-28 space-y-8 mt-[76px]">
                            <Card className="rounded-[48px] border-4 border-[--color-primary] bg-[--color-card] shadow-3xl overflow-hidden">
                                <CardHeader className="bg-[--color-bg-tertiary] p-10 border-b border-[--color-border] text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] mx-auto mb-6 flex items-center justify-center text-white shadow-2xl rotate-3">
                                        <ShieldCheck size={40} />
                                    </div>
                                    <CardTitle className="text-3xl font-semibold tracking-tighter">Your Status</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    {/* Dynamic User Badge */}
                                    <div className="flex justify-center mt-12">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
                                            </div>
                                        ) : rankData && userRank !== null && userRank !== undefined ? (
                                            <ProfileRankBanner
                                                rank={userRank}
                                                tier={rankData.tier}
                                                label={rankData.label}
                                            />
                                        ) : userRank === 0 ? (
                                            <ProfileRankBanner
                                                rank={0}
                                                tier="founder"
                                                label="FOGSLY FOUNDER"
                                            />
                                        ) : (
                                            <p className="text-sm text-[--color-text-secondary]">No rank data available</p>
                                        )}
                                    </div>

                                    {/* Hidden Section - Ecosystem Level, Winning Odds, Max Level */}
                                    {/* <div className="pt-6 border-t border-[--color-border]">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-[--color-text-secondary] uppercase tracking-widest mb-1 opacity-50">Ecosystem Level</p>
                                                <h4 className="text-4xl font-black text-[--color-text-primary] leading-none">{userNftStatus.level}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Winning Odds</p>
                                                <h4 className="text-3xl font-black text-orange-500 leading-none">3.5x</h4>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-[--color-bg-tertiary] rounded-full overflow-hidden shadow-inner border border-[--color-border]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-[--color-primary] via-[--color-accent] to-indigo-500"
                                            />
                                        </div>
                                        <p className="text-xs text-[--color-text-secondary] font-bold mt-4 text-center">Max Level Achieved — Elite Rewards Unlocked</p>
                                    </div> */}

                                    <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black text-sm group" onClick={() => navigate('profile')}>
                                        View Profile Stats <Sparkles size={16} className="ml-2 group-hover:scale-125 transition-transform text-yellow-500"/>
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="p-10 rounded-[48px] bg-slate-900 text-white shadow-3xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('referrals')}>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <PartyPopper size={32} className="mb-6 text-blue-400 group-hover:rotate-12 transition-transform" />
                                <h4 className="text-2xl font-semibold mb-2 tracking-tighter">Invite & Earn Rewards</h4>
                                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Build your network and unlock exclusive benefits. Earn bonus entries and rewards for every successful referral.</p>
                                <Button className="w-full h-12 rounded-xl bg-white text-slate-950 font-semibold hover:bg-blue-50 transition-colors">Start Referring</Button>
                            </div>
                        </div>
                    </div>

                </div>
                </div>
            </div>

            {/* Post Giveaway Modal */}
            {currentUser && (
                <PostGiveawayModal
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default GiveawaysPage;