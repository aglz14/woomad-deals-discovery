
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Location {
  lng: number;
  lat: number;
}

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<Location>({
    lng: -74.006,
    lat: 40.7128,
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN"; // We'll handle this securely
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
      }
    );

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
