import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Users, Cpu, Share2, HelpCircle, Mail, Phone, Clock } from 'lucide-react';
import { privacyPolicyPageData } from '../constants';
import { Card, CardContent } from '../components/ui/Card';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const SectionIcon = ({ title }: { title: string }) => {
  const iconProps = { className: "w-6 h-6 text-[--color-primary]" };
  if (title.includes('Collect')) return <SearchIcon {...iconProps} />;
  if (title.includes('Use')) return <Cpu {...iconProps} />;
  if (title.includes('Sharing')) return <Share2 {...iconProps} />;
  if (title.includes('Security')) return <Lock {...iconProps} />;
  if (title.includes('Rights')) return <Users {...iconProps} />;
  if (title.includes('Cookies')) return <Eye {...iconProps} />;
  if (title.includes('Children')) return <HelpCircle {...iconProps} />;
  if (title.includes('Updates')) return <Clock {...iconProps} />;
  return <Shield {...iconProps} />;
};

const SearchIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const PrivacyPolicyPage = () => {
  const { hero, introduction, sections, contact } = privacyPolicyPageData;

  return (
    <div className="bg-[--color-bg-primary] min-h-screen text-[--color-text-primary] font-sans">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-[--color-border] bg-[--color-card]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full">
              <Shield className="w-3.5 h-3.5" />
              Trusted Environment
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[--color-text-primary]">{hero.headline}</h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] leading-relaxed max-w-2xl mx-auto mb-6">
              {hero.subheadline}
            </p>
            <p className="text-sm font-semibold text-[--color-text-secondary]">Last Updated: {hero.lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          {/* Introduction */}
          <motion.div {...fadeIn} className="mb-16">
            <p className="text-xl text-[--color-text-secondary] leading-relaxed border-l-4 border-[--color-primary] pl-8">
              {introduction}
            </p>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-16">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[--color-card] shadow-sm border border-[--color-border] flex items-center justify-center transition-all group-hover:border-[--color-primary]/30 group-hover:shadow-md">
                    <SectionIcon title={section.title} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[--color-text-primary]">{section.title}</h2>
                </div>

                <div className="pl-0 md:pl-16">
                  <p className="text-[--color-text-secondary] text-lg leading-relaxed mb-6">
                    {section.content}
                  </p>
                  {section.list && (
                    <ul className="grid md:grid-cols-2 gap-4">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 bg-[--color-card] rounded-2xl border border-[--color-border] text-sm font-medium text-[--color-text-primary] shadow-sm hover:border-[--color-primary]/30 transition-colors">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[--color-primary] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-32 pt-16 border-t border-[--color-border]"
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-[--color-bg-marketplace] to-[#1E293B] text-[--color-popup-text] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[--color-primary]/10 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32"></div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Contact Information</h3>
                <p className="text-[--color-text-secondary] mb-10 max-w-lg">{contact.note}</p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[--color-primary] transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] mb-1">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-lg font-bold hover:text-[--color-primary] transition-colors">{contact.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[--color-primary] transition-colors">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] mb-1">Phone</p>
                      <p className="text-lg font-bold">{contact.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="py-16 bg-[--color-card] border-t border-[--color-border]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-[0.2em] mb-8">Committed to transparency</p>
          <div className="flex justify-center gap-12 opacity-40">
            <Shield size={32} />
            <Lock size={32} />
            <Eye size={32} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;