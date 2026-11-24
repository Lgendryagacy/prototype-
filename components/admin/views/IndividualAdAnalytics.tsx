import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, Users, Clock, Star, Calendar, FileDown, RefreshCw } from 'lucide-react';
import { Ad } from '../../../firebase/types/ads';
import { getAdAnalytics } from '../../../firebase/services/adService';
import { toast } from 'react-hot-toast';

interface IndividualAdAnalyticsProps {
  ad: Ad;
  onBack: () => void;
}

interface ViewerDetail {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  earnedAmount: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: Date;
  watchedAt: Date;
}

interface AdAnalyticsData {
  adId: string;
  totalViews: number;
  totalCompletions: number;
  totalEarningsDistributed: number;
  averageScore: number;
  viewerDetails: ViewerDetail[];
  companyName: string;
  adTitle: string;
  createdAt: Date;
}

const IndividualAdAnalytics: React.FC<IndividualAdAnalyticsProps> = ({ ad, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AdAnalyticsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'completedAt' | 'earnedAmount' | 'score'>('completedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 users per page
  const [totalUsers, setTotalUsers] = useState(0);

  // Cache key for this specific ad
  const CACHE_KEY = `ad_analytics_${ad.id}`;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

  // Cache helper functions
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          console.log('Loading from cache:', data);
          return data;
        } else {
          localStorage.removeItem(CACHE_KEY); // Remove expired cache
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  };

  const saveToCache = (data: AdAnalyticsData) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Data saved to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const loadAnalytics = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = loadFromCache();
        if (cachedData) {
          setAnalyticsData(cachedData);
          setTotalUsers(cachedData.viewerDetails?.length || 0);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      console.log('Fetching fresh data from server...');
      const analytics = await getAdAnalytics(ad.id);
      
      if (analytics) {
        console.log('Analytics data received:', analytics);
        console.log('Viewer details:', analytics.viewerDetails);
        
        // Save to cache
        saveToCache(analytics);
        
        setAnalyticsData(analytics);
        setTotalUsers(analytics.viewerDetails?.length || 0);
      } else {
        console.log('No analytics data returned');
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [ad.id]);

  const handleRefresh = () => {
    localStorage.removeItem(CACHE_KEY); // Clear cache
    setCurrentPage(1); // Reset to first page
    loadAnalytics(true);
  };

  // Filter and sort viewer data
  const getFilteredAndSortedViewers = () => {
    if (!analyticsData || !analyticsData.viewerDetails) return [];

    let filtered = analyticsData.viewerDetails.filter(viewer =>
      viewer && (
        (viewer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (viewer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (viewer.userId || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'completedAt':
          aVal = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          bVal = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          break;
        case 'earnedAmount':
          aVal = a.earnedAmount || 0;
          bVal = b.earnedAmount || 0;
          break;
        case 'score':
          aVal = ((a.correctAnswers || 0) / (a.totalQuestions || 1)) * 100;
          bVal = ((b.correctAnswers || 0) / (b.totalQuestions || 1)) * 100;
          break;
        default:
          aVal = bVal = 0;
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  };

  // Get filtered viewers for pagination
  const filteredViewers = getFilteredAndSortedViewers();
  const totalPages = Math.ceil(filteredViewers.length / itemsPerPage);
  const currentPageData = filteredViewers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get pagination range
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return totalPages <= 1 ? [] : rangeWithDots;
  };

  // Download CSV function
  const downloadCSV = () => {
    if (!analyticsData || !analyticsData.viewerDetails) {
      toast.error('No data available to download');
      return;
    }

    const headers = [
      'User ID',
      'User Email', 
      'User Name',
      'Phone',
      'Country',
      'City',
      'Earned Amount',
      'Score (%)',
      'Correct Answers',
      'Total Questions',
      'Completed At',
      'Watched At'
    ];

    const csvContent = [
      headers.join(','),
      ...analyticsData.viewerDetails.map(viewer => [
        viewer.userId || '',
        viewer.email || '',
        viewer.name || '',
        viewer.phone || '',
        viewer.country || '',
        viewer.city || '',
        (viewer.earnedAmount || 0).toFixed(2),
        (((viewer.correctAnswers || 0) / (viewer.totalQuestions || 1)) * 100).toFixed(2),
        viewer.correctAnswers || 0,
        viewer.totalQuestions || 0,
        viewer.completedAt ? new Date(viewer.completedAt).toLocaleString() : '',
        viewer.watchedAt ? new Date(viewer.watchedAt).toLocaleString() : ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${ad.title.replace(/[^a-z0-9]/gi, '_')}_analytics.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Analytics data downloaded successfully!');
  };

  // Download JSON function  
  const downloadJSON = () => {
    if (!analyticsData || !analyticsData.viewerDetails) {
      toast.error('No data available to download');
      return;
    }

    const jsonData = {
      adInfo: {
        id: ad.id,
        title: ad.title,
        companyName: analyticsData.companyName,
        createdAt: analyticsData.createdAt
      },
      summary: {
        totalViews: analyticsData.totalViews,
        totalCompletions: analyticsData.totalCompletions,
        totalEarningsDistributed: analyticsData.totalEarningsDistributed,
        averageScore: analyticsData.averageScore
      },
      viewerDetails: analyticsData.viewerDetails,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${ad.title.replace(/[^a-z0-9]/gi, '_')}_analytics.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Analytics data downloaded as JSON!');
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Loading Analytics...</h2>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics for "{ad.title}"...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">No Analytics Data</h2>
        </div>
        
        <div className="text-center py-20">
          <p className="text-gray-400">No analytics data available for this ad.</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{ad.title} - Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">
              Company: {analyticsData.companyName} • Created: {new Date(analyticsData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-blue-400">{(analyticsData.totalViews || 0).toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completions</p>
              <p className="text-2xl font-bold text-green-400">{(analyticsData.totalCompletions || 0).toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Earnings Distributed</p>
              <p className="text-2xl font-bold text-emerald-400">${(analyticsData.totalEarningsDistributed || 0).toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-yellow-400">{(analyticsData.averageScore || 0).toFixed(1)}%</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by user ID, email, or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setCurrentPage(1); // Reset to first page when sorting
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="completedAt">Sort by Date</option>
            <option value="earnedAmount">Sort by Earnings</option>
            <option value="score">Sort by Score</option>
          </select>
          
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1); // Reset to first page when changing sort order
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white hover:bg-slate-600 transition-colors"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Viewers Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left p-4 font-semibold">User Details</th>
                <th className="text-left p-4 font-semibold">Contact Info</th>
                <th className="text-left p-4 font-semibold">Earnings</th>
                <th className="text-left p-4 font-semibold">Score</th>
                <th className="text-left p-4 font-semibold">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    {searchQuery ? 'No users found matching your search.' : 'No users have completed this ad yet.'}
                  </td>
                </tr>
              ) : (
                currentPageData.map((viewer, index) => (
                  <tr key={`${viewer.userId}-${index}`} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="p-4">
                      <div className="font-medium text-white">{viewer.name || 'Anonymous User'}</div>
                      <div className="text-sm text-gray-400">ID: {viewer.userId}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300">{viewer.email || 'No email'}</div>
                      <div className="text-sm text-gray-400">{viewer.phone || 'No phone'}</div>
                      {viewer.country && (
                        <div className="text-xs text-gray-500 mt-1">{viewer.country}{viewer.city ? `, ${viewer.city}` : ''}</div>
                      )}
                    </td>
                    <td className="p-4 text-emerald-400 font-semibold">
                      ${(viewer.earnedAmount || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="text-yellow-400 font-semibold">
                        {(((viewer.correctAnswers || 0) / (viewer.totalQuestions || 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {viewer.correctAnswers || 0}/{viewer.totalQuestions || 0} correct
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {viewer.completedAt ? new Date(viewer.completedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-700 border-t border-slate-600 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 text-white"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPaginationRange().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1 text-sm rounded-md ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : page === '...'
                        ? 'cursor-default text-gray-400'
                        : 'border border-slate-600 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Showing {currentPageData.length} of {filteredViewers.length} users who completed this ad
        {filteredViewers.length !== (analyticsData.viewerDetails || []).length && (
          <span> (filtered from {(analyticsData.viewerDetails || []).length} total)</span>
        )}
      </div>
    </div>
  );
};

export default IndividualAdAnalytics;
