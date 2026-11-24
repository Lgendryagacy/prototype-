import React, { useState, useEffect } from 'react';
import { Wallet, Search, Eye, Edit, ChevronUp, ChevronDown, RefreshCw, Columns3 } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import { getAllUsersEarnings } from '../../../firebase/services/earningsService';
import { UserEarnings } from '../../../firebase/types/earnings';
import { toast } from 'react-hot-toast';
import ViewEarningsModal from '../modals/ViewEarningsModal';
// import EditEarningsModal from '../modals/EditEarningsModal';
import EditEarningsModal from '../modals/EditEarningsModal';

interface UserEarningsWithInfo extends UserEarnings {
  name: string;
  email: string;
}

type SortField = 'name' | 'availableBalance' | 'lifetimeEarnings' | 'totalWithdrawn';
type SortOrder = 'asc' | 'desc';

// All available columns
const ALL_COLUMNS = [
  { key: 'userName', label: 'User Name', fixed: true },
  { key: 'availableBalance', label: 'Available Balance', fixed: true },
  { key: 'adsEarnings', label: 'Ads Earnings', fixed: false },
  { key: 'freelanceJobsEarnings', label: 'Freelance Earnings', fixed: false },
  { key: 'fogslyServicesEarnings', label: 'Services Earnings', fixed: false },
  { key: 'referralEarnings', label: 'Referral Earnings', fixed: false },
  { key: 'taskEarnings', label: 'Task Earnings', fixed: false },
  { key: 'bonusEarnings', label: 'Bonus Earnings', fixed: false },
  { key: 'depositEarnings', label: 'Deposit Earnings', fixed: false },
  { key: 'fogslyPhysicalEarnings', label: 'Physical Earnings', fixed: false },
  { key: 'lifetimeEarnings', label: 'Lifetime Earnings', fixed: false },
  { key: 'totalWithdrawn', label: 'Total Withdrawn', fixed: false },
  { key: 'totalSpent', label: 'Total Spent', fixed: false },
  { key: 'actions', label: 'Actions', fixed: true }
];

const UserWalletsView = () => {
  const [users, setUsers] = useState<UserEarningsWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('availableBalance');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'userName',
    'availableBalance',
    'adsEarnings',
    'freelanceJobsEarnings',
    'actions'
  ]);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserEarningsWithInfo | null>(null);
  
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    loadUsersEarnings();
  }, []);

  const loadUsersEarnings = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsersEarnings();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users earnings:', error);
      toast.error('Failed to load users earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const toggleColumn = (columnKey: string) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(k => k !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate stats
  const totalBalance = users.reduce((sum, user) => sum + user.availableBalance, 0);
  const totalLifetimeEarnings = users.reduce((sum, user) => sum + user.lifetimeEarnings, 0);
  const totalWithdrawn = users.reduce((sum, user) => sum + user.totalWithdrawn, 0);
  const avgBalance = users.length > 0 ? totalBalance / users.length : 0;

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(numAmount || 0).toFixed(2)} FOG`;
  };

  const handleViewUser = (user: UserEarningsWithInfo) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: UserEarningsWithInfo) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadUsersEarnings();
    setEditModalOpen(false);
  };

  const availableColumnsForDropdown = ALL_COLUMNS.filter(
    col => !col.fixed && !selectedColumns.includes(col.key)
  );

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <h2 className="text-2xl font-bold">User Wallets</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading user wallets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Wallets</h2>
        <button
          onClick={loadUsersEarnings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminStatCard 
          title="Total Balance" 
          value={formatCurrency(totalBalance)} 
          icon={<Wallet size={24}/>} 
        />
        <AdminStatCard 
          title="Lifetime Earnings" 
          value={formatCurrency(totalLifetimeEarnings)} 
          icon={<Wallet size={24}/>} 
          valueColor="text-green-400" 
        />
        <AdminStatCard 
          title="Total Withdrawn" 
          value={formatCurrency(totalWithdrawn)} 
          icon={<Wallet size={24}/>} 
          valueColor="text-yellow-400" 
        />
      </div> */}

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700">
          <div className="relative w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full bg-slate-900 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Column Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <Columns3 className="w-4 h-4" />
              Add Column ({availableColumnsForDropdown.length})
            </button>
            
            {/* Dropdown */}
            {availableColumnsForDropdown.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-400 px-2 py-1 mb-1">Select columns to show:</div>
                  {availableColumnsForDropdown.map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
              <tr>
                {selectedColumns.includes('userName') && (
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      User
                      {getSortIcon('name')}
                    </div>
                  </th>
                )}
                
                {selectedColumns.includes('availableBalance') && (
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('availableBalance')}>
                    <div className="flex items-center gap-1">
                      Available Balance
                      {getSortIcon('availableBalance')}
                    </div>
                  </th>
                )}
                
                {selectedColumns.includes('adsEarnings') && (
                  <th scope="col" className="px-6 py-3">Ads Earnings</th>
                )}
                
                {selectedColumns.includes('freelanceJobsEarnings') && (
                  <th scope="col" className="px-6 py-3">Freelance Earnings</th>
                )}
                
                {selectedColumns.includes('fogslyServicesEarnings') && (
                  <th scope="col" className="px-6 py-3">Services Earnings</th>
                )}
                
                {selectedColumns.includes('referralEarnings') && (
                  <th scope="col" className="px-6 py-3">Referral Earnings</th>
                )}
                
                {selectedColumns.includes('taskEarnings') && (
                  <th scope="col" className="px-6 py-3">Task Earnings</th>
                )}
                
                {selectedColumns.includes('bonusEarnings') && (
                  <th scope="col" className="px-6 py-3">Bonus Earnings</th>
                )}
                
                {selectedColumns.includes('depositEarnings') && (
                  <th scope="col" className="px-6 py-3">Deposit Earnings</th>
                )}
                
                {selectedColumns.includes('fogslyPhysicalEarnings') && (
                  <th scope="col" className="px-6 py-3">Physical Earnings</th>
                )}
                
                {selectedColumns.includes('lifetimeEarnings') && (
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lifetimeEarnings')}>
                    <div className="flex items-center gap-1">
                      Lifetime Earnings
                      {getSortIcon('lifetimeEarnings')}
                    </div>
                  </th>
                )}
                
                {selectedColumns.includes('totalWithdrawn') && (
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalWithdrawn')}>
                    <div className="flex items-center gap-1">
                      Total Withdrawn
                      {getSortIcon('totalWithdrawn')}
                    </div>
                  </th>
                )}
                
                {selectedColumns.includes('totalSpent') && (
                  <th scope="col" className="px-6 py-3">Total Spent</th>
                )}
                
                {selectedColumns.includes('actions') && (
                  <th scope="col" className="px-6 py-3">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={selectedColumns.length} className="px-6 py-8 text-center text-gray-400">
                    {searchTerm ? 'No users found matching your criteria.' : 'No user earnings data found.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.userId} className="border-b border-slate-700 hover:bg-slate-800/50">
                    {selectedColumns.includes('userName') && (
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </td>
                    )}
                    
                    {selectedColumns.includes('availableBalance') && (
                      <td className="px-6 py-4 text-white font-medium">{formatCurrency(user.availableBalance)}</td>
                    )}
                    
                    {selectedColumns.includes('adsEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.adsEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('freelanceJobsEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.freelanceJobsEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('fogslyServicesEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.fogslyServicesEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('referralEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.referralEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('taskEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.taskEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('bonusEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.bonusEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('depositEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.depositEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('fogslyPhysicalEarnings') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.fogslyPhysicalEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('lifetimeEarnings') && (
                      <td className="px-6 py-4 text-green-400 font-medium">{formatCurrency(user.lifetimeEarnings)}</td>
                    )}
                    
                    {selectedColumns.includes('totalWithdrawn') && (
                      <td className="px-6 py-4 text-yellow-400">{formatCurrency(user.totalWithdrawn)}</td>
                    )}
                    
                    {selectedColumns.includes('totalSpent') && (
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(user.totalSpent)}</td>
                    )}
                    
                    {selectedColumns.includes('actions') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-md transition-colors"
                            title="Edit Earnings"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Active Columns Display */}
        {selectedColumns.filter(col => !ALL_COLUMNS.find(c => c.key === col)?.fixed).length > 0 && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/30">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 mr-2">Active columns:</span>
              {selectedColumns
                .filter(col => !ALL_COLUMNS.find(c => c.key === col)?.fixed)
                .map(colKey => {
                  const col = ALL_COLUMNS.find(c => c.key === colKey);
                  return col ? (
                    <button
                      key={colKey}
                      onClick={() => toggleColumn(colKey)}
                      className="px-2 py-1 text-xs bg-blue-900/30 text-blue-300 rounded-md hover:bg-red-900/30 hover:text-red-300 transition-colors"
                      title="Click to remove"
                    >
                      {col.label} ✕
                    </button>
                  ) : null;
                })}
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-sm rounded-md ${
                        currentPage === pageNum 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <ViewEarningsModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            user={selectedUser}
          />
          <EditEarningsModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={selectedUser}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </div>
  );
};

export default UserWalletsView;
