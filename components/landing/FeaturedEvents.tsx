import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Users, ArrowRight, Sparkles, Mic } from 'lucide-react';

interface FeaturedEventsProps {
  navigate: (route: string) => void;
}

const EventCardIcon: React.FC<{ src: string }> = ({ src }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white drop-shadow-lg">
        <Sparkles className="w-8 h-8" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      alt="3D Event Asset" 
      onError={() => setHasError(true)}
      className="w-full h-full object-contain filter drop-shadow" 
    />
  );
};

interface EventItem {
  id: string;
  badge: string;
  title: string;
  date: string;
  location: string;
  organizer: string;
  seats: string;
  gradientClass: string;
  icon3d: string;
}

const eventsData: EventItem[] = [
  { id: '1', badge: "Workshop", title: "AI for Freelancers Bootcamp", date: "Aug 15, 2026", location: "Rawalpindi", organizer: "FOGSLY Academy", seats: "120 seats", gradientClass: "from-[#1554db] to-[#00b8d9]", icon3d: "/images/quick-actions/purple-mic.png" },
  { id: '2', badge: "Expo", title: "Pakistan Digital Career Expo", date: "Sep 04, 2026", location: "Lahore", organizer: "CareerHub PK", seats: "500 seats", gradientClass: "from-[#5b4df6] to-[#2563eb]", icon3d: "/images/quick-actions/visual-live-expo.png" },
  { id: '3', badge: "Networking", title: "Startup Hiring Meetup", date: "Sep 18, 2026", location: "Karachi", organizer: "Startup Circle", seats: "200 seats", gradientClass: "from-[#10b981] to-[#1554db]", icon3d: "/images/quick-actions/visual-career-hub.png" },
  { id: '4', badge: "Community", title: "Women in Tech Networking Night", date: "Oct 02, 2026", location: "Islamabad", organizer: "TechWomen PK", seats: "150 seats", gradientClass: "from-[#e84aa7] to-[#5b4df6]", icon3d: "/images/quick-actions/visual-event-creator.png" },
  { id: '5', badge: "Business", title: "E-Commerce Growth Workshop", date: "Oct 20, 2026", location: "Faisalabad", organizer: "Seller School", seats: "180 seats", gradientClass: "from-[#ff8a3d] to-[#2563eb]", icon3d: "/images/quick-actions/visual-fog-coin.png" },
  { id: '6', badge: "Masterclass", title: "Freelance Success Masterclass", date: "Nov 10, 2026", location: "Online", organizer: "FOGSLY Pros", seats: "1,000 seats", gradientClass: "from-[#00b8d9] to-[#5b4df6]", icon3d: "/images/quick-actions/visual-fogsly-ai-bot.png" }
];

const FeaturedEvents: React.FC<FeaturedEventsProps> = ({ navigate }) => {
  return (
    <section id="events" className="py-20 sm:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 mb-3 shadow-xs"
          >
            <img src="/images/quick-actions/badge-event-3d.svg" alt="3D Event" className="w-4 h-4 object-contain filter drop-shadow-xs" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Live Expo • Events & Meetups
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3"
          >
            Learn. Network. Grow.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed"
          >
            Discover professional events happening across Pakistan
          </motion.p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {eventsData.map((evt, index) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Banner Header */}
                <div className={`relative h-44 bg-gradient-to-br ${evt.gradientClass} p-4 flex flex-col justify-between overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.4),transparent_18%)] pointer-events-none" />
                  
                  {/* Floating 3D Accent Icon */}
                  <div className="absolute right-3.5 bottom-2.5 w-16 h-16 sm:w-20 sm:h-20 opacity-90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] pointer-events-none">
                    <EventCardIcon src={evt.icon3d} />
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-900 bg-white/95 shadow-sm">
                      {evt.badge}
                    </span>
                  </div>
                </div>

                {/* Event Body */}
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {evt.title}
                  </h3>

                  <div className="grid grid-cols-1 gap-2 text-xs font-normal text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {evt.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {evt.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {evt.organizer}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {evt.seats}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  id={`btn-register-event-${evt.id}`}
                  onClick={() => navigate('events')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all text-xs cursor-pointer shadow-sm"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            id="btn-view-all-events"
            onClick={() => navigate('events')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-sm"
          >
            <span>View All Events →</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedEvents;
