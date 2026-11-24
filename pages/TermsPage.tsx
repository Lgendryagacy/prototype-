import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  FileText,
  UserCheck,
  Briefcase,
  Wallet,
  AlertCircle,
  RotateCcw,
  Scale,
  Clock,
  Mail,
  Phone,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { termsPageData } from '../constants';
import { Card, CardContent } from '../components/ui/Card';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const SectionIcon = ({ title }: { title: string }) => {
  const iconProps = { className: "w-6 h-6 text-[--color-primary]" };
  if (title.includes('Acceptance')) return <Shield {...iconProps} />;
  if (title.includes('Registration')) return <UserCheck {...iconProps} />;
  if (title.includes('Services')) return <Briefcase {...iconProps} />;
  if (title.includes('Payments')) return <Wallet {...iconProps} />;
  if (title.includes('Refund')) return <RotateCcw {...iconProps} />;
  if (title.includes('Prohibited')) return <AlertCircle {...iconProps} />;
  if (title.includes('Dispute')) return <Scale {...iconProps} />;
  return <FileText {...iconProps} />;
};

const TermsPage = () => {
  const { hero, introduction, sections, contact } = termsPageData;

  return (
    <div className="bg-[--color-bg-primary] min-h-screen text-[--color-text-primary] font-sans">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-[--color-border] bg-[--color-bg-primary]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full">
              <FileText className="w-3.5 h-3.5" />
              Legal & Compliance
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[--color-text-primary]">{hero.headline}</h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] leading-relaxed max-w-2xl mx-auto mb-6">
              {hero.subheadline}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[--color-text-secondary]">
              <Clock size={14} className="text-[--color-primary]" />
              Last Updated: {hero.lastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <motion.div {...fadeIn} className="mb-20">
            <p className="text-xl text-[--color-text-secondary] leading-relaxed border-l-4 border-[--color-primary] pl-8">
              {introduction}
            </p>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-20">
            {sections.map((section, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mt-32 pt-16 border-t border-[--color-border]"
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
                    <ul className="grid md:grid-cols-1 gap-3 mt-8">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 bg-[--color-card] rounded-2xl border border-[--color-border] text-sm font-medium text-[--color-text-primary] shadow-sm hover:border-[--color-primary]/30 transition-all hover:translate-x-1">
                          <div className="mt-1 w-5 h-5 rounded-full bg-[--color-primary]/10 flex items-center justify-center flex-shrink-0 text-[--color-primary]">
                            <CheckCircle2 size={12} />
                          </div>
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
            className="mt-32 pt-16 border-t border-[#E2E8F0]"
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-[--color-bg-marketplace] to-[#1E293B] text-[--color-popup-text] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[--color-primary]/10 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32"></div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Legal Support</h3>
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
      <section className="py-16 bg-[--color-bg-primary] border-t border-[--color-border]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-[0.2em] mb-8">Building trust through transparency</p>
          <div className="flex justify-center gap-12 opacity-40">
            <Shield size={32} />
            <Scale size={32} />
            <Eye size={32} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;