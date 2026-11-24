
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { ArrowLeft, CheckCircle, Sparkles, Shield, Users } from 'lucide-react';

const MakeBrandRequestPage = ({ navigate }: { navigate: (route: Route) => void }) => {


    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Animated gradient backgrounds that scroll with the page */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                    top: '-10%',
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
                className="absolute w-[400px] h-[400px] rounded-full opacity-50 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
                    top: '20%',
                    right: '15%'
                }}
                animate={{
                    x: [0, -40, 30, -20, 0],
                    y: [0, 40, -30, 20, 0],
                    scale: [1, 0.9, 1.1, 0.95, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />

            <motion.div
                className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
                    bottom: '10%',
                    left: '20%'
                }}
                animate={{
                    x: [0, 30, -40, 25, 0],
                    y: [0, -30, 40, -15, 0],
                    scale: [1, 1.05, 0.9, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            />

            <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button with Glass Effect */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <button
                            onClick={() => navigate('fog-services')}
                            className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300 hover:scale-105 shadow-lg"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">Back to Fog Services</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Main Glass Card */}
                        <motion.div
                            className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                        >
                            {/* Top gradient bar */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1.5"
                                style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                            />

                            <div className="p-8 md:p-12">
                                {/* Header with Icon */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[--color-primary]/20 to-[--color-accent]/20 border-2 border-[--color-primary]/30 mb-6 shadow-xl">
                                        <Sparkles className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
                                    </div>

                                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                                        Create a Fog Service Brand
                                    </h1>

                                    <p className="text-lg leading-relaxed max-w-2xl mx-auto font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                        To maintain a high standard of quality, brand creation is currently an approval-based process. Submit a request, and our team will review your profile and get in touch with you.
                                    </p>
                                </div>

                                {/* Feature Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <motion.div
                                        className="backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 rounded-2xl p-6 text-center"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Quality Assured</h3>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Verified brands only</p>
                                    </motion.div>

                                    <motion.div
                                        className="backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 rounded-2xl p-6 text-center"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Team Review</h3>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Expert evaluation</p>
                                    </motion.div>

                                    <motion.div
                                        className="backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 rounded-2xl p-6 text-center"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <CheckCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Quick Response</h3>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Fast approval process</p>
                                    </motion.div>
                                </div>

                                {/* CTA Button */}
                                <div className="text-center">
                                    <motion.button
                                        onClick={() => navigate('make-brand')}
                                        className="px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb,59,130,246),0.5)] hover:scale-105"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Request to Create Brand
                                        <span className="ml-2">→</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MakeBrandRequestPage;
