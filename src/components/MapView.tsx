
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Location {
  lng: number;
  lat: number;
}

interface Secret {
  value: string;
}

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<Location>({
    lng: -74.006,
    lat: 40.7128,
  });

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Get the Mapbox token from Supabase with proper type casting
        const { data, error } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'MAPBOX_TOKEN')
          .maybeSingle<Secret>();

        if (error) throw error;
        if (!data) throw new Error('Mapbox token not found');
        
        // Initialize map with the token
        mapboxgl.accessToken = data.value;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [userLocation.lng, userLocation.lat],
          zoom: 12,
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
              zoom: 12,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("Could not get your location. Using default location.");
          }
        );
      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Could not initialize the map. Please try again later.");
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
