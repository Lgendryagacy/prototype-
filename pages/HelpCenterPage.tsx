import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { helpCenterPageData } from '../constants';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Rocket,
  ShieldCheck,
  Wallet,
  Briefcase,
  Wrench,
  Sparkles,
  Play,
  Globe,
  HelpCircle,
  MessageSquare,
  Mail,
  ArrowRight,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

type HelpView = 'home' | 'category' | 'article';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, any> = {
    Rocket, ShieldCheck, Wallet, Briefcase, Wrench, Sparkles, Play, Globe, HelpCircle
  };
  const Icon = icons[name] || HelpCircle;
  return <Icon className={className} />;
};

const HelpCenterPage = () => {
  const { hero, categories: helpCategories, trending, faq, guides, contact } = helpCenterPageData;

  const [view, setView] = useState<HelpView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | 'up' | 'down'>(null);

  // Derived Data
  const currentCategory = useMemo(() =>
    helpCategories.find(c => c.id === selectedCatId),
    [selectedCatId, helpCategories]);

  const currentArticle = useMemo(() =>
    currentCategory?.articles.find(a => a.id === selectedArticleId),
    [currentCategory, selectedArticleId]);

  const allArticles = useMemo(() =>
    helpCategories.flatMap(c => c.articles.map(a => ({ ...a, catId: c.id, catTitle: c.title }))),
    [helpCategories]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allArticles.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, allArticles]);

  // Handlers
  const handleCategoryClick = (catId: string) => {
    setSelectedCatId(catId);
    setView('category');
    window.scrollTo(0, 0);
  };

  const handleArticleClick = (catId: string, artId: string) => {
    setSelectedCatId(catId);
    setSelectedArticleId(artId);
    setView('article');
    setFeedback(null);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedCatId(null);
    setSelectedArticleId(null);
    setSearchQuery('');
  };

  const handleBackToCategory = () => {
    setView('category');
    setSelectedArticleId(null);
  };

  return (
    <div className="bg-[--color-bg-primary] text-[--color-text-primary] min-h-screen">
      {/* Breadcrumbs */}
      {view !== 'home' && (
        <div className="bg-[--color-bg-primary] border-b border-[--color-border] pt-24 pb-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-[--color-text-secondary] font-medium">
              <button onClick={handleBackToHome} className="hover:text-[--color-primary] transition-colors">Help Home</button>
              <ChevronRight size={14} />
              {view === 'category' ? (
                <span className="text-[--color-text-primary]">{currentCategory?.title}</span>
              ) : (
                <>
                  <button onClick={handleBackToCategory} className="hover:text-[--color-primary] transition-colors">{currentCategory?.title}</button>
                  <ChevronRight size={14} />
                  <span className="text-[--color-text-primary] truncate max-w-[200px] md:max-w-none">{currentArticle?.title}</span>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" {...fadeIn}>
            {/* Search-First Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[--color-bg-primary] border-b border-[--color-border]">
              <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[--color-primary]/10 text-[--color-primary] rounded-full"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Customer Support Hub
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">How can we help you?</h1>
                <p className="text-lg md:text-xl text-[--color-text-secondary] max-w-2xl mx-auto mb-10 leading-relaxed">
                  Search our knowledge base or browse categories below to find answers to your questions instantly.
                </p>

                <div className="max-w-2xl mx-auto relative mb-6">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[--color-text-secondary] transition-colors group-focus-within:text-[--color-primary]" />
                    <Input
                      placeholder="Search for articles (e.g. 'how to withdraw', 'account help')"
                      className="h-16 pl-14 pr-6 text-lg bg-[--color-card] border-[--color-border] rounded-2xl shadow-xl focus:ring-4 focus:ring-[--color-primary]/10 focus:border-[--color-primary] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Instant Search Results */}
                  <AnimatePresence>
                    {searchQuery.trim().length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[--color-card] rounded-2xl border border-[--color-border] shadow-2xl z-50 overflow-hidden text-left"
                      >
                        {searchResults.length > 0 ? (
                          <div className="p-2">
                            <p className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] border-b border-[--color-bg-secondary] mb-2">Search Results</p>
                            {searchResults.map(res => (
                              <button
                                key={res.id}
                                onClick={() => handleArticleClick(res.catId, res.id)}
                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[--color-bg-secondary] transition-colors group flex items-center justify-between"
                              >
                                <div>
                                  <h4 className="font-bold text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">{res.title}</h4>
                                  <p className="text-xs text-[--color-text-secondary] mt-0.5">In {res.catTitle}</p>
                                </div>
                                <ChevronRight size={16} className="text-[--color-border]" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <Search size={32} className="mx-auto text-[--color-border] mb-2" />
                            <p className="text-[--color-text-secondary]">No articles found for "{searchQuery}"</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <span className="text-xs font-bold text-[--color-text-secondary] uppercase tracking-wider mt-2">Trending:</span>
                  {trending.map(t => (
                    <button key={t} onClick={() => setSearchQuery(t)} className="text-xs font-semibold px-4 py-1.5 bg-[--color-bg-secondary] hover:bg-[--color-bg-tertiary] text-[--color-text-secondary] rounded-full transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Main Categories Grid */}
            <section className="py-24">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {helpCategories.map((cat, index) => (
                    <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card className="h-full border border-[--color-border] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-[--color-card] group overflow-hidden cursor-pointer" onClick={() => handleCategoryClick(cat.id)}>
                        <CardContent className="p-8">
                          <div className="w-14 h-14 mt-4 bg-[--color-primary]/10 text-[--color-primary] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[--color-primary] group-hover:text-white transition-colors duration-300">
                            <IconComponent name={cat.icon} className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                          <p className="text-[--color-text-secondary] text-sm leading-relaxed mb-6">{cat.description}</p>
                          <div className="space-y-3">
                            {cat.articles.slice(0, 3).map(article => (
                              <button
                                key={article.id}
                                onClick={(e) => { e.stopPropagation(); handleArticleClick(cat.id, article.id); }}
                                className="flex items-center gap-2 text-sm font-medium text-[--color-primary] hover:text-[--color-primary]/80 text-left"
                              >
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                                {article.title}
                              </button>
                            ))}
                          </div>
                          <div className="mt-8 pt-6 border-t border-[--color-bg-secondary] flex items-center text-[--color-primary] font-bold text-xs uppercase tracking-widest">
                            View All Articles <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'category' && (
          <motion.div key="category" {...fadeIn} className="pt-12 pb-24">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                <aside className="lg:col-span-4 space-y-4">
                  <div className="p-6 bg-[--color-card] rounded-3xl border border-[--color-border] shadow-sm sticky top-32">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] mb-6">Categories</h3>
                    <div className="space-y-1">
                      {helpCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${selectedCatId === cat.id ? 'bg-[--color-primary] text-white shadow-lg' : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'}`}
                        >
                          <IconComponent name={cat.icon} className={`w-4 h-4 ${selectedCatId === cat.id ? 'text-white' : 'text-[--color-primary]'}`} />
                          {cat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
                <main className="lg:col-span-8">
                  <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-4">{currentCategory?.title}</h1>
                    <p className="text-lg text-[--color-text-secondary]">{currentCategory?.description}</p>
                  </div>
                  <div className="grid gap-4">
                    {currentCategory?.articles.map(article => (
                      <Card key={article.id} className="border border-[--color-border] hover:border-[--color-primary]/30 transition-all hover:shadow-md cursor-pointer group" onClick={() => handleArticleClick(currentCategory.id, article.id)}>
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold group-hover:text-[--color-primary] transition-colors">{article.title}</h3>
                            <p className="text-sm text-[--color-text-secondary] mt-1 line-clamp-1">{article.content}</p>
                          </div>
                          <ChevronRight className="text-[--color-border] group-hover:text-[--color-primary] transition-colors" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </main>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'article' && (
          <motion.div key="article" {...fadeIn} className="pt-12 pb-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Button variant="ghost" onClick={handleBackToCategory} className="mb-8 text-[--color-text-secondary] hover:text-[--color-primary]">
                  <ArrowLeft size={16} className="mr-2" /> Back to {currentCategory?.title}
                </Button>

                v<article className="bg-[--color-card] rounded-[2.5rem] p-8 md:p-12 border border-[--color-border] shadow-sm">
                  <Badge className="bg-[--color-primary]/10 text-[--color-primary] mb-6 border-none">{currentCategory?.title}</Badge>
                  <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">{currentArticle?.title}</h1>

                  <div className="prose prose-lg max-w-none text-[--color-text-secondary] leading-relaxed space-y-6">
                    {currentArticle?.content.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Feedback Section */}
                  <div className="mt-16 pt-12 border-t border-[--color-bg-secondary] text-center">
                    <h4 className="text-lg font-bold mb-6">Was this article helpful?</h4>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setFeedback('up')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all ${feedback === 'up' ? 'bg-[--color-primary] text-white border-[--color-primary]' : 'bg-[--color-card] text-[--color-text-secondary] border-[--color-border] hover:border-[--color-primary]/50'}`}
                      >
                        <ThumbsUp size={18} /> Yes
                      </button>
                      <button
                        onClick={() => setFeedback('down')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all ${feedback === 'down' ? 'bg-[--color-bg-marketplace] text-white border-[--color-bg-marketplace]' : 'bg-[--color-card] text-[--color-text-secondary] border-[--color-border] hover:border-[--color-bg-marketplace]/50'}`}
                      >
                        <ThumbsDown size={18} /> No
                      </button>
                    </div>
                    <AnimatePresence>
                      {feedback && (
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-[--color-primary] font-bold">
                          Thank you for your feedback!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </article>

                {/* Related Articles Footer */}
                <div className="mt-12 bg-[--color-bg-secondary] rounded-3xl p-8 border border-[--color-border]">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[--color-text-secondary] mb-6 flex items-center gap-2">
                    <Info size={14} /> Other helpful articles
                  </h4>
                  <div className="grid gap-3">
                    {currentCategory?.articles.filter(a => a.id !== selectedArticleId).slice(0, 3).map(art => (
                      <button
                        key={art.id}
                        onClick={() => handleArticleClick(currentCategory.id, art.id)}
                        className="w-full text-left p-4 bg-[--color-card] rounded-2xl border border-[--color-border] hover:border-[--color-primary] transition-all flex items-center justify-between group"
                      >
                        <span className="font-bold text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">{art.title}</span>
                        <ChevronRight size={16} className="text-[--color-border]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global FAQ & Contact Footer (Shown on Home only) */}
      {view === 'home' && (
        <>
          <section className="py-24 bg-[--color-bg-primary] border-y border-[--color-border]">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
                <main className="lg:col-span-8">
                  <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faq.map((item, index) => (
                      <details key={index} className="group bg-[--color-bg-secondary] border border-[--color-border] rounded-2xl p-6 open:bg-[--color-card] open:ring-2 open:ring-[--color-primary]/20 transition-all">
                        <summary className="flex justify-between items-center font-bold text-lg cursor-pointer list-none">
                          <span className="text-[--color-text-primary]">{item.question}</span>
                          <ChevronDown className="w-5 h-5 text-[--color-text-secondary] transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <p className="text-[--color-text-secondary] mt-4 leading-relaxed text-base border-t border-[--color-border] pt-4">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </main>
                <aside className="lg:col-span-4 space-y-8">
                  <Card className="border-none bg-[--color-bg-secondary] shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles size={20} className="text-[--color-primary]" />
                        Popular Guides
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {guides.map((guide, index) => (
                        <div key={index} className="group p-4 bg-[--color-card] rounded-xl border border-[--color-border] hover:border-[--color-primary] transition-all cursor-pointer shadow-sm">
                          <h4 className="font-bold text-[--color-text-primary] group-hover:text-[--color-primary] transition-colors">{guide.title}</h4>
                          <p className="text-xs text-[--color-text-secondary] mt-1 line-clamp-1">{guide.description}</p>
                        </div>
                      ))}
                      <Button variant="link" className="w-full text-[--color-primary] font-bold mt-2">
                        Browse Full Library <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-marketplace)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[--color-primary]/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
                    <CardHeader>
                      <CardTitle className="text-xl" style={{ color: 'var(--color-text-marketplace)' }}>Safety & Trust</CardTitle>
                      <p className="text-sm mt-2" style={{ color: 'var(--color-text-marketplace)', opacity: 0.8 }}>Your security is our top priority.</p>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10">
                      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-marketplace)', opacity: 0.8 }}>
                        Learn how we protect your data and payments with government-registered compliance.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl font-bold"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          backgroundColor: 'transparent',
                          color: 'var(--color-text-marketplace)'
                        }}
                      >
                        View Safety Portal
                      </Button>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          </section>

          {/* Proactive Support Section */}
          <section className="py-24">
            <div className="container mx-auto px-4 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto p-12 md:p-20 bg-[--color-card] rounded-[3rem] shadow-xl border border-[--color-border] relative overflow-hidden">
                <div className="relative z-10">
                  <span
                    className="inline-block rounded-full text-xs font-bold tracking-wider uppercase px-4 py-1 mb-6"
                    style={{
                      backgroundColor: 'var(--color-primary, #0D9488)' + '20',
                      color: 'var(--color-primary, #0D9488)'
                    }}
                  >
                    Contact Support
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">{contact.title}</h2>
                  <p className="text-lg text-[--color-text-secondary] mb-10 max-w-2xl mx-auto leading-relaxed">
                    {contact.description}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" className="rounded-full px-10 h-14 bg-[--color-primary] hover:bg-[--color-primary]/90 font-bold shadow-lg shadow-[--color-primary]/20">
                      <MessageSquare className="w-5 h-5 mr-2" /> Start Live Chat
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-10 h-14 border-[--color-border] font-bold">
                      <Mail className="w-5 h-5 mr-2" /> Email Our Team
                    </Button>
                  </div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[--color-primary]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[--color-accent]/5 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Trust Footer Section */}
      <section className="py-16 bg-[--color-bg-primary] border-t border-[--color-border]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 opacity-50 grayscale">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[--color-primary]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[--color-text-secondary]">Encrypted Support</span>
            </div>
            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-[--color-primary]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[--color-text-secondary]">Priority Response</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-[--color-primary]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[--color-text-secondary]">Global Reach</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;