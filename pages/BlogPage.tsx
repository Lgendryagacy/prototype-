import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { blogPageData } from '../constants';
import { Search, ArrowRight, Calendar, User, Clock, ChevronRight, Mail, Sparkles, BookOpen } from 'lucide-react';
import CTA from '../components/CTA';
import { type Route } from '../types';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

interface BlogPageProps {
  navigate: (route: Route, context?: any) => void;
}

const BlogPage = ({ navigate }: BlogPageProps) => {
  const { hero, categories, posts, contributors, featuredPostId } = blogPageData;
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPost = useMemo(() => posts.find(p => p.id === featuredPostId) || posts[0], [posts, featuredPostId]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && post.id !== featuredPostId;
    });
  }, [posts, activeCategory, searchQuery, featuredPostId]);

  return (
    <div className="bg-[--color-bg-primary] text-[--color-text-primary] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[--color-bg-primary] border-b border-[--color-border]">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
          >
            <BookOpen className="w-3.5 h-3.5" />
            The Fogsly Journal
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[--color-text-primary]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {hero.headline}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-[--color-text-secondary] max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            className="max-w-xl mx-auto relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary] transition-colors group-focus-within:text-[--color-primary]" />
            <input
              type="text"
              placeholder="Search for insights, guides, and more..."
              className="w-full h-14 pl-12 pr-4 bg-[--color-card] border border-[--color-border] text-[--color-text-primary] rounded-2xl shadow-sm focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary] outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[--color-primary]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[--color-accent]/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Featured Post - Split Layout */}
        <motion.div {...fadeIn} className="mb-24">
          <div className="flex flex-col lg:flex-row bg-[--color-card] rounded-[2.5rem] overflow-hidden shadow-xl border border-[--color-border] group cursor-pointer" onClick={() => navigate('blog-post', featuredPost.id)}>
            <div className="lg:w-3/5 overflow-hidden relative">
              <img
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                className="w-full h-full object-cover aspect-video lg:aspect-auto group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6">
                <Badge className="bg-[--color-primary] text-white px-4 py-1.5 shadow-lg border-none text-xs">Featured Story</Badge>
              </div>
            </div>
            <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-[--color-card]">
              <Badge variant="secondary" className="bg-[--color-bg-secondary] text-[--color-primary] mb-6 w-fit">{featuredPost.category}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-[--color-text-secondary] text-lg leading-relaxed mb-8">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[--color-bg-secondary] flex items-center justify-center font-bold text-[--color-primary]">
                  {featuredPost.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[--color-text-primary]">{featuredPost.author}</p>
                  <p className="text-xs text-[--color-text-secondary] flex items-center gap-1.5">
                    <Calendar size={12} /> {featuredPost.date} • <Clock size={12} /> 6 min read
                  </p>
                </div>
              </div>
              <Button className="w-fit rounded-full px-8 bg-[--color-primary] hover:bg-[--color-primary]/90" onClick={(e) => { e.stopPropagation(); navigate('blog-post', featuredPost.id); }}>
                Read Full Insight <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Navigation & Grid */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-[--color-border] pb-8">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                    ? 'bg-[--color-primary] text-white shadow-lg shadow-[--color-primary]/20'
                    : 'bg-[--color-card] text-[--color-text-secondary] border border-[--color-border] hover:border-[--color-primary]/30 hover:bg-[--color-bg-secondary]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-sm font-medium text-[--color-text-secondary]">
              Showing <span className="text-[--color-text-primary]">{filteredPosts.length}</span> articles
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col group border-[--color-border] shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-[--color-card] cursor-pointer" onClick={() => navigate('blog-post', post.id)}>
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-[--color-primary] border-none shadow-sm text-[10px] uppercase tracking-wider font-bold">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold leading-snug flex-grow text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors mb-4 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[--color-text-secondary] text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-[--color-border]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-xs font-bold text-[--color-primary]">
                            {post.author.charAt(0)}
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-[--color-text-primary]">{post.author}</p>
                            <p className="text-[--color-text-secondary]">{post.date}</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-[--color-bg-secondary] text-[--color-primary] flex items-center justify-center group-hover:bg-[--color-primary] group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-[--color-card] rounded-[2rem] border border-dashed border-[--color-border]">
              <Search className="w-12 h-12 text-[--color-text-secondary] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[--color-text-primary]">No articles found</h3>
              <p className="text-[--color-text-secondary]">Try adjusting your search or category filters.</p>
              <Button
                variant="link"
                className="mt-4 text-[--color-primary]"
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Signup Section */}
      <section className="py-24 bg-[--color-bg-secondary]">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeIn}
            className="max-w-5xl mx-auto bg-gradient-to-br from-[--color-primary] to-[--color-accent] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-center md:text-left"
          >
            <div className="grid md:grid-cols-2 items-center gap-12 relative z-10">
              <div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white mb-6 border-none px-4 py-1">Stay Informed</Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Weekly insights on the future of work.</h2>
                <p className="text-white/80 text-lg mb-0">
                  Join over 12,000 professionals receiving our curated list of trends, guides, and platform updates.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow h-14 rounded-2xl bg-white/10 border border-white/20 px-6 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <Button size="lg" className="h-14 rounded-2xl bg-white text-[--color-primary] hover:bg-white/90 px-8 font-bold">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-white/60 text-center sm:text-left">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* Contributor Spotlight */}
      <section className="py-24 bg-[--color-bg-primary]">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[--color-text-primary]">Meet Our Contributors</h2>
            <div className="w-20 h-1.5 bg-[--color-primary] mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {contributors.map((author, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
                className="bg-[--color-card] p-8 rounded-3xl border border-[--color-border] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-[--color-bg-secondary] text-[--color-primary] flex items-center justify-center font-bold text-xl mb-6">
                  {author.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="text-xl font-bold mb-1 text-[--color-text-primary]">{author.name}</h4>
                <p className="text-[--color-primary] text-sm font-semibold mb-4">{author.role}</p>
                <p className="text-[--color-text-secondary] text-sm leading-relaxed">
                  {author.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTA
        title="Inspired by our insights?"
        description="Start your own journey on the Fogsly platform today. Build, hire, and earn within a secure, registered ecosystem."
        primaryButtonText="Get Started Now"
        secondaryButtonText="Explore Features"
      />
    </div>
  );
};

export default BlogPage;