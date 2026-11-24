import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, Edit, Pause, Trash2 } from 'lucide-react';

const AdActionDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 p-2"
          >
            <ul className="text-sm text-gray-300" role="menu">
              <MenuItem icon={<Eye size={16} />} text="View Details" />
              <MenuItem icon={<Edit size={16} />} text="Edit" />
              <MenuItem icon={<Pause size={16} />} text="Pause" />
              <MenuItem text="Deactivate" />
              <div className="h-px bg-slate-700 my-2" role="separator"></div>
              <MenuItem icon={<Trash2 size={16} />} text="Delete" isDestructive />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItem = ({ icon, text, isDestructive = false }: { icon?: React.ReactNode, text: string, isDestructive?: boolean }) => (
  <li role="none">
    <button
      role="menuitem"
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isDestructive
          ? 'text-red-400 hover:bg-red-500/10'
          : 'hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  </li>
);

export default AdActionDropdown;
