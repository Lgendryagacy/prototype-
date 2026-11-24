// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
   <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <motion.div
         className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
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
         className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
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
         className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[80px]"
         style={{
            background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
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

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Calendar, MapPin, Globe, Clock, Plus, Search, Filter,
   ChevronRight, ArrowLeft, MoreHorizontal, CheckCircle2,
   Users, Share2, Star, LayoutGrid, Ticket, MonitorPlay,
   Heart, ExternalLink, Copy, X, ChevronDown, Wallet,
   BarChart3, Sparkles, ArrowUpRight, Zap, TrendingUp, Rocket,
   QrCode, AlertCircle, Loader2, Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { type Route } from '../types';
import { EventType, EventStatus, Event, MOCK_EVENTS, STATUS_FILTERS } from '../constants';
import { getAllActiveEvents, updateActiveEvent } from '../firebase/services/activeEventService';
import { getUserEventRequests } from '../firebase/services/eventRequestService';
import { getUserProfile } from '../firebase/services/userService';
import type { ActiveEvent } from '../firebase/types/activeEvent';

// --- Utility Functions ---

const parseEventDateTime = (date: string, time: string): Date => {
   return new Date(`${date}T${time}`);
};

const calculateEventStatus = (event: Event): EventStatus => {
   const now = new Date();
   const startDateTime = parseEventDateTime(event.startDate, event.startTime);

   // Check if event has end date/time
   if (!event.endDate || !event.endTime) {
      // Fallback: If no end date, use original logic
      const hoursUntilStart = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (now >= startDateTime) return 'live';
      if (hoursUntilStart <= 5) return 'coming_soon';
      return 'coming_soon';
   }

   const endDateTime = parseEventDateTime(event.endDate, event.endTime);
   const hoursSinceEnd = (now.getTime() - endDateTime.getTime()) / (1000 * 60 * 60);
   const hoursUntilStart = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

   // EXPIRED: ended more than 1 hour ago
   if (hoursSinceEnd > 1) return 'expired';

   // COMPLETED: ended less than 1 hour ago
   if (now >= endDateTime) return 'completed';

   // LIVE: started but not ended
   if (now >= startDateTime && now < endDateTime) return 'live';

   // COMING SOON: starts within next 1 hour
   if (hoursUntilStart <= 1 && now < startDateTime) return 'coming_soon';

   // Default: upcoming event
   return 'coming_soon';
};

const updateEventStatusInFirestore = async (eventId: string, status: 'closed') => {
   try {
      await updateActiveEvent(eventId, { eventStatus: status });
   } catch (error) {
      console.error(`❌ Failed to update event ${eventId} status:`, error);
   }
};

// --- Sub-Components ---

const OrganizerAvatar = ({ src, name, size = 'md' }: { src: string, name: string, size?: 'sm' | 'md' | 'lg' }) => {
   const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-20 h-20 text-2xl'
   };

   const isPlaceholder = src.startsWith('placeholder:');

   if (isPlaceholder) {
      const letter = src.split(':')[1] || 'U';
      const colors = [
         'bg-teal-500',
         'bg-blue-500',
         'bg-purple-500',
         'bg-pink-500',
         'bg-orange-500',
         'bg-green-500'
      ];
      const colorIndex = letter.charCodeAt(0) % colors.length;

      return (
         <div className={`${sizes[size]} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold shrink-0`}>
            {letter}
         </div>
      );
   }

   return (
      <img
         src={src}
         alt={name}
         className={`${sizes[size]} rounded-full object-cover shrink-0`}
         onError={(e) => {
            // If image fails to load, replace with placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = `${sizes[size]} rounded-full bg-slate-400 flex items-center justify-center text-white font-bold`;
            placeholder.textContent = name.charAt(0).toUpperCase();
            target.parentNode?.appendChild(placeholder);
         }}
      />
   );
};

const StatusBadge = ({ status }: { status: EventStatus }) => {
   const styles = {
      draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      coming_soon: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      live: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500/50 shadow-lg shadow-red-500/30 animate-pulse",
      completed: "bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-[var(--color-success-icon)]",
      expired: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20 line-through",
   };

   const labels = {
      draft: "Draft",
      pending: "Under Review",
      coming_soon: "Coming Soon",
      live: "● LIVE NOW",
      completed: "Completed",
      expired: "Past Event",
      cancelled: "Cancelled"
   };

   return (
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${styles[status]}`}>
         {labels[status]}
      </span>
   );
};

// --- Views ---

const EventsHome = ({
   onEventClick,
   navigate,
   userHasEvents,
   userHasPendingRequests
}: {
   onEventClick: (id: string, event: Event) => void;
   navigate: (route: Route, context?: any) => void;
   userHasEvents: boolean;
   userHasPendingRequests: boolean;
}) => {
   const [searchTerm, setSearchTerm] = useState("");
   const [activeType, setActiveType] = useState<"All" | EventType>("All");
   const [activeCategory, setActiveCategory] = useState("All");
   const [activeStatus, setActiveStatus] = useState("All");
   const [events, setEvents] = useState<Event[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [categories, setCategories] = useState<string[]>(["All"]);
   const [nextUpcomingEvent, setNextUpcomingEvent] = useState<Event | null>(null);

   // Fetch active events from Firestore
   const fetchEvents = async () => {
      try {
         setIsLoading(true);

         const activeEvents = await getAllActiveEvents();

         // Extract unique categories from active events
         const uniqueCategories = new Set<string>();
         activeEvents.forEach(ae => {
            // Include categories from both 'active' and 'closed' events
            if ((ae.eventStatus === 'active' || ae.eventStatus === 'closed') && ae.category) {
               uniqueCategories.add(ae.category);
            }
         });

         // Sort categories alphabetically and add "All" at the beginning
         const sortedCategories = ["All", ...Array.from(uniqueCategories).sort()];
         setCategories(sortedCategories);

         // Transform ActiveEvent to Event interface with dynamic status
         const transformedEvents: Event[] = await Promise.all(
            activeEvents
               .filter(ae => {
                  // Show events that are 'active' or 'closed' (closed = completed/expired but still visible)
                  // Hide only 'draft', 'pending', 'cancelled'
                  const shouldShow = ae.eventStatus === 'active' || ae.eventStatus === 'closed';
                  return shouldShow;
               })
               .map(async ae => {
                  // Fetch organizer profile to get avatar
                  let organizerAvatar = '';
                  try {
                     if (ae.organizerId) {
                        const organizerProfile = await getUserProfile(ae.organizerId);
                        organizerAvatar = organizerProfile?.avatarUrl || '';
                     }
                  } catch (error) {
                     console.error('Error fetching organizer profile:', error);
                  }

                  // If no avatar, use placeholder with first letter
                  if (!organizerAvatar) {
                     const firstLetter = ae.organizerName?.charAt(0).toUpperCase() || 'U';
                     organizerAvatar = `placeholder:${firstLetter}`;
                  }

                  const event: Event = {
                     id: ae.id || '',
                     title: ae.title,
                     description: ae.description,
                     banner: ae.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
                     type: ae.type,
                     category: ae.category,
                     status: 'live' as EventStatus,
                     startDate: ae.startDate,
                     endDate: ae.endDate,
                     startTime: ae.startTime,
                     city: ae.city,
                     country: ae.country,
                     address: ae.address,
                     virtualLink: ae.type === 'virtual' ? 'https://meet.fogsly.com/event' : undefined,
                     organizerName: ae.organizerName,
                     organizerAvatar: organizerAvatar,
                     price: ae.isFree ? 'Free' : `${ae.priceInFOG} FOG`,
                     attendees: ae.currentAttendees || 0,
                     maxCapacity: parseInt(ae.maxCapacity) || 0,
                     isFeatured: false,
                     tags: ae.tags || [],
                     endTime: ae.endTime // Add endTime for status calculation
                  };

                  // Calculate dynamic status
                  const calculatedStatus = calculateEventStatus(event);
                  event.status = calculatedStatus;

                  // Update Firestore if event is completed or expired
                  if ((calculatedStatus === 'completed' || calculatedStatus === 'expired') && ae.eventStatus === 'active') {
                     await updateEventStatusInFirestore(ae.id || '', 'closed');
                  }

                  return event;
               })
         );

         setEvents(transformedEvents);

         // Find next upcoming event (not started yet, closest to current time)
         const now = new Date();
         const upcomingEvents = transformedEvents.filter(event => {
            try {
               const startDateTime = parseEventDateTime(event.startDate, event.startTime);
               return startDateTime > now && (event.status === 'coming_soon' || event.status === 'draft');
            } catch {
               return false;
            }
         });

         // Sort by start date/time (earliest first)
         const sortedUpcoming = upcomingEvents.sort((a, b) => {
            try {
               const dateA = parseEventDateTime(a.startDate, a.startTime);
               const dateB = parseEventDateTime(b.startDate, b.startTime);
               return dateA.getTime() - dateB.getTime();
            } catch {
               return 0;
            }
         });

         // Set the next upcoming event (first in sorted array)
         setNextUpcomingEvent(sortedUpcoming[0] || null);

      } catch (error) {
         console.error('❌ Error fetching events:', error);
         // Don't fallback to mock data - show real state
         setEvents([]);
         setNextUpcomingEvent(null);
      } finally {
         setIsLoading(false);
      }
   };

   // Initial fetch and auto-sync setup
   useEffect(() => {
      // Initial fetch
      fetchEvents();


      const syncInterval = setInterval(() => {
         fetchEvents();
      }, 60000);

      // Cleanup on unmount
      return () => {
         console.log('🛑 Auto-sync stopped');
         clearInterval(syncInterval);
      };
   }, []);

   // Filtering Logic
   const filteredEvents = useMemo(() => {
      const filtered = events.filter(event => {
         // Exclude draft/pending from public view unless specific test
         if (event.status === 'draft' || event.status === 'pending') return false;

         const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesType = activeType === "All" || event.type === activeType;
         const matchesCategory = activeCategory === "All" || event.category === activeCategory;
         const matchesStatus = activeStatus === "All" || event.status === activeStatus;

         return matchesSearch && matchesType && matchesCategory && matchesStatus;
      });
      return filtered;
   }, [events, searchTerm, activeType, activeCategory, activeStatus]);

   const featuredEvents = filteredEvents.filter(e => e.isFeatured);
   const regularEvents = filteredEvents.filter(e => !e.isFeatured);

   return (
      <div className="space-y-8 animate-fade-in pb-24 pt-0 relative">
         <AnimatedBackground />




         {/* Premium Hero Section */}
         <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[420px] md:min-h-[480px] flex flex-col md:flex-row items-center bg-[var(--color-card)] border-2 border-[var(--color-border)] mb-8 md:mb-16 px-2 xs:px-4 md:px-0">
            {/* Abstract Background - Theme Aware */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5 z-0"></div>
            <div className="absolute -top-0 -right-40 w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 w-full max-w-7xl mx-auto px-2 xs:px-4 md:px-12 py-6 md:py-8 flex flex-col md:flex-row gap-12 items-center justify-center">

               <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-0">
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                     className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
                  >
                     <Sparkles size={12} /> Premier Events
                  </motion.div>
                  <motion.h1
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.1 }}
                     className="text-4xl md:text-6xl font-extrabold mb-6 font-heading tracking-tight leading-tight text-[var(--events-title)]"                  >
                     Global Networking, <br />
                     <span className="text-[var(--events-subtitle)]">Workshops & Industry Events</span>
                  </motion.h1>
                  <motion.p
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.2 }}
                     className="text-[var(--events-description)] text-lg mb-8 font-light leading-relaxed max-w-xl mx-auto md:mx-0"
                  >
                     Access world-class summits, local meetups, and exclusive professional workshops designed to expand your network and skills. Discover business networking events, industry expos, and learning opportunities that connect professionals worldwide. The future of global networking starts here.
                  </motion.p>

                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.3 }}
                     className="bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)] p-1.5 rounded-full flex flex-row items-center gap-2 max-w-2xl shadow-lg w-full"
                  >
                     <div className="relative flex-grow min-w-0">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={20} />
                        <input
                           type="text"
                           placeholder="Find events, topics, or locations..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-14 pr-4 py-3.5 rounded-full bg-transparent text-[var(--events-text-input)] focus:outline-none border-none transition-all font-medium placeholder:text-[var(--events-text-input-placeholder)]" />
                     </div>
                     <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white border-none shadow-md px-8 py-3.5 rounded-full transition-all font-bold whitespace-nowrap hover:shadow-lg hover:scale-105">
                        Explore
                     </button>
                  </motion.div>
                  {/* Hero Section Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center sm:justify-start w-full pt-6">
                     {userHasPendingRequests && (
                        <motion.button
                           onClick={() => onEventClick('event-request-status', undefined as any)}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="bg-[var(--color-card)]/80 text-[var(--color-text-primary)] px-6 py-3 rounded-full shadow-md hover:shadow-lg font-semibold flex items-center gap-2 transition-all border border-[var(--color-border)] hover:border-[var(--color-primary)] whitespace-nowrap"
                        >
                           <Calendar size={18} />
                           My Requests
                        </motion.button>
                     )}
                     {userHasEvents && (
                        <motion.button
                           onClick={() => navigate('manage-events')}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="bg-[var(--color-card)]/80 text-[var(--color-text-primary)] px-6 py-3 rounded-full shadow-md hover:shadow-lg font-semibold flex items-center gap-2 transition-all border border-[var(--color-border)] hover:border-[var(--color-primary)] whitespace-nowrap"
                        >
                           <LayoutGrid size={18} />
                           Manage Events
                        </motion.button>
                     )}
                     <motion.button
                        onClick={() => onEventClick('create-event', undefined as any)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
                     >
                        <Plus size={18} strokeWidth={2.5} />
                        Create Event
                     </motion.button>
                  </div>
               </div>

               {/* Right Visual Element - Premium Card */}
               <div className="flex-1 hidden md:flex items-center justify-center relative">
                  {nextUpcomingEvent ? (
                     <motion.div
                        key={nextUpcomingEvent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -8 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => onEventClick(nextUpcomingEvent.id, nextUpcomingEvent)}
                        className="relative z-10 bg-gradient-to-br from-[var(--events-card-gradient-from)]/10 via-[var(--events-card-bg)] to-[var(--events-card-gradient-to)]/10 p-2 rounded-3xl shadow-2xl w-full max-w-sm cursor-pointer group border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-all"
                     >
                        {/* Glow Effect behind */}
                        <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 -z-10"></div>

                        {/* Inner Container */}
                        <div className="bg-[var(--events-bg-hero)] rounded-[1.7rem] p-6 h-full relative overflow-hidden flex flex-col gap-5">
                           {/* Top Shine */}
                           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                           {/* Header */}
                           <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                                    <Calendar size={22} strokeWidth={2.5} />
                                 </div>
                                 <div>
                                    <h3 className="text-[var(--events-title)] font-bold text-base leading-tight group-hover:text-[var(--color-primary)] transition-colors">Next Big Event</h3>
                                    <p className="text-[var(--events-description)] text-xs font-medium mt-0.5 opacity-80">
                                       {nextUpcomingEvent.startDate} • {nextUpcomingEvent.type === 'virtual' ? 'Virtual' : nextUpcomingEvent.city}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                 <StatusBadge status={nextUpcomingEvent.status} />
                              </div>
                           </div>

                           {/* Hero Image */}
                           <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-[var(--color-primary)]/20 shadow-lg group-hover:shadow-[var(--color-primary)]/20 transition-all">
                              <img
                                 src={nextUpcomingEvent.banner}
                                 alt={nextUpcomingEvent.title}
                                 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-hero)] via-transparent to-transparent opacity-90"></div>


                              {/* Category Badge */}
                              <div className="absolute top-3 right-3 bg-[var(--color-card)]/90 backdrop-blur-md border-2 border-[var(--color-border)] px-3 py-1 rounded-lg text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest shadow-lg">
                                 {nextUpcomingEvent.category}
                              </div>

                              {/* Title Over Image */}
                              <div className="absolute bottom-0 left-0 w-full p-4">
                                 <h4 className="text-[var(--events-title)] font-extrabold text-xl leading-tight mb-1 drop-shadow-md line-clamp-2">
                                    {nextUpcomingEvent.title}
                                 </h4>
                                 <p className="text-[var(--color-accent)] text-xs font-bold drop-shadow-sm">
                                    By {nextUpcomingEvent.organizerName}
                                 </p>
                              </div>
                           </div>

                           {/* Details & Tags */}
                           <div className="space-y-4">
                              <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed line-clamp-2 font-medium">
                                 {nextUpcomingEvent.description}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                 {nextUpcomingEvent.tags && nextUpcomingEvent.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)] transition-colors">
                                       #{tag}
                                    </span>
                                 ))}
                              </div>
                           </div>

                           {/* Footer / Social Proof */}
                           <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <OrganizerAvatar src={nextUpcomingEvent.organizerAvatar} name={nextUpcomingEvent.organizerName} size="sm" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Starts</span>
                                    <span className="text-xs font-bold text-[var(--events-title)]">{nextUpcomingEvent.startTime}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[var(--events-title)] text-xs font-semibold">{nextUpcomingEvent.attendees}+ Registered</p>
                                 <div className="flex items-center justify-end gap-0.5 text-[10px] text-[var(--color-accent)] font-semibold">
                                    Join now <ArrowUpRight size={9} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -8 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 bg-gradient-to-br from-[var(--events-card-gradient-from)]/10 via-[var(--events-card-bg)] to-[var(--events-card-gradient-to)]/10 p-2 rounded-3xl shadow-2xl w-full max-w-sm border border-[var(--color-border)]"
                     >
                        {/* Glow Effect behind */}
                        <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-3xl rounded-full opacity-0 transition-opacity duration-700 -z-10"></div>

                        {/* Inner Container */}
                        <div className="bg-[var(--events-bg-hero)] rounded-[1.7rem] p-6 h-full relative overflow-hidden flex flex-col gap-5">
                           {/* Top Shine */}
                           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                           {/* Header */}
                           <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] transition-colors duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                                    <Calendar size={22} strokeWidth={2.5} />
                                 </div>
                                 <div>
                                    <h3 className="text-[var(--events-title)] font-bold text-base leading-tight transition-colors">Upcoming Events</h3>
                                    <p className="text-[var(--events-description)] text-xs font-medium mt-0.5 opacity-80">Coming Soon</p>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                 <span className="bg-blue-500/20 text-blue-400 border-blue-500/40 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 flex items-center gap-1.5">
                                    Stay Tuned
                                 </span>
                              </div>
                           </div>

                           {/* Hero Image */}
                           <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-[var(--color-primary)]/20 shadow-lg transition-all">
                              <img
                                 src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000"
                                 alt="Placeholder Event"
                                 className="w-full h-full object-cover transition-transform duration-700 ease-out opacity-70"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-hero)] via-transparent to-transparent opacity-90"></div>

                              {/* Title Over Image */}
                              <div className="absolute bottom-0 left-0 w-full p-4">
                                 <h4 className="text-[var(--events-title)] font-extrabold text-xl leading-tight mb-1 drop-shadow-md">
                                    Amazing Events Coming Soon!
                                 </h4>
                                 <p className="text-[var(--color-accent)] text-xs font-bold drop-shadow-sm">
                                    Check back for exciting opportunities
                                 </p>
                              </div>
                           </div>

                           {/* Details & Tags */}
                           <div className="space-y-4">
                              <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed line-clamp-2 font-medium">
                                 Discover world-class summits, workshops, and networking events. New events are added regularly - be the first to join!
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                 {['Networking', 'Learning'].map(tag => (
                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide transition-colors">
                                       #{tag}
                                    </span>
                                 ))}
                              </div>
                           </div>

                           {/* Footer / Social Proof */}
                           <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                                    F
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Hosted by</span>
                                    <span className="text-xs font-bold text-[var(--events-title)]">Fogsly</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[var(--events-title)] text-xs font-semibold">New events soon</p>
                                 <div className="flex items-center justify-end gap-0.5 text-[10px] text-[var(--color-accent)] font-semibold">
                                    Check back <ArrowUpRight size={9} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
                  {/* Background Decorative Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-teal-500/10 rounded-full -z-20 animate-[spin_60s_linear_infinite]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-slate-700/20 rounded-full -z-20 animate-[spin_40s_linear_infinite_reverse]"></div>
               </div>
            </div>
         </div>

         {/* Filter Bar */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 mt-4 md:mt-8 mb-6 md:mb-10 px-1 xs:px-2">
            <div className="bg-[var(--color-card)]/80 backdrop-blur-xl border border-[var(--color-border)] p-1.5 rounded-full shadow-lg flex gap-1 overflow-x-auto max-w-full no-scrollbar min-w-0">
               {['All', 'physical', 'virtual'].map((type) => (
                  <button
                     key={type}
                     onClick={() => setActiveType(type as any)}
                     className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-2 ${activeType === type
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-[var(--color-card)] border-[var(--color-primary)] shadow-md'
                        : 'text-[var(--color-text-primary)] border-transparent hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-primary)]'
                        }`}
                  >
                     {type}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative group flex-1 md:flex-none min-w-[200px]">
                  <select
                     value={activeCategory}
                     onChange={(e) => setActiveCategory(e.target.value)}
                     className="w-full appearance-none bg-[var(--color-card)] text-[var(--color-text-primary)] py-3 pl-5 pr-12 rounded-full text-sm font-bold focus:outline-none border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-lg"
                  >
                     {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
               </div>

               <div className="relative group flex-1 md:flex-none min-w-[180px]">
                  <select
                     value={activeStatus}
                     onChange={(e) => setActiveStatus(e.target.value)}
                     className="w-full appearance-none bg-[var(--color-card)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] py-3 pl-5 pr-12 rounded-full text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-lg"
                  >
                     {STATUS_FILTERS.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                  <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
               </div>
            </div>
         </div>

         {/* Loading State */}
         {isLoading && (
            <div className="flex items-center justify-center py-20">
               <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
            </div>
         )}

         {/* Featured Events */}
         {!isLoading && featuredEvents.length > 0 && (
            <section>
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                     <Star className="fill-current" size={20} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold font-heading text-slate-900 leading-none">Featured Highlights</h2>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Curated by Fogsly</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredEvents.map(event => (
                     <motion.div
                        key={event.id}
                        whileHover={{ y: -5 }}
                        onClick={() => onEventClick(event.id, event)}
                        className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 bg-slate-900 border border-slate-200"
                     >
                        {/* Image */}
                        <img
                           src={event.banner}
                           alt={event.title}
                           className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

                        {/* Badges */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                           <StatusBadge status={event.status} />
                           <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              {event.category}
                           </span>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                           <div className="flex items-center gap-4 mb-4">
                              <span className="bg-teal-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg shadow-teal-500/30 flex items-center gap-1">
                                 {event.type === 'virtual' ? <Globe size={12} /> : <MapPin size={12} />} {event.type}
                              </span>
                              <span className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
                                 <Calendar size={14} className="text-teal-400" /> {event.startDate}
                              </span>
                           </div>

                           <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight group-hover:text-teal-300 transition-colors">
                              {event.title}
                           </h3>

                           <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                              <div className="flex items-center gap-2">
                                 <OrganizerAvatar src={event.organizerAvatar} name={event.organizerName} size="sm" />
                                 <span className="text-sm font-bold text-slate-300">{event.organizerName}</span>
                              </div>
                              <span className="flex items-center gap-1 text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                                 View Details <ArrowUpRight size={16} />
                              </span>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </section>
         )}

         {/* All Events List */}
         <section>
            <div className="flex justify-between items-end mb-10 border-b border-[var(--color-border)] pb-6">
               <div>
                  <h2 className="text-2xl font-bold font-heading text-[var(--color-text-primary)]">Upcoming Events</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Browse and filter all available sessions.</p>
               </div>
               <div className="text-xs font-bold bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full">{regularEvents.length} Results</div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 xl:gap-12">
               {!isLoading && regularEvents.map(event => (
                  <div
                     key={event.id}
                     onClick={() => onEventClick(event.id, event)}
                     className="group bg-[var(--color-card)] p-1.5 rounded-[2rem] overflow-hidden hover:border-[var(--color-primary)]/60 border-2 border-[var(--color-border)] hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-lg mb-3 xs:mb-0"
                  >
                     {/* Card Image */}
                     <div className="h-56 relative overflow-hidden bg-[var(--color-bg-tertiary)] rounded-[1.7rem] border border-[var(--color-border)]">
                        <img src={event.banner} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-hero)]/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                        <div className="absolute top-4 left-4">
                           <span className="bg-[var(--color-card)] backdrop-blur-sm text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg border-2 border-[var(--color-border)]">
                              {event.category}
                           </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                           <div className="flex flex-col text-white">
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Start Time</span>
                              <span className="text-sm font-bold flex items-center gap-1.5"><Clock size={14} /> {event.startTime}</span>
                           </div>
                        </div>
                     </div>

                     {/* Card Body */}
                     <div className="bg-[var(--color-card)] rounded-[1.5rem] p-6 flex-1 flex flex-col border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-4">
                           <StatusBadge status={event.status} />
                           <span className="text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md border border-[var(--color-border)]">{event.startDate}</span>
                        </div>

                        <h3 className="font-bold text-lg mb-3 text-[var(--color-text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                           {event.title}
                        </h3>

                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-6">
                           {event.description}
                        </p>

                        <div className="mt-auto pt-5 border-t border-[var(--color-border)] flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <OrganizerAvatar src={event.organizerAvatar} name={event.organizerName} size="sm" />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Host</span>
                                 <span className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-[100px]">{event.organizerName}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Price</span>
                              <span className="text-sm font-bold text-[var(--color-primary)]">{event.price}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-24 bg-[var(--color-bg-secondary)] rounded-[2.5rem] border border-[var(--color-border)] border-dashed">
               <div className="w-24 h-24 bg-[var(--color-card)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-text-secondary)] shadow-sm">
                  <Search size={32} />
               </div>
               <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No events found</h3>
               <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto mb-8">We couldn't find any events matching your criteria. Try adjusting your filters.</p>
               <Button variant="outline" onClick={() => { setSearchTerm(""); setActiveType("All"); setActiveCategory("All"); setActiveStatus("All"); }}>Clear All Filters</Button>
            </div>
         )}
      </div>
   );
};

// --- Main Page Component ---

const EventsPage = ({ navigate, currentUser }: { navigate: (route: Route, context?: any) => void, currentUser?: any }) => {
   const [userHasEvents, setUserHasEvents] = useState(false);
   const [userHasPendingRequests, setUserHasPendingRequests] = useState(false);

   // Check if user has any published events and pending requests
   useEffect(() => {
      const checkUserEvents = async () => {
         if (!currentUser?.uid) {
            setUserHasEvents(false);
            setUserHasPendingRequests(false);
            return;
         }

         try {
            const allEvents = await getAllActiveEvents();
            const hasEvents = allEvents.some(event => event.organizerId === currentUser.uid && event.eventStatus === 'active');
            setUserHasEvents(hasEvents);

            // Check for pending event requests (user-submitted event creation requests)
            const userRequests = await getUserEventRequests(currentUser.uid);
            const hasPendingRequests = userRequests.some(request => request.eventStatus === 'pending');
            setUserHasPendingRequests(hasPendingRequests);
         } catch (error) {
            console.error('Error checking user events:', error);
            setUserHasEvents(false);
            setUserHasPendingRequests(false);
         }
      };

      checkUserEvents();
   }, [currentUser]);

   const handleEventClick = (id: string, event?: Event) => {
      if (id === 'create-event') {
         navigate('create-event');
      } else if (id === 'event-request-status') {
         navigate('event-request-status');
      } else if (event) {
         // Create SEO-friendly slug: eventName-id
         const slug = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${id}`;
         // Navigate with slug URL format: event/slug
         navigate(`event/${slug}` as any, slug);
      }
   };


   return (

      <div className="pt-20 md:pt-2 min-h-screen bg-page">
         <div className="max-w-[1400px] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
            <EventsHome
               onEventClick={handleEventClick}
               navigate={navigate}
               userHasEvents={userHasEvents}
               userHasPendingRequests={userHasPendingRequests}
            />
         </div>
      </div>
   );
};

export default EventsPage;
