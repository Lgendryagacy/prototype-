import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Search, Filter,
  Edit, Pause, Play, Trash2, Eye, MoreVertical,
  TrendingUp, AlertCircle, CheckCircle2, XCircle,
  LayoutGrid, Plus, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { type Route } from '../types';
import { getAllActiveEvents, updateActiveEvent } from '../firebase/services/activeEventService';
import type { ActiveEvent } from '../firebase/types/activeEvent';

interface ManageEventsPageProps {
  navigate: (route: Route, context?: any) => void;
  currentUser: any;
}

const ManageEventsPage: React.FC<ManageEventsPageProps> = ({ navigate, currentUser }) => {
  const [events, setEvents] = useState<ActiveEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ActiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'physical' | 'virtual'>('all');

  // Fetch user's events
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const allEvents = await getAllActiveEvents();

        // Filter events by current user
        const userEvents = allEvents.filter(event => event.organizerId === currentUser.uid);

        setEvents(userEvents);
        setFilteredEvents(userEvents);
      } catch (error) {
        console.error('Error fetching user events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEvents();
  }, [currentUser]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.eventStatus === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, typeFilter, events]);

  // Handle pause/resume event
  const handleToggleStatus = async (eventId: string, currentStatus: string) => {
    try {
      setUpdatingEventId(eventId);
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await updateActiveEvent(eventId, { eventStatus: newStatus });

      // Update local state
      setEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, eventStatus: newStatus } : event
      ));
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Failed to update event status');
    } finally {
      setUpdatingEventId(null);
    }
  };

  // Handle close event
  const handleCloseEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to close this event? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdatingEventId(eventId);
      await updateActiveEvent(eventId, { eventStatus: 'closed' });

      // Update local state
      setEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, eventStatus: 'closed' } : event
      ));
    } catch (error) {
      console.error('Error closing event:', error);
      alert('Failed to close event');
    } finally {
      setUpdatingEventId(null);
    }
  };

  // Navigate to event detail
  const handleViewEvent = (event: ActiveEvent) => {
    const slug = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${event.id}`;
    navigate(`event/${slug}` as any, slug);
  };

  // Navigate to edit event
  const handleEditEvent = (event: ActiveEvent) => {
    navigate('create-event' as any, { editEventData: event });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Active', icon: CheckCircle2 },
      paused: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Paused', icon: Pause },
      closed: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', label: 'Closed', icon: XCircle },
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} ${badge.border} border flex items-center gap-1.5 w-fit`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  // Parse event date and time
  const parseEventDateTime = (date: string, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0, 0);
    return eventDate;
  };

  // Check if event is currently live
  const isEventLive = (event: ActiveEvent): boolean => {
    try {
      const now = new Date();
      const startDateTime = parseEventDateTime(event.startDate, event.startTime);
      
      if (!event.endDate || !event.endTime) {
        return now >= startDateTime;
      }
      
      const endDateTime = parseEventDateTime(event.endDate, event.endTime);
      return now >= startDateTime && now < endDateTime;
    } catch {
      return false;
    }
  };

  // Check if event has ended
  const isEventEnded = (event: ActiveEvent): boolean => {
    try {
      const now = new Date();
      
      if (!event.endDate || !event.endTime) {
        return false;
      }
      
      const endDateTime = parseEventDateTime(event.endDate, event.endTime);
      return now >= endDateTime;
    } catch {
      return false;
    }
  };

  // Get event time status
  const getEventTimeStatus = (startDate: string, startTime: string) => {
    try {
      const eventDateTime = new Date(`${startDate} ${startTime}`);
      const now = new Date();

      if (eventDateTime > now) {
        return { label: 'Upcoming', color: 'text-blue-600' };
      } else {
        return { label: 'Started/Past', color: 'text-slate-500' };
      }
    } catch {
      return { label: 'Unknown', color: 'text-slate-400' };
    }
  };

  // Stats
  const stats = {
    total: events.length,
    active: events.filter(e => e.eventStatus === 'active').length,
    paused: events.filter(e => e.eventStatus === 'paused').length,
    closed: events.filter(e => e.eventStatus === 'closed').length,
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-[var(--color-text-secondary)] mb-4" size={48} />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Authentication Required</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">Please log in to manage your events.</p>
          <Button onClick={() => navigate('auth')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">Manage Events</h1>
              <p className="text-[var(--color-text-secondary)]">Manage all your published events</p>
            </div>
            <Button
              onClick={() => navigate('create-event')}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-primary)]/20"
            >
              <Plus size={18} className="mr-2" />
              Create New Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-bold">Total Events</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-icon)] flex items-center justify-center text-white">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-success-icon)]">{stats.active}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-bold">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                  <Pause size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.paused}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-bold">Paused</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-text-secondary)] flex items-center justify-center text-white">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-secondary)]">{stats.closed}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-bold">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={18} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            >
              <option value="all">All Types</option>
              <option value="physical">Physical</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="bg-[var(--color-card)] p-20 rounded-2xl border border-[var(--color-border)] shadow-sm text-center">
            <Loader2 className="animate-spin text-[var(--color-primary)] mx-auto mb-4" size={48} />
            <p className="text-[var(--color-text-secondary)] font-medium">Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-[var(--color-card)] p-20 rounded-2xl border border-[var(--color-border)] shadow-sm text-center">
            <AlertCircle className="mx-auto text-[var(--color-text-secondary)] mb-4" size={48} />
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No Events Found</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {events.length === 0
                ? "You haven't created any events yet."
                : "No events match your current filters."}
            </p>
            {events.length === 0 && (
              <Button onClick={() => navigate('create-event')}>
                <Plus size={18} className="mr-2" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const timeStatus = getEventTimeStatus(event.startDate, event.startTime);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-6">
                    {/* Event Banner */}
                    <div className="w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-[var(--color-bg-secondary)]">
                      {event.banner && (
                        <img
                          src={event.banner}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{event.title}</h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(event.eventStatus)}
                            <span className={`text-xs font-bold ${timeStatus.color}`}>
                              {timeStatus.label}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                              {event.type}
                            </span>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <Calendar size={16} className="text-[var(--color-text-secondary)]" />
                          <span>{event.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <Clock size={16} className="text-[var(--color-text-secondary)]" />
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <MapPin size={16} className="text-[var(--color-text-secondary)]" />
                          <span>{event.city || 'Virtual'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <Users size={16} className="text-[var(--color-text-secondary)]" />
                          <span>{event.currentAttendees || 0} / {event.maxCapacity} attendees</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[var(--color-border)]">
                        {/* View Event */}
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border border-[var(--color-border)]"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {/* Edit Event */}
                        {!isEventLive(event) && !isEventEnded(event) && (
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border border-blue-200"
                            disabled={updatingEventId === event.id}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        )}

                        {/* View Participants */}
                        <button
                          onClick={() => navigate(`event-participants/${event.id}` as any, event.id)}
                          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border border-purple-200"
                        >
                          <Users size={16} />
                          Participants ({event.currentAttendees || 0})
                        </button>

                        {/* Pause/Resume Event */}
                        {event.eventStatus !== 'closed' && !isEventEnded(event) && (
                          <div className="relative group">
                            <button
                              onClick={() => handleToggleStatus(event.id!, event.eventStatus)}
                              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border ${
                                event.eventStatus === 'active'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                              } ${(updatingEventId === event.id || (event.eventStatus === 'active' && isEventLive(event))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={updatingEventId === event.id || (event.eventStatus === 'active' && isEventLive(event))}
                            >
                              {updatingEventId === event.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : event.eventStatus === 'active' ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                              {event.eventStatus === 'active' ? 'Pause' : 'Resume'}
                            </button>
                            {event.eventStatus === 'active' && isEventLive(event) && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Cannot pause a live event
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Close Event */}
                        {event.eventStatus !== 'closed' && !isEventLive(event) && !isEventEnded(event) && (
                          <button
                            onClick={() => handleCloseEvent(event.id!)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border border-red-200"
                            disabled={updatingEventId === event.id}
                          >
                            <XCircle size={16} />
                            Close Event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEventsPage;
