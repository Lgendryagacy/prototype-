import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, MonitorSmartphone, Share, Plus } from 'lucide-react';
import { Button } from './ui/Button';

interface AppDownloadPopupProps {
  onClose: () => void;
}

// BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppDownloadPopup = ({ onClose }: AppDownloadPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Detect device type
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const ua = userAgent.toLowerCase();
      
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const ios = /iphone|ipad|ipod/.test(ua);
      const android = /android/.test(ua);
      
      setIsMobile(mobile);
      setIsIOS(ios);
      setIsAndroid(android);
      
      console.log('Device detected:', { mobile, ios, android });
    };

    checkDevice();

    // Listen for the beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // console.log('✅ beforeinstallprompt event fired - Install button will appear');
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // console.log('App is already installed - hiding popup');
      // Don't show popup if already installed
      onClose();
      return;
    } else {
      console.log('App not installed yet - showing popup with instructions');
    }

    // Show popup after 2 seconds delay (reduced from 3)
    const timer = setTimeout(() => {
      setIsVisible(true);
      console.log('Popup is now visible');
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      // Track installation
      try {
        localStorage.setItem('fogsly-app-download-attempted', 'true');
        localStorage.setItem('fogsly-app-download-date', new Date().toISOString());
      } catch (error) {
        console.error('Error tracking installation:', error);
      }
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    // Close popup
    handleClose();
  };

  const handleNotNow = () => {
    // Track dismissal
    try {
      const dismissCount = parseInt(localStorage.getItem('fogsly-app-popup-dismiss-count') || '0');
      localStorage.setItem('fogsly-app-popup-dismiss-count', (dismissCount + 1).toString());
      localStorage.setItem('fogsly-app-popup-last-dismiss', new Date().toISOString());
    } catch (error) {
      console.error('Error tracking dismissal:', error);
    }

    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={handleNotNow}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`fixed z-[61] ${
              isMobile 
                ? 'bottom-4 left-4 right-4' 
                : 'bottom-8 right-8 w-full max-w-md'
            }`}
          >
            <div className="bg-gradient-to-br from-[--color-primary] to-[--color-primary]/80 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              {/* Close Button */}
              <button
                onClick={handleNotNow}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="p-6">
                {/* Icon and Badge */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/FOGCOIN_SITE_ICON.png" 
                      alt="FOGSLY Logo"
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const icon = document.createElement('div');
                          icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">Install FOGSLY App</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-semibold">
                        FREE
                      </span>
                    </div>
                    <p className="text-sm text-white/90">
                      Install our website as an app for quick access
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    <span>Quick access from your home screen</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    <span>Works offline with cached content</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    <span>Native app-like experience</span>
                  </div>
                </div>

                {/* Install/Instructions based on device */}
                <div className="space-y-3">
                  {/* Chrome/Edge/Samsung Internet (has install prompt) */}
                  {isInstallable && deferredPrompt && (
                    <>
                      <Button
                        onClick={handleInstallApp}
                        className="w-full hover:bg-[primary] text-[--color-primary] font-semibold h-12 shadow-lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Install Now
                      </Button>
                      <p className="text-xs text-white/70 text-center">
                        Click above to install FOGSLY as an app
                      </p>
                    </>
                  )}

                  {/* iOS Safari Instructions */}
                  {isIOS && !isInstallable && (
                    <div className="bg-white/10 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-white font-semibold mb-2">To install on iOS:</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            1
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            <span>Tap the</span>
                            <Share className="w-4 h-4" />
                            <span>Share button below</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            2
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            <span>Tap</span>
                            <Plus className="w-4 h-4" />
                            <span>"Add to Home Screen"</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            3
                          </div>
                          <span className="text-sm text-white/90">Tap "Add" to confirm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Android Chrome Instructions (fallback if prompt not captured) */}
                  {isAndroid && !isInstallable && (
                    <div className="bg-white/10 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-white font-semibold mb-2">To install on Android:</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            1
                          </div>
                          <span className="text-sm text-white/90">Tap the menu (⋮) in the browser</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            2
                          </div>
                          <span className="text-sm text-white/90">Tap "Install app" or "Add to Home screen"</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            3
                          </div>
                          <span className="text-sm text-white/90">Tap "Install" to confirm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop Chrome/Edge Instructions */}
                  {!isMobile && !isInstallable && (
                    <div className="bg-white/10 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-white font-semibold mb-2">To install on Desktop:</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            1
                          </div>
                          <span className="text-sm text-white/90">Click the install icon (⊕) in the address bar</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            2
                          </div>
                          <span className="text-sm text-white/90">Or go to Menu → "Install FOGSLY"</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                            3
                          </div>
                          <span className="text-sm text-white/90">Click "Install" in the popup</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Not Now Button */}
                  <button
                    onClick={handleNotNow}
                    className="w-full text-sm text-white/80 hover:text-white transition-colors py-2"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppDownloadPopup;
