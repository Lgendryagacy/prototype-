import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, HelpCircle, ArrowRight, Zap, ShieldCheck, Star, Crown, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { pricingPageData } from '../constants';
import CTA from '../components/CTA';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const PricingPage = () => {
    const { hero, plans, faqs } = pricingPageData;
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="bg-[--color-bg-primary] text-[--color-text-primary] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[--color-bg-primary] border-b border-[--color-border]">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Fair & Transparent
                    </motion.div>
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {hero.headline}
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-[--color-text-secondary] max-w-2xl mx-auto mb-12 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        {hero.subheadline}
                    </motion.p>

                    <motion.div
                        {...fadeIn}
                        className="flex flex-wrap justify-center gap-6 md:gap-12"
                    >
                        {hero.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-bold text-[--color-text-secondary]">
                                <div className="w-2 h-2 rounded-full bg-[--color-primary]" />
                                {h}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[--color-primary]/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[--color-accent]/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>
            </section>

            {/* Pricing Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    {/* Billing Toggle (Simulated) */}
                    <div className="flex justify-center items-center gap-4 mb-16">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-7 rounded-full bg-[--color-border] p-1 flex items-center relative transition-colors"
                        >
                            <motion.div
                                animate={{ x: isYearly ? 28 : 0 }}
                                className="w-5 h-5 bg-[--color-card] rounded-full shadow-sm"
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isYearly ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}`}>Yearly</span>
                            <Badge className="!bg-[--color-primary] !text-white !border-none py-0.5 px-2">Save 20%</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {plan.badge && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                        <Badge className="!bg-[--color-primary] !text-white px-4 py-1 text-[10px] uppercase font-black tracking-widest shadow-xl !border-none">
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}
                                <Card className={`h-full border-none shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.primary ? 'ring-2 ring-[--color-primary] scale-105 z-10' : ''} ${plan.id === 'pro' ? 'bg-[--color-bg-marketplace] text-[--color-text-marketplace]' : 'bg-[--color-card]'}`}>
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${plan.id === 'pro' ? 'bg-white/10' : 'bg-[--color-bg-secondary]'}`}>
                                                {plan.id === 'free' ? <Star className="text-[--color-text-secondary]" /> : plan.id === 'starter' ? <Rocket className="text-[--color-primary]" /> : <Crown className="text-yellow-400" />}
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription className={plan.id === 'pro' ? 'text-slate-400' : 'text-[--color-text-secondary]'}>
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 flex flex-col flex-grow">
                                        <div className="my-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl md:text-5xl font-black">{plan.currency}{isYearly && plan.price !== '0' && plan.id !== 'pro' ? (parseInt(plan.price) * 0.8).toFixed(0) : plan.price}</span>
                                                <span className={`text-sm font-bold ${plan.id === 'pro' ? 'text-slate-400' : 'text-[--color-text-secondary]'}`}>{plan.billing}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-10 flex-grow">
                                            <p className={`text-xs font-bold uppercase tracking-widest ${plan.id === 'pro' ? 'text-slate-500' : 'text-[--color-text-secondary]'}`}>What's Included</p>
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.id === 'pro' ? 'bg-[--color-primary]' : 'bg-[--color-primary]/10 text-[--color-primary]'}`}>
                                                        <Check size={10} className={plan.id === 'pro' ? 'text-white' : 'text-[--color-primary]'} />
                                                    </div>
                                                    <span className="text-sm font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            className={`w-full h-14 rounded-2xl font-bold text-base transition-all ${plan.primary ? 'bg-[--color-primary] hover:bg-[--color-primary]/90 text-white shadow-lg shadow-[--color-primary]/20' : plan.id === 'pro' ? 'bg-white text-[--color-bg-marketplace] hover:bg-slate-100' : 'bg-[--color-bg-secondary] text-[--color-text-primary] hover:bg-[--color-bg-tertiary]'}`}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Comparison Section */}
            <section className="py-24 bg-[--color-bg-primary] border-y border-[--color-border]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Value Beyond Price</h2>
                        <p className="text-[--color-text-secondary]">Fogsly provides enterprise-grade infrastructure to every freelancer and business on day one.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-[--color-primary]/10 text-[--color-primary] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Zap size={28} />
                            </div>
                            <h4 className="text-xl font-bold mb-3">No Setup Costs</h4>
                            <p className="text-sm text-[--color-text-secondary] leading-relaxed">Start working and earning instantly without any hidden activation or registration fees.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-[--color-primary]/10 text-[--color-primary] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={28} />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Protected Payments</h4>
                            <p className="text-sm text-[--color-text-secondary] leading-relaxed">Every tier includes access to our secure Escrow system to ensure your work is always paid for.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-[--color-primary]/10 text-[--color-primary] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <HelpCircle size={28} />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Dedicated Support</h4>
                            <p className="text-sm text-[--color-text-secondary] leading-relaxed">Our support team is available to help resolve disputes and guide your growth regardless of plan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-6 bg-[--color-card] rounded-3xl border border-[--color-border]">
                                    <h4 className="font-bold mb-2 flex items-center gap-3">
                                        <Info size={16} className="text-[--color-primary]" />
                                        {faq.q}
                                    </h4>
                                    <p className="text-sm text-[--color-text-secondary] pl-7 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <CTA
                title="Start Your Earning Journey Today"
                description="Join over 120,000 professionals building their digital future on Fogsly. Register in less than 5 minutes."
                primaryButtonText="Create Free Account"
                secondaryButtonText="Compare All Features"
            />
        </div>
    );
};

export default PricingPage;