import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Star, MessageSquare, ExternalLink, ArrowRight, UserPlus, UserCheck } from 'lucide-react';
import { ApprovedBrand } from '../firebase/hooks/useApprovedBrands';
import { type Route } from '../types';
import { followBrand, unfollowBrand, isFollowingBrand } from '../firebase/services/brandService';
import { useAuth } from '../firebase/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ApprovedBrandCardProps {
    brand: ApprovedBrand;
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
    index?: number;
}

const ApprovedBrandCard = ({ brand, navigate, index = 0 }: ApprovedBrandCardProps) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [followerCount, setFollowerCount] = useState(brand.stats?.followers || 0);

    // Check if user is following this brand
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (user) {
                const following = await isFollowingBrand(brand.id, user.uid);
                setIsFollowing(following);
            }
        };
        checkFollowStatus();
    }, [brand.id, user]);

    const handleViewBrand = () => {
        navigate('fog-service-brand', brand.id, { name: brand.brandName });
    };

    const handleMessageBrand = () => {
        navigate('message-brand', { brandId: brand.id });
    };

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            toast.error('Please login to follow brands');
            navigate('auth');
            return;
        }

        setIsLoadingFollow(true);
        try {
            if (isFollowing) {
                await unfollowBrand(brand.id, user.uid);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
                toast.success(`Unfollowed ${brand.brandName}`);
            } else {
                await followBrand(brand.id, user.uid);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
                toast.success(`Following ${brand.brandName}`);
            }
        } catch (error) {
            console.error('Follow toggle error:', error);
            toast.error('Failed to update follow status');
        } finally {
            setIsLoadingFollow(false);
        }
    };

    // Demo services for now - will be replaced with actual services later
    const demoServices = [
        { id: 1, title: 'Logo Design', price: 5000, currency: 'PKR' },
        { id: 2, title: 'Brand Identity', price: 15000, currency: 'PKR' },
        { id: 3, title: 'Web Design', price: 25000, currency: 'PKR' }
    ];

    return (
        <>
            <motion.div whileHover={{ y: -5 }} className="h-full">
                <Card className="overflow-hidden group h-full flex flex-col cursor-pointer bg-[--color-card] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300 border border-[--color-border] hover:border-[--color-primary]/50 relative" onClick={handleViewBrand}>
                    {/* Follow Button - Positioned Absolutely in Top Right */}
                    <motion.div
                        className="absolute top-3 right-3 z-10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant={isFollowing ? "default" : "outline"}
                            size="sm"
                            onClick={handleFollowToggle}
                            disabled={isLoadingFollow}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                transition-all duration-300 shadow-lg
                                ${isFollowing
                                    ? 'bg-[--color-primary] text-white hover:bg-red-500 hover:text-white border-[--color-primary]'
                                    : 'bg-white/95 dark:bg-gray-800/95 text-[--color-text-primary] hover:bg-[--color-primary] hover:text-white hover:border-[--color-primary] border-[--color-border]'
                                }
                            `}
                        >
                            {isLoadingFollow ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Wait...</span>
                                </>
                            ) : isFollowing ? (
                                <>
                                    <UserCheck size={14} />
                                    <span className="hidden sm:inline group-hover:hidden">Followed</span>
                                    <span className="hidden group-hover:inline">Unfollow</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={14} />
                                    <span className="hidden sm:inline">Follow</span>
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Follower Count Badge */}
                    {/* {followerCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="absolute top-3 left-3 z-10 text-xs px-2 py-0.5 bg-white/90 backdrop-blur-sm shadow-sm"
                        >
                            <UserCheck size={12} className="mr-1" />
                            {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
                        </Badge>
                    )} */}

                    <CardContent className="p-3 md:p-4 pt-8 md:pt-10 pb-3 md:pb-3 flex-grow flex flex-col text-center items-center justify-between min-h-[280px] md:min-h-[320px]">
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <div>
                                {brand.logoUrl ? (
                                    <img
                                        src={brand.logoUrl}
                                        alt={`${brand.brandName} logo`}
                                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-[--color-border]"
                                    />
                                ) : (
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-primary]/80 flex items-center justify-center text-white font-bold text-lg md:text-xl">
                                        {brand.brandName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <h3
                                className="font-bold text-base md:text-xl mt-2 md:mt-3 w-full text-[--color-text-primary] overflow-hidden"
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: '1.25rem',
                                    maxHeight: '2.5rem',
                                }}
                                title={brand.brandName}
                            >
                                {brand.brandName}
                            </h3>

                            <p className="text-[--color-text-secondary] text-xs md:text-sm mt-1 md:mt-2 line-clamp-2">
                                {brand.tagline}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-3 md:mt-4 w-full group-hover:bg-[--color-primary] group-hover:text-white group-hover:border-[--color-primary] transition-colors text-xs md:text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewBrand();
                            }}
                        >
                            View Services <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2nd layout */}
            {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="h-full"
            >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-[--color-border] bg-[--color-card]">
                    <CardContent className="p-6 pt-6">

                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                                {brand.logoUrl ? (
                                    <img
                                        src={brand.logoUrl}
                                        alt={`${brand.brandName} logo`}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-[--color-border]"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-primary]/80 flex items-center justify-center text-white font-bold text-xl">
                                        {brand.brandName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-[--color-text-primary] truncate">
                                    {brand.brandName}
                                </h3>
                                <p className="text-sm text-[--color-text-secondary] line-clamp-2">
                                    {brand.tagline}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium text-[--color-text-primary]">
                                        {brand.stats.rating || 5.0}
                                    </span>
                                    <span className="text-xs text-[--color-text-secondary]">
                                        ({brand.stats.reviews || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-wrap gap-1 mb-4">
                            {brand.categories.slice(0, 3).map((category) => (
                                <Badge
                                    key={category}
                                    variant="secondary"
                                    className="text-xs px-2 py-1"
                                >
                                    {category}
                                </Badge>
                            ))}
                            {brand.categories.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                    +{brand.categories.length - 3}
                                </Badge>
                            )}
                        </div>


                        <div className="space-y-2 mb-4">
                            <h4 className="text-sm font-semibold text-[--color-text-primary]">
                                Popular Services:
                            </h4>
                            <div className="space-y-1">
                                {demoServices.slice(0, 2).map((service) => (
                                    <div key={service.id} className="flex justify-between items-center text-sm">
                                        <span className="text-[--color-text-secondary] truncate flex-1">
                                            {service.title}
                                        </span>
                                        <span className="font-medium text-[--color-primary] ml-2">
                                            {service.currency} {service.price.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-[--color-border]">
                            <div className="text-center">
                                <div className="text-lg font-bold text-[--color-text-primary]">
                                    {brand.stats.totalOrders || 0}
                                </div>
                                <div className="text-xs text-[--color-text-secondary]">Orders</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-[--color-text-primary]">
                                    {Math.floor(Math.random() * 50) + 10}
                                </div>
                                <div className="text-xs text-[--color-text-secondary]">Services</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-[--color-text-primary]">
                                    {Math.floor(Math.random() * 100) + 95}%
                                </div>
                                <div className="text-xs text-[--color-text-secondary]">Rating</div>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMessageBrand}
                                className="flex items-center gap-1"
                            >
                                <MessageSquare size={14} />
                                Message
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleViewBrand}
                                className="flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                View Brand
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div> */}
        </>
    );
};

export default ApprovedBrandCard;