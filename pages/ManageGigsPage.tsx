import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../firebase/hooks/useAuth';
import {
    getAllApprovedFreelancersByUserId,
    ApprovedFreelancer,
    updateFreelancerStatus,
    deleteApprovedFreelancer
} from '../firebase/services/approvedFreelancers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
    User,
    Mail,
    Briefcase,
    DollarSign,
    Star,
    TrendingUp,
    Eye,
    Loader,
    AlertCircle,
    Award,
    ArrowLeft,
    Edit,
    Pause,
    Play,
    Trash2,
    MoreVertical,
    CheckCircle,
    Clock
} from 'lucide-react';
import { type Route } from '../types';
import { toast } from 'react-hot-toast';

type TabType = 'active' | 'paused';

const ManageGigsPage = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
    const { user: currentUser } = useAuth();
    const [gigs, setGigs] = useState<ApprovedFreelancer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchGigsData();
    }, [currentUser]);

    const fetchGigsData = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const gigsData = await getAllApprovedFreelancersByUserId(currentUser.uid);
            setGigs(gigsData);
        } catch (error) {
            console.error('Error fetching gigs data:', error);
            toast.error('Failed to load gigs data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (gigId: string, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            setActionLoading(gigId);
            await updateFreelancerStatus(gigId, newStatus);

            // Update local state
            setGigs(prevGigs =>
                prevGigs.map(gig =>
                    gig.id === gigId ? { ...gig, status: newStatus } : gig
                )
            );

            toast.success(`Gig ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
        } catch (error) {
            console.error('Error toggling gig status:', error);
            toast.error('Failed to update gig status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteGig = async (gigId: string, gigTitle: string) => {
        if (!window.confirm(`Are you sure you want to delete "${gigTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setActionLoading(gigId);
            await deleteApprovedFreelancer(gigId);

            // Update local state
            setGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigId));

            toast.success('Gig deleted successfully');
        } catch (error) {
            console.error('Error deleting gig:', error);
            toast.error('Failed to delete gig');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditGig = (gigId: string) => {
        navigate('edit-gig', { gigId });
    };

    const handleOpenGig = (gig: ApprovedFreelancer) => {
        const slug = `${gig.title.toLowerCase().replace(/\s+/g, '-')}-${gig.id}`;
        navigate('gig-detail', { gigId: gig.id, slug });
    };

    // Filter gigs based on active tab
    const activeGigs = gigs.filter(gig => gig.status === 'active');
    const pausedGigs = gigs.filter(gig => gig.status === 'inactive');

    // Calculate collective stats from all gigs
    const totalEarnings = gigs.reduce((sum, gig) => sum + (gig.totalEarnings || 0), 0);
    const totalJobs = gigs.reduce((sum, gig) => sum + (gig.totalJobs || 0), 0);
    const totalReviews = gigs.reduce((sum, gig) => sum + (gig.totalReviews || 0), 0);
    const averageRating = gigs.length > 0 && totalReviews > 0
        ? gigs.reduce((sum, gig) => sum + ((gig.averageRating || 0) * (gig.totalReviews || 0)), 0) / totalReviews
        : 0;
    const activeGigsCount = activeGigs.length;

    // Get current display gigs based on tab
    const displayGigs = activeTab === 'active' ? activeGigs : pausedGigs;

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                        <p className="text-[--color-text-secondary] mb-6">
                            Please log in to manage your gigs.
                        </p>
                        <Button onClick={() => navigate('auth')} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-[--color-primary] mx-auto mb-4" />
                    <p className="text-[--color-text-secondary]">Loading your gigs...</p>
                </div>
            </div>
        );
    }

    if (gigs.length === 0) {
        return (
            <div className="min-h-screen bg-[--color-bg-primary]">
                <div className="container mx-auto px-4 py-12">
                    <Button
                        variant="outline"
                        onClick={() => navigate('find-work')}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Find Work
                    </Button>

                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="p-12 text-center">
                            <Briefcase className="w-20 h-20 text-[--color-text-secondary] mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-4">No Active Freelancer Profile</h2>
                            <p className="text-[--color-text-secondary] mb-4 text-lg">
                                You don't have any approved gigs yet.
                            </p>
                            <p className="text-[--color-text-secondary] mb-8">
                                Apply to become a freelancer to start managing your gigs.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={() => navigate('become-freelancer')}
                                    size="lg"
                                >
                                    <Briefcase className="w-6 h-6 mr-2" />
                                    Apply to Become a Freelancer
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('find-work')}
                                    size="lg"
                                >
                                    Browse Jobs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[--color-bg-primary]">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => navigate('find-work')}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Find Work
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* User Information Card */}
                    <Card className="border-2 border-[--color-border]">
                        <CardContent className="pt-6 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-[--color-primary] to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{currentUser.displayName || 'Freelancer'}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-[--color-text-secondary]" />
                                        <p className="text-lg text-[--color-text-secondary]">{currentUser.email}</p>
                                    </div>
                                    <Badge className="mt-2 bg-green-500/20 text-green-600">
                                        🟢 {activeGigsCount} Active Gig{activeGigsCount !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collective Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[--color-text-secondary]">Total Gigs</p>
                                        <h3 className="text-3xl font-bold mt-2">{gigs.length}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[--color-text-secondary]">Total Jobs</p>
                                        <h3 className="text-3xl font-bold mt-2">{totalJobs}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[--color-text-secondary]">Total Earnings</p>
                                        <h3 className="text-3xl font-bold mt-2">${totalEarnings.toLocaleString()}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[--color-text-secondary]">Avg Rating</p>
                                        <h3 className="text-3xl font-bold mt-2">
                                            {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                                            {averageRating > 0 && ' ⭐'}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                        <Star className="w-6 h-6 text-yellow-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Card className="mb-6">
                        <CardContent className="p-0">
                            <div className="flex border-b border-[--color-border]">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'active'
                                            ? 'text-[--color-primary] border-b-2 border-[--color-primary] bg-[--color-primary]/5'
                                            : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Active Gigs</span>
                                        <Badge className="bg-green-500/20 text-green-600 ml-2">
                                            {activeGigs.length}
                                        </Badge>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('paused')}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'paused'
                                            ? 'text-[--color-primary] border-b-2 border-[--color-primary] bg-[--color-primary]/5'
                                            : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>Paused Gigs</span>
                                        <Badge className="bg-gray-500/20 text-gray-600 ml-2">
                                            {pausedGigs.length}
                                        </Badge>
                                    </div>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gigs Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">
                                {activeTab === 'active' ? 'Active Gigs' : 'Paused Gigs'}
                            </h2>
                            {displayGigs.length === 0 && (
                                <p className="text-[--color-text-secondary]">
                                    {activeTab === 'active'
                                        ? 'No active gigs to display'
                                        : 'No paused gigs to display'}
                                </p>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {displayGigs.map((gig) => (
                                    <GigCard
                                        key={gig.id}
                                        gig={gig}
                                        onView={handleOpenGig}
                                        onEdit={handleEditGig}
                                        onToggleStatus={handleToggleStatus}
                                        onDelete={handleDeleteGig}
                                        isLoading={actionLoading === gig.id}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// GigCard Component with improved UI
interface GigCardProps {
    gig: ApprovedFreelancer;
    onView: (gig: ApprovedFreelancer) => void;
    onEdit: (gigId: string) => void;
    onToggleStatus: (gigId: string, currentStatus: 'active' | 'inactive') => void;
    onDelete: (gigId: string, gigTitle: string) => void;
    isLoading: boolean;
}

const GigCard: React.FC<GigCardProps> = ({
    gig,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
    isLoading
}) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
        >
            <Card className={`h-full hover:shadow-xl transition-all border-2 ${gig.status === 'active'
                    ? 'border-green-500/30 hover:border-green-500/50'
                    : 'border-gray-500/30 hover:border-gray-500/50'
                }`}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-xl truncate">{gig.title}</CardTitle>
                                <Badge className={`${gig.status === 'active'
                                        ? 'bg-green-500/20 text-green-600'
                                        : 'bg-gray-500/20 text-gray-600'
                                    } flex-shrink-0`}>
                                    {gig.status === 'active' ? '🟢 Active' : '⏸️ Paused'}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {gig.categories.slice(0, 2).map((category, index) => (
                                    <Badge key={index} className="bg-[--color-primary]/10 text-[--color-primary] text-xs">
                                        {category}
                                    </Badge>
                                ))}
                                {gig.categories.length > 2 && (
                                    <Badge className="bg-[--color-primary]/10 text-[--color-primary] text-xs">
                                        +{gig.categories.length - 2}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Actions Dropdown */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowActions(!showActions)}
                                className="ml-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="w-4 h-4" />
                                )}
                            </Button>

                            {showActions && !isLoading && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowActions(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[--color-bg-primary] border border-[--color-border] rounded-lg shadow-xl z-20 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                onEdit(gig.id!);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-[--color-bg-secondary] flex items-center gap-3 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-blue-500" />
                                            <span>Edit Gig</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onToggleStatus(gig.id!, gig.status);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-[--color-bg-secondary] flex items-center gap-3 transition-colors"
                                        >
                                            {gig.status === 'active' ? (
                                                <>
                                                    <Pause className="w-4 h-4 text-orange-500" />
                                                    <span>Pause Gig</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 text-green-500" />
                                                    <span>Activate Gig</span>
                                                </>
                                            )}
                                        </button>
                                        {/* <div className="border-t border-[--color-border]" /> */}
                                        <div />
                                        {/* <button
                                            onClick={() => {
                                                onDelete(gig.id!, gig.title);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-red-500/10 flex items-center gap-3 transition-colors text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Gig</span>
                                        </button> */}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-[--color-text-secondary] line-clamp-3 leading-relaxed">
                        {gig.bio}
                    </p>

                    {/* Gig Stats */}
                    <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-[--color-border]">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <p className="text-lg font-bold">
                                    {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : 'N/A'}
                                </p>
                            </div>
                            <p className="text-xs text-[--color-text-secondary]">Rating</p>
                        </div>
                        <div className="text-center border-l border-r border-[--color-border]">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                <p className="text-lg font-bold">{gig.totalJobs || 0}</p>
                            </div>
                            <p className="text-xs text-[--color-text-secondary]">Jobs</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Award className="w-4 h-4 text-purple-500" />
                                <p className="text-lg font-bold">{gig.totalReviews || 0}</p>
                            </div>
                            <p className="text-xs text-[--color-text-secondary]">Reviews</p>
                        </div>
                    </div>

                    {/* Rate */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-[--color-text-secondary]">Hourly Rate</span>
                        </div>
                        <span className="font-bold text-lg text-green-600">
                            {gig.currency} {gig.hourlyRate}/hr
                        </span>
                    </div>

                    {/* Skills Preview */}
                    <div>
                        <p className="text-xs text-[--color-text-secondary] mb-2 font-medium">Top Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {gig.skills.slice(0, 4).map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs py-1 !text-[--color-text-secondary]"
                                >
                                    {skill}
                                </Badge>
                            ))}

                            {gig.skills.length > 4 && (
                                <Badge
                                    variant="outline"
                                    className="text-xs py-1 !text-[--color-text-secondary]"
                                >
                                    +{gig.skills.length - 4} more
                                </Badge>
                            )}
                        </div>
                    </div>


                    {/* View Gig Button */}
                    <Button
                        onClick={() => onView(gig)}
                        className="w-full mt-4 bg-gradient-to-r from-[--color-primary] to-purple-600 hover:from-[--color-primary]/90 hover:to-purple-600/90"
                        disabled={isLoading}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Gig
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ManageGigsPage;
