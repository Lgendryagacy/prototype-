import React, { useState, useEffect, useRef } from "react";
import { Home, Search, Bell, User, Settings, Mail, Menu, ExternalLink, ChevronRight, Calendar } from "lucide-react";
import { ViewState } from "../App";

interface FloatingDockNavProps {
  onNavigate: (view: ViewState) => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  isMenu?: boolean;
  action?: () => void;
}

const fogslyModules = [
  {
    name: "Watch Ads + Q&A",
    id: "watch-ads",
    route: "watch-ads",
    icon: "/images/eco-icons/watch-ads.png"
  },
  {
    name: "Freelance Hub",
    id: "freelance",
    route: "find-work",
    icon: "/images/eco-icons/freelance-hub.png"
  },
  {
    name: "Fog Jobs",
    id: "jobs",
    route: "fog-jobs",
    icon: "/images/eco-icons/fog-jobs.png"
  },
  {
    name: "Fog e-Services",
    id: "services",
    route: "fog-services",
    icon: "/images/eco-icons/fog-services.png"
  },
  {
    name: "Fog Coins",
    id: "wallet",
    route: "fog-coins",
    icon: "/images/eco-icons/fog-coins.png"
  },
  {
    name: "Giveaway",
    id: "giveaway",
    route: "giveaways",
    icon: "/images/eco-icons/giveaways.png"
  },
  {
    name: "Referral System",
    id: "referral",
    route: "referrals",
    icon: "/images/eco-icons/referral-sysem.png"
  },
  {
    name: "Tasker Hub",
    id: "tasker",
    route: "home",
    icon: "/images/eco-icons/tasker-hub.png"
  },
  {
    name: "Fog Shop",
    id: "shop",
    route: "home",
    icon: "/images/eco-icons/fog-shop.png"
  },
  {
    name: "AI Tools",
    id: "ai",
    route: "home",
    icon: "/images/eco-icons/built-in-ai-tools.png"
  },
  {
    name: "Gamification",
    id: "game",
    route: "home",
    icon: "/images/eco-icons/gamification.png"
  },
  {
    name: "Events & Expo",
    id: "events",
    route: "home",
    icon: "/images/eco-icons/events-expo.png"
  },
];

export const FloatingDockNav: React.FC<FloatingDockNavProps> = ({ onNavigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);


  // Close popup on click outside - DISABLED to prevent interference with module clicks
  // Users can close the menu by clicking the Menu button again or pressing Escape
  // useEffect(() => {
  //   if (!isMenuOpen) return;

  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as Node;

  //     // Check if click is outside the menu
  //     if (menuRef.current && !menuRef.current.contains(target)) {
  //       setIsMenuOpen(false);
  //     }
  //   };

  //   // Add listener after a delay to avoid immediate closure
  //   const timeoutId = setTimeout(() => {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }, 200);

  //   return () => {
  //     clearTimeout(timeoutId);
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isMenuOpen]);

  // Close popup on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleModuleClick = (module: typeof fogslyModules[0]) => {
    if (module.route) {
      // Close menu first
      setIsMenuOpen(false);

      // Navigate immediately
      onNavigate(module.route);
    }
  };

  const navItems: NavItem[] = [
    {
      icon: <Home size={20} />,
      label: "Home",
      action: () => {
        setActiveIndex(0);
        onNavigate('home');
      }
    },
    { icon: <Search size={20} />, label: "Search" },
    { icon: <Calendar size={20} />, label: "Events & Expo" },
    { icon: <Bell size={20} />, label: "Notifications" },
    { icon: <Mail size={20} />, label: "Messages" },
    { icon: <User size={20} />, label: "Profile" },
    { icon: <Settings size={20} />, label: "Settings" },
    { 
      icon: <Menu size={20} />, 
      label: "Modules", 
      isMenu: true,
      action: () => setIsMenuOpen(!isMenuOpen)
    },
  ];

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.1;
    return 1;
  };

  const handleItemClick = (index: number, item: NavItem) => {
    if (item.action) {
      item.action();
    } else {
      setActiveIndex(index);
      setIsMenuOpen(false); // Close menu if clicking other items
    }
  };

  return (
    <>
      {/*
        POPUP MENU CONTAINER
        Positioned relative to the dock (fixed bottom).
      */}
      <div
        ref={menuRef}
        className={`
          fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-50
          w-[90vw] max-w-[420px] origin-bottom
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isMenuOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
        `}
      >
        <div className="bg-[--color-card]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[--color-border] ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[70vh]">

          {/* Header */}
          <div className="px-6 py-4 border-b border-[--color-border]/50 bg-[--color-bg-secondary]/50 backdrop-blur-md flex items-center justify-between">
             <h3 className="font-bold text-[--color-text-primary] flex items-center gap-2 text-sm tracking-tight">
               <div className="w-2 h-2 rounded-full bg-[--color-primary] animate-pulse"></div>
               Fogsly Ecosystem
             </h3>
             <span className="text-[10px] font-semibold text-[--color-text-secondary] uppercase tracking-wider">Quick Access</span>
          </div>

          {/* Icon Grid (App Drawer Style) */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-4 gap-x-4 gap-y-6 place-items-center">
              {fogslyModules.map((module, idx) => (
                <div
                  key={idx}
                  onClick={() => handleModuleClick(module)}
                  className="group relative flex items-center justify-center transition-all duration-300 hover:-translate-y-1 cursor-pointer p-2"
                  title={module.name}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleModuleClick(module);
                    }
                  }}
                  style={{ minWidth: '60px', minHeight: '60px' }}
                >
                  {/* Icon Only - No Box, No Text */}
                  <img
                    src={module.icon}
                    alt={module.name}
                    className="w-14 h-14 object-contain filter drop-shadow-md group-hover:drop-shadow-xl group-hover:scale-110 transition-all duration-300"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  />

                  {/* Subtle Glow on Hover */}
                  <div className="absolute inset-0 bg-[--color-primary]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ pointerEvents: 'none' }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Promo Area */}
          <div className="p-3 bg-[--color-bg-secondary]/80 border-t border-[--color-border]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[--color-bg-tertiary] to-[--color-bg-secondary] p-3 shadow-lg group cursor-pointer border border-[--color-border]">
               {/* Decorative Glow */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-[--color-primary]/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[--color-primary]/30 transition-colors"></div>

               <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                       <ExternalLink size={12} className="text-[--color-accent]" />
                       <span className="text-[10px] font-bold text-[--color-accent] uppercase tracking-wider">New Feature</span>
                    </div>
                    <p className="text-xs font-medium text-[--color-text-primary]">AI Automation Tools</p>
                  </div>
                  <div className="bg-[--color-primary]/10 hover:bg-[--color-primary]/20 text-[--color-primary] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors">
                    Try Now
                  </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {/*
        FLOATING DOCK - Hidden on mobile
      */}
      <div
        ref={menuRef} // Using ref here too to detect clicks inside dock vs outside
        className="hidden md:flex fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full justify-center pointer-events-none"
      >
        <div className="pointer-events-auto bg-[--color-card]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-2.5 md:p-3 border border-[--color-border] flex items-end gap-1.5 md:gap-3 ring-1 ring-black/5">
          {navItems.map((item, index) => {
            const scale = getScale(index);
            const isActive = activeIndex === index && !item.isMenu;
            const isMenuOpenState = item.isMenu && isMenuOpen;

            return (
              <button
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleItemClick(index, item)}
                className={`
                  relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ease-out
                  w-10 h-10 md:w-12 md:h-12
                  /* No background classes here */
                `}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'bottom',
                }}
              >
                <div
                  className={`transition-colors duration-200 ${
                    isMenuOpenState ? "text-[--color-primary] drop-shadow-md" :
                    isActive ? "text-[--color-primary]" : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { size: 22, strokeWidth: isActive || isMenuOpenState ? 2.5 : 2 })}
                </div>

                {/* Tooltip */}
                <div
                  className={`
                    hidden md:block absolute bottom-full mb-3 px-2.5 py-1 bg-[--color-bg-tertiary] text-[--color-text-primary] text-[10px] font-bold rounded-md whitespace-nowrap shadow-xl
                    transition-all duration-200 pointer-events-none border border-[--color-border]
                    ${hoveredIndex === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}
                  `}
                >
                  {item.label}
                </div>

                {/* Active Dot indicator */}
                {(isActive || isMenuOpenState) && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[--color-primary] rounded-full shadow-glow" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};