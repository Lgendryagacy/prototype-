import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, Download, Users, DollarSign, Ticket,
  TrendingUp, X, Mail, Phone, Calendar, Check, XCircle, Clock,
  Eye, FileText, AlertCircle, Loader2, UserCircle, CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { type Route } from '../types';
import { getEventTickets } from '../firebase/services/eventTicketService';
import { getActiveEventById } from '../firebase/services/activeEventService';
import type { EventTicket } from '../firebase/types/eventTicket';
import type { ActiveEvent } from '../firebase/types/activeEvent';

interface EventParticipantsPageProps {
  navigate: (route: Route, context?: any) => void;
  context?: string; // eventId
  currentUser?: any;
}

const EventParticipantsPage = ({ navigate, context: eventId, currentUser }: EventParticipantsPageProps) => {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [participants, setParticipants] = useState<EventTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'used'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<EventTicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch event and participants
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch event details
        const eventData = await getActiveEventById(eventId);
        
        if (!eventData) {
          console.error('Event not found');
          setIsLoading(false);
          return;
        }

        // Check if current user is the organizer
        if (currentUser?.uid !== eventData.organizerId) {
          console.error('Unauthorized: Not the event organizer');
          navigate('events');
          return;
        }

        setEvent(eventData);

        // Fetch participants
        const tickets = await getEventTickets(eventId);
        setParticipants(tickets);

      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, currentUser, navigate]);

  // Filter and search participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = 
        p.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.attendeePhone.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      
      const matchesPayment = 
        paymentFilter === 'all' || 
        (paymentFilter === 'free' && p.paymentMethod === 'free') ||
        (paymentFilter === 'paid' && p.paymentMethod === 'fog-coins');

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [participants, searchTerm, statusFilter, paymentFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(p => p.status === 'active').length;
    const totalRevenue = participants
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.priceInFOG, 0);
    const freeTickets = participants.filter(p => p.paymentMethod === 'free').length;
    const paidTickets = participants.filter(p => p.paymentMethod === 'fog-coins').length;

    return { totalParticipants, activeParticipants, totalRevenue, freeTickets, paidTickets };
  }, [participants]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Name', 'Email', 'Phone', 'Price (FOG)', 'Payment Method', 'Status', 'Booking Date'];
    const rows = filteredParticipants.map(p => [
      p.ticketId,
      p.attendeeName,
      p.attendeeEmail,
      p.attendeePhone,
      p.priceInFOG.toString(),
      p.paymentMethod,
      p.status,
      new Date(p.purchaseDate).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event?.title.replace(/[^a-z0-9]/gi, '-')}-participants.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      cancelled: 'bg-red-50 text-red-600 border-red-200',
      used: 'bg-blue-50 text-blue-600 border-blue-200',
      expired: 'bg-slate-100 text-slate-500 border-slate-200'
    };

    const icons = {
      active: <Check size={12} />,
      cancelled: <XCircle size={12} />,
      used: <Check size={12} />,
      expired: <Clock size={12} />
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${styles[status as keyof typeof styles] || styles.active}`}>
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading participants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-page pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h2>
            <p className="text-slate-600 mb-6">The event you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('events')}>Back to Events</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('events')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors group px-4 py-2 rounded-full hover:bg-teal-50 mb-6"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2 font-heading">Event Participants</h1>
              <p className="text-slate-600 font-medium">{event.title}</p>
              <p className="text-sm text-slate-500">{event.startDate} • {event.startTime}</p>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2"
              disabled={filteredParticipants.length === 0}
            >
              <Download size={18} />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Active</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.activeParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Revenue</p>
                <p className="text-2xl font-extrabold text-teal-600">{stats.totalRevenue.toFixed(2)} FOG</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Ticket size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Free</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.freeTickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Paid</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.paidTickets}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Payments</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">
              Showing {filteredParticipants.length} of {participants.length} participants
            </p>
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                className="text-sm text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Participants Table */}
        {filteredParticipants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Participants Found</h3>
            <p className="text-slate-600">
              {participants.length === 0 
                ? 'No one has registered for this event yet.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Booking Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {participant.attendeeProfileImage ? (
                            <img
                              src={participant.attendeeProfileImage}
                              alt={participant.attendeeName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <UserCircle size={20} className="text-slate-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{participant.attendeeName}</p>
                            <p className="text-xs text-slate-500">{participant.ticketId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {participant.attendeeEmail}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {participant.attendeePhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{participant.priceInFOG} FOG</p>
                          <p className="text-xs text-slate-500 capitalize">{participant.paymentMethod === 'fog-coins' ? 'Paid' : 'Free'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(participant.purchaseDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowDetailModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold text-sm rounded-lg transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedParticipant && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Participant Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Participant Info */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Participant Information</h3>
                    <div className="flex items-center gap-4 mb-4">
                      {selectedParticipant.attendeeProfileImage ? (
                        <img
                          src={selectedParticipant.attendeeProfileImage}
                          alt={selectedParticipant.attendeeName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                          <UserCircle size={32} className="text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-lg text-slate-900">{selectedParticipant.attendeeName}</p>
                        <p className="text-sm text-slate-600">{selectedParticipant.attendeeEmail}</p>
                        <p className="text-sm text-slate-600">{selectedParticipant.attendeePhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Ticket Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Ticket ID</p>
                        <p className="font-bold text-slate-900">{selectedParticipant.ticketId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        {getStatusBadge(selectedParticipant.status)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Booking Date</p>
                        <p className="font-bold text-slate-900">
                          {new Date(selectedParticipant.purchaseDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Check-in Status</p>
                        <p className="font-bold text-slate-900">
                          {selectedParticipant.isVerified ? 'Verified ✓' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Price (FOG)</p>
                        <p className="font-bold text-teal-600 text-lg">{selectedParticipant.priceInFOG} FOG</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                        <p className="font-bold text-slate-900 capitalize">
                          {selectedParticipant.paymentMethod === 'fog-coins' ? 'FOG Coins' : 'Free'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Price Display</p>
                        <p className="font-bold text-slate-900">{selectedParticipant.price}</p>
                      </div>
                      {selectedParticipant.transactionId && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                          <p className="font-bold text-slate-900 text-xs truncate">{selectedParticipant.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Event Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Event</p>
                        <p className="font-bold text-slate-900">{selectedParticipant.eventTitle}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="font-bold text-slate-900">{selectedParticipant.eventDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="font-bold text-slate-900">{selectedParticipant.eventTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Type</p>
                          <p className="font-bold text-slate-900 capitalize">{selectedParticipant.eventType}</p>
                        </div>
                        {selectedParticipant.eventVenue && (
                          <div>
                            <p className="text-xs text-slate-500">Venue</p>
                            <p className="font-bold text-slate-900">{selectedParticipant.eventVenue}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default EventParticipantsPage;
