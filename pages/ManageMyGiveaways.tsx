import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Gift, Clock, ArrowLeft, Coins, Zap, Search, Filter,
  Edit, Pause, Play, StopCircle, Loader, AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-react';
import { type Route } from '../types';
import type { ActiveGiveaway } from '../types/giveaway';
import { User } from '../firebase/types/user';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { auth } from '../firebase/config';
import { getUserActiveGiveaways, updateGiveawayStatus } from '../firebase/services/activeGiveawayService';
import PostGiveawayModal from '../components/PostGiveawayModal';

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
        top: '-10%',
        left: '10%'
      }}
      animate={{
        x: [0, 50, -30, 40, 0],
        y: [0, -50, 30, 20, 0],
        scale: [1, 1.1, 0.9, 1.05, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        top: '20%',
        right: '15%'
      }}
      animate={{
        x: [0, -40, 30, -20, 0],
        y: [0, 40, -30, 20, 0],
        scale: [1, 0.9, 1.1, 0.95, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
  </div>
);

interface GiveawayCardProps {
  giveaway: ActiveGiveaway;
  onEdit: (giveaway: ActiveGiveaway) => void;
  onPause?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onClose?: (id: string) => void;
  isProcessing: boolean;
}

const GiveawayCard: React.FC<GiveawayCardProps> = ({ 
  giveaway, 
  onEdit, 
  onPause, 
  onReactivate, 
  onClose,
  isProcessing 
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(giveaway.endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("ENDED");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) setTimeLeft(`${days}d ${hours}h`);
        else setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [giveaway.endTime]);

  const typeColors: Record<string, string> = {
    coins: "from-yellow-400 to-amber-600",
    nft: "from-purple-500 to-indigo-700",
    service: "from-blue-500 to-cyan-600"
  };

  const typeIcons: Record<string, any> = {
    coins: <Coins className="text-yellow-500" />,
    nft: <Trophy className="text-purple-500" />,
    service: <Zap className="text-blue-500" />
  };

  const status = giveaway.status;

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-500 border-green-500/30',
    paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    closed: 'bg-red-500/20 text-red-500 border-red-500/30'
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }} 
      transition={{ type: "spring", stiffness: 300 }}
      layout
    >
      <Card className="rounded-[40px] glass-panel shadow-2xl h-full flex flex-col overflow-hidden bg-[--color-card] border-0">
        <div className={`h-2 w-full bg-gradient-to-r ${typeColors[giveaway.type]}`} />

        <CardContent className="pt-8 px-8 pb-8 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-[--color-bg-tertiary] flex items-center justify-center border border-[--color-border] shadow-inner`}>
              {React.cloneElement(typeIcons[giveaway.type], { size: 28 })}
            </div>
            <div className="text-right">
              <Badge 
                variant="outline" 
                className={`mb-2 font-black border-2 uppercase ${statusColors[status]}`}
              >
                {status}
              </Badge>
              <p className="text-[10px] font-black text-[--color-text-secondary] uppercase tracking-widest flex items-center justify-end gap-1">
                <Clock size={10} /> {timeLeft}
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-[--color-text-primary] mb-2 leading-tight">{giveaway.title}</h3>
          <p className="text-sm text-[--color-text-secondary] mb-6 font-medium opacity-80 leading-relaxed line-clamp-2">
            {giveaway.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
              <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">Prize Pool</p>
              <p className="text-lg font-semibold text-[--color-text-primary]">
                {giveaway.totalCoins > 0 ? `${giveaway.totalCoins} FOG` : `${giveaway.winnersCount} Slots`}
              </p>
            </div>
            <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
              <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">
                Participants
              </p>
              <p className="text-lg font-semibold text-[--color-text-primary]">
                {giveaway.totalParticipated}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex gap-2">
            <Button
              onClick={() => onEdit(giveaway)}
              className="flex-1 h-12 rounded-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            
            <>
                {status === 'active' && onPause && (
                  <Button
                    onClick={() => onPause(giveaway.id!)}
                    disabled={isProcessing}
                    className="h-12 px-4 rounded-2xl font-bold bg-yellow-500 hover:bg-yellow-600 text-white"
                    title="Pause"
                  >
                    {isProcessing ? <Loader size={16} className="animate-spin" /> : <Pause size={16} />}
                  </Button>
                )}
                {status === 'paused' && onReactivate && (
                  <Button
                    onClick={() => onReactivate(giveaway.id!)}
                    disabled={isProcessing}
                    className="h-12 px-4 rounded-2xl font-bold bg-green-500 hover:bg-green-600 text-white"
                    title="Reactivate"
                  >
                    {isProcessing ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
                  </Button>
                )}
                {status === 'closed' && onEdit && (
                  <Button
                    onClick={() => onEdit(giveaway)}
                    disabled={isProcessing}
                    className="h-12 px-4 rounded-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white"
                    title="Reactivate (Update Date)"
                  >
                    <RefreshCw size={16} />
                  </Button>
                )}
                {status !== 'closed' && onClose && (
                  <Button
                    onClick={() => onClose(giveaway.id!)}
                    disabled={isProcessing}
                    className="h-12 px-4 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white"
                    title="Close"
                  >
                    <StopCircle size={16} />
                  </Button>
                )}
              </>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ManageMyGiveaways = ({ navigate, currentUser }: { navigate: (route: Route) => void; currentUser: User | null }) => {
  const [activeGiveaways, setActiveGiveaways] = useState<ActiveGiveaway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<ActiveGiveaway | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchGiveaways = async () => {
    if (!auth.currentUser) {
      navigate('auth');
      return;
    }

    try {
      setIsLoading(true);
      const userActive = await getUserActiveGiveaways(auth.currentUser.uid);
      setActiveGiveaways(userActive);
    } catch (error) {
      console.error('Error fetching giveaways:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const handleEdit = (giveaway: ActiveGiveaway) => {
    setEditingGiveaway(giveaway);
    setShowEditModal(true);
  };

  const handlePause = async (id: string) => {
    setProcessingId(id);
    try {
      await updateGiveawayStatus(id, 'paused');
      await fetchGiveaways();
    } catch (error) {
      console.error('Error pausing giveaway:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReactivate = async (id: string) => {
    setProcessingId(id);
    try {
      await updateGiveawayStatus(id, 'active');
      await fetchGiveaways();
    } catch (error) {
      console.error('Error reactivating giveaway:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this giveaway? This action cannot be undone.')) {
      return;
    }
    
    setProcessingId(id);
    try {
      await updateGiveawayStatus(id, 'closed');
      await fetchGiveaways();
    } catch (error) {
      console.error('Error closing giveaway:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter giveaways
  const filteredGiveaways = activeGiveaways.filter((giveaway) => {
    const matchesSearch = giveaway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         giveaway.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    return giveaway.status === filter;
  });

  // Stats
  const stats = {
    total: activeGiveaways.length,
    active: activeGiveaways.filter(g => g.status === 'active').length,
    paused: activeGiveaways.filter(g => g.status === 'paused').length,
    closed: activeGiveaways.filter(g => g.status === 'closed').length,
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4">
          {/* Back Button */}
          <motion.div
            className="absolute top-6 left-6 z-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => navigate('giveaways')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm backdrop-blur-[20px] hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Giveaways</span>
            </button>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <motion.h1
              className="text-5xl md:text-6xl font-black mb-4 leading-tight text-center"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Manage My Giveaways
            </motion.h1>

            <motion.p
              className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed text-center"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              View, edit, and manage all your active giveaway NFTs in one place
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-32">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-600', filter: 'all' },
              { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-600', filter: 'active' },
              { label: 'Paused', value: stats.paused, color: 'from-yellow-400 to-amber-600', filter: 'paused' },
              { label: 'Closed', value: stats.closed, color: 'from-gray-500 to-slate-600', filter: 'closed' },
            ].map((stat) => (
              <motion.button
                key={stat.label}
                onClick={() => setFilter(stat.filter as any)}
                className={`bg-[--color-card] rounded-2xl p-4 border-2 transition-all ${
                  filter === stat.filter ? 'border-[--color-primary]' : 'border-[--color-border] hover:border-[--color-primary]/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} mx-auto mb-2 flex items-center justify-center`}>
                  <span className="text-white text-xl font-black">{stat.value}</span>
                </div>
                <p className="text-xs font-bold text-[--color-text-secondary] uppercase tracking-wider">{stat.label}</p>
              </motion.button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[--color-text-secondary]" size={20} />
              <input
                type="text"
                placeholder="Search giveaways..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[--color-card] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size={40} className="animate-spin text-[--color-primary]" />
            </div>
          ) : filteredGiveaways.length === 0 ? (
            <div className="text-center py-20 bg-[--color-card] rounded-3xl border border-[--color-border]">
              <Gift size={64} className="mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
              <h3 className="text-2xl font-bold text-[--color-text-primary] mb-2">No Active Giveaways Found</h3>
              <p className="text-[--color-text-secondary]">
                {searchTerm ? 'No active giveaways match your search criteria' : 'You don\'t have any active giveaway NFTs yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGiveaways.map((giveaway) => (
                <GiveawayCard
                  key={giveaway.id}
                  giveaway={giveaway}
                  onEdit={handleEdit}
                  onPause={handlePause}
                  onReactivate={handleReactivate}
                  onClose={handleClose}
                  isProcessing={processingId === giveaway.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {currentUser && (
        <PostGiveawayModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingGiveaway(null);
          }}
          currentUser={currentUser}
          editMode={true}
          editData={editingGiveaway || undefined}
          onSuccess={() => {
            fetchGiveaways();
            setShowEditModal(false);
            setEditingGiveaway(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageMyGiveaways;
