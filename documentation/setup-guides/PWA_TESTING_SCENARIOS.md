# PWA Installation - Testing Scenarios

## Test Scenario 1: First-Time Visitor (Chrome Desktop)

### Setup
```javascript
// Reset tracking
window.appDownloadTracking.reset()
// Reload page
location.reload()
```

### Expected Behavior
1. ✅ Service Worker registers successfully
2. ✅ After 3 seconds, popup appears
3. ✅ Popup shows "Install Now" button (Chrome/Edge)
4. ✅ Click "Install Now" → Browser shows install dialog
5. ✅ Click "Install" → App installs
6. ✅ FOGSLY opens in standalone window
7. ✅ Popup never appears again

### Verify
```javascript
window.appDownloadTracking.getData()
// Should show: { hasDownloaded: true, shouldShow: false }
```

---

## Test Scenario 2: First-Time Visitor (iPhone Safari)

### Setup
```javascript
// Reset tracking
window.appDownloadTracking.reset()
// Reload page
location.reload()
```

### Expected Behavior
1. ✅ After 3 seconds, popup appears
2. ✅ Shows iOS-specific instructions:
   - Step 1: Tap Share button
   - Step 2: Tap "Add to Home Screen"
   - Step 3: Tap "Add"
3. ✅ Follow instructions manually
4. ✅ App icon appears on home screen
5. ✅ Popup shows again on next visit (can't auto-detect iOS install)

### Verify
- Check home screen for FOGSLY icon
- Tap icon → Opens in full screen (no Safari UI)

---

## Test Scenario 3: User Dismisses Popup

### Setup
```javascript
// Reset tracking
window.appDownloadTracking.reset()
// Reload page
location.reload()
```

### Expected Behavior
1. ✅ Popup appears after 3 seconds
2. ✅ Click "Not now" or X button
3. ✅ Popup closes
4. ✅ Reload page → Popup does NOT appear
5. ✅ Wait 24 hours (or simulate):
   ```javascript
   // Simulate 25 hours passing
   const past = new Date(Date.now() - (25 * 60 * 60 * 1000));
   localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());
   location.reload();
   ```
6. ✅ Popup appears again

### Verify
```javascript
window.appDownloadTracking.getData()
// Should show dismissCount, hoursSinceLastDismiss, etc.
```

---

## Test Scenario 4: Persistent Dismisser (3+ times)

### Setup
```javascript
// Simulate 3 dismissals
localStorage.setItem('fogsly-app-popup-dismiss-count', '3');
const recent = new Date(Date.now() - (1 * 60 * 60 * 1000)); // 1 hour ago
localStorage.setItem('fogsly-app-popup-last-dismiss', recent.toISOString());
location.reload();
```

### Expected Behavior
1. ✅ Popup does NOT appear (dismissed 3+ times recently)
2. ✅ Simulate 8 days passing:
   ```javascript
   const past = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000));
   localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());
   location.reload();
   ```
3. ✅ Popup appears again (been a week)

### Verify
```javascript
window.appDownloadTracking.getData()
// Check daysSinceLastDismiss > 7
```

---

## Test Scenario 5: Already Installed (Chrome Desktop)

### Setup
1. Install app first (Test Scenario 1)
2. Close standalone app
3. Visit website in browser again

### Expected Behavior
1. ✅ Service Worker is active
2. ✅ Popup does NOT appear (already installed)
3. ✅ Console shows: `hasDownloaded: true`

### Verify
```javascript
window.appDownloadTracking.getData()
// { hasDownloaded: true, shouldShow: false }
```

---

## Test Scenario 6: Offline Functionality

### Setup
1. Install app (Test Scenario 1)
2. Open DevTools → Network tab
3. Set throttling to "Offline"

### Expected Behavior
1. ✅ Previously visited pages still load
2. ✅ Cached content displays correctly
3. ✅ New pages may not load (not cached)

### Verify
- Check DevTools → Application → Cache Storage
- Should see cached assets

---

## Test Scenario 7: Different Routes

### Setup
```javascript
window.appDownloadTracking.reset()
```

### Expected Behavior
Test each route:

| Route | Should Show Popup? |
|-------|-------------------|
| `/` (home) | ✅ Yes |
| `/fog-services` | ✅ Yes |
| `/find-work` | ✅ Yes |
| `/tasker-hub` | ✅ Yes |
| `/dashboard` | ✅ Yes |
| `/profile` | ✅ Yes |
| `/auth` | ❌ No |
| `/forgot-password` | ❌ No |
| `/admin-dashboard` | ❌ No |

### Verify
Navigate to each route and check popup appears/doesn't appear as expected.

---

## Test Scenario 8: Service Worker Registration

### Setup
1. Fresh browser session
2. Open DevTools → Application → Service Workers

### Expected Behavior
1. ✅ Navigate to FOGSLY website
2. ✅ Console logs: "✅ Service Worker registered successfully"
3. ✅ DevTools shows service worker as "activated and running"
4. ✅ Scope: `https://your-domain.com/` (or localhost)

### Verify
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Registered' : 'Not registered');
  if (reg) console.log('Scope:', reg.scope);
});
```

---

## Test Scenario 9: Manifest Validation

### Setup
1. Open DevTools → Application → Manifest

### Expected Behavior
1. ✅ Manifest loads without errors
2. ✅ Shows app name: "FOGSLY - Freelance & Services Platform"
3. ✅ Shows short name: "FOGSLY"
4. ✅ Icons display correctly
5. ✅ Theme color matches design

### Verify
- Check for any warnings in console
- Verify all fields are populated

---

## Test Scenario 10: Lighthouse PWA Audit

### Setup
1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Click "Generate report"

### Expected Results
✅ **Required Criteria:**
- Installable
- PWA optimized
- Service Worker registered
- Manifest exists
- HTTPS (production only)

✅ **Target Score:** 90-100

### Common Issues & Fixes
| Issue | Fix |
|-------|-----|
| "Page not served over HTTPS" | Deploy with SSL (production) |
| "No matching service worker detected" | Check service-worker.js path |
| "Manifest doesn't have maskable icon" | Update manifest with maskable icons |
| "No start_url in manifest" | Already added ✅ |

---

## Test Scenario 11: App Installation Event

### Setup
```javascript
// Add event listener in console
window.addEventListener('appinstalled', (evt) => {
  console.log('🎉 App installed event fired!');
  alert('FOGSLY app installed successfully!');
});
```

### Expected Behavior
1. ✅ Click "Install Now" button
2. ✅ Complete installation in browser dialog
3. ✅ Event fires → Alert shows
4. ✅ Console logs: "✅ PWA was installed successfully!"

---

## Test Scenario 12: Multiple Devices

### Setup
Test on different devices/browsers:

### Chrome Desktop (Windows/Mac)
```
✅ Auto prompt: Yes
✅ Manual steps: Yes
✅ Offline: Yes
✅ Standalone: Yes
```

### Chrome Android
```
✅ Auto prompt: Yes
✅ Manual steps: Yes
✅ Offline: Yes
✅ Standalone: Yes
✅ Home screen icon: Yes
```

### Safari iOS
```
❌ Auto prompt: No
✅ Manual steps: Yes (Share → Add to Home Screen)
✅ Offline: Yes
✅ Standalone: Yes
✅ Home screen icon: Yes
```

### Edge Desktop
```
✅ Auto prompt: Yes
✅ Manual steps: Yes
✅ Offline: Yes
✅ Standalone: Yes
```

---

## Test Scenario 13: Uninstall & Reinstall

### Setup
1. Install app
2. Uninstall app (from OS/browser)
3. Visit website again

### Expected Behavior
1. ✅ localStorage still shows `hasDownloaded: true`
2. ✅ Popup does NOT appear automatically
3. ✅ Clear tracking:
   ```javascript
   window.appDownloadTracking.reset()
   location.reload()
   ```
4. ✅ Popup appears again
5. ✅ Can reinstall

---

## Test Scenario 14: Production Deployment

### Pre-Deployment Checklist
```
□ Create icon-192.png (192x192)
□ Create icon-512.png (512x512)
□ Update manifest.json with icon paths
□ Verify HTTPS is enabled
□ Test service worker registers
□ Test manifest is accessible
□ Run Lighthouse audit (score >90)
□ Test on Chrome Desktop
□ Test on Chrome Android
□ Test on Safari iOS
□ Verify offline functionality
□ Check console for errors
□ Test installation flow end-to-end
```

### Post-Deployment Verification
1. Visit production URL
2. Check DevTools → Application
3. Verify no SSL errors
4. Run Lighthouse audit
5. Test actual installation
6. Verify app opens correctly

---

## Quick Testing Commands

### Reset Everything
```javascript
window.appDownloadTracking.reset()
location.reload()
```

### Check Current Status
```javascript
window.appDownloadTracking.getData()
```

### Force Popup to Show
```javascript
// Warning: This bypasses safety checks
// Clear all tracking and reload
localStorage.removeItem('fogsly-app-download-attempted');
localStorage.removeItem('fogsly-app-popup-last-dismiss');
location.reload();
```

### Simulate 24 Hours Passing
```javascript
const past = new Date(Date.now() - (25 * 60 * 60 * 1000));
localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());
location.reload();
```

### Simulate 7 Days Passing
```javascript
const past = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000));
localStorage.setItem('fogsly-app-popup-last-dismiss', past.toISOString());
location.reload();
```

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Registered');
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active);
  } else {
    console.log('❌ Not registered');
  }
});
```

### Check if App is Installed
```javascript
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ Running as installed app');
} else {
  console.log('ℹ️ Running in browser');
}
```

---

## Troubleshooting Guide

### Issue: Popup not appearing at all

**Check:**
1. Is tracking data preventing it?
   ```javascript
   window.appDownloadTracking.getData()
   ```
2. Are you on an allowed route?
3. Is there a JavaScript error in console?

**Fix:**
```javascript
window.appDownloadTracking.reset()
location.reload()
```

---

### Issue: "Install Now" button missing

**Possible Causes:**
- Not on Chrome/Edge/Samsung Internet
- Already installed
- Not capturing `beforeinstallprompt` event

**Check:**
1. Open console and look for: `beforeinstallprompt event fired`
2. If on iOS/Safari → Shows instructions instead (expected)

---

### Issue: Service Worker not registering

**Check:**
1. Is file at `/public/service-worker.js`?
2. Any console errors?
3. HTTPS enabled? (required in production)

**Fix:**
- Check file path
- Hard reload (Ctrl+Shift+R)
- Check DevTools → Application → Service Workers

---

### Issue: App not working offline

**Check:**
1. Is Service Worker active?
2. Have you visited pages to cache them?
3. Check cache in DevTools → Application → Cache Storage

**Note:** Only cached pages work offline. First visit requires internet.

---

## Success Metrics to Track

Consider tracking these metrics:

1. **Popup Shown**: How often does popup display?
2. **Install Rate**: % of users who click "Install Now"
3. **Dismissal Rate**: % of users who dismiss popup
4. **Return Rate**: % of users who dismiss and return
5. **Platform Breakdown**: iOS vs Android vs Desktop
6. **Successful Installs**: Actual completed installations

---

**Testing Guide Last Updated**: January 2025  
**Status**: Ready for Testing ✅
