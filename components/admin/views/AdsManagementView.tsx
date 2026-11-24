import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Play, Users, MoreVertical, Edit, Trash2, Pause, BarChart3 } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import AdActionDropdown from './AdActionDropdown';
import CreateEditAdModal from '../ads/CreateEditAdModal';
import IndividualAdAnalytics from './IndividualAdAnalytics';
import { Ad } from '../../../firebase/types/ads';
import { getAllAds, toggleAdStatus, toggleAdPause, deleteAd } from '../../../firebase/services/adService';
import { toast } from 'react-hot-toast';

interface AdsManagementViewProps {
  onCreateNew?: () => void;
  onEditAd?: (ad: Ad) => void;
  onViewAd?: (ad: Ad) => void;
  onViewAnalytics?: (adId: string) => void;
}

interface AdsManagementViewProps {
  onCreateNew?: () => void;
  onEditAd?: (ad: Ad) => void;
  onViewAd?: (ad: Ad) => void;
  onViewAnalytics?: (adId: string) => void;
}

const AdCard = ({ ad, onEdit, onView, onViewAnalytics, onTogglePause, onToggleStatus, onDelete }: { 
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onView: (ad: Ad) => void;
  onViewAnalytics: (adId: string) => void;
  onTogglePause: (adId: string) => void;
  onToggleStatus: (adId: string) => void;
  onDelete: (adId: string, title: string) => void;
}) => {
  const getStatusInfo = (ad: Ad) => {
    if (!ad.isActive) {
      return { status: 'Inactive', classes: 'bg-gray-700 text-gray-400 border-gray-600' };
    }
    if (ad.isPaused) {
      return { status: 'Paused', classes: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' };
    }
    return { status: 'Active', classes: 'bg-green-900/50 text-green-400 border-green-700' };
  };

  const statusInfo = getStatusInfo(ad);
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col md:flex-row items-start gap-4 p-4 transition-all hover:border-blue-500/50">
      {/* Thumbnail */}
      <div className="w-full md:w-48 h-32 md:h-full flex-shrink-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] rounded-lg flex flex-col items-center justify-center text-center p-2 relative">
        {ad.previewImage ? (
          <img 
            src={ad.previewImage} 
            alt={ad.title} 
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              // Fallback to default design
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={ad.previewImage ? 'hidden' : ''}>
          <p className="font-kalam text-xl text-yellow-300">Welcome To</p>
          <h4 className="text-3xl font-extrabold text-white">FOGSLY</h4>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-white">{ad.title}</h3>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.classes}`}>
                {statusInfo.status}
              </span>
              <div className="relative group">
                <button className="p-1 hover:bg-slate-700 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
                <div className="absolute right-0 top-8 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[150px]">
                  <button
                    onClick={() => onView(ad)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-sm text-white"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => onViewAnalytics(ad.id)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-sm text-white"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                  <button
                    onClick={() => onEdit(ad)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-sm text-white"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onTogglePause(ad.id)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-sm text-white"
                  >
                    {ad.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {ad.isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => onToggleStatus(ad.id)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-sm text-white"
                  >
                    {ad.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <hr className="my-1 border-slate-600" />
                  <button
                    onClick={() => onDelete(ad.id, ad.title)}
                    className="w-full px-3 py-2 text-left hover:bg-red-900/50 flex items-center gap-2 text-sm text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-md">{ad.description}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-700/50">
          <AdStatItem label="Questions" value={ad.questions.length} />
          <AdStatItem label="Reward" value={`${ad.totalReward} coins`} />
          <AdStatItem label="Views" value={(ad.totalViews || 0).toLocaleString()} />
          <AdStatItem label="Completions" value={(ad.totalCompletions || 0).toLocaleString()} />
        </div>
      </div>
    </div>
  );
};

const AdStatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-white mt-1">{value}</p>
  </div>
);

const AdsManagementView: React.FC<AdsManagementViewProps> = ({ 
  onCreateNew, 
  onEditAd, 
  onViewAd, 
  onViewAnalytics 
}) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'inactive'>('all');
  const [currentView, setCurrentView] = useState<'management' | 'analytics'>('management');
  const [selectedAdForAnalytics, setSelectedAdForAnalytics] = useState<Ad | null>(null);
  
  // Modal states
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const currentAdminId = 'admin-user-id'; // You should get this from auth context

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    filterAds();
  }, [ads, searchTerm, statusFilter]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const adsData = await getAllAds();
      setAds(adsData);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const filterAds = () => {
    let filtered = ads.filter(ad => {
      const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = statusFilter === 'all' ||
        (statusFilter === 'active' && ad.isActive && !ad.isPaused) ||
        (statusFilter === 'paused' && ad.isPaused) ||
        (statusFilter === 'inactive' && !ad.isActive);

      return matchesSearch && matchesFilter;
    });

    setFilteredAds(filtered);
  };

  const handleToggleStatus = async (adId: string) => {
    try {
      await toggleAdStatus(adId);
      toast.success('Ad status updated successfully');
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const handleTogglePause = async (adId: string) => {
    try {
      await toggleAdPause(adId);
      toast.success('Ad pause status updated successfully');
      loadAds();
    } catch (error) {
      console.error('Error toggling ad pause:', error);
      toast.error('Failed to update ad pause status');
    }
  };

  // Modal handlers
  const handleCreateNew = () => {
    setEditingAd(null);
    setShowCreateEditModal(true);
    onCreateNew?.();
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setShowCreateEditModal(true);
    onEditAd?.(ad);
  };

  const handleModalClose = () => {
    setShowCreateEditModal(false);
    setEditingAd(null);
  };

  const handleModalSuccess = () => {
    loadAds(); // Reload ads after successful create/edit
    setShowCreateEditModal(false);
    setEditingAd(null);
  };

  const handleViewAnalytics = (ad: Ad) => {
    setSelectedAdForAnalytics(ad);
    setCurrentView('analytics');
  };

  const handleBackToManagement = () => {
    setCurrentView('management');
    setSelectedAdForAnalytics(null);
  };

  const handleViewAd = (ad: Ad) => {
    onViewAd?.(ad);
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${adTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAd(adId);
      toast.success('Ad deleted successfully');
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  // Calculate stats
  const stats = {
    totalAds: ads.length,
    activeAds: ads.filter(ad => ad.isActive && !ad.isPaused).length,
    totalViews: ads.reduce((sum, ad) => sum + (ad.totalViews || 0), 0),
    avgCompletion: ads.length > 0 
      ? Math.round((ads.reduce((sum, ad) => sum + (ad.totalCompletions || 0), 0) / 
                    ads.reduce((sum, ad) => sum + (ad.totalViews || 0), 0)) * 100) || 0
      : 0
  };

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <h2 className="text-2xl font-bold">Ads Management</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading ads...</span>
        </div>
      </div>
    );
  }

  // Show individual ad analytics view
  if (currentView === 'analytics' && selectedAdForAnalytics) {
    return (
      <IndividualAdAnalytics 
        ad={selectedAdForAnalytics}
        onBack={handleBackToManagement}
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Ads Management</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage advertising campaigns</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Ad
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Ads" value={stats.totalAds.toString()} icon={<Eye size={24} />} />
        <AdminStatCard title="Active Ads" value={stats.activeAds.toString()} icon={<Play size={24} />} valueColor="text-green-400" />
        <AdminStatCard title="Total Views" value={stats.totalViews.toLocaleString()} icon={<Users size={24} />} />
        <AdminStatCard title="Avg. Completion" value={`${stats.avgCompletion}%`} icon={<BarChart3 size={24} />} valueColor="text-blue-400" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search ads..."
            className="w-full bg-slate-900 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-600 rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Ad List */}
      <div className="space-y-4">
        {filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No ads found' : 'No ads created yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first ad to start earning revenue from user engagement'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button 
                onClick={() => onCreateNew?.()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Create Your First Ad
              </button>
            )}
          </div>
        ) : (
          filteredAds.map(ad => (
            <AdCard
              key={ad.id}
              ad={ad}
              onEdit={handleEditAd}
              onView={handleViewAd}
              onViewAnalytics={() => handleViewAnalytics(ad)}
              onTogglePause={handleTogglePause}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteAd}
            />
          ))
        )}
      </div>

      {/* Create/Edit Ad Modal */}
      {showCreateEditModal && (
        <CreateEditAdModal
          editingAd={editingAd}
          isOpen={showCreateEditModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          currentAdminId="admin" // TODO: Get from admin context
        />
      )}
    </div>
  );
};

export default AdsManagementView;
