// Geocoding and Google Maps utilities

let googleMapsScriptPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      googleMapsScriptPromise = null;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

export const initializeMap = (
  element: HTMLElement,
  location: { latitude: number; longitude: number },
  options: any = {}
): google.maps.Map => {
  if (!(window as any).google || !(window as any).google.maps) {
    throw new Error('Google Maps API not loaded');
  }

  const mapOptions: google.maps.MapOptions = {
    center: { lat: location.latitude, lng: location.longitude },
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    ...options
  };

  return new (window as any).google.maps.Map(element, mapOptions);
};

export const addMarker = (
  map: google.maps.Map,
  location: { latitude: number; longitude: number },
  draggable: boolean = false,
  onDragEnd?: (lat: number, lng: number) => void
): google.maps.Marker => {
  if (!(window as any).google || !(window as any).google.maps) {
    throw new Error('Google Maps API not loaded');
  }

  const marker = new (window as any).google.maps.Marker({
    position: { lat: location.latitude, lng: location.longitude },
    map,
    draggable
  });

  if (draggable && onDragEnd) {
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        onDragEnd(position.lat(), position.lng());
      }
    });
  }

  return marker;
};

export const geocodeAddress = async (
  address: string,
  city?: string,
  country?: string
): Promise<{ success: boolean; location?: { latitude: number; longitude: number; formatted_address: string }; error?: string }> => {
  try {
    await loadGoogleMapsScript();
    if (!(window as any).google || !(window as any).google.maps) {
      return { success: false, error: 'Google Maps not available' };
    }

    const fullAddress = [address, city, country].filter(Boolean).join(', ');
    const geocoder = new (window as any).google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address: fullAddress }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          resolve({
            success: true,
            location: {
              latitude: lat,
              longitude: lng,
              formatted_address: result.formatted_address || fullAddress
            }
          });
        } else {
          resolve({
            success: false,
            error: `Geocoding failed: ${status}`
          });
        }
      });
    });
  } catch (error: any) {
    console.error('Error during geocoding:', error);
    return {
      success: false,
      error: error?.message || 'Geocoding failed'
    };
  }
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ success: boolean; formatted_address?: string; error?: string }> => {
  try {
    await loadGoogleMapsScript();
    if (!(window as any).google || !(window as any).google.maps) {
      return { success: false, error: 'Google Maps not available' };
    }

    const geocoder = new (window as any).google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve({
            success: true,
            formatted_address: results[0].formatted_address
          });
        } else {
          resolve({
            success: false,
            error: `Reverse geocoding failed: ${status}`
          });
        }
      });
    });
  } catch (error: any) {
    console.error('Error during reverse geocoding:', error);
    return {
      success: false,
      error: error?.message || 'Reverse geocoding failed'
    };
  }
};

export const isValidLocation = (location: any): boolean => {
  if (!location || typeof location !== 'object') return false;
  const lat = Number(location.latitude ?? location.lat);
  const lng = Number(location.longitude ?? location.lng);
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);
};
