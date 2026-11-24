# Map Integration Implementation

## Overview
Implemented Google Maps integration for Physical Jobs with two use cases:

### 1. Job Posting Form (FogPhysicalJobPost)
**Purpose:** Help employers verify their company location
- Auto-geocode address when entered
- Display interactive map with draggable marker
- Allow manual location adjustment
- Save accurate coordinates to Firebase

**Features:**
- Address field triggers geocoding on blur
- Map appears after successful geocoding
- Marker is draggable for fine-tuning
- Coordinates saved: latitude, longitude, formatted_address

### 2. Job Details Page (FogPhysicalJobDetailsPage)
**Purpose:** Show job seekers where the company is located
- Display company location on map
- "Get Directions" button → Opens Google Maps with route planning
- "Open in Maps" button → Opens location in Google Maps

**Features:**
- Non-draggable marker (display only)
- Two action buttons:
  - **Get Directions:** `https://www.google.com/maps/dir/?api=1&destination=lat,lng`
  - **Open in Maps:** `https://www.google.com/maps/search/?api=1&query=lat,lng`
- Shows company name and full address
- Responsive and glass-morphism design

## New Component Created

### `JobLocationMap.tsx`
Reusable map component for displaying job locations

**Props:**
- `location: JobLocation` - coordinates and address
- `companyName: string` - company name to display
- `showGetDirections?: boolean` - show action buttons (default: true)
- `height?: string` - map height (default: '400px')

**Features:**
- Automatically loads Google Maps script
- Displays location with marker
- Error handling with toast notifications
- Loading state with spinner
- Fallback UI if location unavailable

## User Flow

### For Job Posters:
1. Fill in company address
2. Click outside address field → Auto-geocoding starts
3. Map appears with marker at location
4. Drag marker to adjust if needed
5. Location coordinates saved automatically
6. Proceed to next step

### For Job Seekers:
1. View job details page
2. Scroll to location map in sidebar
3. See company location on map
4. Click "Get Directions" → Google Maps opens with route from current location
5. OR click "Open in Maps" → See location in full Google Maps

## Google Maps API Requirements

### APIs to Enable:
1. **Geocoding API** - Convert address to coordinates
2. **Maps JavaScript API** - Display interactive maps

### Environment Variable:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Files Modified/Created

### Created:
- `components/JobLocationMap.tsx` - Reusable map display component

### Modified:
- `components/FogPhysicalJobPost.tsx` - Added map for location verification
- `pages/FogPhysicalJobDetailsPage.tsx` - Added map display and navigation
- `utils/geocoding.ts` - Enhanced logging
- `.env.example` - Added Google Maps API key

## Technical Details

### Geocoding Process:
1. User enters address, city, country
2. On blur: `geocodeAddress(address, city, country)`
3. Returns: `{success: true, location: {latitude, longitude, formatted_address}}`
4. Location saved to form state
5. Map initialized with coordinates
6. Marker added at location

### Direction Links:
- **Get Directions API:** Opens Google Maps with route from user's current location
- **Search API:** Opens location in Google Maps for exploration

### Data Storage:
Location saved to Firebase as:
```typescript
location: {
  latitude: number,
  longitude: number,
  formatted_address: string
}
```

## Benefits

### For Employers:
✅ Verify location accuracy before posting
✅ Fine-tune marker position if geocoding is off
✅ Professional map display on job listings

### For Job Seekers:
✅ See exact company location
✅ One-click directions to interview
✅ Plan commute before applying
✅ Verify job location authenticity

## Future Enhancements

1. **Address Autocomplete** - Use Google Places Autocomplete
2. **Multiple Locations** - Support for jobs at multiple sites
3. **Travel Time** - Show estimated commute time
4. **Nearby Transit** - Show public transport options
5. **Street View** - Embed Street View of location
6. **Satellite View** - Toggle map type
7. **Traffic Layer** - Show current traffic conditions

---

**Status:** ✅ Complete and functional
**Testing:** Geocoding working, map display ready (enable Maps JavaScript API)
