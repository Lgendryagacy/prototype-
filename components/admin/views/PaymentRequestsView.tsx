import React, { useState, useEffect } from 'react';
import { HandCoins, Search, Check, X, MoreVertical, Eye, RefreshCw, DollarSign, Banknote, Download } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import {
  getAllPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  getPaymentRequest
} from '../../../firebase/services/paymentsService';
import type { PaymentRequest, PaymentStatus, Currency } from '../../../firebase/types/payments';
import { useAuth } from '../../../firebase/hooks/useAuth';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full";
  const statusClasses = {
    Pending: "bg-yellow-900/50 text-yellow-400",
    pending: "bg-yellow-900/50 text-yellow-400",
    Approved: "bg-green-900/50 text-green-400",
    approved: "bg-green-900/50 text-green-400",
    Rejected: "bg-red-900/50 text-red-400",
    rejected: "bg-red-900/50 text-red-400",
    processing: "bg-blue-900/50 text-blue-400",
    Processing: "bg-blue-900/50 text-blue-400",
  };
  return <span className={`${baseClasses} ${statusClasses[status as keyof typeof statusClasses]}`}>{status}</span>;
};

const PaymentRequestsView = () => {
  const { user } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load payment requests
  useEffect(() => {
    loadPaymentRequests();
  }, []);

  const loadPaymentRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllPaymentRequests();
      setPaymentRequests(requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  useEffect(() => {
    let filtered = paymentRequests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(req =>
        req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, paymentRequests, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const formatAmount = (amount: number, currency: Currency) => {
    return `${currency === 'USD' ? '$' : 'PKR '}${amount.toFixed(2)}`;
  };

  const getRequestType = (request: PaymentRequest) => {
    return 'FOG Coin Deposit';
  };

  const getPaymentMethod = (request: PaymentRequest) => {
    return request.currency === 'USD' ? 'Crypto/Online' : 'Bank Transfer';
  };

  const handleViewDetails = async (requestId: string) => {
    try {
      const request = await getPaymentRequest(requestId);
      if (request) {
        setSelectedRequest(request);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading payment request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const handleApprove = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes('Payment approved and FOG coins deposited to user wallet.');
    setShowApprovalModal(true);
  };

  const handleReject = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !user) return;

    try {
      setProcessing(true);
      await approvePaymentRequest(selectedRequest.id, user.uid, adminNotes);

      // Update local state
      setPaymentRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: 'approved', processedBy: user.uid, adminNotes }
            : req
        )
      );

      toast.success('Payment request approved successfully!');
      setShowApprovalModal(false);
    } catch (error) {
      console.error('Error approving payment request:', error);
      toast.error('Failed to approve payment request');
    } finally {
      setProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedRequest || !user || !adminNotes.trim()) return;

    try {
      setProcessing(true);
      await rejectPaymentRequest(selectedRequest.id, user.uid, adminNotes);

      // Update local state
      setPaymentRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: 'rejected', processedBy: user.uid, adminNotes }
            : req
        )
      );

      toast.success('Payment request rejected.');
      setShowRejectionModal(false);
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      toast.error('Failed to reject payment request');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats
  const stats = {
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    processing: filteredRequests.filter(r => r.status === 'processing').length,
    approvedToday: paymentRequests.filter(r => {
      const today = new Date();
      const requestDate = new Date(r.submittedAt);
      return r.status === 'approved' &&
        requestDate.toDateString() === today.toDateString();
    }).reduce((sum, r) => sum + r.localAmount, 0),
    rejectedToday: paymentRequests.filter(r => {
      const today = new Date();
      const requestDate = new Date(r.submittedAt);
      return r.status === 'rejected' &&
        requestDate.toDateString() === today.toDateString();
    }).reduce((sum, r) => sum + r.localAmount, 0),
    totalProcessing: filteredRequests.filter(r => r.status === 'processing').reduce((sum, r) => sum + r.localAmount, 0)
  };

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <h2 className="text-2xl font-bold">Payment Requests</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading payment requests...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Requests</h2>
          <p className="text-gray-400 text-sm mt-1">Review and process user FOG coin purchase requests.</p>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-400">ℹ️</div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-2">Payment Request Workflow:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                <span className="text-gray-400">Pending:</span> User requested FOG coins but hasn't submitted payment proof yet
              </div>
              <div>
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-yellow-400">Processing:</span> User submitted payment verification - requires admin review
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Pending Requests"
          value={stats.pending.toString()}
          icon={<HandCoins size={24} />}
          valueColor="text-gray-400"
        />
        <AdminStatCard
          title="Awaiting Review"
          value={stats.processing.toString()}
          icon={<Eye size={24} />}
          valueColor="text-yellow-400"
        />
        <AdminStatCard
          title="Approved (24h)"
          value={`$${stats.approvedToday.toFixed(0)}`}
          icon={<Check size={24} />}
          valueColor="text-green-400"
        />
        <AdminStatCard
          title="Processing Value"
          value={`$${stats.totalProcessing.toFixed(0)}`}
          icon={<DollarSign size={24} />}
          valueColor="text-blue-400"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700">
          <div className="relative w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user or ID..."
              className="w-full bg-slate-900 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
              <tr>
                {/* <th scope="col" className="px-6 py-3">Request ID</th> */}
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">FOG Coins</th>
                <th scope="col" className="px-6 py-3">Method</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    {paymentRequests.length === 0 ? 'No payment requests found' : 'No requests match your filters'}
                  </td>
                </tr>
              ) : (
                paginatedRequests.map(req => (
                  <tr key={req.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                    {/* <td className="px-6 py-4 font-mono text-gray-300">{req.id}</td> */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{req.userName}</div>
                        <div className="text-xs text-gray-400">{req.userEmail}</div>
                        {req.verificationDetails && req.status === 'processing' && (
                          <div className="text-xs text-yellow-400 mt-1">📎 Has payment proof</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(new Date(req.submittedAt))}</td>
                    <td className="px-6 py-4 font-semibold">{formatAmount(req.localAmount, req.currency)}</td>
                    <td className="px-6 py-4">{req.fogCoinsAmount} FOG</td>
                    <td className="px-6 py-4">{getPaymentMethod(req)}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(req.id)}
                          className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {req.status === 'processing' && (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              className="p-1.5 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/30"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                          </>
                        )}
                        {req.status !== 'approved' && req.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(req)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        )}
                        {req.status !== 'processing' && req.status !== 'pending' && (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 py-1 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Payment Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Request ID</label>
                  <p className="text-white">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Name</label>
                  <p className="text-white">{selectedRequest.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Email</label>
                  <p className="text-white">{selectedRequest.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Local Amount</label>
                  <p className="text-white">{formatAmount(selectedRequest.localAmount, selectedRequest.currency)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">FOG Coins</label>
                  <p className="text-white">{selectedRequest.fogCoinsAmount} FOG</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <p className="text-white">{selectedRequest.currency}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Submitted At</label>
                <p className="text-white">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
              </div>

              {/* Verification Details Section */}
              {selectedRequest.verificationDetails && (
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Verification Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Transaction ID</label>
                      <p className="text-white font-mono text-sm">{selectedRequest.verificationDetails.transactionId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                      <p className="text-white">{selectedRequest.verificationDetails.accountName}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                    <p className="text-white font-mono text-sm">{selectedRequest.verificationDetails.accountNumber}</p>
                  </div>
                  {selectedRequest.verificationDetails.paymentScreenshot && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Payment Screenshot</label>
                      <div className="mt-2">
                        <a
                          href={selectedRequest.verificationDetails.paymentScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
                        >
                          <Download className="w-4 h-4" />
                          View Screenshot
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Verification Submitted At</label>
                    <p className="text-white">{new Date(selectedRequest.verificationDetails.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Status indicator for requests without verification */}
              {!selectedRequest.verificationDetails && selectedRequest.status === 'pending' && (
                <div className="border-t border-gray-600 pt-4">
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      ⏳ User has not submitted payment verification details yet. No action required from admin.
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div className="border-t border-gray-600 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Admin Notes</label>
                  <p className="text-white bg-gray-700 p-3 rounded">{selectedRequest.adminNotes}</p>
                </div>
              )}

              {selectedRequest.processedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Processed By</label>
                  <p className="text-white">{selectedRequest.processedBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Approve Payment Request</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to approve this payment request for{' '}
                <span className="font-semibold text-white">{selectedRequest.userName}</span>?
              </p>

              {selectedRequest.verificationDetails && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm mb-2">
                    ✅ Verification details have been reviewed:
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Transaction ID: {selectedRequest.verificationDetails.transactionId}</li>
                    <li>• Account: {selectedRequest.verificationDetails.accountName}</li>
                    <li>• Payment screenshot: Verified</li>
                  </ul>
                </div>
              )}

              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-300">
                  Amount: <span className="text-white">{formatAmount(selectedRequest.localAmount, selectedRequest.currency)}</span>
                </p>
                <p className="text-sm text-gray-300">
                  FOG Coins: <span className="text-white">{selectedRequest.fogCoinsAmount} FOG</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes about this approval..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Reject Payment Request</h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to reject this payment request for{' '}
                <span className="font-semibold text-white">{selectedRequest.userName}</span>?
              </p>

              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-300">
                  Amount: <span className="text-white">{formatAmount(selectedRequest.localAmount, selectedRequest.currency)}</span>
                </p>
                <p className="text-sm text-gray-300">
                  FOG Coins: <span className="text-white">{selectedRequest.fogCoinsAmount} FOG</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason *</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejection}
                  disabled={processing || !adminNotes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRequestsView;
