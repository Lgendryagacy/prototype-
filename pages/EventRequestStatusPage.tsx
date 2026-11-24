import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, DollarSign,
  CheckCircle, XCircle, Loader2, AlertCircle, Eye, RefreshCw
} from 'lucide-react';
import { type Route } from '../types';
import { getUserEventRequests } from '../firebase/services/eventRequestService';
import type { EventRequest } from '../firebase/types/eventRequest';
import { toast } from 'react-hot-toast';

interface EventRequestStatusPageProps {
  navigate: (route: Route) => void;
  user?: any;
}

const EventRequestStatusPage = ({ navigate, user }: EventRequestStatusPageProps) => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      toast.error('Please login to view your requests');
      navigate('auth');
      return;
    }

    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const userRequests = await getUserEventRequests(user.uid);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load event requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
            <Clock size={16} />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
            <CheckCircle size={16} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold">
            <XCircle size={16} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your requests...</p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('events')}
            className="flex items-center gap-2 text-sm font-bold transition-colors group px-4 py-2 rounded-full mb-6"
            style={{ 
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 font-heading tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                My Event Requests
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Track the status of your submitted events
              </p>
            </div>

            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-3xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Total Requests</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <p className="text-4xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{requests.length}</p>
          </div>

          <div className="rounded-3xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">Pending</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-amber-600">
              {requests.filter(r => r.eventStatus === 'pending').length}
            </p>
          </div>

          <div className="rounded-3xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-green-600 uppercase tracking-wider">Approved</span>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-green-600">
              {requests.filter(r => r.eventStatus === 'approved').length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="rounded-3xl p-16 text-center shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <Calendar size={40} style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>No Event Requests</h3>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>You haven't submitted any event requests yet</p>
            <button
              onClick={() => navigate('create-event')}
              className="px-8 py-4 text-white font-bold rounded-2xl hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-primary))' }}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group border rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                style={{ 
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Card Image */}
                <div className="h-56 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  {request.banner ? (
                    <img 
                      src={request.banner} 
                      alt={request.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <Calendar size={48} className="text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {request.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex flex-col text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Start Time</span>
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        <Clock size={14}/> {request.startTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(request.eventStatus)}
                    <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                      {request.startDate}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 leading-snug transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                    {request.title}
                  </h3>

                  <p className="text-sm line-clamp-2 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {request.description}
                  </p>
                  
                  <div className="mt-auto pt-5 flex items-center justify-between" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                        {request.userProfile ? (
                          <img src={request.userProfile} alt="User" className="w-8 h-8 rounded-full object-cover" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }} />
                        ) : (
                          <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                            {request.userName?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Organizer</span>
                        <span className="text-xs font-bold truncate max-w-[100px]" style={{ color: 'var(--color-text-primary)' }}>
                          {request.userName || 'You'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Price</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                        {request.isFree ? 'Free' : `${request.priceInFOG} FOG`}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full mt-4 px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                      e.currentTarget.style.color = 'var(--color-bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                  >
                    <Eye size={18} />
                    View Full Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              style={{ backgroundColor: 'var(--color-card)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Banner */}
              {selectedRequest.banner && (
                <div className="relative h-64 overflow-hidden rounded-t-3xl">
                  <img 
                    src={selectedRequest.banner} 
                    alt={selectedRequest.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 right-6">
                    {getStatusBadge(selectedRequest.eventStatus)}
                  </div>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{selectedRequest.title}</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{selectedRequest.description}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Date & Time</p>
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        {selectedRequest.startDate} at {selectedRequest.startTime}
                        {selectedRequest.endDate && ` - ${selectedRequest.endDate} at ${selectedRequest.endTime}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Location</p>
                      {selectedRequest.type === 'virtual' ? (
                        <p style={{ color: 'var(--color-text-secondary)' }}>Virtual Event</p>
                      ) : (
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedRequest.venue && `${selectedRequest.venue}, `}
                          {selectedRequest.address && `${selectedRequest.address}, `}
                          {selectedRequest.city}, {selectedRequest.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users size={20} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Capacity</p>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Maximum {selectedRequest.maxCapacity} attendees</p>
                    </div>
                  </div>

                  {!selectedRequest.isFree && (
                    <div className="flex items-start gap-3">
                      <DollarSign size={20} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Price</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                          PKR {selectedRequest.priceInPKR} ≈ {selectedRequest.priceInFOG} FOG
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full px-6 py-4 text-white font-bold rounded-2xl transition-all"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRequestStatusPage;
