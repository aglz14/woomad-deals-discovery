
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '@/types/store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, MapPin } from "lucide-react";

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

// Validate and set Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWdsejE0IiwiYSI6ImNtN24wMTV2cjByMncybHBycHAwMGQ3aG4ifQ.R5Qpb4QfKpXvuRLNt1yf-g';

const isValidMapboxToken = (token: string): boolean => {
  return token.startsWith('pk.') && token.length > 50;
};

if (!isValidMapboxToken(MAPBOX_TOKEN)) {
  console.error('Invalid Mapbox token format');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export const LocationMap = ({ userLocation, className = "" }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { data: malls } = useQuery({
    queryKey: ['shopping-malls-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_malls')
        .select('*, stores(*)');
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!isValidMapboxToken(MAPBOX_TOKEN)) {
      const error = 'Error: Invalid map configuration';
      console.error(error);
      setMapError(error);
      toast.error(error);
      return;
    }

    try {
      const defaultCenter = [-99.1332, 19.4326]; // Mexico City
      const initialCenter = userLocation ? [userLocation.lng, userLocation.lat] : defaultCenter;
      const initialZoom = userLocation ? 12 : 5;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add user location control
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }));

      // Add attribution control
      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

      // Wait for map to load before doing anything else
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapReady(true);
      });

      // Handle any errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Error loading map components');
        toast.error('Error loading map components');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map interface');
      toast.error('Error initializing map interface');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapReady(false);
      }
    };
  }, [userLocation]);

  // Update markers when map is ready and malls data changes
  useEffect(() => {
    if (!mapReady || !map.current || !malls) return;

    console.log('Adding markers for', malls.length, 'malls');
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    malls.forEach(mall => {
      if (!mall.longitude || !mall.latitude) {
        console.warn('Mall missing coordinates:', mall.name);
        return;
      }

      const storeCount = mall.stores?.length || 0;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'relative';
      el.innerHTML = `
        <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
          ${storeCount}
        </div>
      `;

      // Create popup with clickable link and rich details
      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        maxWidth: '300px',
        className: 'mall-popup-container' // Custom class for styling
      })
        .setHTML(`
          <div class="p-3 border-b border-purple-100">
            <h3 class="font-bold text-gray-900 text-lg mb-1">${mall.name}</h3>
            <div class="flex items-start gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <p class="text-sm text-gray-600">${mall.address}</p>
            </div>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M9 9h.01"/></svg>
              <p class="text-sm text-purple-600 font-medium">${storeCount} tiendas</p>
            </div>
            ${mall.description ? `<p class="text-sm text-gray-500 mt-2 italic line-clamp-2">${mall.description}</p>` : ''}
          </div>
          <div class="p-3">
            <a href="/mall/${mall.id}" class="block w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-md font-medium text-sm transition-colors">Ver perfil completo</a>
          </div>
        `);

      // Add marker to map
      try {
        // Make the marker element clickable with improved interaction
        el.style.cursor = 'pointer';
        el.onclick = (e) => {
          // First show popup when clicking on marker
          marker.togglePopup();
          
          // Fly to the marker position with slight offset for popup visibility
          if (map.current) {
            // Get popup height to calculate proper offset
            const popupHeight = document.querySelector('.mapboxgl-popup-content')?.clientHeight || 200;
            
            // Center on marker with vertical offset to ensure popup is visible
            map.current.flyTo({
              center: [mall.longitude, mall.latitude],
              offset: [0, -popupHeight/2],
              zoom: Math.max(map.current.getZoom(), 13), // Ensure we're zoomed in enough
              duration: 800,
              essential: true
            });
          }
          
          // Prevent immediate navigation to allow users to read popup details
          e.stopPropagation();
          e.preventDefault();
        };
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([mall.longitude, mall.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error adding marker for mall:', mall.name, error);
      }
    });
  }, [malls, mapReady]);

  if (mapError) {
    return (
      <div className={`relative w-full h-[400px] rounded-lg bg-gray-100 flex flex-col items-center justify-center gap-4 ${className}`}>
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <p className="text-gray-600 mb-2">{mapError}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Reintentar cargar mapa</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={`relative w-full h-[400px] rounded-lg shadow-lg bg-white z-10 ${className}`} />
  );
};
import { useRef, useEffect, useState } from 'react';
import { UserLocation } from '@/hooks/use-location';
import { MapPin, AlertTriangle } from 'lucide-react';

interface LocationMapProps {
  userLocation: UserLocation | null;
  className?: string;
  mallLocations?: Array<{id: string; latitude: number; longitude: number; name: string}>;
}

export const LocationMap = ({ userLocation, className = '', mallLocations = [] }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Skip if map reference doesn't exist
    if (!mapRef.current) return;

    let mapInstance: google.maps.Map | null = null;
    let markers: google.maps.Marker[] = [];

    const initMap = async () => {
      try {
        // Check if Google Maps API is loaded
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API failed to load');
        }

        // Create map centered on user location or default to a central location
        const center = userLocation 
          ? { lat: userLocation.lat, lng: userLocation.lng } 
          : { lat: 19.4326, lng: -99.1332 }; // Default to Mexico City if no location

        mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom: userLocation ? 11 : 5,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        // Add user marker if location is available
        if (userLocation) {
          const userMarker = new google.maps.Marker({
            position: { lat: userLocation.lat, lng: userLocation.lng },
            map: mapInstance,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#4338CA',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            title: 'Tu ubicación',
          });
          
          // Add a circle to show user's location radius
          new google.maps.Circle({
            strokeColor: '#4338CA',
            strokeOpacity: 0.3,
            strokeWeight: 2,
            fillColor: '#4338CA',
            fillOpacity: 0.1,
            map: mapInstance,
            center: { lat: userLocation.lat, lng: userLocation.lng },
            radius: 5000, // 5km radius
          });
        }
        
        // Add mall markers
        if (mallLocations.length > 0) {
          console.log("Adding markers for", mallLocations.length, "malls");
          
          mallLocations.forEach(mall => {
            if (mall.latitude && mall.longitude) {
              const marker = new google.maps.Marker({
                position: { lat: mall.latitude, lng: mall.longitude },
                map: mapInstance,
                title: mall.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                }
              });
              
              markers.push(marker);
            }
          });
          
          // Adjust bounds to include all markers if we have user location
          if (userLocation && markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
            
            markers.forEach(marker => {
              bounds.extend(marker.getPosition()!);
            });
            
            mapInstance.fitBounds(bounds);
            
            // Don't zoom in too far
            const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
              if (mapInstance!.getZoom()! > 13) {
                mapInstance!.setZoom(13);
              }
              google.maps.event.removeListener(listener);
            });
          }
        }
        
        setIsMapLoaded(true);
        console.log("Map loaded successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Error al cargar el mapa. Por favor, recarga la página.");
      }
    };

    initMap();

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [userLocation, mallLocations]);

  if (mapError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-700">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!isMapLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};
