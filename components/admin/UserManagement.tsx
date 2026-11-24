import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  UserCheck,
  Calendar,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';
import { getAllUsersWithRanking } from '../../firebase/services/userService';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';

interface User {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  createdAt: Date;
  rank: number;
  tier: string | null;
  status: string;
}

type SortField = 'rank' | 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [rankFilter, setRankFilter] = useState<'all' | 'ranked' | 'unranked'>('all');
  
  const ITEMS_PER_PAGE = 20;

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
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Filter users based on search and rank filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.tier && user.tier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRankFilter = 
      rankFilter === 'all' ||
      (rankFilter === 'ranked' && user.rank > 0) ||
      (rankFilter === 'unranked' && user.rank === 0);
    
    return matchesSearch && matchesRankFilter;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'createdAt') {
      aVal = a.createdAt.getTime();
      bVal = b.createdAt.getTime();
    }
    
    if (sortField === 'rank') {
      // Handle rank 0 (no rank) as lowest priority
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

  const getTierColor = (tier: string | null) => {
    if (!tier) return 'text-gray-500';
    
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes('legend')) return 'text-purple-400';
    if (lowerTier.includes('master')) return 'text-blue-400';
    if (lowerTier.includes('vanguard')) return 'text-green-400';
    if (lowerTier.includes('earlybird')) return 'text-yellow-400';
    if (lowerTier.includes('champion')) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getTierBadgeVariant = (tier: string | null) => {
    if (!tier) return 'secondary';
    
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes('legend')) return 'dark';
    if (lowerTier.includes('master')) return 'primary';
    if (lowerTier.includes('vanguard')) return 'warn';
    return 'secondary';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDeleteUser = (user: User) => {
    // TODO: Implement user deletion
    toast.error('Delete functionality not implemented yet');
  };

  const handleEditCoins = (user: User) => {
    // TODO: Implement coin editing
    toast.error('Edit coins functionality not implemented yet');
  };

  const rankedUsers = users.filter(u => u.rank > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-2">Manage and view all registered users</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{users.length}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Ranked Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{rankedUsers.length}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Rank Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={rankFilter}
              onChange={(e) => {
                setRankFilter(e.target.value as 'all' | 'ranked' | 'unranked');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all" className="bg-gray-800">All Users</option>
              <option value="ranked" className="bg-gray-800">Ranked Only</option>
              <option value="unranked" className="bg-gray-800">Unranked Only</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={loadUsers}
            variant="outline"
            className="text-gray-300 border-white/20 hover:bg-white/10"
          >
            Refresh
          </Button>
        </div>

        {/* Users Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({filteredUsers.length})
              </CardTitle>
              
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} • {filteredUsers.length} total users
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm || rankFilter !== 'all' ? 'No users found matching your criteria.' : 'No users found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleSort('rank')}
                      >
                        <div className="flex items-center gap-1">
                          Rank
                          {getSortIcon('rank')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {getSortIcon('name')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {getSortIcon('email')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Register Date
                          {getSortIcon('createdAt')}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300">Tier</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.uid} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white font-medium">
                          {user.rank > 0 ? (
                            <span>#{user.rank}</span>
                          ) : (
                            <span className="text-gray-500">Unranked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          <div>
                            {user.name}
                            {user.displayName && user.displayName !== user.name && (
                              <div className="text-xs text-gray-400">({user.displayName})</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          {user.tier ? (
                            <Badge 
                              variant={getTierBadgeVariant(user.tier)}
                              className={`${getTierColor(user.tier)} font-medium`}
                            >
                              {user.tier}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">No Tier</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditCoins(user)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                              title="Edit Coins"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(user)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} results
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="text-gray-300 border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  
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
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={currentPage === pageNum 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-300 border-white/20 hover:bg-white/10"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="text-gray-300 border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
