
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '@/types/store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

// Using the environment variable that's already set up
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHNqOXB2ZnMwMGR6MnFxcmM1bTlkNDJ0In0.V4pdj5knKuHrHhbDhKQ2kg';

export const LocationMap = ({ userLocation, className = "" }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-99.1332, 19.4326], // Default to Mexico City if no user location
      zoom: userLocation ? 12 : 5
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

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [userLocation]);

  // Update markers when malls data changes
  useEffect(() => {
    if (!map.current || !malls) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    malls.forEach(mall => {
      const storeCount = mall.stores?.length || 0;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'relative';
      el.innerHTML = `
        <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
          ${storeCount}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-gray-900">${mall.name}</h3>
            <p class="text-sm text-gray-600">${mall.address}</p>
            <p class="text-sm text-purple-600 mt-1">${storeCount} tiendas</p>
          </div>
        `);

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([mall.longitude, mall.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [malls, map.current]);

  return (
    <div ref={mapContainer} className={`w-full h-[400px] rounded-lg shadow-lg ${className}`} />
  );
};
