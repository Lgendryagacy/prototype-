# 🔧 Quick Debugging Guide - PWA Install Popup

## Issue 1: Install Button Not Showing

### Why This Happens
The "Install Now" button only appears when the browser fires the `beforeinstallprompt` event. This happens **ONLY** when:

1. ✅ Website meets PWA criteria (manifest + service worker)
2. ✅ User hasn't installed the app yet
3. ✅ Browser supports PWA (Chrome, Edge, Samsung Internet)
4. ❌ **HTTPS is required in production** (localhost is OK for testing)

### Check Console Logs
Open browser console (F12) and look for these messages:

```
✅ Device detected: {mobile: false, ios: false, android: false}
✅ App not installed yet - showing popup with instructions
✅ beforeinstallprompt event fired - Install button will appear
✅ Popup is now visible
```

### If You See:
- ✅ `beforeinstallprompt event fired` → Install button WILL appear
- ❌ No `beforeinstallprompt` message → You'll see manual instructions instead

### Testing in Different Browsers

#### Chrome/Edge Desktop ✅
```
Expected: "Install Now" button appears
If not: Shows manual instructions (click install icon in address bar)
```

#### Chrome Android ✅
```
Expected: "Install Now" button appears
If not: Shows manual instructions (tap menu → Install app)
```

#### Safari iOS ❌
```
Expected: No install button (not supported)
Shows: Step-by-step instructions for "Add to Home Screen"
```

#### Firefox ❌
```
Expected: Limited PWA support
Shows: Manual instructions
```

---

## Issue 2: Popup Not Reappearing After "Not Now"

### Old Behavior (FIXED)
- ❌ Waited 24 hours after dismissal
- ❌ Only allowed 3 dismissals

### New Behavior (CURRENT)
- ✅ Waits **1 hour** after dismissal
- ✅ Allows **5 dismissals** before 7-day wait

### Test It
```javascript
// 1. Dismiss popup
// 2. Check when it will reappear:
window.appDownloadTracking.getData()

// You should see:
{
  dismissCount: 1,
  hoursSinceLastDismiss: 0.01,  // Just dismissed
  shouldShow: false              // Wait 1 hour
}

// 3. Simulate 1 hour passing:
const past = new Date(Date.now() - (61 * 60 * 1000)); // 61 minutes ago
localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());
location.reload();

// Popup should appear again!
```

---

## Issue 3: Icon Not Showing (FIXED)

### Old Code
```tsx
<MonitorSmartphone className="w-8 h-8 text-white" /> // Generic icon
```

### New Code
```tsx
<img 
  src="/FOGCOIN_SITE_ICON.png"  // Your actual logo
  alt="FOGSLY Logo"
  className="w-12 h-12"
/>
```

### If Icon Still Missing
Check if file exists at: `public/FOGCOIN_SITE_ICON.png`

---

## Quick Test Commands

### Reset Everything & Test Fresh
```javascript
// Reset all tracking
window.appDownloadTracking.reset()

// Reload page
location.reload()

// Popup should appear in 2 seconds
```

### Check Current Status
```javascript
window.appDownloadTracking.getData()

// Expected output:
{
  hasDownloaded: false,
  downloadDate: null,
  dismissCount: 0,
  lastDismiss: null,
  hoursSinceLastDismiss: Infinity,
  daysSinceLastDismiss: Infinity,
  shouldShow: true  // ← Should be TRUE
}
```

### Force Popup to Show (Bypass All Checks)
```javascript
// Clear all tracking
localStorage.removeItem('fogsly-app-download-attempted');
localStorage.removeItem('fogsly-app-popup-last-dismiss');
localStorage.removeItem('fogsly-app-popup-dismiss-count');

// Reload
location.reload();
```

### Simulate 1 Hour Passing
```javascript
// Set last dismiss to 61 minutes ago
const past = new Date(Date.now() - (61 * 60 * 1000));
localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());

// Reload
location.reload();
```

---

## Console Debug Output

When popup loads, you should see:

```
Device detected: {mobile: false, ios: false, android: false}
App not installed yet - showing popup with instructions
Popup is now visible
✅ Popup will be shown
```

If you see install button:
```
✅ beforeinstallprompt event fired - Install button will appear
```

When dismissed:
```
❌ Popup hidden: Dismissed X minutes ago
```

When already installed:
```
App is already installed - hiding popup
❌ Popup hidden: User already installed app
```

---

## Checklist for Install Button

For "Install Now" button to appear, ALL must be true:

- [ ] Using Chrome, Edge, or Samsung Internet
- [ ] Website has valid `manifest.json`
- [ ] Service Worker is registered
- [ ] HTTPS enabled (or localhost)
- [ ] App not already installed
- [ ] Browser fires `beforeinstallprompt` event

**If any is false → Shows manual instructions instead**

---

## Production Deployment

Before deploying, ensure:

1. ✅ **HTTPS Enabled** (required!)
2. ✅ Run Lighthouse PWA audit (score >90)
3. ✅ Test in Chrome Desktop
4. ✅ Test in Chrome Android
5. ✅ Test in Safari iOS
6. ✅ Verify icon loads correctly
7. ✅ Test dismissal and reappearance

---

## Common Issues & Solutions

### Issue: "beforeinstallprompt not firing"
**Solution**: 
- Check if Service Worker is registered (DevTools → Application)
- Verify manifest.json is valid
- Ensure HTTPS in production
- Try hard reload (Ctrl+Shift+R)

### Issue: "Popup never appears"
**Solution**:
```javascript
// Check console for this:
console.log(window.appDownloadTracking.getData());

// If shouldShow: false, clear tracking:
window.appDownloadTracking.reset();
location.reload();
```

### Issue: "Icon not loading"
**Solution**:
- Check file exists: `public/FOGCOIN_SITE_ICON.png`
- Check file path in manifest.json
- Check network tab for 404 errors
- Fallback icon will show if image fails

### Issue: "Popup shows too often"
**Solution**:
Increase the wait time in `App.tsx`:
```tsx
if (hoursSinceLastDismiss < 1) {  // Change to 3, 6, 12, or 24
```

### Issue: "Install button works but app doesn't install"
**Solution**:
- Check if all PWA criteria are met
- Run Lighthouse audit
- Check for console errors
- Verify manifest.json is correct

---

## Need More Help?

1. **Check Browser Console** - Look for error messages
2. **Check DevTools → Application** - Verify Service Worker and Manifest
3. **Run Lighthouse Audit** - Shows what's missing
4. **Use Debug Commands** - All commands listed above
5. **Check Network Tab** - Look for 404 errors

---

**Last Updated**: January 2025  
**Status**: All Issues Fixed ✅  
**New Timing**: 1 hour wait, 5 dismissals max
