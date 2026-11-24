import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, XCircle,
  Eye, Loader, AlertCircle, Filter, Search, Globe, MonitorPlay,
  ChevronLeft, ChevronRight, Sparkles, Tag, Pause, Play, Trash2,
  UserCheck, StopCircle
} from 'lucide-react';
import {
  getAllActiveEvents,
  getActiveEventsByStatus,
  updateActiveEventStatus,
  updateActiveEvent
} from '../../../firebase/services/activeEventService';
import type { ActiveEvent, ActiveEventStatus } from '../../../firebase/types/activeEvent';
import { toast } from 'react-toastify';
import { auth } from '../../../firebase/config';

const ActiveEventsView: React.FC = () => {
  const [events, setEvents] = useState<ActiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ActiveEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      let data: ActiveEvent[] = [];
      
      if (filter === 'all') {
        data = await getAllActiveEvents();
      } else {
        data = await getActiveEventsByStatus(filter as ActiveEventStatus);
      }
      
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch active events');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async (event: ActiveEvent) => {
    if (!event.id) return;

    if (!confirm(`Pause event: "${event.title}"?\n\nThis will:\n⏸️ Stop new bookings\n✅ Keep existing bookings`)) {
      return;
    }

    setIsProcessing(event.id);
    try {
      await updateActiveEventStatus(event.id, 'paused');
      toast.success('⏸️ Event paused successfully!');
      fetchEvents();
    } catch (error: any) {
      console.error('Error pausing event:', error);
      toast.error(error.message || 'Failed to pause event');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResume = async (event: ActiveEvent) => {
    if (!event.id) return;

    if (!confirm(`Resume event: "${event.title}"?\n\nThis will:\n▶️ Allow new bookings again`)) {
      return;
    }

    setIsProcessing(event.id);
    try {
      await updateActiveEventStatus(event.id, 'active');
      toast.success('▶️ Event resumed successfully!');
      fetchEvents();
    } catch (error: any) {
      console.error('Error resuming event:', error);
      toast.error(error.message || 'Failed to resume event');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleClose = async (event: ActiveEvent) => {
    if (!event.id) return;

    if (!confirm(`Close event: "${event.title}"?\n\n⚠️ This will:\n🚫 Stop all new bookings\n📊 Archive the event\n\nThis action cannot be undone!`)) {
      return;
    }

    setIsProcessing(event.id);
    try {
      await updateActiveEventStatus(event.id, 'closed');
      toast.success('🔒 Event closed successfully!');
      fetchEvents();
    } catch (error: any) {
      console.error('Error closing event:', error);
      toast.error(error.message || 'Failed to close event');
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter and search
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: events.length,
    active: events.filter(e => e.eventStatus === 'active').length,
    paused: events.filter(e => e.eventStatus === 'paused').length,
    closed: events.filter(e => e.eventStatus === 'closed').length,
    totalAttendees: events.reduce((sum, e) => sum + (e.currentAttendees || 0), 0),
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
            <Play size={12} />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <Pause size={12} />
            Paused
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
            <StopCircle size={12} />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const icons = {
      physical: <MapPin size={12} />,
      virtual: <Globe size={12} />,
      hybrid: <MonitorPlay size={12} />
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700 text-slate-300 text-xs font-medium">
        {icons[type as keyof typeof icons]}
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-teal-400" size={32} />
            Active Events
          </h1>
          <p className="text-slate-400 mt-1">Manage live and ongoing events</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-green-700/30 rounded-xl p-6 hover:border-green-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Play size={24} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-700/30 rounded-xl p-6 hover:border-amber-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Paused</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.paused}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Pause size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 hover:border-red-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Closed</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.closed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <StopCircle size={24} className="text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-700/30 rounded-xl p-6 hover:border-teal-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Attendees</p>
              <p className="text-3xl font-bold text-teal-400 mt-2">{stats.totalAttendees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <UserCheck size={24} className="text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-teal-400" size={32} />
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">No active events found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-700/30 transition-colors">
                      {/* Event Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {event.banner ? (
                            <img 
                              src={event.banner} 
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-600"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center">
                              <Calendar size={24} className="text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{event.title}</p>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-1">{event.description}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/10 text-teal-400 text-xs font-medium rounded">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Organizer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {event.organizerProfile ? (
                            <img 
                              src={event.organizerProfile} 
                              alt={event.organizerName}
                              className="w-8 h-8 rounded-full border border-slate-600"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                              <span className="text-teal-400 text-xs font-bold">
                                {event.organizerName?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{event.organizerName}</p>
                            <p className="text-slate-400 text-xs">{event.organizerEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        {getTypeBadge(event.type)}
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white font-medium">{event.startDate}</p>
                          <p className="text-slate-400 text-xs">{event.startTime}</p>
                        </div>
                      </td>

                      {/* Attendees */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white font-bold">{event.currentAttendees || 0} / {event.maxCapacity}</p>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-teal-500 h-1.5 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(((event.currentAttendees || 0) / parseInt(event.maxCapacity)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(event.eventStatus)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-colors"
                            title="View Attendees"
                          >
                            <UserCheck size={16} />
                          </button>

                          {event.eventStatus === 'active' && (
                            <button
                              onClick={() => handlePause(event)}
                              disabled={isProcessing === event.id}
                              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Pause Event"
                            >
                              {isProcessing === event.id ? (
                                <Loader className="animate-spin" size={16} />
                              ) : (
                                <Pause size={16} />
                              )}
                            </button>
                          )}

                          {event.eventStatus === 'paused' && (
                            <button
                              onClick={() => handleResume(event)}
                              disabled={isProcessing === event.id}
                              className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Resume Event"
                            >
                              {isProcessing === event.id ? (
                                <Loader className="animate-spin" size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                          )}

                          {event.eventStatus !== 'closed' && (
                            <button
                              onClick={() => handleClose(event)}
                              disabled={isProcessing === event.id}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Close Event"
                            >
                              <StopCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-slate-300 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Banner */}
              {selectedEvent.banner && (
                <div className="relative h-64 overflow-hidden rounded-t-2xl">
                  <img 
                    src={selectedEvent.banner} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  <div className="absolute top-6 right-6">
                    {getStatusBadge(selectedEvent.eventStatus)}
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Title & Category */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-sm font-bold border border-teal-500/20 mb-4">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedEvent.title}</h2>
                  <p className="text-slate-300 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Organizer */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3">Organizer Information</p>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedEvent.organizerProfile ? (
                        <img 
                          src={selectedEvent.organizerProfile} 
                          alt={selectedEvent.organizerName}
                          className="w-12 h-12 rounded-full border border-slate-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <span className="text-teal-400 font-bold">
                            {selectedEvent.organizerName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold">{selectedEvent.organizerName}</p>
                        <p className="text-slate-400 text-sm">{selectedEvent.organizerEmail}</p>
                      </div>
                    </div>
                    {selectedEvent.organizerPhone && (
                      <p className="text-slate-300 text-sm">📞 {selectedEvent.organizerPhone}</p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Event Schedule
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-slate-400">Start:</span> {selectedEvent.startDate} at {selectedEvent.startTime}
                      </p>
                      {selectedEvent.endDate && (
                        <p className="text-white">
                          <span className="text-slate-400">End:</span> {selectedEvent.endDate} at {selectedEvent.endTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <MapPin size={16} /> Location & Type
                    </p>
                    <div className="space-y-2">
                      {getTypeBadge(selectedEvent.type)}
                      {selectedEvent.type !== 'virtual' && (
                        <div className="text-sm text-slate-300 mt-2">
                          {selectedEvent.venue && <p>{selectedEvent.venue}</p>}
                          {selectedEvent.address && <p>{selectedEvent.address}</p>}
                          <p>{selectedEvent.city}, {selectedEvent.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <UserCheck size={16} /> Attendance
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Registered:</span>
                        <span className="text-white font-bold">{selectedEvent.currentAttendees || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Capacity:</span>
                        <span className="text-white font-bold">{selectedEvent.maxCapacity}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(((selectedEvent.currentAttendees || 0) / parseInt(selectedEvent.maxCapacity)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Price: {selectedEvent.isFree ? 'Free' : `${selectedEvent.priceInFOG} FOG (PKR ${selectedEvent.priceInPKR})`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Tag size={16} /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-6 space-y-2 text-sm">
                  <p className="text-slate-400">
                    <span className="font-bold">Activated:</span> {formatDate(selectedEvent.activatedAt)}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-bold">Approved By:</span> Admin
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveEventsView;
