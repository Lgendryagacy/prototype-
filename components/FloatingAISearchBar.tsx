import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Minimize2, ChevronUp } from 'lucide-react';
import { Route } from '../types';

interface FloatingAISearchBarProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
}

const PLACEHOLDER_TEXTS = [
  'Ask AI anything…',
  'Find a freelancer…',
  'How do FogCoins work?',
  'Help me write a proposal…',
  'What gigs are available?',
];

export const FloatingAISearchBar: React.FC<FloatingAISearchBarProps> = ({ navigate }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fade in on first mount with slight delay
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Cycle placeholder text
  useEffect(() => {
    if (isFocused || query) return;
    const t = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(t);
  }, [isFocused, query]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setQuery('');
    navigate('ai-assistant', { initialQuery: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsMinimized(true);
      inputRef.current?.blur();
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="wait">

        {/* ── MINIMIZED PILL ── */}
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={handleExpand}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-xl cursor-pointer group select-none"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary)/60, var(--color-accent)/60)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-white text-xs font-semibold tracking-wide">Ask AI</span>
            <ChevronUp className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
          </motion.button>

        ) : (

          /* ── EXPANDED SEARCH BAR ── */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="pointer-events-auto relative"
            style={{ width: 'min(520px, calc(100vw - 24px))' }}
          >
            {/* Glow blob behind the bar */}
            <motion.div
              className="absolute -inset-[2px] rounded-2xl opacity-60 pointer-events-none"
              animate={{
                background: isFocused
                  ? [
                      'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                      'linear-gradient(225deg, var(--color-accent), var(--color-primary))',
                      'linear-gradient(315deg, var(--color-primary), var(--color-accent))',
                    ]
                  : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div
              className="relative rounded-2xl border backdrop-blur-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 20, 0.72)',
                borderColor: isFocused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)',
                boxShadow: isFocused
                  ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.08) inset'
                  : '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
            >
              {/* Top gradient strip */}
              <div
                className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-accent), transparent)',
                  opacity: isFocused ? 1 : 0.5,
                  transition: 'opacity 0.3s',
                }}
              />

              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">

                {/* Sparkles icon */}
                <motion.div
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    boxShadow: '0 2px 12px var(--color-primary-shadow, rgba(99,102,241,0.4))',
                  }}
                  animate={isFocused ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </motion.div>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/35 focus:outline-none min-w-0 py-1"
                  placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                />

                {/* Send button */}
                <motion.button
                  type="submit"
                  disabled={!query.trim()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: query.trim()
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </motion.button>

                {/* Minimize button */}
                <motion.button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-white/8 hover:bg-white/15 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-3 h-3 text-white/60 hover:text-white/90 transition-colors" />
                </motion.button>
              </form>

              {/* Bottom hint row */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={isFocused ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-white/30 font-medium tracking-wide">
                    Powered by Fogsly AI &middot; Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/50 text-[9px] font-mono">Enter</kbd> to search
                  </span>
                  <motion.div
                    className="flex gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ background: 'var(--color-primary)' }}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingAISearchBar;
