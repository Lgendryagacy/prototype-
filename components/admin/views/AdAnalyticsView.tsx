import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, BarChart3, Eye, Users, Clock, TrendingUp, Calendar, Filter } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import { Ad } from '../../../firebase/types/ads';
import { getAllAds, getAdAnalytics } from '../../../firebase/services/adService';
import { toast } from 'react-hot-toast';

interface AdAnalyticsViewProps {
  onBack: () => void;
  selectedAdId?: string;
}

interface AdAnalyticsData {
  adId: string;
  title: string;
  views: number;
  completions: number;
  earningsDistributed: number;
  averageScore: number;
  companyName: string;
  lastUpdated: Date;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

const CACHE_KEY = 'ad_analytics_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const AdAnalyticsView: React.FC<AdAnalyticsViewProps> = ({ onBack, selectedAdId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AdAnalyticsData[]>([]);
  const [filteredData, setFilteredData] = useState<AdAnalyticsData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'completions' | 'earningsDistributed' | 'averageScore'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Load data from cache
  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
      }
    }
    return null;
  }, []);

  // Save data to cache
  const saveToCache = useCallback((data: AdAnalyticsData[]) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  }, []);

  // Load ads and analytics data
  const loadAnalyticsData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = loadFromCache();
        if (cachedData) {
          setAnalyticsData(cachedData);
          setFilteredData(cachedData);
          updatePagination(cachedData);
          setLoading(false);
          return;
        }
      }

      // Load ads first
      const adsData = await getAllAds();
      setAds(adsData);

      // Load analytics for each ad (with pagination consideration)
      const analyticsPromises = adsData.map(async (ad) => {
        try {
          const analytics = await getAdAnalytics(ad.id);
          return {
            adId: ad.id,
            title: ad.title,
            views: analytics.totalViews || 0,
            completions: analytics.totalCompletions || 0,
            earningsDistributed: analytics.totalEarningsDistributed || 0,
            averageScore: analytics.averageScore || 0,
            companyName: analytics.companyName || ad.companyName || 'Unknown',
            lastUpdated: new Date()
          } as AdAnalyticsData;
        } catch (error) {
          console.error(`Error loading analytics for ad ${ad.id}:`, error);
          return {
            adId: ad.id,
            title: ad.title,
            views: 0,
            completions: 0,
            earningsDistributed: 0,
            averageScore: 0,
            companyName: ad.companyName || 'Unknown',
            lastUpdated: new Date()
          } as AdAnalyticsData;
        }
      });

      const analyticsResults = await Promise.all(analyticsPromises);
      
      // Save to cache
      saveToCache(analyticsResults);
      
      setAnalyticsData(analyticsResults);
      setFilteredData(analyticsResults);
      updatePagination(analyticsResults);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromCache, saveToCache]);

  // Update pagination
  const updatePagination = useCallback((data: AdAnalyticsData[]) => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1)
    }));
  }, [pagination.itemsPerPage]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const filtered = analyticsData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
    updatePagination(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [analyticsData, updatePagination]);

  // Handle sort
  const handleSort = useCallback((field: typeof sortBy) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      return newOrder === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

    setFilteredData(sorted);
  }, [filteredData, sortBy, sortOrder]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData(true);
  }, [loadAnalyticsData]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  }, []);

  // Get paginated data
  const getPaginatedData = useCallback(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  // Calculate total stats
  const totalStats = React.useMemo(() => {
    return analyticsData.reduce(
      (acc, item) => ({
        totalViews: acc.totalViews + item.views,
        totalCompletions: acc.totalCompletions + item.completions,
        totalEarningsDistributed: acc.totalEarningsDistributed + item.earningsDistributed,
        avgScore: analyticsData.length > 0 
          ? analyticsData.reduce((sum, ad) => sum + ad.averageScore, 0) / analyticsData.length 
          : 0
      }),
      { totalViews: 0, totalCompletions: 0, totalEarningsDistributed: 0, avgScore: 0 }
    );
  }, [analyticsData]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

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
          <h2 className="text-2xl font-bold">Ad Analytics</h2>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const paginatedData = getPaginatedData();

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Ad Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">
              Performance insights for all advertising campaigns
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard 
          title="Total Views" 
          value={totalStats.totalViews.toLocaleString()} 
          icon={<Eye size={20} />} 
          valueColor="text-blue-400"
        />
        <AdminStatCard 
          title="Total Completions" 
          value={totalStats.totalCompletions.toLocaleString()} 
          icon={<Users size={20} />} 
          valueColor="text-green-400"
        />
        <AdminStatCard 
          title="Earnings Distributed" 
          value={`$${totalStats.totalEarningsDistributed.toFixed(2)}`} 
          icon={<BarChart3 size={20} />} 
          valueColor="text-emerald-400"
        />
        <AdminStatCard 
          title="Avg Score" 
          value={`${totalStats.avgScore.toFixed(1)}%`} 
          icon={<TrendingUp size={20} />} 
          valueColor="text-yellow-400"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ads by title..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as typeof sortBy)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="views">Sort by Views</option>
            <option value="completions">Sort by Completions</option>
            <option value="earningsDistributed">Sort by Earnings</option>
            <option value="averageScore">Sort by Avg Score</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white hover:bg-slate-600 transition-colors"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left p-4 font-semibold">Ad Title</th>
                <th className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-600" 
                    onClick={() => handleSort('views')}>
                  Views {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-600" 
                    onClick={() => handleSort('completions')}>
                  Completions {sortBy === 'completions' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-600" 
                    onClick={() => handleSort('averageScore')}>
                  Avg Score {sortBy === 'averageScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-600" 
                    onClick={() => handleSort('earningsDistributed')}>
                  Earnings {sortBy === 'earningsDistributed' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-left p-4 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    {searchQuery ? 'No ads found matching your search.' : 'No analytics data available.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.adId} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="p-4">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-sm text-gray-400">Company: {item.companyName}</div>
                    </td>
                    <td className="p-4 text-blue-400">{item.views.toLocaleString()}</td>
                    <td className="p-4 text-green-400">{item.completions.toLocaleString()}</td>
                    <td className="p-4 text-yellow-400">{item.averageScore.toFixed(1)}%</td>
                    <td className="p-4 text-emerald-400">${item.earningsDistributed.toFixed(2)}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {item.lastUpdated.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-700 p-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} ads
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 rounded text-sm transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 rounded text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cache Info */}
      <div className="text-xs text-gray-500 text-center">
        Data cached for faster loading. Use refresh button to get latest data.
      </div>
    </div>
  );
};

export default AdAnalyticsView;
