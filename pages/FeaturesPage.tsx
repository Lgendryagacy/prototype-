import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import CTA from '../components/CTA';
import { featuresPageData } from '../constants';
import * as Icons from 'lucide-react';
import { CheckCircle2, ChevronRight, Users, Rocket, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { type Route } from '../types';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (Icons as any)[name];
  if (!LucideIcon) return <Icons.Zap className={className} />;
  return <LucideIcon className={className} />;
};

interface FeaturesPageProps {
  navigate: (route: Route, context?: any) => void;
}

const FeaturesPage = ({ navigate }: FeaturesPageProps) => {
  const { hero, modules, whyFogsly, howItWorks, audiences } = featuresPageData;

  return (
    <div className="bg-[--color-bg-primary] text-[--color-text-primary] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 bg-[--color-card] border-b border-[--color-border]">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
          >
            <Rocket className="w-3.5 h-3.5" />
            Empowering Digital Work
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {hero.title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-[--color-text-secondary] max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" className="rounded-full bg-[--color-primary] hover:bg-[--color-primary]/90 px-8" onClick={() => navigate('auth')}>
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-[--color-border] px-8" onClick={() => navigate('dashboard')}>
              Explore Platform
            </Button>
          </motion.div>
        </div>

        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[--color-primary]/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[--color-accent]/5 rounded-full blur-[100px] pointer-events-none -ml-48 -mb-48"></div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Core Platform Modules</h2>
            <p className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto">
              Everything you need to succeed in the digital economy, integrated into one seamless ecosystem.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={module.name}
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.05 * index }}
              >
                <Card
                  className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden bg-[--color-card] cursor-pointer"
                  onClick={() => navigate(module.route)}
                >
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-14 h-14 bg-[--color-bg-secondary] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[--color-primary] transition-colors duration-300">
                      <IconComponent name={module.iconName} className="w-7 h-7 text-[--color-primary] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[--color-primary] transition-colors">{module.name}</h3>
                    <p className="text-[--color-text-secondary] leading-relaxed mb-6 flex-grow">{module.description}</p>
                    <div className="pt-4 border-t border-[--color-bg-secondary] flex items-center text-[--color-primary] font-bold text-sm">
                      Learn More <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Fogsly Section */}
      <section className="py-24 bg-[--color-bg-marketplace] text-[--color-text-marketplace]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <Badge className="bg-[--color-primary] text-white mb-6 border-none px-4 py-1">The Fogsly Advantage</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Why Choice Fogsly?</h2>
              <p className="text-lg text-[--color-text-secondary] mb-12 leading-relaxed">
                We're building more than just a marketplace; we're establishing a foundation for the future of work.
              </p>
              <div className="space-y-6">
                {whyFogsly.map((reason, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-[--color-primary] flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-lg">{reason}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-[--color-primary]/20 to-[--color-accent]/20 absolute -inset-4 rotate-3 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
                alt="Collaboration"
                className="rounded-[3rem] shadow-2xl w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-[--color-primary] p-6 rounded-3xl shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Your Journey to Success</h2>
            <p className="text-lg text-[--color-text-secondary]">Start earning or hiring in 5 simple steps.</p>
          </motion.div>

          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-[--color-border] -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              {howItWorks.map((step, idx) => (
                <motion.div
                  key={idx}
                  {...fadeIn}
                  transition={{ delay: idx * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[--color-card] border-4 border-[--color-primary] flex items-center justify-center mb-6 shadow-lg group">
                    <span className="text-xl font-bold text-[--color-primary]">{idx + 1}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-3 px-4">{step}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Built for Everyone */}
      <section className="py-24 bg-[--color-bg-secondary]">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight">Built for Everyone</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {audiences.map((audience, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-[--color-card] rounded-2xl shadow-sm border border-[--color-border] font-bold text-[--color-text-secondary] flex items-center gap-3 cursor-default"
                >
                  <Users className="w-5 h-5 text-[--color-primary]" />
                  {audience}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <CTA
        title="Ready to Experience the Future?"
        description="Join over 120,000 professionals building their future on Fogsly. It's free to sign up and takes less than 5 minutes."
        primaryButtonText="Create My Account"
        secondaryButtonText="Explore Hubs"
        onPrimaryClick={() => navigate('auth')}
        onSecondaryClick={() => navigate('find-work')}
      />
    </div>
  );
};

// Internal Badge for consistency
const Badge = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <span className={`inline-block rounded-full text-xs font-bold tracking-wider uppercase ${className}`}>
    {children}
  </span>
);

export default FeaturesPage;