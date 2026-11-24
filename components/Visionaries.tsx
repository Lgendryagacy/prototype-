import React, { useState } from 'react';
import { Instagram, Phone, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

const visionaries = [
  {
    name: 'Dr. Ibrar Hussain',
    role: 'Chairman & Chief Advisor',
    bio: "Providing strategic leadership and long-term vision, Dr. Ibrar Hussain guides FOGSLY’s growth with decades of experience, ensuring a strong foundation rooted in integrity, sustainability, and scalable digital innovation.",
    image: '/images/Chairman.jpg',
    socials: {
      twitter: '#',
      instagram: '#',
      phone: 'tel:03455361061',
    },
  },
  {
    name: 'Ruh Ul Hassnain',
    role: 'Founder & CEO',
    bio: 'Leading the creation of a next-generation on-demand digital marketplace, Ruh Ul Hassnain is bridging global talent with online earning opportunities through blockchain-powered solutions and smart technology.',
    image: '/images/CEO.jpg',
    socials: {
      twitter: '#',
      instagram: 'https://www.instagram.com/ruh_ulhassnain',
      phone: 'tel:03117557999',
    },
  },
  {
    name: 'Alishba Zaryab',
    role: 'Co-founder & COO',
    bio: 'Driving operational excellence, Alishba Sundas designs and manages the core systems that power FOGSLY’s all-in-one earning platform, ensuring a seamless, user-focused, and scalable marketplace experience.',
    image: '/images/Co-founder.jpg',
    socials: {
      twitter: '#',
      instagram: '#',
      phone: '#',
    },
  },
  {
    name: 'Hassan Shafiq',
    role: "Lead Platform Developer",
    bio: 'Engineering the technology backbone of FOGSLY, Hassan Shafiq focuses on performance, security, and AI-ready infrastructure, delivering a reliable blockchain-enabled digital platform for users around the world.',
    image: '/images/hssn.jpeg',
    socials: {
      twitter: '#',
      instagram: 'https://www.instagram.com/hssn_shafiq/',
      phone: 'https://api.whatsapp.com/send/?phone=%2B923205314850',
    },
  },
  {
    name: 'Hassan Shafiq',
    role: "Fogsly Developer",
    bio: 'Building the core engine behind FOGSLY — dedicated to delivering a seamless and meaningful experience for every user.',
    image: '/images/hssn.jpeg',
    socials: {
      twitter: '#',
      instagram: 'https://www.instagram.com/hssn_shafiq/',
      phone: 'https://api.whatsapp.com/send/?phone=%2B923205314850',
    },
  },
  {
    name: 'Hassan ',
    role: "Fogsly's Developer",
    bio: 'Building the core engine behind FOGSLY — dedicated to delivering a seamless and meaningful experience for every user.',
    image: '/images/hssn.jpeg',
    socials: {
      twitter: '#',
      instagram: 'https://www.instagram.com/hssn_shafiq/',
      phone: 'https://api.whatsapp.com/send/?phone=%2B923205314850',
    },
  },

];

// Image component with loading state and fallback
const VisionaryImage = ({ visionary }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initials = visionary.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="w-32 h-32 rounded-[16px] mx-auto mb-6 bg-[--color-bg-tertiary]/50 backdrop-blur-md border-2 border-[--color-border]/40 shadow-xl flex items-center justify-center overflow-hidden relative transition-all duration-300 hover:scale-105">
      {/* Show initials as fallback/loading state */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'}`}>
        <span className={`text-5xl font-bold text-[--color-text-primary] ${!imageLoaded && visionary.image ? 'animate-pulse' : ''}`}>
          {initials}
        </span>
      </div>

      {/* Show image when available and loaded */}
      {visionary.image && (
        <img
          src={visionary.image}
          alt={visionary.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}
    </div>
  );
};

const Visionaries = () => {
  return (
    <section className="py-14 bg-[--color-bg-secondary] transition-colors duration-300 relative overflow-hidden">
      {/* Animated gradient backgrounds that scroll with the page */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          top: '15%',
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
        className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          bottom: '15%',
          right: '10%'
        }}
        animate={{
          x: [0, -40, 30, -20, 0],
          y: [0, 40, -30, 20, 0],
          scale: [1, 0.9, 1.1, 0.95, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />

      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full opacity-45 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
          top: '50%',
          right: '15%'
        }}
        animate={{
          x: [0, -30, 40, -25, 0],
          y: [0, 30, -40, 15, 0],
          scale: [1, 1.05, 0.95, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-45 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          top: '70%',
          left: '5%'
        }}
        animate={{
          x: [0, 40, -35, 30, 0],
          y: [0, -40, 35, -20, 0],
          scale: [1, 0.95, 1.1, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />

      <div className="container mx-auto px-5 md:px-0 lg:px-10 max-w-7xl relative z-10">
        <div className="text-center mb-8 opacity-0 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[--color-text-primary] italic">
            The Visionaries Powering the  <span className="text-[--color-primary]">FOGSLY MARKETPLACE</span>
          </h2>

          <p className="text-[--color-text-secondary] text-lg leading-relaxed">
            FOGSLY is led by a forward-thinking leadership team driven by innovation, blockchain technology, and digital transformation,<br className="hidden md:block" />  focused on building a global online earning . technology, and digital transformation, <br className="hidden md:block" />
            focused on building a global online earning
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* First 3 cards in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-7">
            {visionaries.slice(0, 3).map((visionary, index) => (
              <div
                key={`${visionary.name}-${index}`}
                className="h-full opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <motion.div
                  className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl cursor-pointer hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300 h-full relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Top gradient bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />

                  <div className="p-8 text-center flex flex-col h-full">
                    <VisionaryImage visionary={visionary} />
                    <h3 className="text-2xl font-black mb-2 leading-tight transition-colors" style={{ color: 'var(--color-text-primary)' }}>{visionary.name}</h3>
                    <p className="text-base font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>{visionary.role}</p>
                    <p className="text-sm leading-relaxed mt-2 flex-grow font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      "{visionary.bio}"
                    </p>
                    <div className="flex justify-center gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <a
                        href={visionary.socials.twitter}
                        aria-label={`${visionary.name} on Twitter`}
                        className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                      >
                        <Twitter className="w-6 h-6" />
                      </a>
                      <a
                        href={visionary.socials.phone}
                        aria-label={`Call ${visionary.name}`}
                        className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                      >
                        <Phone className="w-6 h-6" />
                      </a>
                      <a
                        href={visionary.socials.instagram}
                        aria-label={`${visionary.name} on Instagram`}
                        className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* 4th card centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="md:col-start-2 opacity-0 animate-fadeInUp" style={{ animationDelay: '450ms' }}>
              <motion.div
                className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl cursor-pointer hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300 h-full relative overflow-hidden group"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Top gradient bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />

                <div className="p-8 text-center flex flex-col h-full">
                  <VisionaryImage visionary={visionaries[3]} />
                  <h3 className="text-2xl font-black mb-2 leading-tight transition-colors" style={{ color: 'var(--color-text-primary)' }}>{visionaries[3].name}</h3>
                  <p className="text-base font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>{visionaries[3].role}</p>
                  <p className="text-sm leading-relaxed mt-2 flex-grow font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    "{visionaries[3].bio}"
                  </p>
                  <div className="flex justify-center gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <a
                      href={visionaries[3].socials.twitter}
                      aria-label={`${visionaries[3].name} on Twitter`}
                      className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a
                      href={visionaries[3].socials.phone}
                      aria-label={`Call ${visionaries[3].name}`}
                      className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                    >
                      <Phone className="w-6 h-6" />
                    </a>
                    <a
                      href={visionaries[3].socials.instagram}
                      aria-label={`${visionaries[3].name} on Instagram`}
                      className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-80 hover:opacity-100"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Visionaries;