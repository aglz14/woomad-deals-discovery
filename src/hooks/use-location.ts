
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Location {
  lat: number;
  lng: number;
}

export const MAX_DISTANCE_KM = 50; // Default max distance in kilometers

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [maxDistance, setMaxDistance] = useState(MAX_DISTANCE_KM);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("No pudimos obtener tu ubicación. Mostrando todas las ubicaciones.");
        }
      );
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const isWithinDistance = (lat: number, lng: number) => {
    if (!userLocation) return true; // If no location, show all
    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
    return distance <= maxDistance;
  };

  const formatDistance = (lat: number, lng: number): string => {
    if (!userLocation) return '';
    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
    return distance < 1 ? 
      `${Math.round(distance * 1000)}m` : 
      `${Math.round(distance)}km`;
  };

  return { 
    userLocation, 
    calculateDistance, 
    isWithinDistance, 
    formatDistance,
    maxDistance,
    setMaxDistance 
  };
};
