
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";

interface Location {
  lng: number;
  lat: number;
}

interface ShoppingMall {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  image_url?: string;
}

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<Location>({
    lng: -100.3161,  // Default to a central location
    lat: 25.6714,
  });
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Fetch Mapbox token with better error handling
  const { data: mapboxToken, isLoading: isTokenLoading, error: tokenError } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'MAPBOX_TOKEN')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching token:', error);
        throw error;
      }
      
      return data.value;
    },
  });

  // Fetch nearby malls
  const { data: malls = [] } = useQuery({
    queryKey: ['shopping-malls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_malls')
        .select('*');
      
      if (error) throw error;
      return data as ShoppingMall[];
    },
    enabled: !!mapboxToken,
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",  // Changed to streets style for better visibility
        center: [userLocation.lng, userLocation.lat],
        zoom: 11,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Get user location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          };
          setUserLocation(newLocation);
          map.current?.flyTo({
            center: [newLocation.lng, newLocation.lat],
            zoom: 11,
            essential: true
          });
        },
        (error) => {
          console.log("Using default location, geolocation error:", error);
        }
      );

      // Add markers for malls
      malls.forEach((mall) => {
        if (mall.latitude && mall.longitude) {
          console.log('Adding marker for mall:', mall.name, 'at:', mall.latitude, mall.longitude);
          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat([mall.longitude, mall.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <h3 style="font-weight: 600; margin-bottom: 4px;">${mall.name}</h3>
                  <p style="font-size: 14px; color: #666;">${mall.address}</p>
                  ${mall.description ? `<p style="font-size: 14px; margin-top: 8px;">${mall.description}</p>` : ''}
                  <a href="/mall/${mall.id}" style="color: #6366f1; text-decoration: none; display: block; margin-top: 8px; font-size: 14px;">View Details →</a>
                `)
            )
            .addTo(map.current!);
        }
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapLoading(false);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Could not initialize the map. Please try again later.");
      setIsMapLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, malls, userLocation.lat, userLocation.lng]);

  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="font-semibold mb-2">Error loading map</p>
          <p className="text-sm">Could not retrieve Mapbox token. Please check your configuration.</p>
        </div>
      </div>
    );
  }

  if (isTokenLoading || isMapLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
