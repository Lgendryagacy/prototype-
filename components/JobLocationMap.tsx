import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { loadGoogleMapsScript, initializeMap, addMarker } from '../utils/geocoding';
import { JobLocation } from '../firebase/types/physicalJob';
import toast from 'react-hot-toast';

interface JobLocationMapProps {
  location: JobLocation;
  companyName: string;
  showGetDirections?: boolean;
  height?: string;
}

export const JobLocationMap: React.FC<JobLocationMapProps> = ({
  location,
  companyName,
  showGetDirections = true,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current || !location.latitude || !location.longitude) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // console.log('Loading map for location:', location);
        
        await loadGoogleMapsScript();
        
        // Clear previous map instance if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }
        
        const map = initializeMap(mapRef.current, location);
        mapInstanceRef.current = map;
        
        // Add non-draggable marker for display only
        const marker = addMarker(map, location, false);
        markerRef.current = marker;
        
        setMapLoaded(true);
        // console.log('Map loaded successfully');
      } catch (error) {
        console.error('Error loading map:', error);
        toast.error('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();

    // Cleanup function
    return () => {
      try {
        // Remove marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        
        // Clear map div innerHTML before React unmounts
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        
        mapInstanceRef.current = null;
      } catch (error) {
        console.error('Error cleaning up map:', error);
      }
    };
  }, [location]);

  const handleGetDirections = () => {
    // Open Google Maps in new tab with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const handleOpenInMaps = () => {
    // Open Google Maps at this location
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  if (!location.latitude || !location.longitude) {
    return (
      <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-8">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <MapPin className="w-5 h-5" />
          <p>Location information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] overflow-hidden">
      {/* Map Container */}
      <div className="w-full relative" style={{ height }}>
        {/* Loading Spinner Overlay - Separate from map container */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.85] dark:bg-white/[0.05] z-50 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
        {/* Map div - Always rendered */}
        <div 
          ref={mapRef}
          className="w-full h-full"
        />
      </div>

      {/* Location Info & Actions */}
      <div className="p-6 border-t border-blue-500/[0.15] dark:border-white/[0.1]">
        {/* Address */}
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{companyName}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{location.formatted_address}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {showGetDirections && (
          <div className="flex gap-3">
            <button
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                }}
              />
              <Navigation className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10 group-hover:-translate-y-0.5 transition-transform duration-300">Get Directions</span>
            </button>
            
            <button
              onClick={handleOpenInMaps}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-[20px] font-bold text-sm hover:-translate-y-0.5 transition-all duration-300 group"
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                border: `1px solid var(--color-border)`
              }}
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:-translate-y-0.5 transition-transform duration-300">Open in Maps</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobLocationMap;
