import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Mail,
    ArrowRight,
    Calendar,
    Tag,
    FileText,
    Image as ImageIcon,
    Camera,
    BarChart2,
    ExternalLink,
    ChevronRight,
    Newspaper,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import CTA from '../components/CTA';
import Modal from '../components/ui/Modal';
import { pressPageData } from '../constants';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
    const icons: Record<string, any> = {
        FileText, Image: ImageIcon, Camera, BarChart: BarChart2
    };
    const Icon = icons[name] || FileText;
    return <Icon className={className} />;
};

const PressPage = () => {
    const { hero, releases, mediaKit, featuredIn, factSheet, contact, categories } = pressPageData;
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedRelease, setSelectedRelease] = useState<typeof releases[0] | null>(null);

    const filteredReleases = releases.filter(r =>
        activeCategory === "All" || r.category === activeCategory
    );

    return (
        <div className="bg-[--color-bg-primary] text-[--color-text-primary]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[--color-bg-primary] border-b border-[--color-border]">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
                    >
                        <Newspaper className="w-3.5 h-3.5" />
                        Fogsly Newsroom
                    </motion.div>
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-[--color-text-primary]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {hero.headline}
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-[--color-text-secondary] max-w-2xl mx-auto mb-10 leading-relaxed"
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
                        className="flex justify-center"
                    >
                        <Button size="lg" className="rounded-full bg-[--color-primary] hover:bg-[--color-primary]/90" onClick={() => document.getElementById('latest-releases')?.scrollIntoView({ behavior: 'smooth' })}>
                            Browse News <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
                {/* Abstract shapes */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[--color-primary]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[--color-accent]/5 rounded-full blur-3xl pointer-events-none"></div>
            </section>

            {/* Statistics Section */}
            <section className="py-12 bg-[--color-bg-primary] border-b border-[--color-border]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {factSheet.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-3xl font-bold text-[--color-primary] mb-1">{item.value}</p>
                                <p className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider">{item.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Press Releases */}
            <section id="latest-releases" className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <motion.div {...fadeIn}>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">Latest Releases</h2>
                            <p className="text-[--color-text-secondary]">Our official announcements and thought leadership.</p>
                        </motion.div>
                        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                                        ? 'bg-[--color-primary] text-white shadow-lg'
                                        : 'bg-[--color-card] text-[--color-text-secondary] border border-[--color-border] hover:border-[--color-primary]/50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredReleases.map((release, idx) => (
                                <motion.div
                                    key={release.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="h-full border-[--color-border] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden bg-[--color-card]" onClick={() => setSelectedRelease(release)}>
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-3 mb-4 mt-5">
                                                <Badge variant="secondary" className="bg-[--color-bg-secondary] text-[--color-primary] font-bold">{release.category}</Badge>
                                                <span className="text-xs font-semibold text-[--color-text-secondary] flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {release.date}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-4 text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">{release.title}</h3>
                                            <p className="text-[--color-text-secondary] leading-relaxed mb-6 line-clamp-2">{release.snippet}</p>
                                            <div className="flex items-center text-[--color-primary] font-bold gap-2">
                                                Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Featured In Section */}
            <section className="py-24 bg-[--color-bg-secondary] border-y border-[--color-border]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[--color-text-secondary] mb-2">As Seen In</h3>
                        <div className="w-12 h-1 bg-[--color-primary] mx-auto rounded-full"></div>
                    </motion.div>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                        {featuredIn.map((outlet, i) => (
                            <motion.a
                                key={i}
                                href={outlet.link}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.4 }}
                                whileHover={{ opacity: 1, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="grayscale transition-all duration-300"
                            >
                                <img src={outlet.logo} alt={outlet.name} className="h-10 md:h-12 object-contain" />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Media Kit Section */}
            <section className="py-24 bg-[--color-bg-primary]">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <motion.div {...fadeIn} className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">Media Kit</h2>
                            <p className="text-[--color-text-secondary]">Download high-resolution assets and official brand materials.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {mediaKit.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    {...fadeIn}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="flex items-center justify-between p-6 bg-[--color-card] rounded-2xl border border-[--color-border] hover:border-[--color-primary]/30 transition-all hover:shadow-md group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[--color-primary]/10 text-[--color-primary] rounded-xl flex items-center justify-center group-hover:bg-[--color-primary] group-hover:text-white transition-colors">
                                                <IconComponent name={item.icon} className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[--color-text-primary]">{item.name}</h4>
                                                <p className="text-xs font-semibold text-[--color-text-secondary]">{item.type} • {item.size}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-[--color-primary] hover:bg-[--color-primary]/5">
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Press Contact */}
            <section className="py-24 bg-[--color-bg-secondary]">
                <div className="container mx-auto px-4">
                    <motion.div
                        {...fadeIn}
                        className="max-w-4xl mx-auto bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden text-center"
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-xl">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Media Inquiries</h2>
                            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                                Need an interview, more information, or specific assets? Our media relations team is here to help.
                            </p>
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">{contact.name}</p>
                                <a href={`mailto:${contact.email}`} className="text-2xl md:text-3xl font-bold hover:text-white/80 transition-colors flex items-center gap-3 justify-center">
                                    {contact.email} <ExternalLink className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <CTA
                title="Be Part of the Fogsly Journey"
                description="Follow our updates and join thousands of professionals building the future of work."
                primaryButtonText="Subscribe to Newsletter"
                secondaryButtonText="Explore Products"
            />

            {/* Release Detail Modal */}
            <Modal isOpen={!!selectedRelease} onClose={() => setSelectedRelease(null)} title={selectedRelease?.title || "Press Release"}>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-[--color-primary]/10 text-[--color-primary] font-bold">{selectedRelease?.category}</Badge>
                        <span className="text-xs font-semibold text-[--color-text-secondary] flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {selectedRelease?.date}
                        </span>
                    </div>
                    <p className="text-lg leading-relaxed text-[--color-text-secondary] font-medium border-l-4 border-[--color-primary] pl-6 italic">
                        {selectedRelease?.snippet}
                    </p>
                    <div className="space-y-4 text-[--color-text-primary] leading-relaxed">
                        {selectedRelease?.content.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-[--color-border] flex justify-end">
                        <Button className="bg-[--color-primary] hover:bg-[--color-primary]/90" onClick={() => setSelectedRelease(null)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Done Reading
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PressPage;