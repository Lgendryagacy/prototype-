import React, { useState, useEffect } from 'react';
// FIX: Replaced CheckShield with the correct icon name ShieldCheck.
import { Users, Search, MoreVertical, Eye, ShieldOff, ShieldCheck, Star, UserPlus, Filter, ChevronUp, ChevronDown, Edit, RefreshCw, Ban, CheckCircle, Wallet } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import { getAllUsersWithRanking, suspendUserAccount, reactivateUserAccount } from '../../../firebase/services/userService';
import { toast } from 'react-hot-toast';
import UserWalletsView from './UserWalletsView';

interface User {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  rank: number;
  tier: string | null;
  status: string;
}

type SortField = 'rank' | 'name' | 'email' | 'createdAt' | 'lastLoginAt';
type SortOrder = 'asc' | 'desc';
type TabType = 'users' | 'wallets';

const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full";
  const statusClasses = {
    Active: "bg-green-900/50 text-green-400",
    Suspended: "bg-red-900/50 text-red-400",
    'Pending Verification': "bg-yellow-900/50 text-yellow-400",
  };
  return <span className={`${baseClasses} ${statusClasses[status as keyof typeof statusClasses]}`}>{status}</span>;
};

const UserManagementView = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [rankFilter, setRankFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsersWithRanking();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Helper function to determine status from user data
  const getUserStatus = (user: User) => {
    if (user.status === 'suspended') return 'Suspended';
    if (!user.rank || user.rank === 0) return 'Pending Verification';
    return 'Active';
  };

  // Helper function to determine if user is verified
  const isUserVerified = (user: User) => {
    return user.rank && user.rank > 0;
  };

  // Filter users based on search and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userStatus = getUserStatus(user);
    const matchesStatusFilter = 
      rankFilter === 'all' ||
      (rankFilter === 'active' && userStatus === 'Active') ||
      (rankFilter === 'suspended' && userStatus === 'Suspended') ||
      (rankFilter === 'pending' && userStatus === 'Pending Verification');
    
    return matchesSearch && matchesStatusFilter;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'createdAt' || sortField === 'lastLoginAt') {
      aVal = a[sortField]?.getTime() || 0;
      bVal = b[sortField]?.getTime() || 0;
    }
    
    if (sortField === 'rank') {
      if (aVal === 0 && bVal === 0) return 0;
      if (aVal === 0) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === 0) return sortOrder === 'asc' ? -1 : 1;
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
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
  const totalUsers = users.length;
  const newUsers24h = users.filter(user => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return user.createdAt > yesterday;
  }).length;
  const pendingVerifications = users.filter(user => getUserStatus(user) === 'Pending Verification').length;
  const suspendedUsers = users.filter(user => getUserStatus(user) === 'Suspended').length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  const handleEditUser = (user: User) => {
    toast.error('Edit functionality not implemented yet');
  };

  const handleSuspendUser = async (user: User) => {
    if (!confirm(`Are you sure you want to suspend ${user.name}'s account? They will not be able to log in until reactivated.`)) {
      return;
    }

    try {
      await suspendUserAccount(user.uid);
      toast.success(`${user.name}'s account has been suspended successfully.`);
      // Reload users to reflect the change
      await loadUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user account. Please try again.');
    }
  };

  const handleReactivateUser = async (user: User) => {
    if (!confirm(`Are you sure you want to reactivate ${user.name}'s account?`)) {
      return;
    }

    try {
      await reactivateUserAccount(user.uid);
      toast.success(`${user.name}'s account has been reactivated successfully.`);
      // Reload users to reflect the change
      await loadUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user account. Please try again.');
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'users'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </div>
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'wallets'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              User Wallets
            </div>
            {activeTab === 'wallets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'wallets' ? (
        <UserWalletsView />
      ) : (
        <UsersTabContent
          users={users}
          loading={loading}
          loadUsers={loadUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          rankFilter={rankFilter}
          setRankFilter={setRankFilter}
          paginatedUsers={paginatedUsers}
          filteredUsers={filteredUsers}
          totalPages={totalPages}
          startIndex={startIndex}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          handleEditUser={handleEditUser}
          handleSuspendUser={handleSuspendUser}
          handleReactivateUser={handleReactivateUser}
          getUserStatus={getUserStatus}
          isUserVerified={isUserVerified}
          formatDate={formatDate}
          totalUsers={totalUsers}
          newUsers24h={newUsers24h}
          pendingVerifications={pendingVerifications}
          suspendedUsers={suspendedUsers}
        />
      )}
    </div>
  );
};

interface UsersTabContentProps {
  users: User[];
  loading: boolean;
  loadUsers: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => React.ReactElement | null;
  rankFilter: 'all' | 'active' | 'suspended' | 'pending';
  setRankFilter: (filter: 'all' | 'active' | 'suspended' | 'pending') => void;
  paginatedUsers: User[];
  filteredUsers: User[];
  totalPages: number;
  startIndex: number;
  ITEMS_PER_PAGE: number;
  handleEditUser: (user: User) => void;
  handleSuspendUser: (user: User) => void;
  handleReactivateUser: (user: User) => void;
  getUserStatus: (user: User) => string;
  isUserVerified: (user: User) => boolean;
  formatDate: (date: Date) => string;
  totalUsers: number;
  newUsers24h: number;
  pendingVerifications: number;
  suspendedUsers: number;
}

const UsersTabContent: React.FC<UsersTabContentProps> = ({
  users,
  loading,
  loadUsers,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  handleSort,
  getSortIcon,
  rankFilter,
  setRankFilter,
  paginatedUsers,
  filteredUsers,
  totalPages,
  startIndex,
  ITEMS_PER_PAGE,
  handleEditUser,
  handleSuspendUser,
  handleReactivateUser,
  getUserStatus,
  isUserVerified,
  formatDate,
  totalUsers,
  newUsers24h,
  pendingVerifications,
  suspendedUsers
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading users...</span>
      </div>
    );
  }

  return (
    <>
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          title="Refresh Users"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Users" value={totalUsers} icon={<Users size={24}/>} />
        <AdminStatCard title="New Users (24h)" value={newUsers24h} icon={<UserPlus size={24}/>} valueColor="text-green-400" />
        <AdminStatCard title="Pending Verifications" value={pendingVerifications} icon={<ShieldCheck size={24}/>} valueColor="text-yellow-400" />
        <AdminStatCard title="Suspended" value={suspendedUsers} icon={<ShieldOff size={24}/>} valueColor="text-red-400" />
      </div>

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
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={rankFilter}
              onChange={(e) => {
                setRankFilter(e.target.value as 'all' | 'active' | 'suspended' | 'pending');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('rank')}>
                  <div className="flex items-center gap-1">
                    Rank
                    {getSortIcon('rank')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    User
                    {getSortIcon('name')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Verified</th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Joined Date
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                {/* <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lastLoginAt')}>
                  <div className="flex items-center gap-1">
                    Last Login
                    {getSortIcon('lastLoginAt')}
                  </div>
                </th> */}
                <th scope="col" className="px-6 py-3">Tier</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    {searchTerm || rankFilter !== 'all' ? 'No users found matching your criteria.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const userStatus = getUserStatus(user);
                  const isVerified = isUserVerified(user);
                  
                  return (
                    <tr key={user.uid} className="border-b border-slate-700 hover:bg-slate-800/50 group">
                      <td className="px-6 py-4 text-white font-medium">
                        {user.rank >= 0 ? (
                          <span>#{user.rank}</span>
                        ) : (
                          <span className="text-gray-500">Unranked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={userStatus} /></td>
                      <td className="px-6 py-4">
                        {isVerified ? <ShieldCheck size={20} className="text-blue-400"/> : <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(user.createdAt)}</td>
                      {/* <td className="px-6 py-4 text-gray-400">
                        {user.lastLoginAt ? formatLastLogin(user.lastLoginAt) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </td> */}
                      <td className="px-6 py-4">
                        {user.tier ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900/50 text-blue-400">
                            {user.tier}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No Tier</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <div className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors group/menu cursor-pointer">
                            <MoreVertical size={16}/>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-8 mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                  <Edit size={14} />
                                  Edit User
                                </button>
                                <button

                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                  <Eye size={14} />
                                  View Details
                                </button>
                                <hr className="border-slate-600 my-1" />
                                {userStatus === 'Suspended' ? (
                                  <button
                                    onClick={() => handleReactivateUser(user)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-400 hover:bg-green-900/20 hover:text-green-300 transition-colors"
                                  >
                                    <CheckCircle size={14} />
                                    Reactivate Account
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSuspendUser(user)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-400 hover:bg-orange-900/20 hover:text-orange-300 transition-colors"
                                  >
                                    <Ban size={14} />
                                    Suspend Account
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
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
    </>
  );
};

export default UserManagementView;