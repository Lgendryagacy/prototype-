import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Gift, Users, Clock, ShieldCheck, Star,
  ArrowLeft, PartyPopper, CheckCircle2, AlertCircle, Info,
  Coins, LayoutGrid, Zap, Sparkles, XCircle, Loader, Trash2
} from 'lucide-react';
import { type Route } from '../types';
import type { GiveawayRequest } from '../types/giveaway';
import { User } from '../firebase/types/user';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getUserGiveawayRequests, deleteGiveawayRequest } from '../firebase/services/giveawayRequestService';

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
    <motion.div
      className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px]"
      style={{
        background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
        bottom: '10%',
        left: '20%'
      }}
      animate={{
        x: [0, 30, -40, 25, 0],
        y: [0, -30, 40, -15, 0],
        scale: [1, 1.05, 0.9, 1.1, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
    />
  </div>
);

interface RequestCardProps {
  request: GiveawayRequest;
  onDelete: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(request.endTime).getTime();
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
  }, [request.endTime]);

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

  const statusColors: Record<string, string> = {
    pending: "border-yellow-500/30 text-yellow-500",
    approved: "border-green-500/30 text-green-500",
    rejected: "border-red-500/30 text-red-500"
  };

  const statusIcons: Record<string, any> = {
    pending: <Clock size={14} className="inline" />,
    approved: <CheckCircle2 size={14} className="inline" />,
    rejected: <XCircle size={14} className="inline" />
  };

  const handleDelete = async () => {
    if (!request.id || !confirm('Are you sure you want to delete this request?')) return;

    setIsDeleting(true);
    try {
      await deleteGiveawayRequest(request.id);
      onDelete(request.id);
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      layout
    >
      <Card className="rounded-[40px] glass-panel shadow-2xl h-full flex flex-col overflow-hidden bg-[--color-card] border-0">
        <div className={`h-2 w-full bg-gradient-to-r ${typeColors[request.type]}`} />

        <CardContent className="pt-10 px-8 pb-8 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-[--color-bg-tertiary] flex items-center justify-center border border-[--color-border] shadow-inner`}>
              {React.cloneElement(typeIcons[request.type], { size: 28 })}
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`mb-2 font-black border-2 ${statusColors[request.status]} uppercase`}>
                {statusIcons[request.status]} {request.status}
              </Badge>
              <p className="text-[10px] font-black text-[--color-text-secondary] uppercase tracking-widest flex items-center justify-end gap-1">
                <Clock size={10} /> {timeLeft}
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-[--color-text-primary] mb-2 leading-tight">
            {request.title}
          </h3>
          <p className="text-sm text-[--color-text-secondary] mb-8 font-medium opacity-80 leading-relaxed line-clamp-2">
            {request.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
              <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">
                {request.type === 'coins' ? 'Total Coins' : 'Winners'}
              </p>
              <p className="text-lg font-semibold text-[--color-text-primary]">
                {request.type === 'coins' ? `${request.totalCoins} FOG` : request.winnersCount}
              </p>
            </div>
            <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-2xl text-center border-0">
              <p className="text-[9px] font-semibold text-[--color-text-secondary] uppercase tracking-tighter opacity-60">Required</p>
              <p className="text-xs font-semibold text-[--color-text-primary]">{request.requiredNft}</p>
            </div>
          </div>

          {request.status === 'rejected' && request.rejectionReason && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20">
              <p className="text-xs font-bold text-red-500 mb-1 uppercase tracking-wider">Rejection Reason:</p>
              <p className="text-sm text-red-600">{request.rejectionReason}</p>
            </div>
          )}

          <div className="mt-auto">
            <p className="text-[10px] text-center mb-3 font-bold text-[--color-text-secondary] opacity-50 uppercase tracking-widest">
              Submitted: {new Date(request.createdAt).toLocaleDateString()}
            </p>

            {request.status === 'pending' && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                className="w-full h-12 rounded-2xl font-bold border-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                {isDeleting ? (
                  <Loader size={18} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={18} className="mr-2" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Request'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MyGiveawayRequests = ({ navigate, currentUser }: { navigate: (route: Route) => void; currentUser: User | null }) => {
  const [requests, setRequests] = useState<GiveawayRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) {
        navigate('auth');
        return;
      }

      try {
        setIsLoading(true);
        const userRequests = await getUserGiveawayRequests(currentUser.uid);
        setRequests(userRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleDeleteRequest = (deletedId: string) => {
    setRequests(prev => prev.filter(req => req.id !== deletedId));
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
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

          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-7 py-3 backdrop-blur-[20px] rounded-full text-sm font-semibold mb-8 shadow-sm"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)'
              }}
            >
              📋 My Submissions
            </motion.div>

            <motion.h1
              className="text-6xl md:text-7xl font-black mb-7 leading-tight"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              My Giveaway Requests
            </motion.h1>

            <motion.p
              className="text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Track the status of your giveaway submissions and see which ones are approved, pending, or rejected.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {[
                { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-600' },
                { label: 'Pending', value: stats.pending, color: 'from-yellow-400 to-amber-600' },
                { label: 'Approved', value: stats.approved, color: 'from-green-500 to-emerald-600' },
                { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-rose-600' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-[32px] glass-panel shadow-xl bg-[--color-card] border border-[--color-border]"
                >
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-[--color-text-secondary] uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-32">
          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-8 justify-center flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                  filter === status
                    ? 'bg-[--color-primary] text-white shadow-lg'
                    : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:bg-[--color-bg-tertiary]/80'
                }`}
              >
                {status} {status !== 'all' && `(${stats[status]})`}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-[--color-primary]/30 border-t-[--color-primary] rounded-full"
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredRequests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] mx-auto mb-6 flex items-center justify-center">
                <Gift size={48} className="text-[--color-text-secondary]" />
              </div>
              <h3 className="text-2xl font-black text-[--color-text-primary] mb-3">
                {filter === 'all' ? 'No Requests Yet' : `No ${filter} requests`}
              </h3>
              <p className="text-[--color-text-secondary] mb-8">
                {filter === 'all'
                  ? "You haven't submitted any giveaway requests yet."
                  : `You don't have any ${filter} requests at the moment.`}
              </p>
              <Button
                onClick={() => navigate('giveaways')}
                className="h-12 px-8 rounded-2xl font-bold bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white"
              >
                <Gift size={18} className="mr-2" />
                Submit a Giveaway
              </Button>
            </motion.div>
          )}

          {/* Requests Grid */}
          {!isLoading && filteredRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGiveawayRequests;
