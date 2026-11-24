import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Alert } from '../../ui/Alert';
import Modal from '../../ui/Modal';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  Calendar,
  User,
  Building2,
  MapPin,
  Globe,
  Settings,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  Zap,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  getAllBrandRequests, 
  approveBrandRequest, 
  rejectBrandRequest, 
  deleteBrandRequest,
  getBrandRequestStats,
  toggleBrandFreeze,
  getAllBrands
} from '../../../firebase/services/brandService';
import { getAllBrandServices, getBrandServicesStats, toggleServiceFreeze, toggleServiceSoldOut, deleteBrandService } from '../../../firebase/services/brandServiceService';
import { BrandRequest, Brand } from '../../../firebase/types/brand';
import { BrandService } from '../../../firebase/types/service';
import { toast } from 'react-hot-toast';

export default function BrandManagementView() {
  const [activeTab, setActiveTab] = useState<'requests' | 'brands' | 'services'>('requests');
  const [requests, setRequests] = useState<BrandRequest[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<BrandService[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brandsCurrentPage, setBrandsCurrentPage] = useState(1);
  const [servicesCurrentPage, setServicesCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<BrandRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [freezingBrandId, setFreezingBrandId] = useState<string | null>(null);
  const [freezingServiceId, setFreezingServiceId] = useState<string | null>(null);
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [servicesStats, setServicesStats] = useState({
    total: 0,
    active: 0,
    frozen: 0
  });

  const pageSize = 10;

  useEffect(() => {
    fetchRequests();
    fetchStats();
    if (activeTab === 'brands') {
      fetchBrands();
    }
    if (activeTab === 'services') {
      fetchServices();
      fetchServicesStats();
    }
  }, [currentPage, statusFilter, searchTerm, activeTab]);

  const fetchStats = async () => {
    try {
      const requestStats = await getBrandRequestStats();
      setStats(requestStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const result = await getAllBrandServices();
      setServices(result.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchBrands = async () => {
    setBrandsLoading(true);
    try {
      const fetchedBrands = await getAllBrands();
      setBrands(fetchedBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setBrandsLoading(false);
    }
  };

  const fetchServicesStats = async () => {
    try {
      const stats = await getBrandServicesStats();
      setServicesStats(stats);
    } catch (error) {
      console.error('Error fetching services stats:', error);
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, currentStatus: string) => {
    setFreezingServiceId(serviceId);
    try {
      const shouldFreeze = currentStatus === 'active';
      const result = await toggleServiceFreeze(serviceId, shouldFreeze);
      
      if (result.success) {
        toast.success(`Service ${shouldFreeze ? 'frozen' : 'unfrozen'} successfully`);
        // Refresh services after status change
        await fetchServices();
        await fetchServicesStats();
      } else {
        toast.error(result.error || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update service status');
    } finally {
      setFreezingServiceId(null);
    }
  };

  const handleToggleBrandFreeze = async (brandId: string, currentStatus: string) => {
    setFreezingBrandId(brandId);
    try {
      const shouldFreeze = currentStatus === 'active' || currentStatus === 'approved';
      const result = await toggleBrandFreeze(brandId, shouldFreeze);
      
      if (result.success) {
        toast.success(`Brand ${shouldFreeze ? 'frozen' : 'unfrozen'} successfully`);
        // Refresh brands after status change
        await fetchBrands();
        await fetchRequests();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to update brand status');
      }
    } catch (error) {
      console.error('Error toggling brand freeze:', error);
      toast.error('Failed to update brand status');
    } finally {
      setFreezingBrandId(null);
    }
  };

  const handleToggleServiceSoldOut = async (serviceId: string, currentSoldOut: boolean) => {
    try {
      const result = await toggleServiceSoldOut(serviceId, !currentSoldOut);
      
      if (result.success) {
        toast.success(`Service marked as ${!currentSoldOut ? 'sold out' : 'available'}`);
        // Refresh services after status change
        await fetchServices();
        await fetchServicesStats();
      } else {
        toast.error(result.error || 'Failed to update service sold out status');
      }
    } catch (error) {
      console.error('Error toggling service sold out:', error);
      toast.error('Failed to update service sold out status');
    }
  };

  const handleViewService = (serviceId: string) => {
    // TODO: Implement service detail view
    console.log('Viewing service:', serviceId);
  };

  const handleDeleteService = async (serviceId: string, userId: string) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    setFreezingServiceId(serviceId);
    try {
      const result = await deleteBrandService(serviceId, userId);
      
      if (result.success) {
        toast.success('Service deleted successfully');
        await fetchServices();
        await fetchServicesStats();
      } else {
        toast.error(result.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setFreezingServiceId(null);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await getAllBrandRequests(
        currentPage,
        pageSize,
        statusFilter === 'all' ? undefined : statusFilter,
        searchTerm || undefined
      );
      
      setRequests(result.requests);
      setTotalPages(Math.ceil(result.total / pageSize));
    } catch (error) {
      console.error('Error fetching brand requests:', error);
      toast.error('Failed to load brand requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const result = await approveBrandRequest(requestId, 'admin-user-id', adminComments);
      
      if (result.success) {
        toast.success('Brand request approved successfully');
        fetchRequests();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to approve brand request');
      }
    } catch (error) {
      console.error('Error approving brand:', error);
      toast.error('Failed to approve brand request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(selectedRequest.id);
    try {
      const result = await rejectBrandRequest(
        selectedRequest.id,
        'admin-user-id',
        rejectionReason.trim(),
        adminComments.trim(),
        allowResubmit
      );
      
      if (result.success) {
        toast.success(`Brand request rejected${!allowResubmit ? ' (permanent ban)' : ''}`);
        fetchRequests();
        fetchStats();
        setIsRejectModalOpen(false);
        setRejectionReason('');
        setAdminComments('');
        setAllowResubmit(true);
        setSelectedRequest(null);
      } else {
        toast.error(result.error || 'Failed to reject brand request');
      }
    } catch (error) {
      console.error('Error rejecting brand:', error);
      toast.error('Failed to reject brand request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this brand request? This action cannot be undone.')) {
      return;
    }

    setActionLoading(requestId);
    try {
      const result = await deleteBrandRequest(requestId);
      
      if (result.success) {
        toast.success('Brand request deleted successfully');
        await fetchRequests();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to delete brand request');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated services. This action cannot be undone.')) {
      return;
    }

    setFreezingBrandId(brandId);
    try {
      // Import and call deleteBrand from Firebase
      const { deleteBrand } = await import('../../../firebase/services/brandService');
      const result = await deleteBrand(brandId);
      
      if (result.success) {
        toast.success('Brand deleted successfully');
        await fetchBrands();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    } finally {
      setFreezingBrandId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const openViewModal = (request: BrandRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const openRejectModal = (request: BrandRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
    setRejectionReason('');
    setAdminComments('');
    setAllowResubmit(true);
  };

  const filteredRequests = requests.filter(request => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (searchTerm && !request.brandName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.userId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Pagination for Brands tab
  const brandsPerPage = 10;
  const totalBrandsPages = Math.ceil(brands.length / brandsPerPage);
  const brandStartIndex = (brandsCurrentPage - 1) * brandsPerPage;
  const brandEndIndex = brandStartIndex + brandsPerPage;
  const currentBrands = brands.slice(brandStartIndex, brandEndIndex);

  // Pagination for Services tab
  const servicesPerPage = 10;
  const totalServicesPages = Math.ceil(services.length / servicesPerPage);
  const serviceStartIndex = (servicesCurrentPage - 1) * servicesPerPage;
  const serviceEndIndex = serviceStartIndex + servicesPerPage;
  const currentServices = services.slice(serviceStartIndex, serviceEndIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Management</h1>
          <p className="text-slate-400">Manage brand requests, approvals, and services</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => {
              console.log('Switching to requests tab');
              setActiveTab('requests');
            }}
            className="border-slate-600"
          >
            Brand Requests ({stats.total})
          </Button>
          <Button
            variant={activeTab === 'brands' ? 'default' : 'outline'}
            onClick={() => {
              console.log('Switching to brands tab');
              setActiveTab('brands');
            }}
            className="border-slate-600"
          >
            Approved Brands ({brands.length})
          </Button>
          <Button
            variant={activeTab === 'services' ? 'default' : 'outline'}
            onClick={() => {
              console.log('Switching to services tab');
              setActiveTab('services');
            }}
            className="border-slate-600"
          >
            Brand Services ({services.length})
          </Button>
        </div>
      </div>

      {/* Debug indicator */}
      <div className="text-center py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm">
          🔍 <strong>Current Tab:</strong> {activeTab === 'requests' ? 'Brand Requests' : activeTab === 'brands' ? 'Approved Brands' : 'Brand Services'}
        </p>
      </div>

      {activeTab === 'requests' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
            <CardHeader className=" space-y-0 ">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Requests</CardTitle>
              <div className="text-3xl font-bold text-white">{stats.pending}</div>
            </CardHeader>
            <CardContent className=' py-0'>
              <Clock className="h-6 w-6 text-yellow-400" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
            <CardHeader className=" space-y-0 ">
              <CardTitle className="text-sm font-medium text-gray-300">Approved Requests</CardTitle>
              <div className="text-3xl font-bold text-white">{stats.approved}</div>
            </CardHeader>
            <CardContent className=' py-0'>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
            <CardHeader className="space-y-0">
              <CardTitle className="text-sm font-medium text-gray-300">Rejected Requests</CardTitle>
              <div className="text-3xl font-bold text-white">{stats.rejected}</div>
            </CardHeader>
            <CardContent className=' py-0'>
              <XCircle className="h-6 w-6 text-red-400" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by brand name or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className="border-slate-600"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className="border-slate-600"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
                className="border-slate-600"
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
                className="border-slate-600"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Requests Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Brand Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No brand requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">Brand</th>
                    {/* <th className="text-left py-3 px-2 text-slate-300 font-medium">User</th> */}
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">Submitted</th>
                    <th className="text-right py-3 px-2 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {request.logoUrl ? (
                            <img
                              src={request.logoUrl}
                              alt="Logo"
                              className="w-10 h-10 rounded-full object-cover border border-slate-600"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-300">
                              {request.brandName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{request.brandName}</div>
                            <div className="text-sm text-slate-400">{request.tagline}</div>
                          </div>
                        </div>
                      </td>
                      {/* <td className="py-3 px-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{request.userId}</span>
                        </div>
                      </td> */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{request.createdAt.toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(request)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={actionLoading === request.id}
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRejectModal(request)}
                                disabled={actionLoading === request.id}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="text-green-400 hover:text-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            disabled={actionLoading === request.id}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-slate-600 text-slate-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-slate-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {activeTab === 'brands' && (
        <>
          {/* Brands Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Approved Brands ({brands.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No approved brands found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Brand</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Categories</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Stats</th>
                        <th className="text-right py-3 px-2 text-slate-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBrands.map((brand) => (
                        <motion.tr
                          key={brand.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              {brand.logoUrl ? (
                                <img
                                  src={brand.logoUrl}
                                  alt="Logo"
                                  className="w-10 h-10 rounded-full object-cover border border-slate-600"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-300">
                                  {brand.brandName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-white">{brand.brandName}</div>
                                <div className="text-sm text-slate-400">{brand.tagline}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1">
                              {brand.categories.map((cat, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge 
                              variant={brand.status === 'frozen' ? 'destructive' : 'success'}
                            >
                              {brand.status === 'frozen' ? 'Frozen' : 'Active'}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm text-slate-300">
                              <div>Orders: {brand.stats.totalOrders}</div>
                              <div>Rating: {brand.stats.rating.toFixed(1)} ⭐</div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleBrandFreeze(brand.id, brand.status)}
                                disabled={freezingBrandId === brand.id}
                                className={brand.status === 'frozen' ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'}
                                title={brand.status === 'frozen' ? 'Unfreeze brand' : 'Freeze brand'}
                              >
                                {freezingBrandId === brand.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : brand.status === 'frozen' ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* Navigate to brand detail view */}}
                                className="text-slate-400 hover:text-white"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBrand(brand.id)}
                                disabled={freezingBrandId === brand.id}
                                className="text-red-400 hover:text-red-300"
                                title="Delete brand"
                              >
                                {freezingBrandId === brand.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Brands */}
              {!brandsLoading && brands.length > 0 && totalBrandsPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBrandsCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={brandsCurrentPage === 1}
                      className="border-slate-600 text-slate-300"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBrandsCurrentPage(prev => Math.min(prev + 1, totalBrandsPages))}
                      disabled={brandsCurrentPage === totalBrandsPages}
                      className="border-slate-600 text-slate-300"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Showing <span className="font-medium text-white">{brandStartIndex + 1}</span> to{' '}
                        <span className="font-medium text-white">{Math.min(brandEndIndex, brands.length)}</span> of{' '}
                        <span className="font-medium text-white">{brands.length}</span> brands
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBrandsCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={brandsCurrentPage === 1}
                          className="border-slate-600 text-slate-300 rounded-l-md"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: totalBrandsPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalBrandsPages ||
                            (page >= brandsCurrentPage - 1 && page <= brandsCurrentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={brandsCurrentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setBrandsCurrentPage(page)}
                                className={brandsCurrentPage === page 
                                  ? '' 
                                  : 'border-slate-600 text-slate-300'
                                }
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === brandsCurrentPage - 2 || page === brandsCurrentPage + 2) {
                            return (
                              <span key={page} className="px-3 py-1 text-slate-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBrandsCurrentPage(prev => Math.min(prev + 1, totalBrandsPages))}
                          disabled={brandsCurrentPage === totalBrandsPages}
                          className="border-slate-600 text-slate-300 rounded-r-md"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'services' && (
        <>
          {/* Services Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
                <CardHeader className="space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Services</CardTitle>
                  <div className="text-3xl font-bold text-white">{servicesStats.total}</div>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="h-6 w-6 text-blue-400">📊</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
                <CardHeader className="space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Services</CardTitle>
                  <div className="text-3xl font-bold text-white">{servicesStats.active}</div>
                </CardHeader>
                <CardContent className="py-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="flex flex-row items-center justify-between bg-white/5 border-white/10">
                <CardHeader className="space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-300">Frozen Services</CardTitle>
                  <div className="text-3xl font-bold text-white">{servicesStats.frozen}</div>
                </CardHeader>
                <CardContent className="py-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Services Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Brand Services ({services.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No services found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Service</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Brand</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Price</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-slate-300 font-medium">Created</th>
                        <th className="text-right py-3 px-2 text-slate-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentServices.map((service) => (
                        <motion.tr
                          key={service.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              {service.mainImage ? (
                                <img
                                  src={service.mainImage}
                                  alt="Service"
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-600"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-300">
                                  {service.title.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-white">{service.title}</div>
                                <div className="text-sm text-slate-400 truncate max-w-[200px]">
                                  {service.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-white font-medium">{service.brandName}</div>
                            <div className="text-sm text-slate-400">{service.brandTagline}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-white font-medium">
                              {service.pricing.type === 'hourly' 
                                ? `PKR ${service.pricing.hourlyRate?.rate || 0}/hr`
                                : service.pricing.packages && service.pricing.packages.length > 0
                                  ? `PKR ${Math.min(...service.pricing.packages.map(p => p.price)).toLocaleString()}`
                                  : 'N/A'
                              }
                            </div>
                            <div className="text-sm text-slate-400">
                              {service.pricing.type === 'hourly' ? 'Hourly' : 'Fixed'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {service.status === 'active' ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                Frozen
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-white text-sm">
                              {service.createdAt.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewService(service.id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleServiceStatus(service.id, service.status)}
                                disabled={freezingServiceId === service.id}
                                className={service.status === 'frozen' 
                                  ? "text-green-400 hover:text-green-300" 
                                  : "text-yellow-400 hover:text-yellow-300"
                                }
                                title={service.status === 'frozen' ? 'Unfreeze Service' : 'Freeze Service'}
                              >
                                {freezingServiceId === service.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : service.status === 'frozen' ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleServiceSoldOut(service.id, service.soldOut)}
                                className={service.soldOut 
                                  ? "text-green-400 hover:text-green-300" 
                                  : "text-orange-400 hover:text-orange-300"
                                }
                                title={service.soldOut ? 'Mark as Available' : 'Mark as Sold Out'}
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteService(service.id, service.userId)}
                                disabled={freezingServiceId === service.id}
                                className="text-red-400 hover:text-red-300"
                                title="Delete Service"
                              >
                                {freezingServiceId === service.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Services */}
              {!servicesLoading && services.length > 0 && totalServicesPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServicesCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={servicesCurrentPage === 1}
                      className="border-slate-600 text-slate-300"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServicesCurrentPage(prev => Math.min(prev + 1, totalServicesPages))}
                      disabled={servicesCurrentPage === totalServicesPages}
                      className="border-slate-600 text-slate-300"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Showing <span className="font-medium text-white">{serviceStartIndex + 1}</span> to{' '}
                        <span className="font-medium text-white">{Math.min(serviceEndIndex, services.length)}</span> of{' '}
                        <span className="font-medium text-white">{services.length}</span> services
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setServicesCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={servicesCurrentPage === 1}
                          className="border-slate-600 text-slate-300 rounded-l-md"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: totalServicesPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalServicesPages ||
                            (page >= servicesCurrentPage - 1 && page <= servicesCurrentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={servicesCurrentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setServicesCurrentPage(page)}
                                className={servicesCurrentPage === page 
                                  ? '' 
                                  : 'border-slate-600 text-slate-300'
                                }
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === servicesCurrentPage - 2 || page === servicesCurrentPage + 2) {
                            return (
                              <span key={page} className="px-3 py-1 text-slate-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setServicesCurrentPage(prev => Math.min(prev + 1, totalServicesPages))}
                          disabled={servicesCurrentPage === totalServicesPages}
                          className="border-slate-600 text-slate-300 rounded-r-md"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* View Brand Request Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Brand Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedRequest.logoUrl ? (
                <img
                  src={selectedRequest.logoUrl}
                  alt="Brand logo"
                  className="w-16 h-16 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-xl font-medium text-slate-300">
                  {selectedRequest.brandName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedRequest.brandName}</h3>
                <p className="text-slate-400">{selectedRequest.tagline}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedRequest.status)}
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Description</Label>
                <p className="mt-1 p-3 bg-slate-700 rounded-lg text-slate-200">
                  {selectedRequest.tagline}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Submitted</Label>
                  <p className="mt-1 text-slate-200">{selectedRequest.createdAt.toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.whatsappChannel && (
                <div>
                  <Label className="text-slate-300">WhatsApp Channel</Label>
                  <a
                    href={selectedRequest.whatsappChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    View Channel <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {(selectedRequest.rejectionReason || selectedRequest.adminComments) && (
                <div>
                  <Label className="text-slate-300">
                    {selectedRequest.status === 'rejected' ? 'Rejection Reason' : 'Admin Comments'}
                  </Label>
                  <p className="mt-1 p-3 bg-slate-700 rounded-lg text-slate-200">
                    {selectedRequest.rejectionReason || selectedRequest.adminComments}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
              {selectedRequest.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openRejectModal(selectedRequest);
                    }}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Brand Request Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Brand Request"
      >
        <div className="space-y-4">
          <Alert type="warning">
            Are you sure you want to reject this brand request? This action will notify the user.
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason" className="text-slate-300">
              Rejection Reason *
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection..."
              rows={3}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-comments" className="text-slate-300">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="admin-comments"
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder="Any additional feedback or suggestions..."
              rows={2}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">
              Resubmission Policy
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="allow-resubmit"
                  name="resubmit"
                  checked={allowResubmit}
                  onChange={() => setAllowResubmit(true)}
                  className="text-blue-600"
                />
                <label htmlFor="allow-resubmit" className="text-slate-300 text-sm">
                  Allow user to resubmit brand request
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="permanent-ban"
                  name="resubmit"
                  checked={!allowResubmit}
                  onChange={() => setAllowResubmit(false)}
                  className="text-red-600"
                />
                <label htmlFor="permanent-ban" className="text-slate-300 text-sm">
                  Permanently ban user from creating brands (cannot resubmit)
                </label>
              </div>
            </div>
            {!allowResubmit && (
              <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  ⚠️ Warning: This will permanently prevent the user from creating brand requests. 
                  The "Make Brand" button will be hidden and the route will be restricted.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading === selectedRequest?.id || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === selectedRequest?.id 
                ? 'Processing...' 
                : allowResubmit 
                ? 'Reject Request' 
                : 'Reject & Ban User'
              }
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}