
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '@/types/store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

// Set the access token directly
mapboxgl.accessToken = 'pk.eyJ1IjoiYWdsejE0IiwiYSI6ImNtN24wMTV2cjByMncybHBycHAwMGQ3aG4ifQ.R5Qpb4QfKpXvuRLNt1yf-g';

export const LocationMap = ({ userLocation, className = "" }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

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

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation ? [userLocation.lng, userLocation.lat] : [-99.1332, 19.4326], // Default to Mexico City if no user location
        zoom: userLocation ? 12 : 5,
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
      });
    } catch (error) {
      console.error('Error initializing map:', error);
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
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
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

  return (
    <div ref={mapContainer} className={`relative w-full h-[400px] rounded-lg shadow-lg bg-white z-10 ${className}`} />
  );
};
