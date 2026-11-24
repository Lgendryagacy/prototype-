import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Phone,
  Twitter,
  Users,
  Rocket,
  Globe,
  Code2,
  Megaphone,
  Briefcase,
  Shield,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  Coffee,
} from 'lucide-react';
import CTA from '../components/CTA';
import { type Route } from '../types';

interface TeamPageProps {
  navigate: (route: Route, context?: any) => void;
}

// ── Team members data ──────────────────────────────────────────────
const leadership = [
  {
    name: 'Dr. Ibrar Hussain',
    role: 'Chairman & Chief Advisor',
    department: 'Leadership',
    bio: "Providing strategic leadership and long-term vision, Dr. Ibrar Hussain guides FOGSLY's growth with decades of experience, ensuring a strong foundation rooted in integrity, sustainability, and scalable digital innovation.",
    image: '/images/Chairman.jpg',
    socials: { twitter: '#', instagram: '#', phone: 'tel:03455361061' },
  },
  {
    name: 'Ruh Ul Hassnain',
    role: 'Founder & CEO',
    department: 'Leadership',
    bio: 'Leading the creation of a next-generation on-demand digital marketplace, Ruh Ul Hassnain is bridging global talent with online earning opportunities through blockchain-powered solutions and smart technology.',
    image: '/images/CEO.jpg',
    socials: { twitter: '#', instagram: 'https://www.instagram.com/ruh_ulhassnain', phone: 'tel:03117557999' },
  },
  {
    name: 'Alishba Zaryab',
    role: 'Co-founder & COO',
    department: 'Leadership',
    bio: "Driving operational excellence, Alishba Sundas designs and manages the core systems that power FOGSLY's all-in-one earning platform, ensuring a seamless, user-focused, and scalable marketplace experience.",
    image: '/images/Co-founder.jpg',
    socials: { twitter: '#', instagram: '#', phone: '#' },
  },
  {
    name: 'Hassan Shafiq',
    role: 'Lead Platform Developer',
    department: 'Engineering',
    bio: 'Engineering the technology backbone of FOGSLY, Hassan Shafiq focuses on performance, security, and AI-ready infrastructure, delivering a reliable blockchain-enabled digital platform for users around the world.',
    image: '/images/hssn.jpeg',
    socials: {
      twitter: '#',
      instagram: 'https://www.instagram.com/hssn_shafiq/',
      phone: 'https://api.whatsapp.com/send/?phone=%2B923205314850',
    },
  },
];

const departments = [
  { icon: Code2, label: 'Engineering', color: 'var(--color-primary)', count: '4+', desc: 'Full-stack, mobile & AI engineers building a blazing-fast platform.' },
  { icon: Megaphone, label: 'Marketing', color: 'var(--color-accent)', count: '3+', desc: 'Growth hackers and content creators amplifying the FOGSLY brand globally.' },
  { icon: Briefcase, label: 'Operations', color: '#a78bfa', count: '5+', desc: 'Ops experts keeping the marketplace running smoothly 24/7.' },
  { icon: Shield, label: 'Trust & Safety', color: '#34d399', count: '2+', desc: 'Dedicated team protecting every transaction and user interaction.' },
  { icon: Globe, label: 'Business Dev', color: '#f472b6', count: '3+', desc: 'Strategic partnerships and market expansion specialists.' },
  { icon: Sparkles, label: 'Product & Design', color: '#fbbf24', count: '3+', desc: 'UX thinkers and designers crafting world-class user experiences.' },
];

const cultureValues = [
  { icon: Heart, title: 'People First', desc: 'Every decision we make starts with the impact it has on our community.' },
  { icon: Star, title: 'Innovation Always', desc: 'We challenge norms, experiment boldly, and ship ideas that matter.' },
  { icon: Zap, title: 'Move Fast', desc: "We're builders at heart — we iterate quickly and learn from everything." },
  { icon: Target, title: 'Ownership', desc: 'Every teammate owns their craft and takes pride in the outcomes they create.' },
  { icon: Coffee, title: 'Async Culture', desc: "We trust each other to deliver — wherever and whenever they work best." },
  { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the highest standards, always raising the bar.' },
];

const stats = [
  { value: '4+', label: 'Founding Members' },
  { value: '20+', label: 'Team Members' },
  { value: '3', label: 'Countries' },
  { value: '∞', label: 'Ambition' },
];

// ── Reusable member image component ──────────────────────────────
const MemberAvatar = ({ member }: { member: (typeof leadership)[0] }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const initials = member.name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="w-32 h-32 rounded-[16px] mx-auto mb-6 bg-[--color-bg-tertiary]/50 backdrop-blur-md border-2 border-[--color-border]/40 shadow-xl flex items-center justify-center overflow-hidden relative transition-all duration-300 hover:scale-105">
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${loaded && !errored ? 'opacity-0' : 'opacity-100'}`}>
        <span className={`text-4xl font-bold text-[--color-text-primary] ${!loaded && member.image ? 'animate-pulse' : ''}`}>
          {initials}
        </span>
      </div>
      {member.image && (
        <img
          src={member.image}
          alt={member.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${loaded && !errored ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(false); }}
        />
      )}
    </div>
  );
};

// ── Glassmorphism member card ──────────────────────────────────────
const MemberCard = ({ member, delay = 0 }: { member: (typeof leadership)[0]; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay }}
    className="h-full"
  >
    <motion.div
      className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl cursor-default hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300 h-full relative overflow-hidden group"
      whileHover={{ scale: 1.02, y: -6 }}
    >
      {/* Hover top-bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />

      {/* Subtle corner glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: 'var(--color-primary)' }} />

      <div className="p-8 text-center flex flex-col h-full relative z-10">
        <MemberAvatar member={member} />

        {/* Department badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 self-center" style={{ background: 'var(--color-primary)20', color: 'var(--color-primary)', border: '1px solid var(--color-primary)40' }}>
          {member.department}
        </span>

        <h3 className="text-xl font-black mb-1 leading-tight text-[--color-text-primary]">{member.name}</h3>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>{member.role}</p>
        <p className="text-sm leading-relaxed mt-1 flex-grow font-medium text-[--color-text-secondary]">"{member.bio}"</p>

        {/* Socials */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-[--color-border]">
          {[
            { href: member.socials.twitter, Icon: Twitter, label: 'Twitter' },
            { href: member.socials.phone, Icon: Phone, label: 'Phone' },
            { href: member.socials.instagram, Icon: Instagram, label: 'Instagram' },
          ].map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={`${member.name} on ${label}`}
              className="text-[--color-text-primary] hover:text-[--color-primary] transition-all duration-300 hover:scale-110 opacity-70 hover:opacity-100"
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ── Animated floating gradient orb ────────────────────────────────
const FloatOrb = ({ color, style, animX, animY, delay = 0 }: any) => (
  <motion.div
    className="absolute rounded-full pointer-events-none blur-[80px]"
    style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, ...style }}
    animate={{ x: animX, y: animY, scale: [1, 1.08, 0.93, 1.05, 1] }}
    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Page ──────────────────────────────────────────────────────────
const TeamPage = ({ navigate }: TeamPageProps) => {
  return (
    <div className="bg-[--color-bg-primary] text-[--color-text-primary] overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-28 overflow-hidden bg-gradient-to-b from-[--color-bg-secondary] to-[--color-bg-primary]">
        {/* Orbs */}
        <FloatOrb color="var(--color-primary)" style={{ width: 480, height: 480, top: '-10%', left: '-8%', opacity: 0.35 }} animX={[0, 50, -30, 40, 0]} animY={[0, -40, 30, 10, 0]} delay={0} />
        <FloatOrb color="var(--color-accent)" style={{ width: 400, height: 400, top: '20%', right: '-8%', opacity: 0.30 }} animX={[0, -40, 25, -20, 0]} animY={[0, 40, -20, 30, 0]} delay={4} />
        <FloatOrb color="rgb(167,139,250)" style={{ width: 360, height: 360, bottom: '0%', left: '40%', opacity: 0.25 }} animX={[0, 30, -25, 15, 0]} animY={[0, -30, 25, -10, 0]} delay={8} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-xs font-bold tracking-widest uppercase rounded-full"
            style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', border: '1px solid var(--color-primary)35' }}
          >
            <Users className="w-3.5 h-3.5" />
            The People Behind FOGSLY
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Built by{' '}
            <span className="relative inline-block">
              <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                Dreamers
              </span>
            </span>
            ,<br />
            Delivered by{' '}
            <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-accent), rgb(167,139,250))' }}>
              Doers.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[--color-text-secondary] max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            FOGSLY is powered by a passionate, globally-distributed team obsessed with unlocking earning potential for everyone, everywhere — through technology, trust, and relentless innovation.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
          >
            <button
              onClick={() => navigate('careers')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:opacity-90 hover:scale-105 text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              <Rocket className="w-4 h-4" />
              Join Our Team
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('about')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide border transition-all duration-300 hover:bg-[--color-bg-secondary] border-[--color-border] text-[--color-text-primary]"
            >
              Our Mission
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS TICKER ════════════════════════════════════════════ */}
      <section className="py-12 bg-[--color-bg-marketplace] text-[--color-text-marketplace] border-y border-white/10 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="text-4xl md:text-5xl font-black mb-1" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stat.value}
                </p>
                <p className="text-sm font-semibold tracking-wide text-[--color-text-marketplace] opacity-70 uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LEADERSHIP — Visionaries-style cards ════════════════════ */}
      <section className="py-20 bg-[--color-bg-secondary] relative overflow-hidden">
        {/* Animated gradient orbs — same as Visionaries component */}
        <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', top: '15%', left: '10%' }} animate={{ x: [0, 50, -30, 40, 0], y: [0, -50, 30, 20, 0], scale: [1, 1.1, 0.9, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', bottom: '15%', right: '10%' }} animate={{ x: [0, -40, 30, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.9, 1.1, 0.95, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />
        <motion.div className="absolute w-[450px] h-[450px] rounded-full opacity-45 blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)', top: '50%', right: '15%' }} animate={{ x: [0, -30, 40, -25, 0], y: [0, 30, -40, 15, 0], scale: [1, 1.05, 0.95, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

        <div className="container mx-auto px-5 md:px-4 lg:px-10 max-w-7xl relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', border: '1px solid var(--color-primary)35' }}>
              The Visionaries
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 italic">
              The Visionaries Powering the{' '}
              <span style={{ color: 'var(--color-primary)' }}>FOGSLY MARKETPLACE</span>
            </h2>
            <p className="text-[--color-text-secondary] text-lg max-w-2xl mx-auto leading-relaxed">
              FOGSLY is led by a forward-thinking leadership team driven by innovation, blockchain technology, and digital transformation — focused on building a global online earning ecosystem.
            </p>
          </motion.div>

          {/* First row: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-7">
            {leadership.slice(0, 3).map((member, i) => (
              <MemberCard key={`${member.name}-${i}`} member={member} delay={i * 0.12} />
            ))}
          </div>

          {/* 4th card — centred */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="md:col-start-2">
              <MemberCard member={leadership[3]} delay={0.36} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DEPARTMENTS ════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: 'var(--color-accent)15', color: 'var(--color-accent)', border: '1px solid var(--color-accent)35' }}>
              Our Departments
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Many Teams,{' '}
              <span style={{ color: 'var(--color-primary)' }}>One Mission</span>
            </h2>
            <p className="text-[--color-text-secondary] text-lg max-w-xl mx-auto">
              Specialised squads collaborating to build the world's most inclusive freelance marketplace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-3xl p-7 bg-[--color-card] border border-[--color-border] hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-default"
                whileHover={{ y: -6 }}
              >
                {/* Background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: dept.color }} />

                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${dept.color}, transparent)` }} />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: `${dept.color}18`, border: `1.5px solid ${dept.color}40` }}>
                    <dept.icon className="w-7 h-7" style={{ color: dept.color }} />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-[--color-text-primary]">{dept.label}</h3>
                    <span className="text-2xl font-black" style={{ color: dept.color }}>{dept.count}</span>
                  </div>
                  <p className="text-sm text-[--color-text-secondary] leading-relaxed">{dept.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CULTURE & VALUES ════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-secondary] relative overflow-hidden">
        {/* Decorative grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: 'rgb(167,139,250,0.15)', color: 'rgb(167,139,250)', border: '1px solid rgba(167,139,250,0.35)' }}>
              How We Work
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Culture That{' '}
              <span style={{ color: 'var(--color-primary)' }}>Drives Us</span>
            </h2>
            <p className="text-[--color-text-secondary] text-lg max-w-xl mx-auto">
              These aren't slogans on a wall — they're the decisions we make every single day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultureValues.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl p-7 backdrop-blur-xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300 group"
                whileHover={{ y: -5, scale: 1.01 }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--color-primary)15', border: '1.5px solid var(--color-primary)30' }}>
                  <val.icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-lg font-black mb-2 text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors duration-300">{val.title}</h3>
                <p className="text-sm text-[--color-text-secondary] leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN ROLES TEASER ══════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Big illustrative emoji row */}
            <div className="flex justify-center gap-3 mb-8 text-4xl select-none">
              {['🚀', '💡', '🌍', '⚡', '🤝']. map((e, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                >
                  {e}
                </motion.span>
              ))}
            </div>

            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', border: '1px solid var(--color-primary)35' }}>
              We're Hiring
            </span>

            <h2 className="text-3xl md:text-5xl font-black mb-5">
              Ready to Build the Future{' '}
              <span style={{ color: 'var(--color-primary)' }}>With Us?</span>
            </h2>
            <p className="text-[--color-text-secondary] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              We're always on the lookout for talented, curious, and driven individuals who want to make a real impact in the digital economy. Remote-first. Mission-driven.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('careers')}
                className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-black text-sm tracking-wide transition-all duration-300 hover:opacity-90 hover:scale-105 text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
              >
                <Rocket className="w-4 h-4" />
                View Open Positions
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('about')}
                className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-black text-sm tracking-wide border transition-all duration-300 hover:bg-[--color-bg-secondary] border-[--color-border] text-[--color-text-primary]"
              >
                Learn Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════ */}
      <CTA
        onPrimaryClick={() => navigate('auth')}
        onSecondaryClick={() => navigate('careers')}
        primaryButtonText="Join FOGSLY"
        secondaryButtonText="View Careers"
      />
    </div>
  );
};

export default TeamPage;
