import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Briefcase,
    DollarSign,
    Star,
    User,
    ChevronLeft,
    ChevronRight,
    Award,
    TrendingUp,
    Lock,
    Unlock,
    RotateCcw
} from 'lucide-react';
import {
    getAllFreelanceRequests,
    updateFreelanceRequestStatus,
    getFreelanceRequestsByStatus,
    FreelanceRequest
} from '../../../firebase/services/freelanceRequests';
import {
    addApprovedFreelancer,
    ApprovedFreelancer,
    updateFreelancerStatus,
    getApprovedFreelancerByUserId
} from '../../../firebase/services/approvedFreelancers';
import FreelancerDetailsModal from '../FreelancerDetailsModal';
import { toast } from 'react-hot-toast';

const FreelanceManagementView = () => {
    const [requests, setRequests] = useState<FreelanceRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<FreelanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedRequest, setSelectedRequest] = useState<FreelanceRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [approvedFreelancersStatus, setApprovedFreelancersStatus] = useState<Record<string, 'active' | 'inactive'>>({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, searchTerm, statusFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const allRequests = await getAllFreelanceRequests();
            setRequests(allRequests);

            // Fetch approved freelancers status
            const statusMap: Record<string, 'active' | 'inactive'> = {};
            for (const request of allRequests.filter(r => r.requestStatus === 'approved')) {
                try {
                    const approvedFreelancer = await getApprovedFreelancerByUserId(request.userId);
                    if (approvedFreelancer) {
                        statusMap[request.userId] = approvedFreelancer.status;
                    }
                } catch (error) {
                    console.error(`Error fetching status for user ${request.userId}:`, error);
                }
            }
            setApprovedFreelancersStatus(statusMap);

            // Calculate stats
            const statsData = {
                total: allRequests.length,
                pending: allRequests.filter(r => r.requestStatus === 'pending').length,
                approved: allRequests.filter(r => r.requestStatus === 'approved').length,
                rejected: allRequests.filter(r => r.requestStatus === 'rejected').length
            };
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching freelance requests:', error);
            toast.error('Failed to load freelance requests');
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = requests;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.requestStatus === statusFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                request =>
                    request.fullName.toLowerCase().includes(lowerSearch) ||
                    request.userName.toLowerCase().includes(lowerSearch) ||
                    request.userEmail.toLowerCase().includes(lowerSearch) ||
                    request.title.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredRequests(filtered);
    };

    const handleApprove = async (requestId: string) => {
        if (!window.confirm('Are you sure you want to approve this freelancer request?')) {
            return;
        }

        try {
            setActionLoading(requestId);
            
            // Get the full request data
            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Prepare data for ApprovedFreelancers collection
            const approvedFreelancerData: Omit<ApprovedFreelancer, 'id' | 'approvedAt' | 'createdAt'> = {
                userId: request.userId,
                userEmail: request.userEmail,
                userName: request.userName,
                fullName: request.fullName,
                title: request.title,
                bio: request.bio,
                skills: request.skills,
                categories: request.categories,
                experience: request.experience as 'beginner' | 'intermediate' | 'expert',
                portfolioItems: request.portfolioItems,
                education: request.education,
                certifications: request.certifications,
                hourlyRate: request.hourlyRate,
                currency: request.currency as 'USD' | 'PKR',
                availability: request.availability,
                languages: request.languages,
                status: 'active', // Set status to active
                totalReviews: request.totalReviews,
                totalJobs: request.totalJobs,
                totalEarnings: request.totalEarnings,
                averageRating: request.averageRating
            };

            // Add to ApprovedFreelancers collection
            await addApprovedFreelancer(approvedFreelancerData);

            // Update the request status to approved
            await updateFreelanceRequestStatus(requestId, 'approved');

            toast.success('Freelancer approved and moved to active freelancers!');
            await fetchRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Failed to approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!window.confirm('Are you sure you want to reject this freelancer request?')) {
            return;
        }

        try {
            setActionLoading(requestId);
            await updateFreelanceRequestStatus(requestId, 'rejected');
            toast.success('Freelancer request rejected');
            await fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReApprove = async (requestId: string) => {
        if (!window.confirm('Are you sure you want to re-approve this freelancer request?')) {
            return;
        }

        try {
            setActionLoading(requestId);
            
            // Get the full request data
            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Check if already approved in ApprovedFreelancers
            const existingApproved = await getApprovedFreelancerByUserId(request.userId);
            
            if (!existingApproved) {
                // Prepare data for ApprovedFreelancers collection
                const approvedFreelancerData: Omit<ApprovedFreelancer, 'id' | 'approvedAt' | 'createdAt'> = {
                    userId: request.userId,
                    userEmail: request.userEmail,
                    userName: request.userName,
                    fullName: request.fullName,
                    title: request.title,
                    bio: request.bio,
                    skills: request.skills,
                    categories: request.categories,
                    experience: request.experience as 'beginner' | 'intermediate' | 'expert',
                    portfolioItems: request.portfolioItems,
                    education: request.education,
                    certifications: request.certifications,
                    hourlyRate: request.hourlyRate,
                    currency: request.currency as 'USD' | 'PKR',
                    availability: request.availability,
                    languages: request.languages,
                    status: 'active',
                    totalReviews: request.totalReviews,
                    totalJobs: request.totalJobs,
                    totalEarnings: request.totalEarnings,
                    averageRating: request.averageRating
                };

                await addApprovedFreelancer(approvedFreelancerData);
            }

            // Update the request status to approved
            await updateFreelanceRequestStatus(requestId, 'approved');

            toast.success('Freelancer re-approved successfully!');
            await fetchRequests();
        } catch (error) {
            console.error('Error re-approving request:', error);
            toast.error('Failed to re-approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleGigStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'active' ? 'activate' : 'pause';
        
        if (!window.confirm(`Are you sure you want to ${actionText} this freelancer's gig?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            
            // Get the approved freelancer by userId
            const approvedFreelancer = await getApprovedFreelancerByUserId(userId);
            
            if (!approvedFreelancer || !approvedFreelancer.id) {
                throw new Error('Approved freelancer not found');
            }

            await updateFreelancerStatus(approvedFreelancer.id, newStatus);
            
            toast.success(`Freelancer gig ${actionText}d successfully`);
            await fetchRequests();
        } catch (error) {
            console.error('Error toggling gig status:', error);
            toast.error('Failed to update gig status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewDetails = (request: FreelanceRequest) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    // Pagination
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusBadge = (status: string, userId?: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-500/20 text-yellow-600', icon: Clock },
            approved: { color: 'bg-green-500/20 text-green-600', icon: CheckCircle },
            rejected: { color: 'bg-red-500/20 text-red-600', icon: XCircle }
        };

        // If approved, check if the gig is paused
        if (status === 'approved' && userId && approvedFreelancersStatus[userId] === 'inactive') {
            return (
                <Badge className="bg-orange-500/20 text-orange-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    PAUSED
                </Badge>
            );
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status.toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Total Requests</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Pending</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.pending}</h3>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Approved</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.approved}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Rejected</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.rejected}</h3>
                            </div>
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Freelance Requests Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[--color-text-secondary] w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[--color-text-secondary] w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="pl-10 pr-8 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary] mx-auto"></div>
                            <p className="mt-4 text-[--color-text-secondary]">Loading requests...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 text-[--color-text-secondary] mx-auto mb-4" />
                            <p className="text-[--color-text-secondary]">No freelance requests found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-[--color-border]">
                                        <tr className="text-left">
                                            <th className="pb-3 font-semibold">Freelancer</th>
                                            <th className="pb-3 font-semibold">Title</th>
                                            <th className="pb-3 font-semibold">Rate</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRequests.map((request) => (
                                            <motion.tr
                                                key={request.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-[--color-border] hover:bg-[--color-bg-secondary] transition-colors"
                                            >
                                                <td className="py-4">
                                                    <div>
                                                        <p className="font-medium">{request.fullName}</p>
                                                        <p className="text-sm text-[--color-text-secondary]">
                                                            {request.userEmail}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-sm">{request.title}</p>
                                                    <p className="text-xs text-[--color-text-secondary] capitalize">
                                                        {request.experience} level
                                                    </p>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-green-500" />
                                                        <span className="font-medium">
                                                            {request.currency} {request.hourlyRate}/hr
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {getStatusBadge(request.requestStatus, request.userId)}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewDetails(request)}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        
                                                        {request.requestStatus === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(request.id!)}
                                                                    disabled={actionLoading === request.id}
                                                                    className="bg-green-500 hover:bg-green-600"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleReject(request.id!)}
                                                                    disabled={actionLoading === request.id}
                                                                    className="text-red-500 hover:bg-red-50 border-red-500"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        
                                                        {request.requestStatus === 'approved' && (
                                                            <>
                                                                {approvedFreelancersStatus[request.userId] && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleToggleGigStatus(
                                                                            request.userId, 
                                                                            approvedFreelancersStatus[request.userId]
                                                                        )}
                                                                        disabled={actionLoading === request.userId}
                                                                        className={`${
                                                                            approvedFreelancersStatus[request.userId] === 'active'
                                                                                ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                                                                                : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                                                        }`}
                                                                        title={approvedFreelancersStatus[request.userId] === 'active' ? 'Pause Gig' : 'Activate Gig'}
                                                                    >
                                                                        {approvedFreelancersStatus[request.userId] === 'active' ? (
                                                                            <Lock className="w-4 h-4" />
                                                                        ) : (
                                                                            <Unlock className="w-4 h-4" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {request.requestStatus === 'rejected' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReApprove(request.id!)}
                                                                disabled={actionLoading === request.id}
                                                                className="bg-blue-500 hover:bg-blue-600"
                                                                title="Re-approve"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-[--color-text-secondary]">
                                        Showing {indexOfFirstRequest + 1} to{' '}
                                        {Math.min(indexOfLastRequest, filteredRequests.length)} of{' '}
                                        {filteredRequests.length} requests
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <FreelancerDetailsModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedRequest(null);
                    }}
                />
            )}
        </div>
    );
};

export default FreelanceManagementView;
