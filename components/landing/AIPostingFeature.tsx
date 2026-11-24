import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Bot } from 'lucide-react';

interface AIPostingFeatureProps {
  navigate: (route: string) => void;
}

const AIPostingFeature: React.FC<AIPostingFeatureProps> = ({ navigate }) => {
  return (
    <section className="py-20 sm:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-3"
            >
              <div className="flex items-center gap-2">
                <img src="/images/quick-actions/visual-fogsly-ai-bot.png" alt="3D AI" className="w-5 h-5 object-contain filter drop-shadow-xs" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Powered by FOGSLY AI
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Coming Soon
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
            >
              Post Jobs & Events in Seconds
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-normal"
            >
              Just describe what you want to post. Our AI creates a complete professional listing for you. Review, submit, and go live.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              {[
                "AI generates title, description & tags",
                "Clean, professional format automatically",
                "Admin reviews before publishing",
                "No technical knowledge needed"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-2.5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-post-job-ai"
                  onClick={() => navigate('post-job')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Post a Job with AI</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/50 text-blue-100">
                    Soon
                  </span>
                </button>
                <button
                  id="btn-post-event-ai"
                  onClick={() => navigate('create-event')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <span>Post an Event with AI</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Soon
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>AI listing assistant is currently in closed testing — manual posting is available now.</span>
              </p>
            </motion.div>
          </div>

          {/* Right AI Card Mockup Column */}
          <div className="lg:col-span-7 relative">
            {/* Floating 3D AI Robot Mascot */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-3 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none z-20"
            >
              <img
                src="/images/quick-actions/visual-fogsly-ai-bot.png"
                alt="3D FOGSLY AI Robot"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(14,165,233,0.5)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 sm:p-8 rounded-2xl text-white bg-slate-900 dark:bg-[#0E131F] border border-slate-800 shadow-xl relative overflow-hidden"
            >
              {/* Subtle glows */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Mockup Top Header */}
              <div className="flex items-center justify-between px-4 py-3 border border-white/10 rounded-xl bg-white/[0.04] mb-6 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2 font-medium text-xs text-white/90">
                  <img src="/images/quick-actions/visual-fogsly-ai-bot.png" alt="3D Bot" className="w-4 h-4 object-contain filter drop-shadow-xs" />
                  <span>FOGSLY AI Assistant</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Interactive Preview
                  </span>
                </div>
                <div className="flex items-center text-amber-300/80">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Chat Bubble 1: User */}
              <div className="ml-auto w-fit max-w-[85%] mb-4 p-3.5 rounded-xl bg-blue-600 text-white font-normal text-sm shadow-sm">
                Create a job post for a remote React Developer in Pakistan.
              </div>

              {/* Chat Bubble 2: AI */}
              <div className="mr-auto w-fit max-w-[85%] mb-6 p-3.5 rounded-xl bg-white/10 border border-white/10 text-white/90 font-normal text-sm backdrop-blur-sm">
                Done — I created a professional listing with role details, salary, requirements and tags.
              </div>

              {/* Generated Fields Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/10 rounded-xl text-white border border-white/10">
                  <span className="block text-xs font-medium text-slate-400">Title</span>
                  <span className="block text-sm font-semibold mt-0.5">React Developer</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl text-white border border-white/10">
                  <span className="block text-xs font-medium text-slate-400">Location</span>
                  <span className="block text-sm font-semibold mt-0.5">Remote, Pakistan</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl text-white border border-white/10">
                  <span className="block text-xs font-medium text-slate-400">Salary</span>
                  <span className="block text-sm font-semibold mt-0.5">PKR 120k–180k</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl text-white border border-white/10">
                  <span className="block text-xs font-medium text-slate-400">Requirements</span>
                  <span className="block text-sm font-semibold mt-0.5">React, Next.js, APIs</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AIPostingFeature;
