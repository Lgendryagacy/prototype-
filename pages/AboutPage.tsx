
import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Target,
  Eye,
  ShieldCheck,
  Zap,
  Database,
  Sparkles,
  Briefcase,
  Wrench,
  FileText,
  ShoppingBag,
  Play,
  Store,
  Wallet,
  Award,
  Globe,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import CTA from '../components/CTA';
import { aboutPageData } from '../constants';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, any> = {
    Briefcase, Wrench, FileText, ShoppingBag, Sparkles, Play, Store, Wallet, Award, Globe
  };
  const Icon = icons[name] || Briefcase;
  return <Icon className={className} />;
};

const AboutPage = () => {
  const {
    hero,
    whoWeAre,
    mission,
    vision,
    differentiation,
    ecosystem,
    trust,
    founderMessage
  } = aboutPageData;

  return (
    <div className="bg-[--color-bg-primary] text-[--color-text-primary]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-[--color-bg-secondary] to-[--color-bg-primary]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[--color-primary]">
            <circle cx="80" cy="20" r="40" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
          >
            Registered & Trusted Platform
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {hero.headline}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-[--color-text-secondary] max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hero.subheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 md:gap-12"
          >
            {hero.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-medium text-[--color-text-secondary]">
                <CheckCircle2 className="text-[--color-primary] w-5 h-5" />
                {highlight}
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <Button size="lg" className="rounded-full px-10">Explore Our Platform</Button>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      {/* Who We Are */}
      <section className="py-24 border-y border-[--color-border]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{whoWeAre.title}</h2>
              <p className="text-lg text-[--color-text-secondary] leading-relaxed mb-8 whitespace-pre-line">
                {whoWeAre.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-[--color-bg-secondary] rounded-xl border border-[--color-border]">
                  <p className="text-2xl font-bold text-[--color-primary]">Pvt Ltd</p>
                  <p className="text-sm text-[--color-text-secondary]">Government Registered</p>
                </div>
                <div className="p-4 bg-[--color-bg-secondary] rounded-xl border border-[--color-border]">
                  <p className="text-2xl font-bold text-[--color-primary]">100%</p>
                  <p className="text-sm text-[--color-text-secondary]">Transparency</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }} className="relative h-[400px] md:h-[450px]">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] opacity-10 rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?w=800&q=80"
                alt="Who We Are"
                className="rounded-3xl shadow-2xl relative z-10 w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-[--color-bg-secondary]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeIn} className="bg-[--color-card] p-10 rounded-3xl border border-[--color-border] shadow-sm">
              <div className="w-14 h-14 bg-[--color-primary]/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-[--color-primary]" />
              </div>
              <h3 className="text-3xl font-bold mb-6">{mission.title}</h3>
              <ul className="space-y-4">
                {mission.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-[--color-primary] flex-shrink-0" />
                    <span className="text-[--color-text-secondary] leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }} className="bg-[--color-card] p-10 rounded-3xl border border-[--color-border] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-[--color-accent]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-[--color-accent]" />
                </div>
                <h3 className="text-3xl font-bold mb-6">{vision.title}</h3>
                <p className="text-xl text-[--color-text-secondary] leading-relaxed">
                  {vision.description}
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-[--color-border]">
                <p className="text-sm font-semibold uppercase tracking-wider text-[--color-text-secondary] mb-4">Core Principles</p>
                <div className="flex gap-4">
                  <Badge className="bg-[--color-bg-tertiary] text-[--color-text-primary] px-4 py-2">Security</Badge>
                  <Badge className="bg-[--color-bg-tertiary] text-[--color-text-primary] px-4 py-2">Growth</Badge>
                  <Badge className="bg-[--color-bg-tertiary] text-[--color-text-primary] px-4 py-2">Trust</Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Makes Fogsly Different</h2>
            <p className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto">
              We're not just another marketplace; we're a purpose-built ecosystem for the modern era.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiation.map((feat, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-transparent hover:border-[--color-primary]/20">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-[--color-primary]/10 text-[--color-primary] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[--color-primary] group-hover:text-white transition-colors">
                      {idx === 0 ? <Zap /> : idx === 1 ? <ShieldCheck /> : idx === 2 ? <Database /> : <Sparkles />}
                    </div>
                    <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                    <p className="text-[--color-text-secondary] leading-relaxed">{feat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Overview */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Fogsly Ecosystem</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A comprehensive suite of modules designed to empower every step of your digital journey.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {ecosystem.map((mod, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
              >
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center hover:bg-white/10 hover:border-white/20 transition-all group">
                  <IconComponent name={mod.icon} className="w-8 h-8 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <h5 className="font-semibold text-sm md:text-base">{mod.name}</h5>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-[--color-bg-secondary] rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[--color-primary] opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="grid md:grid-cols-2 gap-16 relative z-10">
              <motion.div {...fadeIn}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Trust & Compliance</h2>
                <p className="text-lg text-[--color-text-secondary] leading-relaxed">
                  Fogsly (Pvt) Ltd is fully committed to maintaining the highest standards of integrity, data protection, and business transparency.
                </p>
              </motion.div>
              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }} className="space-y-6">
                {trust.map((point, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[--color-card] rounded-2xl shadow-sm border border-[--color-border]">
                    <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-semibold text-[--color-text-primary]">{point}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="py-24 bg-gradient-to-br from-[--color-primary]/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn} className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-6xl font-serif text-[--color-primary] opacity-20">"</span>
            </div>
            <blockquote className="text-2xl md:text-4xl font-medium mb-12 italic leading-snug">
              {founderMessage.quote}
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-3xl font-bold mb-4 shadow-lg ring-4 ring-white dark:ring-slate-800">
                RH
              </div>
              <h5 className="text-xl font-bold">{founderMessage.name}</h5>
              <p className="text-[--color-text-secondary]">{founderMessage.designation}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <CTA
        title="Join the Future of Digital Work"
        description="Be part of the most secure and rewarding digital ecosystem today."
        primaryButtonText="Get Started"
        secondaryButtonText="Explore Features"
      />
    </div>
  );
};

// FIX: Make children optional in Badge props to satisfy compiler when string literal children are used.
const Badge = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <span className={`inline-block rounded-full text-xs font-bold tracking-wider uppercase ${className}`}>
    {children}
  </span>
);

export default AboutPage;
