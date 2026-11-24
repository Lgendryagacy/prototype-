import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface BlogSectionProps {
  navigate: (route: string) => void;
}

const posts = [
  {
    badge: "Freelancing",
    badgeClass: "text-[#1d4ed8] bg-[#edf5ff]",
    gradientClass: "from-[#1554db] to-[#00b8d9]",
    title: "How to Win Better Clients in 2026",
    description: "Practical tips to improve proposals, pricing, communication, and delivery.",
    authorLogo: "F",
    meta: "Fogsly Team · 6 min read",
    icon3d: "/images/eco-icons/freelance-hub.png"
  },
  {
    badge: "AI & Productivity",
    badgeClass: "text-[#5b4df6] bg-[#f1efff]",
    gradientClass: "from-[#5b4df6] to-[#2563eb]",
    title: "AI Tools Every Professional Should Use",
    description: "Work smarter, write faster, and improve your career workflow using AI.",
    authorLogo: "A",
    meta: "A. Rehman · 8 min read",
    icon3d: "/images/quick-actions/visual-fogsly-ai-bot.png"
  },
  {
    badge: "FOGSLY News",
    badgeClass: "text-[#047857] bg-[#eafbf5]",
    gradientClass: "from-[#10b981] to-[#1554db]",
    title: "What’s New Inside FOGSLY",
    description: "Latest product updates, new modules, feature releases, and platform announcements.",
    authorLogo: "P",
    meta: "Product Team · 4 min read",
    icon3d: "/images/quick-actions/visual-fog-coin.png"
  }
];

const BlogSection: React.FC<BlogSectionProps> = ({ navigate }) => {
  return (
    <section id="blog" className="py-20 sm:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 mb-3 shadow-xs"
          >
            <img src="/images/quick-actions/badge-discover-3d.svg" alt="3D Blog" className="w-4 h-4 object-contain filter drop-shadow-xs" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              From the Blog
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3"
          >
            Knowledge That Moves You Forward
          </motion.h2>
        </div>

        {/* 3 Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className={`h-44 bg-gradient-to-br ${post.gradientClass} relative p-4 flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.4),transparent_18%)] pointer-events-none" />
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 w-24 h-24 flex items-center justify-center"
                  >
                    <img
                      src={post.icon3d}
                      alt={post.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
                    />
                  </motion.div>
                </div>

                <div className="p-5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${post.badgeClass}`}>
                    {post.badge}
                  </span>

                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-normal">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-normal mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {post.authorLogo}
                    </div>
                    <span>{post.meta}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  id={`btn-read-blog-${index}`}
                  onClick={() => navigate('blog')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>Read Article →</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom Button */}
        <div className="text-center">
          <button
            id="btn-visit-blog"
            onClick={() => navigate('blog')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-sm"
          >
            <span>Visit Our Blog</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
