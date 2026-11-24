import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query as firestoreQuery, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Route } from '../types';
import { User as UserType } from '../firebase/types/user';
import { BrandService } from '../firebase/types/service';
import { Brand } from '../firebase/types/brand';
import { ActiveEvent } from '../firebase/types/activeEvent';
import { getAllActiveEvents } from '../firebase/services/activeEventService';
import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import { FogCoinSettings } from '../firebase/types/fogCoinSettings';
import Markdown from 'react-markdown';
import {
  ChatMessage,
  generateAIResponse,
  getSuggestedQuestions,
} from '../utils/geminiService';
import {
  getAllActiveFreelancers,
  ApprovedFreelancer,
} from '../firebase/services/approvedFreelancers';
import {
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
  Trash2,
  ArrowLeft,
  MessageSquare,
  Zap,
  Star,
  ExternalLink,
  Users,
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  X,
  Code2,
  BookOpen,
  DollarSign,
  Briefcase,
  HelpCircle,
  TrendingUp,
  PresentationIcon,
  Package,
  Store,
  CalendarDays,
  MapPin,
  Clock,
} from 'lucide-react';

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
      style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', top: '-10%', left: '10%' }}
      animate={{ x: [0, 50, -30, 40, 0], y: [0, -50, 30, 20, 0], scale: [1, 1.1, 0.9, 1.05, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
      style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', top: '20%', right: '15%' }}
      animate={{ x: [0, -40, 30, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.9, 1.1, 0.95, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
    <motion.div
      className="absolute w-[350px] h-[350px] rounded-full opacity-30 blur-[100px]"
      style={{ background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)', bottom: '10%', left: '20%' }}
      animate={{ x: [0, 30, -40, 25, 0], y: [0, -30, 40, -15, 0], scale: [1, 1.05, 0.9, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
    />
  </div>
);

// ============== SUGGESTION CATEGORIES ==============
const SUGGESTION_CATEGORIES = [
  {
    icon: Briefcase,
    label: 'Find Work',
    color: 'from-blue-500 to-cyan-500',
    questions: [
      'How do I find clients on Fogsly?',
      'What gig categories are available?',
      'How to create a winning proposal?',
    ],
  },
  {
    icon: DollarSign,
    label: 'Earnings',
    color: 'from-green-500 to-emerald-500',
    questions: [
      'How do FogCoins work?',
      'What are the payment methods?',
      'How much can I earn on Fogsly?',
    ],
  },
  {
    icon: Code2,
    label: 'Tech Help',
    color: 'from-purple-500 to-violet-500',
    questions: [
      'How to set up my developer profile?',
      'What skills are in high demand?',
      'How to showcase my portfolio?',
    ],
  },
  {
    icon: TrendingUp,
    label: 'Growth Tips',
    color: 'from-orange-500 to-amber-500',
    questions: [
      'How to get my first client?',
      'Tips to grow my freelance business',
      'How do top freelancers succeed?',
    ],
  },
  {
    icon: HelpCircle,
    label: 'Platform FAQ',
    color: 'from-pink-500 to-rose-500',
    questions: [
      'What is Fogsly?',
      'How does the referral program work?',
      'What is the Visionaries program?',
    ],
  },
  {
    icon: BookOpen,
    label: 'Getting Started',
    color: 'from-teal-500 to-cyan-500',
    questions: [
      'How do I get started on Fogsly?',
      'How to complete my profile?',
      'What documents do I need?',
    ],
  },
];

interface AIAssistantPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  currentUser: UserType | null;
  initialQuery?: string;
}

// ============== FREELANCER INTENT DETECTION ==============
const FREELANCER_KEYWORDS = [
  'hire', 'find freelancer', 'need freelancer', 'looking for freelancer', 'looking for developer',
  'looking for designer', 'looking for writer', 'who can', 'can you find',
  'gig', 'gigs', 'freelancer', 'freelancers', 'talent', 'portfolio',
  'developer', 'designer', 'writer', 'marketer', 'editor', 'photographer',
  'programmer', 'coder', 'analyst', 'consultant', 'creator',
  'web developer', 'app developer', 'ui designer', 'ux designer', 'graphic designer',
  'full stack', 'backend', 'frontend', 'data analyst', 'copywriter',
  'illustrator', 'animator', 'video editor',
  'react', 'flutter', 'python', 'node', 'wordpress', 'javascript', 'typescript',
  'android', 'ios', 'mobile app', 'hourly rate',
];

function detectFreelancerIntent(message: string): { isMatch: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  const matched = FREELANCER_KEYWORDS.filter(kw => lower.includes(kw));
  return { isMatch: matched.length > 0, keywords: matched };
}

function filterFreelancers(freelancers: ApprovedFreelancer[], keywords: string[]): ApprovedFreelancer[] {
  if (!keywords.length) return freelancers.slice(0, 4);
  const scored = freelancers.map(f => {
    const text = [f.title, f.bio, ...(f.skills || []), ...(f.categories || [])].join(' ').toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    return { f, score };
  });
  const matched = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  return (matched.length > 0 ? matched.map(s => s.f) : freelancers).slice(0, 5);
}

// ============== SERVICE INTENT DETECTION ==============
const SERVICE_KEYWORDS = [
  'service', 'services', 'e-service', 'fog service', 'fog e-service', 'eservice',
  'package', 'packages', 'buy', 'order', 'purchase', 'pricing', 'price',
  'branding service', 'design service', 'seo service', 'marketing service',
  'digital marketing', 'logo design', 'content writing', 'social media management',
  'what do you offer', 'what services', 'available services', 'show services',
  'list services', 'browse services', 'find services', 'affordable', 'cost',
];

function detectServiceIntent(message: string): { isMatch: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  const matched = SERVICE_KEYWORDS.filter(kw => lower.includes(kw));
  return { isMatch: matched.length > 0, keywords: matched };
}

function filterServices(services: BrandService[], keywords: string[]): BrandService[] {
  if (!keywords.length) return services.slice(0, 5);
  const scored = services.map(s => {
    const text = [s.title, s.description, ...(s.categories || []), s.brandName].join(' ').toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    return { s, score };
  });
  const matched = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return (matched.length > 0 ? matched.map(x => x.s) : services).slice(0, 5);
}

// ============== BRAND INTENT DETECTION ==============
const BRAND_KEYWORDS = [
  'brand', 'brands', 'fog brand', 'store', 'shop', 'official brand',
  'brand store', 'brand page', 'seller', 'vendor', 'provider',
  'show brands', 'list brands', 'browse brands', 'find brands',
  'which brand', 'brand name', 'who sells', 'top brands', 'best brands',
];

function detectBrandIntent(message: string): { isMatch: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  const matched = BRAND_KEYWORDS.filter(kw => lower.includes(kw));
  return { isMatch: matched.length > 0, keywords: matched };
}

function filterBrands(brands: Brand[], keywords: string[]): Brand[] {
  if (!keywords.length) return brands.slice(0, 5);
  const scored = brands.map(b => {
    const text = [b.brandName, b.tagline, b.description].join(' ').toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    return { b, score };
  });
  const matched = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return (matched.length > 0 ? matched.map(x => x.b) : brands).slice(0, 5);
}

// ============== FOG COIN INTENT DETECTION ==============
const FOG_COIN_KEYWORDS = [
  'fog coin', 'fog coins', 'fogcoin', 'fogcoins',
  'coin price', 'fog price', 'price of fog', 'fog value', 'how much is fog', 'fog worth',
  'fog to usd', 'fog to pkr', 'usd to fog', 'pkr to fog', 'fog rate', 'coin rate',
  'buy fog', 'purchase fog', 'get fog coins', 'earn fog',
  'withdraw fog', 'withdrawal', 'minimum withdraw', 'can i withdraw',
  'daily limit', 'earning limit', 'maximum earning',
  'fog coin value', 'fog coin rate', 'what is fog', '1 fog',
];

function detectFogCoinIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return FOG_COIN_KEYWORDS.some(kw => lower.includes(kw));
}

// ============== EVENT INTENT DETECTION ==============
const EVENT_KEYWORDS = [
  'event', 'events', 'fog event', 'upcoming event', 'upcoming events',
  'conference', 'summit', 'meetup', 'workshop', 'webinar', 'seminar',
  'networking', 'expo', 'hackathon', 'bootcamp', 'training',
  'virtual event', 'physical event', 'online event', 'in-person event',
  'attend', 'register', 'tickets', 'ticket', 'rsvp',
  'what events', 'show events', 'list events', 'browse events', 'find events',
  'live event', 'live now', 'coming soon event', 'next event',
];

function detectEventIntent(message: string): { isMatch: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  const matched = EVENT_KEYWORDS.filter(kw => lower.includes(kw));
  return { isMatch: matched.length > 0, keywords: matched };
}

function filterEvents(events: ActiveEvent[], keywords: string[]): ActiveEvent[] {
  if (!keywords.length) return events.slice(0, 5);
  const scored = events.map(e => {
    const text = [e.title, e.description, e.category, e.city, e.country, ...(e.tags || [])].join(' ').toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    return { e, score };
  });
  const matched = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return (matched.length > 0 ? matched.map(x => x.e) : events).slice(0, 5);
}

// ============== COMING SOON TOOLTIP ==============
const ComingSoonTooltip: React.FC<{ children: React.ReactNode; sidebarExpanded: boolean }> = ({ children, sidebarExpanded }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${sidebarExpanded ? 'left-full ml-2' : 'left-full ml-3'} top-1/2 -translate-y-1/2 z-[999] pointer-events-none`}
          >
            <div className="relative">
              <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-2xl border border-white/10 whitespace-nowrap">
                ⏳ Coming Soon
              </div>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============== LEFT SIDEBAR NAV ITEMS ==============
const NAV_ITEMS = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    available: true,
    gradient: 'from-[--color-primary] to-[--color-accent]',
    bgActive: 'bg-gradient-to-r from-[--color-primary]/15 to-[--color-accent]/15',
    borderActive: 'border-[--color-primary]/40',
    textActive: 'text-[--color-primary]',
  },
  {
    id: 'video-generator',
    label: 'Video Generator',
    icon: Video,
    available: false,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'ppt-generator',
    label: 'PowerPoint Generator',
    icon: PresentationIcon,
    available: false,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'image-generator',
    label: 'Image Generator',
    icon: ImageIcon,
    available: false,
    gradient: 'from-violet-500 to-purple-500',
  },
];

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ navigate, currentUser, initialQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestedFreelancers, setSuggestedFreelancers] = useState<ApprovedFreelancer[]>([]);
  const [isFetchingFreelancers, setIsFetchingFreelancers] = useState(false);
  const [allFreelancers, setAllFreelancers] = useState<ApprovedFreelancer[]>([]);
  const [suggestedServices, setSuggestedServices] = useState<BrandService[]>([]);
  const [allServices, setAllServices] = useState<BrandService[]>([]);
  const [suggestedBrands, setSuggestedBrands] = useState<Brand[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<ActiveEvent[]>([]);
  const [allEvents, setAllEvents] = useState<ActiveEvent[]>([]);
  const [fogCoinSettings, setFogCoinSettings] = useState<FogCoinSettings | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'freelancers' | 'services' | 'brands' | 'events'>('freelancers');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [talentSidebarVisible, setTalentSidebarVisible] = useState(true);
  const [mobileSuggestionsOpen, setMobileSuggestionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialQueryRef = useRef(initialQuery);

  const suggestedQuestions = getSuggestedQuestions();

  useEffect(() => {
    // Load freelancers
    getAllActiveFreelancers().then(setAllFreelancers).catch(console.error);
    // Load active services
    getDocs(firestoreQuery(
      collection(db, 'BrandsServices'),
      where('status', '==', 'active'),
      where('soldOut', '==', false),
      limit(100)
    )).then(snap => setAllServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as BrandService))))
      .catch(console.error);
    // Load approved/active brands
    getDocs(firestoreQuery(
      collection(db, 'brands'),
      where('status', 'in', ['approved', 'active']),
      limit(100)
    )).then(snap => setAllBrands(snap.docs.map(d => ({ id: d.id, ...d.data() } as Brand))))
      .catch(console.error);
    // Load active events
    getAllActiveEvents()
      .then(evts => setAllEvents(evts.filter(e => e.eventStatus === 'active')))
      .catch(console.error);
    // Load FOG coin pricing settings
    getFogCoinSettings().then(setFogCoinSettings).catch(console.error);
  }, []);

  // Auto-submit query passed from the floating search bar
  useEffect(() => {
    const q = initialQueryRef.current;
    if (q) {
      initialQueryRef.current = undefined;
      handleSendMessage(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) navigate('auth');
  }, [currentUser, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // no initial welcome bubble — greeting is merged into the suggestions panel

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);
    setActiveCategory(null);

    const { isMatch: isFreelancerMatch, keywords: freelancerKws } = detectFreelancerIntent(textToSend);
    const { isMatch: isServiceMatch, keywords: serviceKws } = detectServiceIntent(textToSend);
    const { isMatch: isBrandMatch, keywords: brandKws } = detectBrandIntent(textToSend);
    const { isMatch: isEventMatch, keywords: eventKws } = detectEventIntent(textToSend);
    const isFogCoinQuery = detectFogCoinIntent(textToSend);

    const anyMatch = isFreelancerMatch || isServiceMatch || isBrandMatch || isEventMatch;

    // Compute filtered results into local vars so we can both set state AND build AI context
    let matchedFreelancers = suggestedFreelancers;
    let matchedServices = suggestedServices;
    let matchedBrands = suggestedBrands;
    let matchedEvents = suggestedEvents;

    if (anyMatch) {
      matchedFreelancers = filterFreelancers(allFreelancers, freelancerKws);
      matchedServices = filterServices(allServices, serviceKws);
      matchedBrands = filterBrands(allBrands, brandKws);
      matchedEvents = filterEvents(allEvents, eventKws);

      setIsFetchingFreelancers(true);
      setSuggestedFreelancers(matchedFreelancers);
      setSuggestedServices(matchedServices);
      setSuggestedBrands(matchedBrands);
      setSuggestedEvents(matchedEvents);
      setIsFetchingFreelancers(false);
      setTalentSidebarVisible(true);
    } else {
      matchedFreelancers = [];
      matchedServices = [];
      matchedBrands = [];
      matchedEvents = [];
      setSuggestedFreelancers([]);
      setSuggestedServices([]);
      setSuggestedBrands([]);
      setSuggestedEvents([]);
    }

    // Auto-switch tab: highest keyword match count wins, so the most relevant tab opens first
    const scores = [
      { tab: 'freelancers' as const, count: freelancerKws.length, active: isFreelancerMatch },
      { tab: 'services' as const, count: serviceKws.length, active: isServiceMatch },
      { tab: 'brands' as const, count: brandKws.length, active: isBrandMatch },
      { tab: 'events' as const, count: eventKws.length, active: isEventMatch },
    ].filter(x => x.active);
    if (scores.length > 0) {
      const winner = scores.reduce((a, b) => b.count > a.count ? b : a);
      setSidebarTab(winner.tab);
    }

    // Build live data context string to pass into the AI so it can speak about real results
    let liveDataContext: string | undefined;
    
    // Only inject massive platform data if there is an intent match to keep responses lightning fast
    if (anyMatch) {
      const parts: string[] = [];
      if (matchedFreelancers.length > 0) {
        parts.push(
          `AVAILABLE FREELANCERS ON FOGSLY:\n` +
          matchedFreelancers.slice(0, 5).map((f, i) =>
            `${i + 1}. ${f.userName || 'Freelancer'} — ${f.title} — Skills: ${(f.skills || []).slice(0, 4).join(', ')} — Rate: PKR ${f.hourlyRate}/hr — Rating: ${f.averageRating ? f.averageRating.toFixed(1) : '5.0'} — Categories: ${(f.categories || []).join(', ')}`
          ).join('\n')
        );
      }
      if (matchedServices.length > 0) {
        parts.push(
          `AVAILABLE SERVICES ON FOGSLY:\n` +
          matchedServices.slice(0, 5).map((s, i) =>
            `${i + 1}. "${s.title}" by ${s.brandName}${s.pricing?.packages?.[0] ? ` — From PKR ${s.pricing.packages[0].price}` : ''} — Categories: ${(s.categories || []).join(', ')}`
          ).join('\n')
        );
      }
      if (matchedBrands.length > 0) {
        parts.push(
          `AVAILABLE BRANDS ON FOGSLY:\n` +
          matchedBrands.slice(0, 5).map((b, i) =>
            `${i + 1}. ${b.brandName}${b.tagline ? ` — "${b.tagline}"` : ''} — Orders: ${b.stats?.totalOrders || 0}`
          ).join('\n')
        );
      }
      if (matchedEvents.length > 0) {
        parts.push(
          `AVAILABLE EVENTS ON FOGSLY:\n` +
          matchedEvents.slice(0, 5).map((e, i) =>
            `${i + 1}. "${e.title}" — ${e.category} — ${e.city || e.country || 'Online'} — ${e.startDate} — ${e.isFree ? 'Free' : `${e.priceInFOG} FOG coins`}`
          ).join('\n')
        );
      }
      if (parts.length > 0) liveDataContext = parts.join('\n\n');
    }

    // Append live FOG coin pricing data (no sidebar — just AI context)
    if (fogCoinSettings) {
      const fogPart = [
        'FOG COIN LIVE PRICING DATA:',
        `1 FOG = $${fogCoinSettings.fogToUsdRate.toFixed(4)} USD`,
        `1 FOG = PKR ${fogCoinSettings.fogToPkrRate.toFixed(2)}`,
        `1 USD = PKR ${fogCoinSettings.usdToPkrRate.toFixed(2)}`,
        `Minimum withdrawal: ${fogCoinSettings.minimumWithdrawAmount} FOG`,
        `Maximum daily earnings cap: ${fogCoinSettings.maximumDailyEarnings} FOG`,
        `Withdrawals currently: ${fogCoinSettings.isWithdrawalsEnabled ? 'ENABLED' : 'DISABLED'}`,
        `Use cases: pay freelancers, purchase e-services, tip creators, boost profiles, withdraw as real money`,
        `How to earn: watch ads, complete Q&A tasks, referrals, complete freelance jobs, sell services`,
      ].join('\n');
      liveDataContext = liveDataContext ? liveDataContext + '\n\n' + fogPart : fogPart;
    }

    try {
      const response = await generateAIResponse(textToSend, messages, liveDataContext);
      setMessages(prev => [...prev, { role: 'assistant', content: response.content, timestamp: new Date(), toolResults: response.toolResults }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setActiveCategory(null);
    setSuggestedFreelancers([]);
    setSuggestedServices([]);
    setSuggestedBrands([]);
    setSuggestedEvents([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[--color-bg-primary] via-[--color-bg-secondary] to-[--color-bg-primary]">
      <AnimatedBackground />

      {/* ===== TOP HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-white/5 dark:bg-black/5 flex-shrink-0"
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 text-[--color-text-secondary]" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[--color-text-primary] leading-tight">
                Fogsly AI Studio
              </h1>
              <p className="text-[--color-text-secondary] text-[10px] hidden sm:block">
                Your intelligent creative hub
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </motion.div>

      {/* ===== MAIN BODY ===== */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* ===== LEFT SIDEBAR ===== */}
        <motion.div
          animate={{ width: sidebarExpanded ? 220 : 62 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative flex-shrink-0 hidden md:flex flex-col border-r border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl overflow-hidden"
          style={{ minWidth: sidebarExpanded ? 220 : 62 }}
        >
          {/* Sidebar Header Row */}
          <div className={`flex items-center py-4 px-3 border-b border-white/10 gap-2 ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-secondary]/50 pl-1 whitespace-nowrap"
              >
                AI Tools
              </motion.span>
            )}
            <button
              onClick={() => setSidebarExpanded(v => !v)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              {sidebarExpanded
                ? <ChevronLeft className="w-4 h-4 text-[--color-text-secondary]" />
                : <ChevronRight className="w-4 h-4 text-[--color-text-secondary]" />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-3 flex flex-col gap-1 px-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;

              if (!item.available) {
                return (
                  <ComingSoonTooltip key={item.id} sidebarExpanded={sidebarExpanded}>
                    <div
                      className={`
                        flex items-center gap-3 rounded-xl py-2.5 transition-all
                        cursor-not-allowed opacity-45 select-none
                        border border-transparent
                        ${sidebarExpanded ? 'px-3' : 'px-0 justify-center'}
                      `}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/8">
                        <Icon className="w-4 h-4 text-[--color-text-secondary]" />
                      </div>
                      {sidebarExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 }}
                          className="flex-1 min-w-0"
                        >
                          <p className="text-xs font-semibold text-[--color-text-secondary] truncate leading-tight">
                            {item.label}
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400/60">
                            Coming Soon
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </ComingSoonTooltip>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`
                    flex items-center gap-3 rounded-xl py-2.5 transition-all
                    border ${(item as any).bgActive} ${(item as any).borderActive}
                    ${sidebarExpanded ? 'px-3' : 'px-0 justify-center'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.gradient} shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {sidebarExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
                      className="flex-1 min-w-0"
                    >
                      <p className={`text-xs font-bold truncate leading-tight ${(item as any).textActive}`}>
                        {item.label}
                      </p>
                      <span className="text-[9px] font-semibold text-emerald-400">
                        ● Active
                      </span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer Tip */}
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="p-3 border-t border-white/10"
            >
              <div className="rounded-xl bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10 border border-[--color-primary]/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-bold text-[--color-text-primary]">Pro Tip</span>
                </div>
                <p className="text-[10px] text-[--color-text-secondary] leading-relaxed">
                  Ask about freelancers or gigs to get smart talent suggestions!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ===== CHAT COLUMN ===== */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.45); }
              .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.25) transparent; }
              
              .markdown-body p { margin-bottom: 0.75rem; }
              .markdown-body p:last-child { margin-bottom: 0; }
              .markdown-body strong { font-weight: 600; color: inherit; }
              .markdown-body ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; }
              .markdown-body ol { list-style-type: decimal; margin-left: 1.25rem; margin-bottom: 0.75rem; }
              .markdown-body li { margin-bottom: 0.25rem; }
              .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
              .markdown-body code { background: rgba(0,0,0,0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
              .dark .markdown-body code { background: rgba(255,255,255,0.1); }
              .markdown-body pre code { background: transparent; padding: 0; border-radius: 0; color: inherit; }
              .markdown-body pre { background: rgba(0,0,0,0.8); color: white; padding: 0.75rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 0.75rem; }
              .markdown-body a { color: var(--color-primary); text-decoration: underline; text-underline-offset: 2px; }
            `}</style>

            <div className="px-4 py-6 max-w-4xl mx-auto w-full">
              <div className="space-y-5 pb-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-9 h-9 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[--color-primary]/20">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-2 rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-[--color-primary] to-[--color-accent] text-white rounded-tr-sm'
                            : 'bg-white/15 dark:bg-white/5 text-[--color-text-primary] border border-white/10 backdrop-blur-sm rounded-tl-sm'
                        }`}
                      >
                        {message.content && (
                          <div className="markdown-body text-sm leading-relaxed">
                            <Markdown>{message.content}</Markdown>
                          </div>
                        )}
                        
                        {message.toolResults && message.toolResults.map((result, idx) => {
                          if (result.type === 'form_draft') {
                            return (
                              <div key={idx} className="mt-2 p-4 rounded-xl bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10">
                                <h4 className="font-bold text-sm mb-2 opacity-90 flex items-center">
                                  <Sparkles className="w-4 h-4 inline mr-2 text-[--color-primary]"/> {result.title}
                                </h4>
                                <div className="text-xs space-y-2 opacity-80 whitespace-pre-wrap">{result.content}</div>
                                <button
                                  onClick={() => {
                                    if (result.jsonData) {
                                      window.localStorage.setItem('fogsly_ai_draft_data', result.jsonData);
                                      if (result.formType === 'physical_job') navigate('post-physical-job');
                                      else if (result.formType === 'job') navigate('post-job');
                                      else if (result.formType === 'task') navigate('post-task');
                                      else if (result.formType === 'gig') navigate('become-freelancer');
                                      else if (result.formType === 'profile_update') navigate('profile');
                                      else toast.info('Draft prepared. Navigating to forms...', { icon: '🚀' });
                                    } else {
                                      toast.info('This draft is text-only. Please copy it to your clipboard.', { icon: '📋' });
                                    }
                                  }}
                                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-[--color-primary] text-white rounded-lg text-xs font-medium hover:bg-[--color-accent] transition-colors"
                                >
                                  <span>Use Draft & Post</span>
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }
                          if (result.type === 'rich_search') {
                            return (
                              <div key={idx} className="mt-2 p-3 flex flex-col gap-2">
                                <h4 className="font-semibold text-xs opacity-70 uppercase tracking-widest">{result.searchType} results for "{result.query}":</h4>
                                {result.results.map((r: any, rIdx: number) => (
                                  <div key={rIdx} className="p-3 rounded-lg bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10">
                                    <p className="font-medium text-sm">{r.title}</p>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })}

                        <p className={`text-[10px] mt-1.5 ${message.role === 'user' ? 'text-white/60' : 'text-[--color-text-secondary]/60'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                    <div className="w-9 h-9 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/15 dark:bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay }}
                            className="w-2 h-2 rounded-full bg-[--color-primary]"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ===== ENHANCED SUGGESTIONS SECTION ===== */}
              {showSuggestions && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pb-6"
                >
                  {/* Section Header — greeting merged in */}
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[--color-text-primary]">👋 Hello! I'm your Fogsly AI</h2>
                        <p className="text-[11px] text-[--color-text-secondary]">Ask me anything about the platform, gigs, freelancers & more</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SUGGESTION_CATEGORIES.map((cat, idx) => {
                      const CatIcon = cat.icon;
                      const isSelected = activeCategory === idx;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setActiveCategory(isSelected ? null : idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white border-transparent shadow-md'
                              : 'bg-white/8 hover:bg-white/15 text-[--color-text-secondary] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <CatIcon className="w-3 h-3" />
                          {cat.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Question Cards */}
                  <AnimatePresence mode="wait">
                    {activeCategory !== null ? (
                      <motion.div
                        key={`cat-${activeCategory}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                      >
                        {SUGGESTION_CATEGORIES[activeCategory].questions.map((q, i) => {
                          const CatIcon = SUGGESTION_CATEGORIES[activeCategory].icon;
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.07 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSendMessage(q)}
                              className="text-left flex items-start gap-2.5 px-3.5 py-3 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-[--color-primary]/30 rounded-xl transition-all group"
                            >
                              <div className="w-7 h-7 mt-0.5 rounded-lg bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center flex-shrink-0 opacity-80 group-hover:opacity-100 shadow-sm">
                                <CatIcon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-xs text-[--color-text-secondary] group-hover:text-[--color-text-primary] transition-colors leading-relaxed">
                                {q}
                              </span>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                      >
                        {suggestedQuestions.slice(0, 6).map((q, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSendMessage(q)}
                            className="text-left flex items-start gap-2 px-3.5 py-3 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-[--color-primary]/30 rounded-xl transition-all group"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-[--color-primary]/50 group-hover:text-[--color-primary] flex-shrink-0 transition-colors" />
                            <span className="text-xs text-[--color-text-secondary] group-hover:text-[--color-text-primary] transition-colors leading-relaxed">
                              {q}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feature Highlight Cards removed */}
                </motion.div>
              )}
            </div>
          </div>

          {/* ===== RE-OPEN SUGGESTIONS CHIP ===== */}
          <AnimatePresence>
            {!showSuggestions && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="px-4 pt-2 max-w-4xl mx-auto w-full"
              >
                <button
                  onClick={() => setShowSuggestions(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[--color-primary]/10 hover:bg-[--color-primary]/20 border border-[--color-primary]/20 hover:border-[--color-primary]/40 text-[--color-primary] text-[11px] font-semibold transition-all"
                >
                  <Zap className="w-3 h-3" />
                  Show suggestions
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== INPUT BAR ===== */}
          <div className="border-t border-white/10 backdrop-blur-xl bg-white/5 dark:bg-black/5 flex-shrink-0">
            <div className="px-4 pt-2.5 pb-3 max-w-4xl mx-auto w-full">

              {/* Talent chip — shown inside input area when sidebar is closed */}
              {/* Desktop chip — reopen sidebar when it's been closed */}
              <AnimatePresence>
                {!talentSidebarVisible && (suggestedFreelancers.length > 0 || suggestedServices.length > 0 || suggestedBrands.length > 0 || suggestedEvents.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden lg:flex justify-end overflow-hidden"
                  >
                    <button
                      onClick={() => setTalentSidebarVisible(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[--color-primary]/10 hover:bg-[--color-primary]/20 border border-[--color-primary]/25 hover:border-[--color-primary]/50 text-[--color-primary] text-[11px] font-semibold transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      View Suggestions
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile chip — always show when there are results (sidebar is never visible on mobile) */}
              <AnimatePresence>
                {(suggestedFreelancers.length > 0 || suggestedServices.length > 0 || suggestedBrands.length > 0 || suggestedEvents.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex lg:hidden justify-center overflow-hidden"
                  >
                    <button
                      onClick={() => setMobileSuggestionsOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white text-xs font-bold shadow-lg shadow-[--color-primary]/30 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      View Suggestions ({suggestedFreelancers.length + suggestedServices.length + suggestedBrands.length + suggestedEvents.length})
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Fogsly..."
                    className="w-full px-4 py-3 text-sm bg-white/10 dark:bg-white/5 border border-white/15 rounded-2xl text-[--color-text-primary] placeholder-[--color-text-secondary]/50 resize-none focus:outline-none focus:border-[--color-primary]/60 focus:bg-white/15 transition-all backdrop-blur-sm"
                    rows={1}
                    style={{ maxHeight: '120px', minHeight: '46px' }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-11 h-11 bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[--color-primary]/25 flex-shrink-0"
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-[--color-text-secondary]/50 mt-1.5 text-center hidden sm:block">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>

        </div>{/* end chat column */}

        {/* ===== RIGHT SIDEBAR — Suggestions (Freelancers / Services / Brands / Events) ===== */}
        {/* Backdrop overlay for mobile bottom sheet */}
        <AnimatePresence>
          {mobileSuggestionsOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileSuggestionsOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(suggestedFreelancers.length > 0 || suggestedServices.length > 0 || suggestedBrands.length > 0 || suggestedEvents.length > 0 || isFetchingFreelancers) && (talentSidebarVisible || mobileSuggestionsOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-3xl border-t lg:relative lg:inset-auto lg:bottom-auto lg:z-10 lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l border-white/10 bg-[--color-card] lg:bg-white/5 dark:lg:bg-black/5 backdrop-blur-xl lg:w-72 xl:w-80"
            >
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0 lg:hidden">
                <div className="w-12 h-1.5 rounded-full bg-white/25" />
              </div>

              {/* Header + Tabs */}
              <div className="sticky top-0 z-10 px-4 pt-2 lg:pt-3.5 pb-0 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[--color-text-primary]">Fogsly Suggestions</p>
                  <button
                    onClick={() => { setTalentSidebarVisible(false); setMobileSuggestionsOpen(false); }}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-[--color-text-secondary]" />
                  </button>
                </div>
                {/* Tab Pills */}
                <div className="flex gap-1 pb-0 overflow-x-auto no-scrollbar">
                  {([
                    { key: 'freelancers', label: 'Freelancers', icon: Users, count: suggestedFreelancers.length },
                    { key: 'services', label: 'Services', icon: Package, count: suggestedServices.length },
                    { key: 'brands', label: 'Brands', icon: Store, count: suggestedBrands.length },
                    { key: 'events', label: 'Events', icon: CalendarDays, count: suggestedEvents.length },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSidebarTab(tab.key)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-t-lg text-[10px] font-bold transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                        sidebarTab === tab.key
                          ? 'text-[--color-primary] border-[--color-primary] bg-[--color-primary]/10'
                          : 'text-[--color-text-secondary] border-transparent hover:text-[--color-text-primary]'
                      }`}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-0.5 px-1.5 py-0 rounded-full text-[9px] font-bold ${
                          sidebarTab === tab.key ? 'bg-[--color-primary] text-white' : 'bg-white/15 text-[--color-text-secondary]'
                        }`}>{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2.5">

                {/* ── FREELANCERS TAB ── */}
                {sidebarTab === 'freelancers' && (
                  isFetchingFreelancers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin text-[--color-primary]" />
                    </div>
                  ) : suggestedFreelancers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-8 h-8 text-[--color-text-secondary]/30 mb-2" />
                      <p className="text-xs text-[--color-text-secondary]/50">Ask about freelancers to see suggestions</p>
                    </div>
                  ) : (
                    suggestedFreelancers.map((freelancer, idx) => (
                      <motion.div
                        key={freelancer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => {
                          const slug = `${freelancer.title.toLowerCase().replace(/\s+/g, '-')}-${freelancer.id}`;
                          navigate('gig-detail', { gigId: freelancer.id, slug }, { name: freelancer.title });
                        }}
                        className="group cursor-pointer rounded-xl border border-white/10 bg-white/8 hover:bg-white/15 hover:border-[--color-primary]/30 transition-all p-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-[--color-primary]/30 to-[--color-accent]/30 flex items-center justify-center text-xs font-bold text-[--color-text-primary] overflow-hidden border border-white/10">
                            {freelancer.userName ? getInitials(freelancer.userName) : <User className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[--color-text-primary] truncate group-hover:text-[--color-primary] transition-colors">
                              {freelancer.userName || 'Freelancer'}
                            </p>
                            <p className="text-[10px] text-[--color-text-secondary] truncate">{freelancer.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-semibold text-[--color-text-secondary]">
                                  {freelancer.averageRating ? freelancer.averageRating.toFixed(1) : '5.0'}
                                </span>
                              </div>
                              <span className="text-[--color-text-secondary]/30 text-[9px]">•</span>
                              <span className="text-[10px] font-bold text-[--color-primary]">
                                PKR {freelancer.hourlyRate}/hr
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[--color-text-secondary]/30 group-hover:text-[--color-primary] transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        {freelancer.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {freelancer.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[--color-primary]/10 text-[--color-primary] font-bold uppercase tracking-wide">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )
                )}

                {/* ── SERVICES TAB ── */}
                {sidebarTab === 'services' && (
                  suggestedServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Package className="w-8 h-8 text-[--color-text-secondary]/30 mb-2" />
                      <p className="text-xs text-[--color-text-secondary]/50">Ask about services to see suggestions</p>
                    </div>
                  ) : (
                    suggestedServices.map((service, idx) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => navigate('fog-service-detail', service.id)}
                        className="group cursor-pointer rounded-xl border border-white/10 bg-white/8 hover:bg-white/15 hover:border-[--color-primary]/30 transition-all p-3"
                      >
                        <div className="flex items-start gap-2.5">
                          {service.mainImage ? (
                            <img src={service.mainImage} alt={service.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/10">
                              <Package className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[--color-text-primary] truncate group-hover:text-[--color-primary] transition-colors">
                              {service.title}
                            </p>
                            <p className="text-[10px] text-[--color-text-secondary] truncate">{service.brandName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-semibold text-[--color-text-secondary]">
                                  {service.stats?.rating ? service.stats.rating.toFixed(1) : '5.0'}
                                </span>
                              </div>
                              {service.pricing.type === 'fixed' && service.pricing.packages?.[0] && (
                                <>
                                  <span className="text-[--color-text-secondary]/30 text-[9px]">•</span>
                                  <span className="text-[10px] font-bold text-[--color-primary]">
                                    PKR {service.pricing.packages[0].price}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[--color-text-secondary]/30 group-hover:text-[--color-primary] transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        {service.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.categories.slice(0, 2).map(cat => (
                              <span key={cat} className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold uppercase tracking-wide">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )
                )}

                {/* ── BRANDS TAB ── */}
                {sidebarTab === 'brands' && (
                  suggestedBrands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Store className="w-8 h-8 text-[--color-text-secondary]/30 mb-2" />
                      <p className="text-xs text-[--color-text-secondary]/50">Ask about brands to see suggestions</p>
                    </div>
                  ) : (
                    suggestedBrands.map((brand, idx) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => navigate('fog-service-brand', { brandId: brand.id })}
                        className="group cursor-pointer rounded-xl border border-white/10 bg-white/8 hover:bg-white/15 hover:border-[--color-primary]/30 transition-all p-3"
                      >
                        <div className="flex items-start gap-2.5">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.brandName}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-white/10">
                              <Store className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[--color-text-primary] truncate group-hover:text-[--color-primary] transition-colors">
                              {brand.brandName}
                            </p>
                            <p className="text-[10px] text-[--color-text-secondary] truncate">{brand.tagline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-semibold text-[--color-text-secondary]">
                                  {brand.stats?.rating ? brand.stats.rating.toFixed(1) : '5.0'}
                                </span>
                              </div>
                              <span className="text-[--color-text-secondary]/30 text-[9px]">•</span>
                              <span className="text-[10px] text-[--color-text-secondary]">
                                {brand.stats?.totalOrders || 0} orders
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[--color-text-secondary]/30 group-hover:text-[--color-primary] transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                      </motion.div>
                    ))
                  )
                )}

                {/* ── EVENTS TAB ── */}
                {sidebarTab === 'events' && (
                  suggestedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarDays className="w-8 h-8 text-[--color-text-secondary]/30 mb-2" />
                      <p className="text-xs text-[--color-text-secondary]/50">Ask about events to see suggestions</p>
                    </div>
                  ) : (
                    suggestedEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => {
                          const slug = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${event.id}`;
                          navigate(`event/${slug}` as Route, slug);
                        }}
                        className="group cursor-pointer rounded-xl border border-white/10 bg-white/8 hover:bg-white/15 hover:border-[--color-primary]/30 transition-all p-3"
                      >
                        <div className="flex items-start gap-2.5">
                          {event.banner ? (
                            <img src={event.banner} alt={event.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-teal-500/30 to-blue-500/30 flex items-center justify-center border border-white/10">
                              <CalendarDays className="w-4 h-4 text-teal-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[--color-text-primary] truncate group-hover:text-[--color-primary] transition-colors">
                              {event.title}
                            </p>
                            <p className="text-[10px] text-[--color-text-secondary] truncate">{event.category}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {(event.city || event.country) && (
                                <div className="flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-[--color-text-secondary]/60" />
                                  <span className="text-[10px] text-[--color-text-secondary] truncate">
                                    {event.city || event.country}
                                  </span>
                                </div>
                              )}
                              {event.startDate && (
                                <div className="flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5 text-[--color-text-secondary]/60" />
                                  <span className="text-[10px] text-[--color-text-secondary]">
                                    {new Date(event.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              )}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                event.isFree ? 'bg-green-500/15 text-green-400' : 'bg-[--color-primary]/10 text-[--color-primary]'
                              }`}>
                                {event.isFree ? 'Free' : `${event.priceInFOG} FOG`}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[--color-text-secondary]/30 group-hover:text-[--color-primary] transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        {event.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-bold uppercase tracking-wide">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )
                )}

              </div>

              {/* View All Button */}
              <div className="sticky bottom-0 px-3 py-3 border-t border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
                {sidebarTab === 'freelancers' && (
                  <button
                    onClick={() => navigate('find-work' as Route)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white text-xs font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[--color-primary]/20"
                  >
                    <Users className="w-3.5 h-3.5" /> Browse All Freelancers
                  </button>
                )}
                {sidebarTab === 'services' && (
                  <button
                    onClick={() => navigate('fog-services' as Route)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Package className="w-3.5 h-3.5" /> Browse All Services
                  </button>
                )}
                {sidebarTab === 'brands' && (
                  <button
                    onClick={() => navigate('fog-services' as Route)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Store className="w-3.5 h-3.5" /> Browse All Brands
                  </button>
                )}
                {sidebarTab === 'events' && (
                  <button
                    onClick={() => navigate('events' as Route)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Browse All Events
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AIAssistantPage;
