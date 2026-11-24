import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, User, MessageSquare, ArrowUpRight, CheckCircle, Loader2, Sparkles, BookOpen, TrendingUp, Zap } from 'lucide-react';

const insights = [
  {
    icon: <TrendingUp size={18} />,
    label: 'Freelancing Strategies',
    desc: 'Actionable tips to win more clients, price your services, and grow your income.',
  },
  {
    icon: <Zap size={18} />,
    label: 'Tech & Innovation',
    desc: 'How AI, blockchain, and emerging tools are reshaping the way the world works.',
  },
  {
    icon: <BookOpen size={18} />,
    label: 'Fogsly News & Releases',
    desc: 'Changelogs, new features, and announcements straight from the team.',
  },
];

const Newsletter: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!form.message.trim()) newErrors.message = 'Please leave a comment or question.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus('loading');
    // Demo: simulate submission
    setTimeout(() => {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    }, 1800);
  };

  return (
    <section
      className="relative overflow-hidden py-20 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full blur-[100px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
        />
        <div
          className="absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full blur-[100px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-3 flex items-center gap-2"
        >
          <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-medium tracking-wide" style={{ color: 'var(--color-primary)' }}>
            From The Fogsly Blog
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* ── Left: Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <h2
              className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Knowledge That{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, var(--color-accent), var(--color-primary))' }}
              >
                Moves You Forward
              </span>
            </h2>

            <p
              className="mb-10 max-w-md text-base font-semibold leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Dive into expert-written articles covering freelancing strategies, platform news, and the tools that shape the future of digital work.
            </p>

            {/* Insight pills */}
            <div className="flex flex-col gap-4">
              {insights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="flex items-start gap-4 rounded-xl p-4 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Blog CTA */}
            <motion.a
              href="/blog"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Visit Our Blog
              <ArrowUpRight size={16} />
            </motion.a>
          </motion.div>

          {/* ── Right: Form card ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3
              className="mb-1 text-2xl font-extrabold uppercase tracking-wide"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Get In Touch
            </h3>
            <p className="mb-7 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Have a question or suggestion? We'd love to hear from you.
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-10 text-center"
                style={{
                  backgroundColor: 'var(--color-success-bg)',
                  borderRadius: '0.75rem',
                  padding: '2.5rem 1rem',
                }}
              >
                <CheckCircle size={52} style={{ color: 'var(--color-success-icon)' }} />
                <p className="text-xl font-bold" style={{ color: 'var(--color-success-fg)' }}>
                  Message Sent!
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Thanks for reaching out. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 rounded-lg px-5 py-2 text-sm font-medium transition"
                  style={{
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'transparent',
                  }}
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Name */}
                <div>
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <User size={13} style={{ color: 'var(--color-primary)' }} />
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter Your Full Name"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: errors.name ? '1px solid #ef4444' : '1px solid var(--color-border)',
                    }}
                  />
                  {errors.name && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: errors.email ? '1px solid #ef4444' : '1px solid var(--color-border)',
                    }}
                  />
                  {errors.email && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.email}</p>}
                </div>

                {/* Message */}
                <div>
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <MessageSquare size={13} style={{ color: 'var(--color-primary)' }} />
                    Comment / Question <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Message"
                    className="w-full resize-none rounded-lg px-4 py-3 text-sm outline-none transition"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: errors.message ? '1px solid #ef4444' : '1px solid var(--color-border)',
                    }}
                  />
                  {errors.message && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-70"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
