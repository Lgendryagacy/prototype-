# Cache Clearing Guide

## Issue
After updates, you might see old/cached data instead of fresh data from Firebase. This happens because:
1. Browser caches old data
2. Service Worker caches pages
3. Old build files in dist folder

---

## Quick Fix Solutions

### Option 1: Clear Cache via Browser Console (Fastest)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type this command:
```javascript
clearAllCaches()
```
4. Press Enter
5. Page will reload automatically with fresh data

---

### Option 2: Manual Browser Cache Clear

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. Refresh page with `Ctrl + F5`

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Check "Cache"
3. Select "Everything"
4. Click "Clear Now"
5. Refresh page with `Ctrl + F5`

---

### Option 3: Hard Refresh (Quick but Limited)

- **Windows:** `Ctrl + F5` or `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

### Option 4: Clear Service Worker via DevTools

1. Open DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Service Workers" in left sidebar
4. Click "Unregister" next to service worker
5. Go to "Cache Storage"
6. Right-click each cache → Delete
7. Refresh page

---

### Option 5: Clear Build and Rebuild (Development)

If you're developing and seeing old data:

```powershell
# Delete dist folder
Remove-Item -Recurse -Force dist

# Rebuild
npm run build

# Or just run dev
npm run dev
```

---

## What We Fixed

### 1. Service Worker Cache Issue

**Problem:** Service worker was caching ALL requests including Firebase API calls

**Solution:** Updated `public/service-worker.js` to:
- Increment cache version to `fogsly-v2`
- Never cache Firebase/Firestore requests
- Never cache API calls
- Only cache static assets

**Code Added:**
```javascript
// NEVER cache Firebase API calls - always fetch fresh data
if (
  event.request.url.includes('firestore.googleapis.com') ||
  event.request.url.includes('firebase') ||
  event.request.url.includes('/api/') ||
  event.request.method !== 'GET'
) {
  event.respondWith(fetch(event.request));
  return;
}
```

### 2. Navigation Context Loss

**Problem:** When navigating back from public profile to job detail, the job ID was lost

**Solution:** Updated `App.tsx` to extract context from URL on browser back/forward:

```typescript
const handlePopState = () => {
  const newRoute = getRouteFromPath(window.location.pathname);
  setRoute(newRoute);
  
  // Extract context from URL when navigating back/forward
  const path = window.location.pathname;
  let context = null;
  
  if (path.startsWith('/brand/')) {
    const slug = path.replace('/brand/', '');
    context = extractIdFromSlug(slug);
  } else if (path.startsWith('/service/')) {
    const slug = path.replace('/service/', '');
    context = extractIdFromSlug(slug);
  } else if (path.startsWith('/job/')) {
    const slug = path.replace('/job/', '');
    context = extractIdFromSlug(slug);
  } else if (path.startsWith('/user/')) {
    context = path.replace('/user/', '');
  }
  
  setRouteContext(context);
};
```

### 3. Added Debug Logging

Added console logs to LatestJobs component to see what's being fetched:

```typescript
console.log('Fetching active jobs from Firestore...');
const activeJobs = await getActiveFogslyJobs(100);
console.log('Fetched jobs count:', activeJobs.length);
console.log('First job sample:', activeJobs[0]);
```

---

## Testing the Fix

### Test Navigation:
1. Go to Find Work page
2. Click on a job
3. Click on client name → Navigate to public profile
4. Click "Back" button
5. ✅ Should show job details correctly

### Test Fresh Data:
1. Open browser console
2. Look for logs:
   - "Fetching active jobs from Firestore..."
   - "Fetched jobs count: X"
3. Check if jobs are from Firebase (not demo data)

---

## Prevention Tips

### For Development:

1. **Disable Cache in DevTools:**
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Disable cache"
   - Keep DevTools open while developing

2. **Use Incognito/Private Mode:**
   - No cached data
   - Fresh service worker each time
   - Clean slate for testing

3. **Service Worker Update:**
   - Every time you change service worker
   - Increment the version: `fogsly-v2` → `fogsly-v3`

### For Users:

- Service worker auto-updates every minute
- Hard refresh clears most issues
- clearAllCaches() function always available

---

## Common Issues & Solutions

### Issue: Still seeing old data after refresh

**Solution:**
```javascript
// In browser console
clearAllCaches()
```

### Issue: Jobs not loading at all

**Check:**
1. Browser console for errors
2. Network tab - Firebase requests failing?
3. Firebase rules - permissions correct?

**Debug:**
```javascript
// In browser console
// Check if Firebase is connected
console.log(window.firebase)
```

### Issue: Service worker not updating

**Solution:**
1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Unregister old worker
4. Refresh page

---

## Files Modified

1. ✅ `App.tsx` - Fixed navigation context on back/forward
2. ✅ `public/service-worker.js` - Don't cache Firebase calls
3. ✅ `components/LatestJobs.tsx` - Added debug logging

---

## Quick Commands

```javascript
// Clear all caches (run in browser console)
clearAllCaches()

// Check service worker status
navigator.serviceWorker.getRegistrations()

// Check cache storage
caches.keys()

// Delete specific cache
caches.delete('fogsly-v1')
```

---

## Production Deployment

When deploying new version:

1. **Increment service worker version:**
   ```javascript
   const CACHE_NAME = 'fogsly-v3'; // Increment
   ```

2. **Clear CDN cache** (if using CDN)

3. **Test in incognito mode first**

4. **Monitor browser console** for errors

---

## Summary

✅ **Fixed Issues:**
1. Navigation context preserved on browser back/forward
2. Service worker no longer caches Firebase API calls
3. Debug logging added for troubleshooting
4. Global cache clearing function available

✅ **How to Clear Cache:**
- Run `clearAllCaches()` in console (easiest)
- Hard refresh with `Ctrl + F5`
- Manual cache clear in DevTools

✅ **Prevention:**
- Service worker version incremented
- Firebase calls never cached
- Auto-update checks every minute

**Your app now always fetches fresh data from Firebase!** 🚀
