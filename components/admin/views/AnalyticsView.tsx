import React, { useState, useEffect } from 'react';
import { BarChart3, Download, DollarSign, Users, Briefcase, HandCoins, ArrowLeft, Eye, Target, Clock, X, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AdminStatCard } from './AdminStatCard';
import { getAllAds, getAdAnalytics as getFirebaseAdAnalytics, getAdById } from '../../../firebase/services/adService';
import type { Ad } from '../../../firebase/types/ads';
import { collection, query, where, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-hot-toast';

interface AnalyticsViewProps {
  selectedAdId?: string;
  onBack?: () => void;
}

interface AdUserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  correctAnswers: number;
  totalQuestions: number;
  earnedAmount: number;
  watchedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  status: 'completed' | 'viewed' | 'partial';
}

interface AdAnalyticsData {
  adId: string;
  totalViews: number;
  totalCompletions: number;
  totalEarningsDistributed: number;
  averageScore: number;
  viewerDetails: AdUserData[];
  companyName: string;
  adTitle: string;
  createdAt: Date;
}

// Mock Data
const revenueData = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 }, { name: 'Aug', revenue: 6500 },
];
const userGrowthData = [
  { name: 'Mar', users: 200 }, { name: 'Apr', users: 250 }, { name: 'May', users: 300 },
  { name: 'Jun', users: 400 }, { name: 'Jul', users: 550 }, { name: 'Aug', users: 700 },
];
const gigDistributionData = [
  { name: 'Development', value: 400 }, { name: 'Design', value: 300 },
  { name: 'Marketing', value: 200 }, { name: 'Writing', value: 100 },
];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 text-white p-2 rounded-md border border-slate-600 text-sm">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ selectedAdId, onBack }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [adAnalyticsData, setAdAnalyticsData] = useState<AdAnalyticsData | null>(null);
  const [realUserData, setRealUserData] = useState<AdUserData[]>([]);

  // Helper function to convert Firestore timestamp to Date
  const convertTimestampToDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it's a Firestore Timestamp
    if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    // Fallback
    return new Date();
  };

  // Function to get ALL ad interactions (both completed and incomplete)
  const getAllAdInteractions = async (adId: string): Promise<AdUserData[]> => {
    try {
      // Get all user interactions for this ad (both completed and incomplete)
      const interactionsQuery = query(
        collection(db, 'userAdInteractions'),
        where('adId', '==', adId)
      );
      
      const interactionsSnapshot = await getDocs(interactionsQuery);
      
      // Process interactions in parallel for faster loading
      const userPromises = interactionsSnapshot.docs.map(async (interactionDoc) => {
        const interaction = interactionDoc.data();
        
        // Get user profile data
        const userProfileRef = doc(db, 'userProfile', interaction.userId);
        const userProfileDoc = await getDoc(userProfileRef);
        
        if (userProfileDoc.exists()) {
          const userProfile = userProfileDoc.data();
          
          // Calculate correct answers
          const correctAnswers = interaction.questionsAnswered ? 
            interaction.questionsAnswered.filter((q: any) => q.isCorrect).length : 0;
          
          // Determine status
          let status: 'completed' | 'viewed' | 'partial' = 'viewed';
          if (interaction.isCompleted) {
            status = 'completed';
          } else if (interaction.questionsAnswered && interaction.questionsAnswered.length > 0) {
            status = 'partial';
          }
          
          return {
            userId: interaction.userId,
            name: userProfile.name || userProfile.displayName || 'Unknown User',
            email: userProfile.email || 'N/A',
            phone: userProfile.phone || 'N/A',
            country: userProfile.country || 'N/A',
            city: userProfile.city || userProfile.state || 'N/A',
            correctAnswers: correctAnswers,
            totalQuestions: interaction.questionsAnswered ? interaction.questionsAnswered.length : 0,
            earnedAmount: interaction.totalEarned || 0,
            watchedAt: convertTimestampToDate(interaction.watchedAt),
            completedAt: interaction.completedAt ? convertTimestampToDate(interaction.completedAt) : undefined,
            isCompleted: interaction.isCompleted || false,
            status: status
          };
        }
        return null;
      });
      
      const results = await Promise.all(userPromises);
      return results.filter(result => result !== null) as AdUserData[];
      
    } catch (error) {
      toast.error('Failed to load user interactions');
      return [];
    }
  };

  useEffect(() => {
    if (selectedAdId) {
      setLoading(true);
      loadAds();
    }
  }, [selectedAdId]);

  useEffect(() => {
    if (selectedAd && selectedAdId) {
      loadRealAnalyticsData();
    }
  }, [selectedAd, selectedAdId]);

  // Load user data when modal opens
  useEffect(() => {
    if (showUserModal && selectedAdId && realUserData.length === 0) {
      loadRealAnalyticsData();
    }
  }, [showUserModal, selectedAdId]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const adsData = await getAllAds();
      setAds(adsData);
      if (selectedAdId) {
        const ad = adsData.find(a => a.id === selectedAdId);
        setSelectedAd(ad || null);
      }
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealAnalyticsData = async () => {
    if (!selectedAdId || !selectedAd) return;
    
    try {
      setLoading(true);
      
      // Get all user interactions (both completed and incomplete)
      const allInteractions = await getAllAdInteractions(selectedAdId);
      setRealUserData(allInteractions);
      
      // Also try to get the official analytics data
      try {
        const analyticsData = await getFirebaseAdAnalytics(selectedAdId);
        if (analyticsData) {
          setAdAnalyticsData(analyticsData);
        }
      } catch (analyticsError) {
        // Analytics data not available, using calculated data
      }
      
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = () => {
    if (!selectedAd || realUserData.length === 0) return;
    
    const csvHeaders = [
      'User ID',
      'Name',
      'Email',
      'Phone',
      'Country',
      'City',
      'Status',
      'Correct Answers',
      'Total Questions',
      'Earned Amount',
      'Watched At',
      'Completed At'
    ];
    
    const csvData = realUserData.map(user => [
      user.userId,
      user.name,
      user.email,
      user.phone,
      user.country,
      user.city,
      user.status,
      user.correctAnswers.toString(),
      user.totalQuestions.toString(),
      user.earnedAmount.toString(),
      user.watchedAt.toLocaleString(),
      user.completedAt ? user.completedAt.toLocaleString() : 'N/A'
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ad_${selectedAd.id}_user_analytics.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock ad-specific analytics data
  const getAdAnalytics = (ad: Ad) => {
    const baseViews = ad.totalViews || 0;
    const baseCompletions = ad.totalCompletions || 0;
    
    return {
      dailyViews: [
        { name: 'Mon', views: Math.floor(baseViews * 0.15) },
        { name: 'Tue', views: Math.floor(baseViews * 0.12) },
        { name: 'Wed', views: Math.floor(baseViews * 0.18) },
        { name: 'Thu', views: Math.floor(baseViews * 0.16) },
        { name: 'Fri', views: Math.floor(baseViews * 0.20) },
        { name: 'Sat', views: Math.floor(baseViews * 0.10) },
        { name: 'Sun', views: Math.floor(baseViews * 0.09) },
      ],
      completionRate: baseViews > 0 ? Math.round((baseCompletions / baseViews) * 100) : 0,
      avgWatchTime: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
      revenueGenerated: baseCompletions * (ad.totalReward || 0),
    };
  };

  const UserDetailsModal = () => {
    if (!showUserModal || !selectedAd) return null;

    const getStatusBadge = (status: AdUserData['status']) => {
      switch (status) {
        case 'completed':
          return 'bg-green-900/50 text-green-400 border-green-700';
        case 'partial':
          return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
        case 'viewed':
          return 'bg-blue-900/50 text-blue-400 border-blue-700';
        default:
          return 'bg-gray-900/50 text-gray-400 border-gray-700';
      }
    };

    const getScoreBadge = (correctAnswers: number, totalQuestions: number) => {
      if (totalQuestions === 0) return 'bg-gray-900/50 text-gray-400 border-gray-700';
      
      const percentage = (correctAnswers / totalQuestions) * 100;
      if (percentage >= 80) {
        return 'bg-green-900/50 text-green-400 border-green-700';
      } else if (percentage >= 60) {
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      } else {
        return 'bg-red-900/50 text-red-400 border-red-700';
      }
    };

    const completedUsers = realUserData.filter(u => u.status === 'completed');
    const partialUsers = realUserData.filter(u => u.status === 'partial');
    const viewedUsers = realUserData.filter(u => u.status === 'viewed');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-7xl w-full max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-700 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white">Real User Analytics</h3>
              <p className="text-gray-400 text-sm mt-1">All users who interacted with "{selectedAd.title}"</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportUserData}
                disabled={realUserData.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Download size={16} />
                Export Users (CSV)
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Modal Content with Custom Scrollbar */}
          <div className="flex-1 overflow-hidden">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #1e293b;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #475569 #1e293b;
              }
            `}</style>
            <div 
              className="h-full overflow-y-auto p-6 custom-scrollbar"
            >
              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-400">Loading user data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Stats Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Total Users</h4>
                      <p className="text-2xl font-bold text-white">{realUserData.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Completed</h4>
                      <p className="text-2xl font-bold text-green-400">{completedUsers.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Partial</h4>
                      <p className="text-2xl font-bold text-yellow-400">{partialUsers.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Viewed Only</h4>
                      <p className="text-2xl font-bold text-blue-400">{viewedUsers.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Total Earned</h4>
                      <p className="text-2xl font-bold text-green-400">
                        {realUserData.reduce((sum, u) => sum + u.earnedAmount, 0).toLocaleString()} FOG
                      </p>
                    </div>
                  </div>

              {/* Users Table */}
              {realUserData.length === 0 ? (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-12 text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No User Interactions Yet</h3>
                  <p className="text-gray-400">
                    No users have interacted with this ad yet. Once users start viewing or completing the ad, their data will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-300">User</th>
                          <th className="text-left p-4 font-medium text-gray-300">Contact</th>
                          <th className="text-left p-4 font-medium text-gray-300">Location</th>
                          <th className="text-left p-4 font-medium text-gray-300">Status</th>
                          <th className="text-left p-4 font-medium text-gray-300">Watched</th>
                          <th className="text-left p-4 font-medium text-gray-300">Score</th>
                          <th className="text-left p-4 font-medium text-gray-300">Earned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realUserData.map((user, index) => (
                          <tr key={user.userId} className={`border-b border-slate-700 hover:bg-slate-800 ${index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-white">{user.name}</p>
                                  <p className="text-xs text-gray-400">ID: {user.userId.substring(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-sm text-gray-300">{user.email}</p>
                                <p className="text-xs text-gray-400">{user.phone}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-gray-300">
                                <MapPin size={14} />
                                <div>
                                  <p className="text-sm">{user.city}</p>
                                  <p className="text-xs text-gray-400">{user.country}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar size={14} />
                                <span className="text-sm">
                                  {user.completedAt ? user.completedAt.toLocaleDateString() : user.watchedAt.toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              {user.totalQuestions > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm">
                                    {user.correctAnswers}/{user.totalQuestions}
                                  </span>
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getScoreBadge(user.correctAnswers, user.totalQuestions)}`}>
                                    {Math.round((user.correctAnswers / user.totalQuestions) * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No answers</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-green-400 font-semibold">
                                {user.earnedAmount} FOG
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedAdId && selectedAd) {
    const analytics = getAdAnalytics(selectedAd);
    
    // Show loading screen while data is being fetched
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px] text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      );
    }
    
    return (
      <>
        <div className="space-y-6 text-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold">Ad Analytics</h2>
                <p className="text-gray-400 text-sm mt-1">Performance metrics for "{selectedAd.title}"</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (selectedAd?.id && selectedAdId) {
                    setShowUserModal(true);
                  } else {
                    toast.error('Please select an ad first');
                  }
                }}
                disabled={loading}
                className={`flex items-center justify-center gap-2 ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    View User Details ({realUserData.length})
                  </>
                )}
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={exportUserData}
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          {/* Ad-Specific Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard 
              title="Total Views" 
              value={(selectedAd.totalViews || 0).toLocaleString()} 
              icon={<Eye size={24}/>} 
              valueColor="text-blue-400" 
            />
            <AdminStatCard 
              title="Completions" 
              value={realUserData.length.toLocaleString()} 
              icon={<Target size={24}/>} 
              valueColor="text-green-400" 
            />
            <AdminStatCard 
              title="Completion Rate" 
              value={`${selectedAd.totalViews ? Math.round((realUserData.length / selectedAd.totalViews) * 100) : 0}%`} 
              icon={<BarChart3 size={24}/>} 
              valueColor="text-purple-400" 
            />
            <AdminStatCard 
              title="Total Earnings Paid" 
              value={`${realUserData.reduce((sum, u) => sum + u.earnedAmount, 0).toLocaleString()} FOG`} 
              icon={<DollarSign size={24}/>} 
              valueColor="text-yellow-400" 
            />
          </div>

          {/* Ad Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-96">
              <h3 className="font-semibold mb-4">Daily Views (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={analytics.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Ad Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Questions</span>
                  <span className="font-semibold">{selectedAd.questions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Reward per Completion</span>
                  <span className="font-semibold text-green-400">{selectedAd.totalReward} FOG</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Total Revenue Generated</span>
                  <span className="font-semibold text-blue-400">
                    {realUserData.reduce((sum, u) => sum + u.earnedAmount, 0).toLocaleString()} FOG
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-semibold ${
                    selectedAd.isActive && !selectedAd.isPaused ? 'text-green-400' : 
                    selectedAd.isPaused ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {selectedAd.isActive && !selectedAd.isPaused ? 'Active' : 
                     selectedAd.isPaused ? 'Paused' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Unique Users</span>
                  <span className="font-semibold text-purple-400">{realUserData.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-gray-400">Average Score</span>
                  <span className="font-semibold text-orange-400">
                    {realUserData.length > 0 ? 
                      Math.round(realUserData.reduce((sum, u) => sum + (u.correctAnswers / u.totalQuestions * 100), 0) / realUserData.length) : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <UserDetailsModal />
      </>
    );
  }

  // General platform analytics (original view)
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-gray-400 text-sm mt-1">Platform-wide metrics and performance.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Download size={16} />
          Export Data (CSV)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Platform Revenue (MTD)" value="$15,670" icon={<DollarSign size={24}/>} valueColor="text-green-400" />
        <AdminStatCard title="New Signups (MTD)" value="245" icon={<Users size={24}/>} valueColor="text-blue-400" />
        <AdminStatCard title="Active Gigs" value="1,890" icon={<Briefcase size={24}/>} />
        <AdminStatCard title="FOG Coin Circulation" value="45,230" icon={<HandCoins size={24}/>} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-96">
          <h3 className="font-semibold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-96">
          <h3 className="font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="users" name="New Users" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-96">
        <h3 className="font-semibold mb-4">Gig Category Distribution</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={gigDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {gigDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsView;
