
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
    lng: -74.006,
    lat: 40.7128,
  });
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Fetch Mapbox token with better error handling
  const { data: mapboxToken, isLoading: isTokenLoading, error: tokenError } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      console.log('Fetching Mapbox token...');
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'MAPBOX_TOKEN');
      
      if (error) {
        console.error('Error fetching token:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('No token found in secrets');
        throw new Error('Mapbox token not found');
      }
      
      console.log('Token retrieved successfully');
      return data[0].value;
    },
    retry: 1,
  });

  // Fetch nearby malls
  const { data: malls } = useQuery({
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

    console.log('Initializing map with token:', mapboxToken.substring(0, 8) + '...');
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
      });

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
            zoom: 12,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Using default location.");
        }
      );

      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');
        setIsMapLoading(false);
      });

      // Add markers for malls when they're loaded
      if (malls) {
        malls.forEach((mall) => {
          const marker = new mapboxgl.Marker()
            .setLngLat([mall.longitude, mall.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <h3 class="text-lg font-semibold">${mall.name}</h3>
                  <p class="text-sm text-gray-600">${mall.address}</p>
                  ${mall.description ? `<p class="text-sm mt-2">${mall.description}</p>` : ''}
                  <a href="/mall/${mall.id}" class="text-purple-600 hover:underline text-sm block mt-2">View Details →</a>
                `)
            )
            .addTo(map.current!);
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Could not initialize the map. Please try again later.");
      setIsMapLoading(false);
    }

    return () => {
      if (map.current) {
        console.log('Cleaning up map instance');
        map.current.remove();
      }
    };
  }, [mapboxToken, malls]);

  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">
          Error loading map: Could not retrieve Mapbox token
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
