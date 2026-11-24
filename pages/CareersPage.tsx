import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Users,
    Zap,
    ShieldCheck,
    Target,
    Globe,
    MapPin,
    Clock,
    ChevronDown,
    Briefcase,
    Star,
    Rocket,
    Search,
    Heart
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import CTA from '../components/CTA';
import { careersPageData } from '../constants';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
    const icons: Record<string, any> = {
        ShieldCheck, Target, Zap, Users, Globe, Briefcase, Heart, Rocket, Star
    };
    const Icon = icons[name] || Briefcase;
    return <Icon className={className} />;
};

const CareersPage = () => {
    const {
        hero,
        whyJoin,
        culture,
        openPositions,
        lifeAtFogsly,
        hiringProcess,
        founderMessage
    } = careersPageData;

    const [expandedRole, setExpandedRole] = useState<number | null>(null);

    return (
        <div className="bg-[--color-bg-primary] text-[--color-text-primary]">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-[--color-bg-primary] to-[--color-bg-primary]">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[--color-primary]">
                        <circle cx="85" cy="15" r="30" />
                        <rect x="10" y="80" width="20" height="20" rx="4" />
                    </svg>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
                    >
                        Join the Revolution
                    </motion.div>
                    <motion.h1
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[--color-text-primary]"
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
                        className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12"
                    >
                        {hero.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-[--color-text-secondary]">
                                <CheckCircle2 className="text-[--color-primary] w-5 h-5" />
                                {highlight}
                            </div>
                        ))}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Button size="lg" className="rounded-full px-10 bg-[--color-primary] hover:bg-[--color-primary]/90" onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}>
                            View Open Positions <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Why Join Fogsly */}
            {/* Why Join Fogsly */}
            <section className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">{whyJoin.title}</h2>
                        <div className="w-20 h-1.5 bg-[--color-primary] mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {whyJoin.points.map((point, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeIn}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <Card className="h-full border-[--color-border] shadow-sm hover:shadow-xl transition-all duration-300 bg-[--color-card] hover:-translate-y-2">
                                    <CardContent className="p-8 text-center flex flex-col items-center h-full">
                                        <div className="w-14 h-14 bg-[--color-primary]/10 text-[--color-primary] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[--color-primary] group-hover:text-white transition-colors duration-300">
                                            <IconComponent name={point.icon} className="w-7 h-7" />
                                        </div>
                                        <h4 className="text-lg font-bold mb-3 text-[--color-text-primary]">{point.title}</h4>
                                        <p className="text-sm text-[--color-text-secondary] leading-relaxed">{point.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Culture & Values */}
            {/* Our Culture & Values */}
            <section className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">{culture.title}</h2>
                        <p className="text-[--color-text-secondary] max-w-2xl mx-auto">Our values define who we are and guide every decision we make as a team.</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {culture.values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeIn}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-[--color-card] border border-[--color-border] rounded-3xl hover:shadow-lg transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-[--color-primary] flex items-center justify-center mb-6 font-bold text-lg text-white group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-[--color-text-primary]">{val.title}</h3>
                                <p className="text-[--color-text-secondary] leading-relaxed">{val.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section id="open-positions" className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">{openPositions.title}</h2>
                            <p className="text-[--color-text-secondary]">Find your place in the Fogsly ecosystem.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[--color-border] bg-[--color-card] text-[--color-text-primary] focus:ring-2 focus:ring-[--color-primary] outline-none"
                            />
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        {openPositions.categories.map((category) => (
                            <div key={category} className="space-y-4">
                                <h3 className="text-lg font-bold text-[--color-text-secondary] pt-8 pb-2 border-b border-[--color-border]">{category}</h3>
                                <div className="grid gap-4">
                                    {openPositions.roles.filter(r => r.category === category).map((role) => (
                                        <motion.div key={role.id} layout>
                                            <div
                                                className={`p-6 bg-[--color-card] rounded-2xl border transition-all cursor-pointer group ${expandedRole === role.id ? 'border-[--color-primary] ring-1 ring-[--color-primary]' : 'border-[--color-border] hover:border-[--color-primary]/30 hover:shadow-md'}`}
                                                onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-xl font-bold text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">{role.title}</h4>
                                                            <Badge variant="secondary" className="bg-[--color-bg-secondary] text-[--color-text-secondary]">{role.type}</Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-sm text-[--color-text-secondary]">
                                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[--color-primary]" /> {role.location}</span>
                                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[--color-primary]" /> Full-time</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Button className={`rounded-xl hidden md:flex ${expandedRole === role.id ? 'bg-[--color-primary]' : 'bg-[--color-bg-marketplace]'}`}>Apply Now</Button>
                                                        <ChevronDown className={`w-5 h-5 text-[--color-text-secondary] transition-transform duration-300 ${expandedRole === role.id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedRole === role.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-6 mt-6 border-t border-[--color-border]">
                                                                <p className="text-[--color-text-secondary] leading-relaxed mb-6">
                                                                    {role.description}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 mb-6">
                                                                    <Badge variant="outline" className="border-[--color-border] text-[--color-text-secondary]">Growth Mindset</Badge>
                                                                    <Badge variant="outline" className="border-[--color-border] text-[--color-text-secondary]">AI Savvy</Badge>
                                                                    <Badge variant="outline" className="border-[--color-border] text-[--color-text-secondary]">Team Player</Badge>
                                                                </div>
                                                                <Button className="w-full md:hidden mb-2 bg-[--color-primary]">Apply Now</Button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Life at Fogsly */}
            <section className="py-24 bg-[--color-bg-secondary]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeIn}>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[--color-text-primary]">{lifeAtFogsly.title}</h2>
                            <p className="text-lg text-[--color-text-secondary] leading-relaxed mb-8">
                                {lifeAtFogsly.description}
                            </p>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                {lifeAtFogsly.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-3 p-3 bg-[--color-card] rounded-xl shadow-sm border border-[--color-border]">
                                        <div className="w-8 h-8 bg-[--color-primary]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-[--color-primary]" />
                                        </div>
                                        <span className="text-sm font-semibold text-[--color-text-secondary]">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="relative">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
                                    alt="Team Collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[--color-primary] rounded-3xl -z-0 opacity-20"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How We Hire */}
            <section className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">How We Hire</h2>
                        <p className="text-[--color-text-secondary]">Our hiring process is designed to be transparent, fair, and focused on potential.</p>
                    </motion.div>

                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                        {hiringProcess.steps.map((step, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6 bg-[--color-card] rounded-3xl border border-[--color-border] shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="w-12 h-12 bg-[--color-bg-secondary] text-[--color-text-secondary] rounded-full flex items-center justify-center mx-auto mb-4 font-bold group-hover:bg-[--color-primary] group-hover:text-white transition-colors">
                                    {i + 1}
                                </div>
                                <h4 className="font-bold mb-2 text-[--color-text-primary]">{step.title}</h4>
                                <p className="text-xs text-[--color-text-secondary] leading-relaxed">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Message */}
            <section className="py-24 bg-[--color-bg-secondary]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="max-w-4xl mx-auto bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                                <circle cx="0" cy="100" r="50" />
                            </svg>
                        </div>
                        <Rocket className="w-16 h-16 mx-auto mb-8 opacity-20" />
                        <blockquote className="text-2xl md:text-4xl font-medium mb-10 italic leading-snug relative z-10">
                            "{founderMessage.quote}"
                        </blockquote>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-4 backdrop-blur-md">
                                RH
                            </div>
                            <h5 className="text-xl font-bold">{founderMessage.name}</h5>
                            <p className="text-white/80 text-sm font-medium">{founderMessage.designation}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <CTA
                title="Ready to Grow with Us?"
                description="Whether you're an engineer, designer, or specialist, if you have a passion for building the future, we want to hear from you."
                primaryButtonText="Apply Now"
                secondaryButtonText="Contact HR"
            />
        </div>
    );
};

export default CareersPage;