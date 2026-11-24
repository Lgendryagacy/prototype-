import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Calendar,
  Building2,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Heart,
  Ticket,
  Plus,
  Radio,
  Megaphone,
  UserCheck,
  Sparkles,
  Share2,
  CheckCircle2,
  X,
  Download,
  Check,
  CalendarPlus,
  QrCode
} from 'lucide-react';
import { INITIAL_EVENTS, EventItem } from './eventsData';
import { toast } from 'react-hot-toast';
import { Route } from '../../types';
import styles from './events.module.css';

interface EventsExplorerProps {
  navigate: (route: Route | string) => void;
  currentUser?: any;
}

export const EventsExplorer: React.FC<EventsExplorerProps> = ({ navigate, currentUser }) => {
  // Always initialize with latest INITIAL_EVENTS from the screenshot
  const [events, setEvents] = useState<EventItem[]>(() => {
    const version = 'v3-screenshot-events';
    const savedVersion = localStorage.getItem('fogsly-events-ver');
    if (savedVersion !== version) {
      localStorage.setItem('fogsly-events-ver', version);
      localStorage.setItem('fogsly-all-events', JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const saved = localStorage.getItem('fogsly-all-events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_EVENTS;
      }
    }
    return INITIAL_EVENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('All Events');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Sorting & Filtering Popover States
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'soonest' | 'price-free' | 'price-low' | 'popular'>('recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'virtual' | 'physical'>('all');
  const [selectedPriceMode, setSelectedPriceMode] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fogsly-registered-event-ids');
    return saved ? JSON.parse(saved) : ['event-1'];
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fogsly-saved-event-ids');
    return saved ? JSON.parse(saved) : ['event-2', 'event-7'];
  });

  // Modal states
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [eventToRegister, setEventToRegister] = useState<EventItem | null>(null);
  const [isHostEventModalOpen, setIsHostEventModalOpen] = useState(false);

  // Registration modal states
  const [registrationStep, setRegistrationStep] = useState<'tier' | 'form' | 'ticket'>('tier');
  const [selectedPassTier, setSelectedPassTier] = useState<'general' | 'vip'>('general');
  const [attendeeName, setAttendeeName] = useState(currentUser?.displayName || currentUser?.name || 'Farhan Tariq');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || 'farhan.tariq@fogsly.pro');
  const [attendeeRole, setAttendeeRole] = useState('Community Builder & Enthusiast');
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  // Host Event form states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('University Event');
  const [newEventType, setNewEventType] = useState<'In-Person' | 'Virtual' | 'Hybrid'>('In-Person');
  const [newEventCity, setNewEventCity] = useState('Karachi');
  const [newEventDate, setNewEventDate] = useState('2026-10-15');
  const [newEventTime, setNewEventTime] = useState('10:00 AM – 4:00 PM');
  const [newEventVenue, setNewEventVenue] = useState('Main Campus Auditorium');
  const [newEventTagline, setNewEventTagline] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem('fogsly-registered-event-ids', JSON.stringify(registeredEventIds));
  }, [registeredEventIds]);

  useEffect(() => {
    localStorage.setItem('fogsly-saved-event-ids', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('fogsly-all-events', JSON.stringify(events));
  }, [events]);

  const toggleSaveEvent = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (savedEventIds.includes(id)) {
      setSavedEventIds(savedEventIds.filter(item => item !== id));
      toast.success('Removed from wishlist');
    } else {
      setSavedEventIds([...savedEventIds, id]);
      toast.success('Added to your wishlist ❤️');
    }
  };

  const openRegisterModal = (event: EventItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEventToRegister(event);
    setRegistrationStep('tier');
    setSelectedPassTier('general');
  };

  const proceedToForm = () => {
    setRegistrationStep('form');
  };

  const confirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToRegister) return;

    if (!registeredEventIds.includes(eventToRegister.id)) {
      setRegisteredEventIds([...registeredEventIds, eventToRegister.id]);
    }

    // Increment attendees count
    setEvents(prev =>
      prev.map(ev =>
        ev.id === eventToRegister.id ? { ...ev, attendeesCount: ev.attendeesCount + 1 } : ev
      )
    );

    const ticketSerial = `FOG-PASS-${Math.floor(100000 + Math.random() * 900000)}-${selectedPassTier.toUpperCase()}`;
    setGeneratedTicketId(ticketSerial);
    setRegistrationStep('ticket');
    toast.success('Admission pass reserved successfully!');
  };

  const downloadCalendarFile = () => {
    if (!eventToRegister) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FOGSLY//Events Platform//EN
BEGIN:VEVENT
SUMMARY:${eventToRegister.title}
DESCRIPTION:${eventToRegister.tagline || eventToRegister.shortDescription}
LOCATION:${eventToRegister.venue || eventToRegister.location || 'Karachi, Pakistan'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${eventToRegister.id}-fogsly-pass.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar .ICS file downloaded');
  };

  const handleHostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDesc.trim()) {
      toast.error('Please enter event title and description');
      return;
    }

    const createdEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      tagline: newEventTagline.trim() || newEventDesc.slice(0, 90) + '...',
      shortDescription: newEventDesc.slice(0, 150) + '...',
      fullDescription: newEventDesc,
      category: newEventCategory,
      type: newEventType,
      status: 'upcoming',
      eventStatus: 'Upcoming',
      startDate: newEventDate,
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      time: newEventTime || '10:00 AM – 4:00 PM',
      date: newEventDate.split('-')[2] || '15',
      month: 'OCT',
      year: '2026',
      timezone: 'PKT (UTC+5)',
      city: newEventCity,
      country: 'Pakistan',
      location: newEventCity,
      format: newEventType === 'Virtual' ? 'Online' : 'Physical',
      venue: newEventVenue.trim() || `${newEventCity} Auditorium`,
      bannerImage: '/events/societies-fair-26.svg',
      image: '/events/societies-fair-26.svg',
      organizerName: currentUser?.displayName || currentUser?.name || 'Event Updates',
      host: currentUser?.displayName || currentUser?.name || 'Event Updates',
      hostInitial: (currentUser?.displayName || currentUser?.name || 'E')[0].toUpperCase(),
      hostTone: 'purple',
      organizerRole: 'Campus Community Host',
      organizerAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOrganizerVerified: true,
      priceType: 'Free',
      price: 'Free',
      attendeesCount: 1,
      maxCapacity: 350,
      agenda: [
        {
          time: '10:00 AM - 11:00 AM',
          title: 'Opening & Welcome Keynote',
          speaker: currentUser?.displayName || 'Host',
          description: 'Introduction to session agenda and key community highlights.'
        },
        {
          time: '11:30 AM - 01:00 PM',
          title: 'Interactive Workshops & Live Presentations',
          speaker: 'Guest Speakers',
          description: 'Hands-on practical sessions and audience participation.'
        },
        {
          time: '02:00 PM - 04:00 PM',
          title: 'Networking & Community Showcase',
          speaker: 'All Attendees',
          description: 'Open mic session, peer networking, and awards.'
        }
      ],
      speakers: [
        {
          name: currentUser?.displayName || 'Host',
          role: 'Event Director',
          company: 'Community Builder Hub',
          avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Host and curator of community gatherings across Pakistan.'
        }
      ],
      tags: ['Community', 'Pakistan', newEventCategory, newEventType]
    };

    setEvents([createdEvent, ...events]);
    setIsHostEventModalOpen(false);
    toast.success('Your event has been published to Fogsly!');

    setNewEventTitle('');
    setNewEventTagline('');
    setNewEventDesc('');
  };

  // Featured events list
  const featuredEvents = useMemo(() => {
    const list = events.filter(e => e.isFeatured);
    return list.length > 0 ? list : [events[0]];
  }, [events]);

  const currentFeatured = featuredEvents[featuredIndex % featuredEvents.length] || events[0];

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedQuickFilter, selectedFormat, selectedPriceMode, selectedCity, selectedSort]);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let list = events.filter(event => {
      // Quick filter
      if (selectedQuickFilter === 'Online') {
        if (event.type !== 'Virtual' && event.format !== 'Online') return false;
      } else if (selectedQuickFilter === 'Near Me') {
        if (event.type === 'Virtual') return false;
      } else if (selectedQuickFilter === 'Free') {
        if (event.priceType !== 'Free' && event.price !== 'Free') return false;
      } else if (selectedQuickFilter === 'Saved') {
        if (!savedEventIds.includes(event.id)) return false;
      } else if (selectedQuickFilter === 'Today') {
        if (event.date !== '21') return false;
      } else if (selectedQuickFilter === 'This Week') {
        const d = parseInt(event.date || '31', 10);
        if (d > 27) return false;
      } else if (selectedQuickFilter === 'This Month') {
        if ((event.month || 'SEP').toUpperCase() !== 'SEP') return false;
      }

      // Format filter
      if (selectedFormat === 'virtual') {
        if (event.type !== 'Virtual' && event.format !== 'Online') return false;
      } else if (selectedFormat === 'physical') {
        if (event.type === 'Virtual') return false;
      }

      // Price filter
      if (selectedPriceMode === 'free') {
        if (event.priceType !== 'Free' && event.price !== 'Free') return false;
      } else if (selectedPriceMode === 'paid') {
        if (event.priceType === 'Free' || event.price === 'Free') return false;
      }

      // City filter
      if (selectedCity !== 'All') {
        const evLoc = (event.location || event.city || '').toLowerCase();
        if (!evLoc.includes(selectedCity.toLowerCase())) return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        const evCat = event.category.toLowerCase();
        const evTags = event.tags.map(t => t.toLowerCase()).join(' ');
        if (!evCat.includes(cat) && !evTags.includes(cat)) {
          if (cat === 'ai & tech' && !(evCat.includes('tech') || evCat.includes('ai'))) return false;
          if (cat === 'music & culture' && !(evCat.includes('music') || evCat.includes('culture') || evCat.includes('entertainment'))) return false;
          if (cat === 'business' && !evCat.includes('business')) return false;
          if (cat === 'workshops' && !(evCat.includes('craft') || evCat.includes('art') || evTags.includes('workshop'))) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesDesc = (event.tagline || event.shortDescription).toLowerCase().includes(q);
        const matchesLocation = (event.location || event.city || '').toLowerCase().includes(q);
        const matchesHost = (event.host || event.organizerName).toLowerCase().includes(q);
        const matchesCat = event.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesHost && !matchesCat) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    if (selectedSort === 'soonest') {
      list.sort((a, b) => parseInt(a.date || '31', 10) - parseInt(b.date || '31', 10));
    } else if (selectedSort === 'price-free') {
      list.sort((a, b) => (a.price === 'Free' ? -1 : 1));
    } else if (selectedSort === 'price-low') {
      const getP = (e: EventItem) => (e.price === 'Free' ? 0 : e.priceInUSD || 2800);
      list.sort((a, b) => getP(a) - getP(b));
    } else if (selectedSort === 'popular') {
      list.sort((a, b) => b.attendeesCount - a.attendeesCount);
    }

    return list;
  }, [events, selectedQuickFilter, selectedFormat, selectedPriceMode, selectedCity, selectedCategory, searchQuery, selectedSort, savedEventIds]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * eventsPerPage;
    return filteredEvents.slice(start, start + eventsPerPage);
  }, [filteredEvents, currentPage]);

  const activeFilterCount = (selectedFormat !== 'all' ? 1 : 0) + (selectedPriceMode !== 'all' ? 1 : 0) + (selectedCity !== 'All' ? 1 : 0);

  return (
    <div className={styles.page}>
      {/* Top-Right Decorative Doodle with Hand-drawn loop arrow & cursive text */}
      <div className={styles.doodleHero}>
        <div className={styles.doodleSphere} />
        <div className={styles.doodleHeroText}>
          More{"\n"}Connections{"\n"}Brighter{"\n"}Tomorrows
        </div>
        <svg className={styles.doodleHeroArrow} viewBox="0 0 55 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 34 6 C 14 18, 10 34, 26 38 C 36 40, 42 30, 32 24 C 20 18, 14 36, 16 50" />
          <path d="M 8 44 L 16 51 L 24 46" />
        </svg>
      </div>

      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroGlowOne} />
        <div className={styles.heroGlowTwo} />

        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span>⚡ EVENTS</span>
            <span>·</span>
            <span>Learn · Connect · Grow</span>
          </div>

          <h1>
            Discover Events<br />
            <span>That Move You Forward</span>
          </h1>

          <p>
            Join workshops, networking sessions, industry events and local meetups designed to help you learn, connect and grow.
          </p>

          <form
            className={styles.searchBox}
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events, skills, topics, locations or organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClearBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button type="submit">Explore</button>
          </form>

          <div className={styles.categoryRow}>
            {['All', 'AI & Tech', 'Networking', 'Business', 'Career', 'Workshops', 'Music & Culture'].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={isActive ? { background: '#2563eb', borderColor: '#2563eb', color: '#ffffff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)' } : {}}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className={styles.heroStats}>
            <div>
              <div className={styles.statIcon}><Calendar size={18} /></div>
              <div>
                <strong>500+</strong>
                <span>Events Listed</span>
              </div>
            </div>
            <div>
              <div className={styles.statIcon}><Building2 size={18} /></div>
              <div>
                <strong>50+</strong>
                <span>Organizations</span>
              </div>
            </div>
            <div>
              <div className={styles.statIcon}><MapPin size={18} /></div>
              <div>
                <strong>All Pakistan</strong>
                <span>Online & Physical</span>
              </div>
            </div>
            <div>
              <div className={styles.statIcon}><Users size={18} /></div>
              <div>
                <strong>Real Opportunities</strong>
                <span>Learn · Network · Grow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Event Card on Right Side */}
        <div className={styles.featuredCard} onClick={() => setSelectedEventForDetail(currentFeatured)}>
          <div className={styles.featuredTop}>
            <div>
              <span className={styles.star}>★</span>
              <span>Featured Event</span>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevFeatured();
                }}
                title="Previous featured event"
                aria-label="Previous featured event"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextFeatured();
                }}
                title="Next featured event"
                aria-label="Next featured event"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.featuredImageWrap}>
            <img
              src={currentFeatured.image || currentFeatured.bannerImage}
              alt={currentFeatured.title}
            />
            <div className={styles.featuredDate}>
              <span>{currentFeatured.month || 'SEP'}</span>
              <strong>{currentFeatured.date || '21'}</strong>
            </div>
          </div>

          <div className={styles.featuredBody}>
            <span className={styles.smallCategory}>{currentFeatured.category}</span>
            <h2>{currentFeatured.title}</h2>
            <p>{currentFeatured.tagline || currentFeatured.shortDescription}</p>

            <div className={styles.featuredMeta}>
              <span><Clock size={12} /> {currentFeatured.time || `${currentFeatured.startTime} – ${currentFeatured.endTime}`}</span>
              <span><MapPin size={12} /> {currentFeatured.location || currentFeatured.city || 'Karachi'} · {currentFeatured.format || currentFeatured.type}</span>
            </div>

            <div className={styles.featuredBottom}>
              <div className={styles.host}>
                <span className={`${styles.hostAvatar} ${currentFeatured.hostTone === 'blue' ? styles.blueAvatar : ''}`}>
                  {currentFeatured.hostInitial || 'H'}
                </span>
                <div>
                  <small>Hosted by</small>
                  <strong>{currentFeatured.host || currentFeatured.organizerName}</strong>
                </div>
              </div>

              {currentFeatured.priceType === 'Free' || currentFeatured.price === 'Free' ? (
                <span className={styles.freePrice}><strong>Free</strong></span>
              ) : (
                <div className={styles.paidPrice}>
                  <strong>{currentFeatured.price || 'PKR 2,800'}</strong>
                  <span>{currentFeatured.fogCoin || '100 Fog Coin'}</span>
                </div>
              )}
            </div>

            <button
              className={styles.featuredCTA}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEventForDetail(currentFeatured);
              }}
            >
              <span>View Event</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK FILTERS & CONTROLS BAR */}
      <section className={styles.filters}>
        <div className={styles.quickFilters}>
          {['All Events', 'Today', 'This Week', 'This Month', 'Online', 'Near Me', 'Free', 'Saved'].map((item) => (
            <button
              key={item}
              className={selectedQuickFilter === item ? styles.selectedFilter : ''}
              onClick={() => setSelectedQuickFilter(item)}
            >
              {item === 'Saved' ? `Saved (${savedEventIds.length})` : item}
            </button>
          ))}
        </div>

        <div className={styles.filterRight}>
          <button className={styles.filterButton} onClick={() => setIsHostEventModalOpen(true)}>
            <Plus size={16} className="text-blue-600" />
            <span>Host Event</span>
          </button>

          {/* Interactive Filter Dropdown */}
          <div className="relative">
            <button
              className={`${styles.filterButton} ${activeFilterCount > 0 ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
            >
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Filter Events</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedFormat('all');
                        setSelectedPriceMode('all');
                        setSelectedCity('All');
                        setIsFilterOpen(false);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="space-y-4 pt-3">
                  {/* Format Filter */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">Format</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'virtual', label: 'Online' },
                        { id: 'physical', label: 'Physical' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedFormat(item.id as any)}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                            selectedFormat === item.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">Price</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'free', label: 'Free' },
                        { id: 'paid', label: 'Paid' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedPriceMode(item.id as any)}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                            selectedPriceMode === item.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Filter */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="All">All Cities</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Remote">Online / Remote</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters ({filteredEvents.length} events)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Sort Dropdown */}
          <div className="relative">
            <button
              className={styles.filterButton}
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
            >
              <span>
                {selectedSort === 'recommended' && 'Sort: Recommended'}
                {selectedSort === 'soonest' && 'Sort: Date (Soonest)'}
                {selectedSort === 'price-free' && 'Sort: Free First'}
                {selectedSort === 'price-low' && 'Sort: Price (Low to High)'}
                {selectedSort === 'popular' && 'Sort: Most Popular'}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {[
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'soonest', label: 'Date (Soonest First)' },
                  { id: 'price-free', label: 'Free Admission First' },
                  { id: 'price-low', label: 'Price (Low to High)' },
                  { id: 'popular', label: 'Most Attendees / Popular' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedSort(item.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedSort === item.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedSort === item.id && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS SECTION */}
      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>EXPLORE OPPORTUNITIES</span>
            <h2>Upcoming Events</h2>
            <p>Discover events happening online and around you. From workshops to cultural events, find experiences that match your goals.</p>
          </div>

          <div className="flex items-center gap-2">
            <svg className={styles.doodleCommunityArrow} viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 4 28 C 14 10, 28 12, 40 22" />
              <path d="M 32 16 L 41 23 L 34 29" />
            </svg>
            <div className={styles.communityPill}>
              <div className={styles.miniAvatars}>
                <span>H</span>
                <span>C</span>
                <span>A</span>
              </div>
              <strong>79+</strong>
              <div>
                <b>Join thousands of learners,</b>
                <span>professionals and creators</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        {paginatedEvents.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No matching events found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any events matching your current filters or search term. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedQuickFilter('All Events');
                setSelectedFormat('all');
                setSelectedPriceMode('all');
                setSelectedCity('All');
              }}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className={styles.eventGrid}>
            {paginatedEvents.map((event) => {
              const isSaved = savedEventIds.includes(event.id);
              const isFree = event.priceType === 'Free' || event.price === 'Free';

              return (
                <article
                  key={event.id}
                  className={styles.eventCard}
                  onClick={() => setSelectedEventForDetail(event)}
                >
                  {/* 1. Event 16:9 image wrap with wishlist heart, status and date badge */}
                  <div className={styles.eventImageWrap}>
                    <div className={`${styles.statusBadge} ${isFree ? styles.upcomingStatus : styles.limitedStatus}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{event.eventStatus || (isFree ? 'Free Admission' : 'Limited Seats')}</span>
                    </div>

                    <button
                      className={`${styles.favoriteButton} ${isSaved ? styles.favoriteActive : ''}`}
                      onClick={(e) => toggleSaveEvent(event.id, e)}
                      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart size={16} fill={isSaved ? '#f43f5e' : 'none'} color={isSaved ? '#f43f5e' : 'currentColor'} />
                    </button>

                    <div className={styles.dateBadge}>
                      <span>{event.month || 'SEP'}</span>
                      <strong>{event.date || '21'}</strong>
                    </div>

                    <img
                      src={event.image || event.bannerImage}
                      alt={event.title}
                      loading="lazy"
                    />
                  </div>

                  {/* 2. Event Content: title, tagline, time+location, host+price+arrow */}
                  <div className={styles.eventContent}>
                    <h3>{event.title}</h3>
                    <p className={styles.eventDescription}>{event.tagline || event.shortDescription}</p>

                    <div className={styles.eventMeta}>
                      <span><Clock size={13} /> {event.time || `${event.startTime} – ${event.endTime}`}</span>
                      <span><MapPin size={13} /> {event.location || event.city || 'Karachi'} · {event.format || event.type}</span>
                    </div>

                    <div className={styles.eventBottom}>
                      <div className={styles.host}>
                        <span className={`${styles.hostAvatar} ${event.hostTone === 'blue' ? styles.blueAvatar : ''}`}>
                          {event.hostInitial || (event.host ? event.host[0] : 'H')}
                        </span>
                        <div>
                          <small>Hosted by</small>
                          <strong>{event.host || event.organizerName}</strong>
                        </div>
                      </div>

                      {isFree ? (
                        <div className={styles.freePrice}>
                          <strong>Free</strong>
                        </div>
                      ) : (
                        <div className={styles.paidPrice}>
                          <strong>{event.price || 'PKR 2,800'}</strong>
                          <span>{event.fogCoin || '100 Fog Coin'}</span>
                        </div>
                      )}

                      <button
                        className={styles.arrowButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetail(event);
                        }}
                        aria-label={`View details for ${event.title}`}
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Functional Pagination */}
        {filteredEvents.length > 0 && (
          <div className={styles.paginationArea}>
            <span>
              Showing {(currentPage - 1) * eventsPerPage + 1}–{Math.min(currentPage * eventsPerPage, filteredEvents.length)} of {filteredEvents.length} events
            </span>
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={currentPage === pageNum ? styles.currentPage : ''}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. FOR ORGANIZERS SECTION */}
      <section className={styles.organizer}>
        <div>
          <span className={styles.organizerEyebrow}>✨ FOR ORGANIZERS</span>
          <h2>
            Turn Your Event Into<br />
            <span>Real Opportunities</span>
          </h2>
          <p>
            Reach students, professionals and opportunity seekers across Pakistan. List your event on Fogsly and get the visibility you deserve.
          </p>

          <div className={styles.organizerButtons}>
            <button onClick={() => setIsHostEventModalOpen(true)}>
              <Plus size={14} />
              <span>Create an Event</span>
            </button>
            <button onClick={() => navigate('about')}>
              <span>Learn More</span>
            </button>
          </div>

          <div className={styles.organizerBenefits}>
            <div>
              <Megaphone size={16} />
              <div>
                <strong>Reach a wider audience</strong>
                <p>Get discovered by thousands of active students and professionals looking for events.</p>
              </div>
            </div>

            <div>
              <UserCheck size={16} />
              <div>
                <strong>Build your community</strong>
                <p>Create meaningful connections with attendees who care about what you're doing.</p>
              </div>
            </div>

            <div>
              <Ticket size={16} />
              <div>
                <strong>Drive real participation</strong>
                <p>Turn your event into opportunities, from registrations to long-term community members.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Hand-drawn doodle note + 3D Calendar Visual */}
        <div className="flex items-center justify-center gap-3">
          <div className={styles.doodleOrganizer}>
            <span className={styles.doodleOrganizerText}>Create Impact Together</span>
            <svg className={styles.doodleOrganizerArrow} viewBox="0 0 50 55" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 6 8 C 28 10, 36 28, 26 46" />
              <path d="M 18 40 L 26 47 L 34 41" />
            </svg>
          </div>

          <div className={styles.calendarVisual}>
            <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
              <defs>
                <linearGradient id="calBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e5effe" />
                </linearGradient>
                <linearGradient id="calHeader" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2575fc" />
                  <stop offset="100%" stopColor="#6a11cb" />
                </linearGradient>
                <filter id="calShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1e3a8a" floodOpacity="0.18" />
                </filter>
              </defs>
              <rect x="14" y="24" width="86" height="80" rx="18" fill="url(#calBody)" filter="url(#calShadow)" stroke="#d2e3fc" strokeWidth="1.5" />
              <path d="M 14 42 C 14 32, 22 24, 32 24 L 82 24 C 92 24, 100 32, 100 42 L 100 45 L 14 45 Z" fill="url(#calHeader)" />
              <rect x="28" y="16" width="6" height="15" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
              <rect x="46" y="16" width="6" height="15" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
              <rect x="64" y="16" width="6" height="15" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
              <rect x="82" y="16" width="6" height="15" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
              <circle cx="32" cy="58" r="3.5" fill="#3b82f6" />
              <circle cx="50" cy="58" r="3.5" fill="#93c5fd" />
              <circle cx="68" cy="58" r="3.5" fill="#93c5fd" />
              <circle cx="86" cy="58" r="3.5" fill="#93c5fd" />
              <circle cx="32" cy="74" r="3.5" fill="#93c5fd" />
              <circle cx="50" cy="74" r="3.5" fill="#3b82f6" />
              <circle cx="68" cy="74" r="3.5" fill="#93c5fd" />
              <circle cx="86" cy="74" r="3.5" fill="#3b82f6" />
              <circle cx="32" cy="90" r="3.5" fill="#93c5fd" />
              <circle cx="50" cy="90" r="3.5" fill="#93c5fd" />
            </svg>
            <div className={styles.plusBubble}>
              <Plus size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              F
            </div>
            <strong className="text-base font-extrabold text-slate-900 dark:text-white">FOGSLY</strong>
          </div>
          <p className="text-xs text-slate-500 mb-4">The future of freelance and on-demand services.</p>
          <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
            <span className="hover:text-blue-600 cursor-pointer">FB</span>
            <span className="hover:text-blue-600 cursor-pointer">IG</span>
            <span className="hover:text-blue-600 cursor-pointer">X</span>
            <span className="hover:text-blue-600 cursor-pointer">YT</span>
            <span className="hover:text-blue-600 cursor-pointer">IN</span>
            <span className="hover:text-blue-600 cursor-pointer">WA</span>
          </div>
          <small className="text-[10px] text-slate-400">© 2026 FOGSLY. All rights reserved.</small>
        </div>

        <div>
          <h4>Company</h4>
          <a href="#about" onClick={(e) => { e.preventDefault(); navigate('about'); }}>About Us</a>
          <a href="#careers" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Careers</a>
          <a href="#press" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Press</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Blog</a>
        </div>

        <div>
          <h4>Platform</h4>
          <a href="#features" onClick={(e) => { e.preventDefault(); navigate('events'); }}>Features</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); navigate('jobs'); }}>Pricing</a>
          <a href="#find-work" onClick={(e) => { e.preventDefault(); navigate('jobs'); }}>Find Work</a>
        </div>

        <div>
          <h4>Support</h4>
          <a href="#help" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Help Center</a>
          <a href="#community" onClick={(e) => { e.preventDefault(); navigate('community'); }}>Community</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); navigate('about'); }}>Terms</a>
        </div>
      </footer>

      {/* Floating Ask AI Button */}
      <button
        className={styles.askAI}
        onClick={() => navigate('ai-copilot')}
        aria-label="Ask AI Assistant"
      >
        <Sparkles size={14} />
        <span>Ask AI</span>
      </button>

      {/* ========================================================================= */}
      {/* MODAL 1: EVENT DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900">
              <img
                src={selectedEventForDetail.image || selectedEventForDetail.bannerImage}
                alt={selectedEventForDetail.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                      {selectedEventForDetail.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-md">
                      {selectedEventForDetail.format || selectedEventForDetail.type}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedEventForDetail.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveEvent(selectedEventForDetail.id)}
                    className={`p-2.5 rounded-xl border ${
                      savedEventIds.includes(selectedEventForDetail.id)
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={savedEventIds.includes(selectedEventForDetail.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Date & Time</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {selectedEventForDetail.month} {selectedEventForDetail.date}, {selectedEventForDetail.year}
                  </strong>
                  <div className="text-slate-500">{selectedEventForDetail.time}</div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Location</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {selectedEventForDetail.location || selectedEventForDetail.city}
                  </strong>
                  <div className="text-slate-500 truncate">{selectedEventForDetail.venue}</div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Admission</span>
                  <strong className={`font-black ${selectedEventForDetail.price === 'Free' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {selectedEventForDetail.price || 'Free'}
                  </strong>
                  {selectedEventForDetail.fogCoin && (
                    <div className="text-amber-500 text-[11px] font-semibold">{selectedEventForDetail.fogCoin}</div>
                  )}
                </div>
              </div>

              {/* Host info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedEventForDetail.hostInitial || 'H'}
                </div>
                <div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Event Organizer</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedEventForDetail.host || selectedEventForDetail.organizerName}</div>
                  <div className="text-xs text-slate-500">{selectedEventForDetail.organizerRole}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About This Event</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEventForDetail.fullDescription || selectedEventForDetail.shortDescription}
                </p>
              </div>

              {/* Agenda */}
              {selectedEventForDetail.agenda && selectedEventForDetail.agenda.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Schedule & Agenda</h4>
                  <div className="space-y-3">
                    {selectedEventForDetail.agenda.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] flex gap-3.5">
                        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap pt-0.5">
                          {item.time}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                          {item.speaker && <div className="text-xs text-slate-500 font-medium">{item.speaker}</div>}
                          {item.description && <div className="text-xs text-slate-400">{item.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers */}
              {selectedEventForDetail.speakers && selectedEventForDetail.speakers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Speakers & Guests</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedEventForDetail.speakers.map((sp, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A10]">
                        <img src={sp.avatar} alt={sp.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{sp.name}</div>
                          <div className="text-[11px] text-slate-500">{sp.role} · {sp.company}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-[#070A10] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#events?id=${selectedEventForDetail.id}`);
                  toast.success('Event link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventForDetail(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const ev = selectedEventForDetail;
                    setSelectedEventForDetail(null);
                    openRegisterModal(ev);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {registeredEventIds.includes(selectedEventForDetail.id) ? 'View Your Pass' : 'Reserve Admission Pass'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TICKET REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {eventToRegister && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {registrationStep === 'tier' ? (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Select Pass Tier</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{eventToRegister.title}</h2>
                  </div>
                  <button onClick={() => setEventToRegister(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* General Pass */}
                  <div
                    onClick={() => setSelectedPassTier('general')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPassTier === 'general'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">Community Access Pass</div>
                      <div className="text-sm font-black text-emerald-600">
                        {eventToRegister.priceType === 'Free' || eventToRegister.price === 'Free' ? 'FREE' : eventToRegister.price}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Full event entry, auditorium seating, open participation and community networking directory.
                    </p>
                  </div>

                  {/* VIP Pass */}
                  <div
                    onClick={() => setSelectedPassTier('vip')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPassTier === 'vip'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">VIP Priority Guest Pass</div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          Exclusive
                        </span>
                      </div>
                      <div className="text-sm font-black text-amber-500">100 Fog Coin</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Front-row reserved seating, speaker lounge access, high-table dinner reception, and certified attendee badge.
                    </p>
                  </div>
                </div>

                <button
                  onClick={proceedToForm}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Continue to Attendee Details
                </button>
              </div>
            ) : registrationStep === 'form' ? (
              <form onSubmit={confirmRegistration} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Attendee Details</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Pass Reservation</h2>
                  </div>
                  <button type="button" onClick={() => setEventToRegister(null)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Affiliation / Organization</label>
                    <input
                      type="text"
                      value={attendeeRole}
                      onChange={(e) => setAttendeeRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegistrationStep('tier')}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admission Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">Your admission pass is ready. Please present this pass at entry.</p>
                </div>

                {/* Digital Hologram Ticket */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white text-left space-y-4 border border-blue-500/30 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">FOGSLY ADMISSION PASS</span>
                      <div className="text-xs font-bold text-white truncate max-w-[220px]">{eventToRegister.title}</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-blue-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Attendee</span>
                      <strong className="text-white font-semibold">{attendeeName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Pass Tier</span>
                      <strong className="text-amber-400 font-bold uppercase">{selectedPassTier} PASS</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Date & Venue</span>
                      <span className="text-slate-300">{eventToRegister.month} {eventToRegister.date} · {eventToRegister.location || eventToRegister.city}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Pass Serial</span>
                      <span className="font-mono text-[9px] text-blue-300">{generatedTicketId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCalendarFile}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ICS</span>
                  </button>
                  <button
                    onClick={() => setEventToRegister(null)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HOST EVENT MODAL */}
      {/* ========================================================================= */}
      {isHostEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Host Community Event</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publish Event to Fogsly</h2>
              </div>
              <button onClick={() => setIsHostEventModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHostEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karachi Tech Summit 2026"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Short Tagline *</label>
                <input
                  type="text"
                  placeholder="e.g. A one-day gathering for creators and builders"
                  value={newEventTagline}
                  onChange={(e) => setNewEventTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="University Event">University Event</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="Music & Entertainment">Music & Entertainment</option>
                    <option value="Business & Networking">Business & Networking</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Markets & Shopping">Markets & Shopping</option>
                    <option value="Culture & Entertainment">Culture & Entertainment</option>
                    <option value="Cultural Festival">Cultural Festival</option>
                    <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newEventCity}
                    onChange={(e) => setNewEventCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Timing</label>
                  <input
                    type="text"
                    value={newEventTime}
                    placeholder="10:00 AM – 4:00 PM"
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Venue / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Arts Council Auditorium, Karachi"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details about what attendees will experience, key activities, and schedule..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHostEventModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsExplorer;
