# PWA Installation Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Visits FOGSLY Website                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Service Worker Registers (Background)               │
│                    ✅ Enables Offline Support                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Check Installation Status                      │
│                                                                   │
│   ┌─────────────────┬─────────────────┬────────────────────┐   │
│   │ Already         │ Dismissed       │ Never Seen         │   │
│   │ Installed?      │ Recently?       │ Before?            │   │
│   └────────┬────────┴────────┬────────┴─────────┬─────────┘   │
│            │                 │                   │              │
│            ▼                 ▼                   ▼              │
│     ❌ Don't Show     ❌ Don't Show      ✅ Show Popup        │
└─────────────────────────────────────────────────┬──────────────┘
                                                   │
                                                   ▼
              ┌────────────────────────────────────────────────┐
              │          POPUP APPEARS (3 sec delay)           │
              │                                                │
              │  ┌─────────────────────────────────────────┐  │
              │  │  Install FOGSLY App                     │  │
              │  │  [FREE]                                 │  │
              │  │                                         │  │
              │  │  ✓ Quick access from home screen       │  │
              │  │  ✓ Works offline                       │  │
              │  │  ✓ Native app-like experience          │  │
              │  └─────────────────────────────────────────┘  │
              └────────────┬───────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Install  │   │ Not Now  │   │  Close   │
    │   Now    │   │  Button  │   │  Button  │
    └─────┬────┘   └─────┬────┘   └─────┬────┘
          │              │              │
          │              │              │
          │              ▼              ▼
          │       Track Dismissal  Track Dismissal
          │       Wait 24 hours    Wait 24 hours
          │
          ▼
   ┌─────────────────────────────────────────────┐
   │        DEVICE TYPE DETECTION                │
   ├─────────────────────────────────────────────┤
   │                                             │
   │  Chrome/Edge/Samsung Internet:              │
   │  ├─ Show native browser install prompt     │
   │  └─ One-click installation                 │
   │                                             │
   │  iOS Safari:                                │
   │  ├─ Show step-by-step instructions         │
   │  ├─ 1. Tap Share button                    │
   │  ├─ 2. Tap "Add to Home Screen"            │
   │  └─ 3. Tap "Add"                            │
   │                                             │
   │  Android (Fallback):                        │
   │  ├─ Show manual instructions                │
   │  ├─ 1. Tap menu (⋮)                         │
   │  ├─ 2. Tap "Install app"                    │
   │  └─ 3. Tap "Install"                        │
   │                                             │
   │  Desktop (Fallback):                        │
   │  ├─ Show manual instructions                │
   │  ├─ 1. Click install icon in address bar   │
   │  ├─ 2. Or use browser menu                 │
   │  └─ 3. Click "Install"                      │
   └─────────────┬───────────────────────────────┘
                 │
                 ▼
   ┌─────────────────────────────────────────────┐
   │     USER COMPLETES INSTALLATION             │
   │                                             │
   │  ✅ App installed to device                 │
   │  ✅ Icon appears on home screen/desktop     │
   │  ✅ Installation tracked in localStorage    │
   │  ✅ Popup never shows again                 │
   └─────────────┬───────────────────────────────┘
                 │
                 ▼
   ┌─────────────────────────────────────────────┐
   │        USER LAUNCHES APP                    │
   │                                             │
   │  • Opens in standalone window               │
   │  • No browser UI (address bar, etc.)        │
   │  • Looks like native app                    │
   │  • Works offline (cached content)           │
   │  • Fast loading                             │
   └─────────────────────────────────────────────┘
```

## Smart Tracking Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRACKING SYSTEM                               │
└─────────────────────────────────────────────────────────────────┘

LocalStorage Keys:
├─ fogsly-app-download-attempted: "true" | null
├─ fogsly-app-download-date: ISO date string
├─ fogsly-app-popup-dismiss-count: number
└─ fogsly-app-popup-last-dismiss: ISO date string


Decision Tree:
┌───────────────────────────────────────────────┐
│ Has user installed? (download-attempted)     │
├───────────────────────────────────────────────┤
│ YES → ❌ Never show popup again               │
│ NO  → Continue checking...                    │
└─────────────────┬─────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────┐
│ Hours since last dismiss < 24?                │
├───────────────────────────────────────────────┤
│ YES → ❌ Don't show (wait 24 hours)           │
│ NO  → Continue checking...                    │
└─────────────────┬─────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────┐
│ Dismiss count >= 3?                           │
├───────────────────────────────────────────────┤
│ YES → Check if 7 days passed                  │
│       ├─ < 7 days → ❌ Don't show             │
│       └─ >= 7 days → ✅ Show popup            │
│ NO  → ✅ Show popup                            │
└───────────────────────────────────────────────┘
```

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  App.tsx                                                         │
│  ├─ Registers Service Worker                                    │
│  ├─ Manages popup state                                         │
│  ├─ Checks allowed routes                                       │
│  └─ Listens for 'appinstalled' event                            │
│                                                                  │
│  AppDownloadPopup.tsx                                            │
│  ├─ Detects device type (iOS/Android/Desktop)                   │
│  ├─ Listens for 'beforeinstallprompt' event                     │
│  ├─ Shows appropriate UI/instructions                           │
│  ├─ Triggers native install prompt                              │
│  └─ Tracks user actions                                         │
│                                                                  │
│  appDownloadUtils.ts                                             │
│  ├─ Tracking helper functions                                   │
│  ├─ LocalStorage management                                     │
│  ├─ Testing utilities                                           │
│  └─ Decision logic                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PWA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  manifest.json                                                   │
│  ├─ App name and description                                    │
│  ├─ Icons (192x192, 512x512)                                    │
│  ├─ Theme color                                                 │
│  ├─ Display mode (standalone)                                   │
│  └─ Start URL                                                   │
│                                                                  │
│  service-worker.js                                               │
│  ├─ Install event → Cache assets                                │
│  ├─ Activate event → Clean old caches                           │
│  ├─ Fetch event → Serve cached content                          │
│  └─ Offline support                                             │
│                                                                  │
│  index.html                                                      │
│  ├─ <link rel="manifest">                                       │
│  ├─ <meta name="theme-color">                                   │
│  └─ Apple touch icon                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER APIs                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  beforeinstallprompt event (Chrome/Edge)                         │
│  appinstalled event (All browsers)                               │
│  navigator.serviceWorker.register()                              │
│  window.matchMedia('(display-mode: standalone)')                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
Fogsly-Freelance/
│
├── components/
│   └── AppDownloadPopup.tsx          # Main popup component
│
├── utils/
│   └── appDownloadUtils.ts           # Tracking utilities
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── service-worker.js             # Service Worker
│   ├── Favicon.png                   # App icon (current)
│   ├── icon-192.png                  # TODO: Create this
│   └── icon-512.png                  # TODO: Create this
│
├── App.tsx                            # Main app + SW registration
├── index.html                         # PWA meta tags
│
├── APP_DOWNLOAD_POPUP_README.md      # Full documentation
└── PWA_SETUP_GUIDE.md                # Quick setup guide
```

## Browser Compatibility Matrix

```
┌────────────────────┬─────────────┬──────────────┬───────────────┐
│ Browser            │ Auto Prompt │ Manual Steps │ Offline       │
├────────────────────┼─────────────┼──────────────┼───────────────┤
│ Chrome (Desktop)   │     ✅      │      ✅      │      ✅       │
│ Chrome (Android)   │     ✅      │      ✅      │      ✅       │
│ Edge (Desktop)     │     ✅      │      ✅      │      ✅       │
│ Samsung Internet   │     ✅      │      ✅      │      ✅       │
│ Safari (iOS)       │     ❌      │      ✅      │      ✅       │
│ Safari (macOS)     │     ❌      │      ❌      │      ❌       │
│ Firefox            │     ❌      │      ⚠️      │      ✅       │
│ Opera              │     ✅      │      ✅      │      ✅       │
└────────────────────┴─────────────┴──────────────┴───────────────┘

✅ Fully Supported
⚠️  Limited Support
❌ Not Supported
```

---

**Visual Guide Created**: January 2025  
**For**: FOGSLY PWA Installation Feature
