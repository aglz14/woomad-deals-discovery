import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, MapPin } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '@/types/store';
import { Mall } from '@/types/mall';

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  className?: string;
  mallLocations?: Mall[];
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

export const LocationMap = ({ userLocation, className = "", mallLocations = [] }: LocationMapProps) => {
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

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
      });

      map.current = mapInstance;

      mapInstance.on('load', () => {
        console.log('Map loaded successfully');
        setMapReady(true);
      });

      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Error loading map');
      });

      return () => {
        mapInstance.remove();
        map.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map');
      toast.error('Could not load map. Please try again later.');
    }
  }, [userLocation]);

  // Add markers for user location and malls
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      markersRef.current.push(userMarker);

      // Center map on user location
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
        essential: true
      });
    }

    // Add mall markers
    const mallsToShow = mallLocations.length > 0 ? mallLocations : malls || [];
    if (mallsToShow.length > 0) {
      console.log('Adding markers for', mallsToShow.length, 'malls');

      mallsToShow.forEach(mall => {
        if (mall.latitude && mall.longitude) {
          // Create a custom popup with a button to view mall details
          const popupHtml = `
            <div>
              <strong>${mall.name}</strong>
              <p>${mall.address}</p>
              <button class="mapbox-popup-button" data-mall-id="${mall.id}" style="
                background-color: #3FB1CE; 
                color: white; 
                border: none; 
                padding: 5px 10px; 
                margin-top: 5px; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 12px;
              ">Ver detalles</button>
            </div>
          `;
          
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupHtml);

          const marker = new mapboxgl.Marker({ color: '#3FB1CE' })
            .setLngLat([mall.longitude, mall.latitude])
            .setPopup(popup)
            .addTo(map.current!);
          
          // Add the mall ID to the marker element for reference
          const markerElement = marker.getElement();
          markerElement.setAttribute('data-mall-id', mall.id);
          markerElement.style.cursor = 'pointer';
          
          // Also handle clicking directly on the marker
          markerElement.addEventListener('click', () => {
            // Open the popup
            marker.togglePopup();
          });

          markersRef.current.push(marker);
        }
      });
      
      // Add a global click listener to handle popup button clicks
      map.current.on('click', (e) => {
        // Check if clicked on a popup button
        const popupButtons = document.querySelectorAll('.mapbox-popup-button');
        popupButtons.forEach(button => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const mallId = button.getAttribute('data-mall-id');
            if (mallId) {
              window.location.href = `/mall/${mallId}`;
            }
          });
        });
      });
    }
  }, [malls, mallLocations, mapReady, userLocation]);

  if (mapError) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border border-red-300 bg-red-50 rounded-md h-64 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-700">Error loading map: {mapError}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`rounded-lg border overflow-hidden bg-gray-100 ${className}`} 
      style={{ minHeight: "300px" }}
    />
  );
};