import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  getAllWithdrawalRequests,
  updateWithdrawalStatus,
  getWithdrawalSettings
} from '../../../firebase/services/withdrawalService';
import { WithdrawalRequest, WithdrawalSettings } from '../../../firebase/types/withdrawals';
import { getUserProfile } from '../../../firebase/services/userService';
import { getFogCoinSettingsWithCache } from '../../../utils/fogCoinUtils';
import { FogCoinSettings } from '../../../firebase/types/fogCoinSettings';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  Building,
  Wallet,
  Eye,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface WithdrawalManagementViewProps {}

interface WithdrawalRequestWithUser extends WithdrawalRequest {
  userEmail?: string;
  userName?: string;
}

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
type SortField = 'requestedAt' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

const WithdrawalManagementView: React.FC<WithdrawalManagementViewProps> = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequestWithUser[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WithdrawalRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestWithUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [withdrawalSettings, setWithdrawalSettings] = useState<WithdrawalSettings | null>(null);
  const [fogCoinSettings, setFogCoinSettings] = useState<FogCoinSettings | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadWithdrawalData();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [withdrawalRequests, searchTerm, statusFilter, sortField, sortDirection]);

  const loadWithdrawalData = async () => {
    try {
      setLoading(true);
      
      const [allRequests, settings, fogSettings] = await Promise.all([
        getAllWithdrawalRequests(),
        getWithdrawalSettings(),
        getFogCoinSettingsWithCache()
      ]);
      
      // Fetch user details for each request
      const requestsWithUserData = await Promise.all(
        allRequests.map(async (request) => {
          try {
            const userProfile = await getUserProfile(request.userId);
            return {
              ...request,
              userEmail: userProfile?.email || 'N/A',
              userName: userProfile?.name || 'N/A'
            };
          } catch (error) {
            console.error(`Error fetching user profile for ${request.userId}:`, error);
            return {
              ...request,
              userEmail: 'N/A',
              userName: 'N/A'
            };
          }
        })
      );
      
      setWithdrawalRequests(requestsWithUserData);
      setWithdrawalSettings(settings);
      setFogCoinSettings(fogSettings);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...withdrawalRequests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.account.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'requestedAt':
          aValue = new Date(a.requestedAt).getTime();
          bValue = new Date(b.requestedAt).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const handleAction = async (request: WithdrawalRequestWithUser, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
    setRejectionReason('');
    setAdminNotes('');
    setTransactionId('');
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(selectedRequest.id);

      if (actionType === 'approve') {
        await updateWithdrawalStatus(
          selectedRequest.id,
          'completed',
          adminNotes || undefined,
          undefined,
          transactionId || undefined
        );
        toast.success('Withdrawal approved successfully');
      } else {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a rejection reason');
          return;
        }
        await updateWithdrawalStatus(
          selectedRequest.id,
          'rejected',
          adminNotes || undefined,
          rejectionReason
        );
        toast.success('Withdrawal rejected successfully');
      }

      setShowActionModal(false);
      await loadWithdrawalData();
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast.error('Failed to update withdrawal status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | any) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateId = (id: string, length: number = 8) => {
    return id.length > length ? `${id.slice(0, length)}...` : id;
  };

  const truncateBankName = (bankName: string) => {
    return bankName.split(' ')[0];
  };

  const truncateAccountNumber = (accountNumber: string, length: number = 6) => {
    return accountNumber.length > length ? `${accountNumber.slice(0, length)}...` : accountNumber;
  };

 const formatCurrency = (amount: number, currency: string) => {
    if (!fogCoinSettings) {
      // Fallback rates if fogCoinSettings not loaded
      if (currency === 'USD') {
        return `${amount} FOG ($${(amount * 0.1).toFixed(2)})`;
      } else {
        return `${amount} FOG (₨${(amount * 28).toFixed(2)})`;
      }
    }

    const usdValue = amount * fogCoinSettings.fogToUsdRate;
    
    if (currency === 'USD') {
      return `${amount} FOG ($${usdValue.toFixed(2)})`;
    } else {
      const pkrValue = usdValue * 280; // PKR rate as requested
      return `${amount} FOG (₨${pkrValue.toFixed(2)})`;
    }
};

  const stats = {
    total: withdrawalRequests.length,
    pending: withdrawalRequests.filter(r => r.status === 'pending').length,
    processing: withdrawalRequests.filter(r => r.status === 'processing').length,
    completed: withdrawalRequests.filter(r => r.status === 'completed').length,
    rejected: withdrawalRequests.filter(r => r.status === 'rejected').length,
    totalAmount: withdrawalRequests.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: withdrawalRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading withdrawal requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-gray-400 mt-1">Manage user withdrawal requests and settings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadWithdrawalData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Amount</p>
              <p className="text-lg font-bold text-yellow-500">{stats.pendingAmount} FOG</p>
            </div>
            <Wallet className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user ID, email, name, account details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="requestedAt-desc">Newest First</option>
              <option value="requestedAt-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="status-asc">Status A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            Withdrawal Requests ({filteredRequests.length})
          </h3>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No withdrawal requests found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Withdrawal requests will appear here once users make requests'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount & Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Account Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            {request.userName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {request.userEmail}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {truncateId(request.userId)} | Req: {truncateId(request.id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">
                        {formatCurrency(request.amount, request.currency)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {request.currency} withdrawal
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {request.account.type === 'PKR' ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Building className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{truncateBankName(request.account.bankName || '')}</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{truncateAccountNumber(request.account.accountNumber || '')}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {request.account.accountName ? `${request.account.accountName.split(' ')[0]}...` : 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Wallet className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{request.account.serviceName}</span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {request.account.walletAddress?.slice(0, 12)}...
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {formatDate(request.requestedAt)}
                      </div>
                      {request.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(request.processedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(request, 'approve')}
                              disabled={actionLoading === request.id}
                              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(request, 'reject')}
                              disabled={actionLoading === request.id}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDetailsModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Withdrawal Request Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Request ID</label>
                      <p className="text-white font-mono text-sm">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                      <p className="text-white font-mono text-sm">{selectedRequest.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">User Name</label>
                      <p className="text-white text-sm">{selectedRequest.userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">User Email</label>
                      <p className="text-white text-sm">{selectedRequest.userEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                      <p className="text-white font-medium">
                        {formatCurrency(selectedRequest.amount, selectedRequest.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize">{selectedRequest.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Account Details</label>
                    <div className="bg-slate-700 rounded-lg p-4">
                      {selectedRequest.account.type === 'PKR' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Account Name:</span>
                            <span className="text-white">{selectedRequest.account.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Account Number:</span>
                            <span className="text-white font-mono">{selectedRequest.account.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bank Name:</span>
                            <span className="text-white">{selectedRequest.account.bankName}</span>
                          </div>
                          {selectedRequest.account.ibanNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">IBAN:</span>
                              <span className="text-white font-mono">{selectedRequest.account.ibanNumber}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Service:</span>
                            <span className="text-white">{selectedRequest.account.serviceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Wallet Address:</span>
                            <span className="text-white font-mono text-sm break-all">
                              {selectedRequest.account.walletAddress}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Timeline</label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="ml-3">
                          <p className="text-white text-sm">Request created</p>
                          <p className="text-gray-400 text-xs">{formatDate(selectedRequest.requestedAt)}</p>
                        </div>
                      </div>
                      {selectedRequest.processedAt && (
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            selectedRequest.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div className="ml-3">
                            <p className="text-white text-sm">
                              {selectedRequest.status === 'completed' ? 'Approved & Completed' : 'Rejected'}
                            </p>
                            <p className="text-gray-400 text-xs">{formatDate(selectedRequest.processedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes & Transaction Details */}
                  {(selectedRequest.adminNotes || selectedRequest.transactionId || selectedRequest.rejectionReason) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-3">Additional Information</label>
                      <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                        {selectedRequest.transactionId && (
                          <div>
                            <p className="text-gray-400 text-sm">Transaction ID:</p>
                            <p className="text-white font-mono text-sm">{selectedRequest.transactionId}</p>
                          </div>
                        )}
                        {selectedRequest.rejectionReason && (
                          <div>
                            <p className="text-gray-400 text-sm">Rejection Reason:</p>
                            <p className="text-white text-sm">{selectedRequest.rejectionReason}</p>
                          </div>
                        )}
                        {selectedRequest.adminNotes && (
                          <div>
                            <p className="text-gray-400 text-sm">Admin Notes:</p>
                            <p className="text-white text-sm">{selectedRequest.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleAction(selectedRequest, 'reject');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleAction(selectedRequest, 'approve');
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedRequest && actionType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                  </h3>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Withdrawal Amount:</p>
                    <p className="text-white font-medium">
                      {formatCurrency(selectedRequest.amount, selectedRequest.currency)}
                    </p>
                  </div>

                  {actionType === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Transaction ID 
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID for reference"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {actionType === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any additional notes..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={actionLoading === selectedRequest.id || (actionType === 'reject' && !rejectionReason.trim())}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 ${
                      actionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {actionLoading === selectedRequest.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : actionType === 'approve' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>{actionType === 'approve' ? 'Approve' : 'Reject'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WithdrawalManagementView;
