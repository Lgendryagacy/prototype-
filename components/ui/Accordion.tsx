import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Context for the main accordion state
interface AccordionContextProps {
  activeValue: string | null;
  toggleItem: (value: string) => void;
}
const AccordionContext = createContext<AccordionContextProps | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("Accordion components must be used within an Accordion provider");
  return context;
};

export const Accordion = ({ children, defaultValue }: { children: React.ReactNode, defaultValue?: string | null }) => {
  const [activeValue, setActiveValue] = useState<string | null>(defaultValue || null);
  const toggleItem = (value: string) => {
    setActiveValue(current => (current === value ? null : value));
  };
  return (
    <AccordionContext.Provider value={{ activeValue, toggleItem }}>
      <div className="border border-[--color-border] rounded-lg">{children}</div>
    </AccordionContext.Provider>
  );
};

// Context for each item to know its own value
const AccordionItemContext = createContext<{ value: string } | null>(null);
const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) throw new Error("Accordion components must be used within an AccordionItem");
  return context;
};

export const AccordionItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={`border-b border-[--color-border] last:border-b-0 ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export const AccordionTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { activeValue, toggleItem } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isOpen = activeValue === value;
  return (
    <button
      className={`flex w-full items-center justify-between p-4 text-left font-medium transition-colors hover:bg-[--color-bg-secondary]/50 ${className}`}
      onClick={() => toggleItem(value)}
    >
      <span className="text-[--color-text-primary]">{children}</span>
      <ChevronDown className={`h-5 w-5 shrink-0 text-[--color-text-secondary] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const AccordionContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { activeValue } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isOpen = activeValue === value;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
        >
          <div className={`p-4 pt-0 text-[--color-text-secondary] ${className}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
