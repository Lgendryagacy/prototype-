export interface EventAgendaItem {
  time: string;
  title: string;
  speaker: string;
  description: string;
}

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  type: 'Virtual' | 'In-Person' | 'Hybrid';
  status: 'live' | 'upcoming' | 'past';
  startDate: string; // e.g. "2026-09-21"
  startTime: string; // e.g. "10:00 AM"
  endDate?: string;
  endTime?: string;
  timezone: string;
  city?: string;
  country?: string;
  venue?: string;
  virtualStreamUrl?: string;
  bannerImage: string;
  organizerName: string;
  organizerRole: string;
  organizerAvatar: string;
  isOrganizerVerified: boolean;
  priceType: 'Free' | 'Paid';
  priceInFOG?: number;
  priceInUSD?: number;
  vipPriceInFOG?: number;
  attendeesCount: number;
  maxCapacity: number;
  isFeatured?: boolean;
  shortDescription: string;
  fullDescription: string;
  agenda: EventAgendaItem[];
  speakers: EventSpeaker[];
  tags: string[];

  // Visual card presentation fields from source-of-truth screenshot
  image?: string;
  tagline?: string;
  date?: string;
  month?: string;
  year?: string;
  time?: string;
  location?: string;
  format?: string;
  host?: string;
  hostInitial?: string;
  hostTone?: 'purple' | 'blue' | string;
  eventStatus?: 'Upcoming' | 'Limited Seats' | string;
  price?: string;
  fogCoin?: string;
}

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'event-1',
    title: "Societies Fair '26",
    tagline: 'Meet student communities, explore societies and discover collaboration opportunities.',
    shortDescription: 'Meet student communities, explore societies and discover collaboration opportunities.',
    fullDescription: "Join us at the Societies Fair '26 in Karachi! Meet student communities, explore societies and discover collaboration opportunities. Connect with premier university clubs, student leaders, and creative communities.",
    category: 'University Event',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-09-21',
    startTime: '9:00 AM',
    endTime: '4:00 PM',
    time: '9:00 AM – 4:00 PM',
    date: '21',
    month: 'SEP',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Karachi',
    country: 'Pakistan',
    location: 'Karachi',
    format: 'Physical',
    venue: 'Karachi University Grounds / Main Auditorium',
    bannerImage: '/events/societies-fair-26.svg',
    image: '/events/societies-fair-26.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Campus Outreach Partner',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Free',
    price: 'Free',
    attendeesCount: 520,
    maxCapacity: 1200,
    isFeatured: true,
    agenda: [
      {
        time: '9:00 AM - 10:30 AM',
        title: 'Opening Ceremony & Keynote Address',
        speaker: 'Campus Leadership',
        description: 'Welcome orientation and overview of university societies.'
      },
      {
        time: '11:00 AM - 2:00 PM',
        title: 'Societies Exhibition & Membership Drive',
        speaker: 'Student Council Heads',
        description: 'Explore over 30 student clubs and creative initiatives.'
      },
      {
        time: '2:30 PM - 4:00 PM',
        title: 'Interactive Showcases & Networking',
        speaker: 'Community Leads',
        description: 'Stage presentations and awards.'
      }
    ],
    speakers: [
      {
        name: 'Sara Khan',
        role: 'President, Student Council',
        company: 'Societies Directorate',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        bio: 'Leading student development and extracurricular communities across Karachi.'
      }
    ],
    tags: ['University', 'Societies', 'Karachi', 'Student Community']
  },
  {
    id: 'event-2',
    title: 'CSC Fiesta 2026',
    tagline: 'A three-day food and entertainment event with music, stalls and student activities.',
    shortDescription: 'A three-day food and entertainment event with music, stalls and student activities.',
    fullDescription: 'Experience CSC Fiesta 2026 organized by COMSATS Student Club in Islamabad! A 3-day mega celebration featuring culinary stalls, acoustic performances, e-sports battles, and cultural showcases.',
    category: 'Food & Culture',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-09-22',
    startTime: '4:00 PM',
    endTime: '10:00 PM',
    time: '4:00 PM – 10:00 PM',
    date: '22',
    month: 'SEP',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Islamabad',
    country: 'Pakistan',
    location: 'Islamabad',
    format: 'Physical',
    venue: 'COMSATS Islamabad Campus Arena',
    bannerImage: '/events/csc-fiesta-2026.svg',
    image: '/events/csc-fiesta-2026.svg',
    organizerName: 'COMSATS Student Club',
    host: 'COMSATS Student Club',
    hostInitial: 'C',
    hostTone: 'blue',
    organizerRole: 'Campus Activities Hub',
    organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 2,800',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 10,
    vipPriceInFOG: 200,
    attendeesCount: 840,
    maxCapacity: 1500,
    isFeatured: false,
    agenda: [
      {
        time: '4:00 PM - 6:00 PM',
        title: 'Food Street Opening & Live Busking',
        speaker: 'Local Indie Musicians',
        description: '40+ artisan culinary stalls open for tasting and dining.'
      },
      {
        time: '6:30 PM - 8:30 PM',
        title: 'Student Band Showdown',
        speaker: 'Performing Ensembles',
        description: 'Live acoustic battles and crowd favorites.'
      },
      {
        time: '8:45 PM - 10:00 PM',
        title: 'Headline Musical Concert',
        speaker: 'Guest Performing Artists',
        description: 'High-energy celebration concert.'
      }
    ],
    speakers: [
      {
        name: 'Bilal Ahmed',
        role: 'Fiesta Director',
        company: 'COMSATS Student Club',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        bio: 'Curating mega youth festivals across the twin cities.'
      }
    ],
    tags: ['Fiesta', 'Islamabad', 'Food', 'Music', 'COMSATS']
  },
  {
    id: 'event-3',
    title: 'Dastaan Events Layyah Presents Qawali Night',
    tagline: 'Experience a soulful night of Qawwali, live music and vibrant cultural atmosphere.',
    shortDescription: 'Experience a soulful night of Qawwali, live music and vibrant cultural atmosphere.',
    fullDescription: 'Immerse yourself in divine Sufi melodies and spiritual ecstasy in Layyah. Enjoy classical qawwali, traditional instrumentation, fragrant courtyard ambiance, and local hospitality.',
    category: 'Music & Entertainment',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-09-26',
    startTime: '5:30 PM',
    endTime: '11:00 PM',
    time: '5:30 PM – 11:00 PM',
    date: '26',
    month: 'SEP',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Layyah',
    country: 'Pakistan',
    location: 'Layyah',
    format: 'Physical',
    venue: 'Dastaan Cultural Arena, Layyah',
    bannerImage: '/events/qawali-night-layyah.svg',
    image: '/events/qawali-night-layyah.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Heritage Events Partner',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Free',
    price: 'Free',
    attendeesCount: 650,
    maxCapacity: 1000,
    isFeatured: false,
    agenda: [
      {
        time: '5:30 PM - 7:00 PM',
        title: 'Arrival & Traditional Kashmiri Chai Reception',
        speaker: 'Event Hosts',
        description: 'Welcome reception and seating arrangement.'
      },
      {
        time: '7:30 PM - 9:30 PM',
        title: 'Classical Sufi Kalams & Harmonium Ensemble',
        speaker: 'Ustad Tariq & Brothers',
        description: 'Poetry of Bulleh Shah, Rumi, and Amir Khusro.'
      },
      {
        time: '9:45 PM - 11:00 PM',
        title: 'Grand Finale Qawwali Crescendo',
        speaker: 'Featured Ensemble',
        description: 'Ecstatic communal chorus and closing blessings.'
      }
    ],
    speakers: [
      {
        name: 'Ustad Tariq Nizami',
        role: 'Master Vocalist',
        company: 'Dastaan Sufi Troupe',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        bio: 'Over two decades of classical qawwali recitals across South Asia.'
      }
    ],
    tags: ['Qawwali', 'Layyah', 'Sufi', 'Culture', 'Free Event']
  },
  {
    id: 'event-4',
    title: 'The Pakistan Business Excellence Summit 2026',
    tagline: 'A one day business gathering taking place on 26th September 2026.',
    shortDescription: 'A one day business gathering taking place on 26th September 2026.',
    fullDescription: 'The premier national business forum uniting corporate CEOs, founders, venture capitalists, and policymakers at the Movenpick Hotel Karachi. Deep dives into macroeconomic growth, exports, AI enterprise adoption, and global capital.',
    category: 'Business & Networking',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-09-26',
    startTime: '10:00 AM',
    endTime: '5:00 PM',
    time: '10:00 AM – 5:00 PM',
    date: '26',
    month: 'SEP',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Karachi',
    country: 'Pakistan',
    location: 'Karachi',
    format: 'Physical',
    venue: 'Mövenpick Grand Ballroom, Karachi',
    bannerImage: '/events/pakistan-business-excellence.svg',
    image: '/events/pakistan-business-excellence.svg',
    organizerName: 'CEO Minds Pakistan',
    host: 'CEO Minds Pakistan',
    hostInitial: 'C',
    hostTone: 'blue',
    organizerRole: 'Executive Forum Conveners',
    organizerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 5,000',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 18,
    vipPriceInFOG: 350,
    attendeesCount: 380,
    maxCapacity: 500,
    isFeatured: true,
    agenda: [
      {
        time: '10:00 AM - 11:30 AM',
        title: 'Macro Perspectives: Catalyzing Pakistani Exports & FDI',
        speaker: 'Keynote Panel',
        description: 'Strategic frameworks for cross-border scale.'
      },
      {
        time: '12:00 PM - 1:30 PM',
        title: 'AI Transformation in Banking, Logistics & Retail',
        speaker: 'Technology Leaders',
        description: 'Deploying generative AI into enterprise operations.'
      },
      {
        time: '2:30 PM - 5:00 PM',
        title: 'Executive Roundtable & High-Table Networking Lunch',
        speaker: 'CEO Forum',
        description: 'Curated 1-on-1 deal flow and investor matching.'
      }
    ],
    speakers: [
      {
        name: 'Kamran Haider',
        role: 'Managing Director',
        company: 'CEO Minds Pakistan',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        bio: 'Senior corporate advisor and enterprise strategist.'
      }
    ],
    tags: ['Business', 'Karachi', 'Summit', 'Networking', 'Executive']
  },
  {
    id: 'event-5',
    title: 'Resin Art Masterclass',
    tagline: 'A 2-Day hands-on workshop designed for beginners and art lovers.',
    shortDescription: 'A 2-Day hands-on workshop designed for beginners and art lovers.',
    fullDescription: 'Unleash your creativity at the Lahore Resin Art Masterclass! Learn resin chemistry, pigment blending, beach wave textures, geode crystal embellishments, and protective clear coating. Take home your own cured art pieces.',
    category: 'Arts & Crafts',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-10-02',
    startTime: '11:00 AM',
    endTime: '2:00 PM',
    time: '11:00 AM – 2:00 PM',
    date: '02',
    month: 'OCT',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Lahore',
    country: 'Pakistan',
    location: 'Lahore',
    format: 'Physical',
    venue: 'Gulberg Art Studio Hub, Lahore',
    bannerImage: '/events/resin-art-masterclass.svg',
    image: '/events/resin-art-masterclass.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Creative Arts Workshop Curator',
    organizerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 1,500',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 6,
    vipPriceInFOG: 180,
    attendeesCount: 42,
    maxCapacity: 60,
    isFeatured: false,
    agenda: [
      {
        time: '11:00 AM - 12:00 PM',
        title: 'Safety, Resin Ratios & Color Theory',
        speaker: 'Art Instructor',
        description: 'Safety protocols, mixing dynamics, and mica pigment choices.'
      },
      {
        time: '12:00 PM - 1:30 PM',
        title: 'Hands-On Pouring: Ocean Waves & Geode Textures',
        speaker: 'Lead Artisan',
        description: 'Direct step-by-step guidance on wooden boards.'
      },
      {
        time: '1:30 PM - 2:00 PM',
        title: 'Curing Best Practices & Certificate Handout',
        speaker: 'Studio Director',
        description: 'Packaging and curing process.'
      }
    ],
    speakers: [
      {
        name: 'Mahnoor Tariq',
        role: 'Principal Resin Artist',
        company: 'Lahore Artisan Guild',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        bio: 'Specialist in ocean resin art with over 50 workshops delivered nationwide.'
      }
    ],
    tags: ['Art', 'Workshop', 'Lahore', 'Masterclass', 'Crafts']
  },
  {
    id: 'event-6',
    title: "Pakistan's First Waterfront Farmers Market",
    tagline: 'Fresh produce, local brands, food stalls and a vibrant community experience.',
    shortDescription: 'Fresh produce, local brands, food stalls and a vibrant community experience.',
    fullDescription: "Experience Pakistan's inaugural open-air Waterfront Farmers Market in Islamabad! Located along the scenic lakeside promenade, enjoy direct-from-farm organic fruits, artisanal cheeses, sourdough breads, natural skincare, and pet-friendly lakeside stalls.",
    category: 'Markets & Shopping',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-10-03',
    startTime: '3:00 PM',
    endTime: '9:00 PM',
    time: '3:00 PM – 9:00 PM',
    date: '03',
    month: 'OCT',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Islamabad',
    country: 'Pakistan',
    location: 'Islamabad',
    format: 'Physical',
    venue: 'Waterfront Promenade, Rawal Lake, Islamabad',
    bannerImage: '/events/farmers-market.svg',
    image: '/events/farmers-market.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Sustainable Communities Group',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Free',
    price: 'Free',
    attendeesCount: 950,
    maxCapacity: 2000,
    isFeatured: false,
    agenda: [
      {
        time: '3:00 PM - 5:00 PM',
        title: 'Farmers Market Opening & Tasting Pavilions',
        speaker: 'Local Organic Farmers',
        description: 'Fresh honey, cold-pressed oils, seasonal harvest.'
      },
      {
        time: '5:30 PM - 7:30 PM',
        title: 'Sunset Acoustic Music & Lake Walk',
        speaker: 'Folk Duets',
        description: 'Acoustic guitar and flute lakeside busking.'
      },
      {
        time: '7:30 PM - 9:00 PM',
        title: 'Artisanal Street Food Night Market',
        speaker: 'Culinary Popups',
        description: 'Wood-fired pizzas, herbal teas, and fresh grills.'
      }
    ],
    speakers: [
      {
        name: 'Zainab Qureshi',
        role: 'Founder',
        company: 'Green Harvest Collective',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        bio: 'Pioneering organic farm-to-table initiatives in the capital.'
      }
    ],
    tags: ['Farmers Market', 'Islamabad', 'Organic', 'Shopping', 'Free Event']
  },
  {
    id: 'event-7',
    title: 'Qawwali Night with The Malangz',
    tagline: 'Live music and a vibrant cultural experience.',
    shortDescription: 'Live music and a vibrant cultural experience.',
    fullDescription: 'Join The Malangz for an enchanting night of live classical and modern fusion Qawwali in Karachi! Experience powerful vocals, traditional harmonium, vibrant percussion, and a captivating candlelit ambience under the stars.',
    category: 'Culture & Entertainment',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-10-03',
    startTime: '7:00 PM',
    endTime: '11:00 PM',
    time: '7:00 PM – 11:00 PM',
    date: '03',
    month: 'OCT',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Karachi',
    country: 'Pakistan',
    location: 'Karachi',
    format: 'Physical',
    venue: 'Arts Council Open-Air Amphitheatre, Karachi',
    bannerImage: '/events/qawwali-malangz.svg',
    image: '/events/qawwali-malangz.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Music & Stage Promotions',
    organizerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 1,000',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 4,
    vipPriceInFOG: 150,
    attendeesCount: 640,
    maxCapacity: 900,
    isFeatured: false,
    agenda: [
      {
        time: '7:00 PM - 8:00 PM',
        title: 'Doors Open & Candlelight Seating',
        speaker: 'Stage Crew',
        description: 'Traditional carpeted floor and chair seating.'
      },
      {
        time: '8:00 PM - 9:30 PM',
        title: 'Opening Set: Hamd & Naat Recitations',
        speaker: 'The Malangz Ensemble',
        description: 'Soulful opening verses and classical raga explorations.'
      },
      {
        time: '9:45 PM - 11:00 PM',
        title: 'Ecstatic Fusion Qawwali Anthems',
        speaker: 'The Malangz',
        description: 'High-energy claps, tabla crescendos, and crowd favorites.'
      }
    ],
    speakers: [
      {
        name: 'Ali Raza',
        role: 'Lead Singer',
        company: 'The Malangz',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        bio: 'Renowned fusion vocalist bringing classical qawwali to modern audiences.'
      }
    ],
    tags: ['Qawwali', 'Karachi', 'Music', 'The Malangz', 'Live Concert']
  },
  {
    id: 'event-8',
    title: 'Heritage Night – Rang, Raunaq, Rawaj',
    tagline: "A cultural evening celebrating Pakistan's heritage, food, music and traditions.",
    shortDescription: "A cultural evening celebrating Pakistan's heritage, food, music and traditions.",
    fullDescription: 'Immerse in the rich cultural tapestry of Pakistan at Heritage Night: Rang, Raunaq, Rawaj in Rawalpindi. Featuring regional folk music, Lok Virsa artisan live demonstrations, authentic culinary pavilions, traditional attire, and interactive heritage exhibits.',
    category: 'Cultural Festival',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Upcoming',
    startDate: '2026-10-03',
    startTime: '6:00 PM',
    endTime: '10:00 PM',
    time: '6:00 PM – 10:00 PM',
    date: '03',
    month: 'OCT',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Rawalpindi',
    country: 'Pakistan',
    location: 'Rawalpindi',
    format: 'Physical',
    venue: 'Rawalpindi Cultural Complex Courtyard',
    bannerImage: '/events/heritage-night.svg',
    image: '/events/heritage-night.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Traditional Heritage Trust',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 800',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 3,
    vipPriceInFOG: 120,
    attendeesCount: 420,
    maxCapacity: 750,
    isFeatured: false,
    agenda: [
      {
        time: '6:00 PM - 7:15 PM',
        title: 'Folk Crafts Live Loom Demonstration',
        speaker: 'Master Artisans',
        description: 'Pottery, mirror work embroidery, and wood carving.'
      },
      {
        time: '7:30 PM - 9:00 PM',
        title: 'Regional Folk Dance Troupes & Rubab Recital',
        speaker: 'Heritage Artists',
        description: 'Khattak, Lewa, and Jhumar cultural dances.'
      },
      {
        time: '9:00 PM - 10:00 PM',
        title: 'Heritage Feast & Desi Chai Dhabba',
        speaker: 'Master Chefs',
        description: 'Traditional delicacies from all four provinces.'
      }
    ],
    speakers: [
      {
        name: 'Usman Malik',
        role: 'Curator',
        company: 'Rawalpindi Heritage Circle',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        bio: 'Preserving and promoting indigenous folk art and craft traditions.'
      }
    ],
    tags: ['Heritage', 'Rawalpindi', 'Culture', 'Traditions', 'Festival']
  },
  {
    id: 'event-9',
    title: "La Soiree's Fashion & Lifestyle Exhibition",
    tagline: 'An exclusive exhibition bringing together fashion, lifestyle and local brands.',
    shortDescription: 'An exclusive exhibition bringing together fashion, lifestyle and local brands.',
    fullDescription: "Step into luxury at La Soirée's Fashion & Lifestyle Exhibition in Lahore! Showcasing bridal couture, contemporary pret collections, handcrafted jewelry, luxury home accents, and bespoke accessories from Pakistan's most coveted design houses.",
    category: 'Fashion & Lifestyle',
    type: 'In-Person',
    status: 'upcoming',
    eventStatus: 'Limited Seats',
    startDate: '2026-10-03',
    startTime: '4:00 PM',
    endTime: '11:00 PM',
    time: '4:00 PM – 11:00 PM',
    date: '03',
    month: 'OCT',
    year: '2026',
    timezone: 'PKT (UTC+5)',
    city: 'Lahore',
    country: 'Pakistan',
    location: 'Lahore',
    format: 'Physical',
    venue: 'Royal Palm Golf & Country Club, Lahore',
    bannerImage: '/events/la-soiree.svg',
    image: '/events/la-soiree.svg',
    organizerName: 'Event Updates',
    host: 'Event Updates',
    hostInitial: 'H',
    hostTone: 'purple',
    organizerRole: 'Luxury Fashion Producers',
    organizerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    isOrganizerVerified: true,
    priceType: 'Paid',
    price: 'PKR 2,000',
    fogCoin: '100 Fog Coin',
    priceInFOG: 100,
    priceInUSD: 8,
    vipPriceInFOG: 250,
    attendeesCount: 194,
    maxCapacity: 200,
    isFeatured: false,
    agenda: [
      {
        time: '4:00 PM - 6:00 PM',
        title: 'VIP Preview & Haute Couture Showcase',
        speaker: 'Featured Designers',
        description: 'Exclusive early access to limited edition designer drops.'
      },
      {
        time: '6:30 PM - 9:00 PM',
        title: 'General Exhibition & Boutique Stalls',
        speaker: 'Brand Curators',
        description: 'Fine jewelry, bespoke pret, and couture accessories.'
      },
      {
        time: '9:30 PM - 11:00 PM',
        title: 'Fashion Runway Highlights & Gala Evening',
        speaker: 'Runway Director',
        description: 'Curated models showcase key winter season looks.'
      }
    ],
    speakers: [
      {
        name: 'Ayla Bukhari',
        role: 'Creative Director',
        company: 'La Soirée Events',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        bio: 'Leading luxury event architect and fashion producer in Lahore.'
      }
    ],
    tags: ['Fashion', 'Lifestyle', 'Lahore', 'Luxury', 'Exhibition']
  }
];
