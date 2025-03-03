import { useLocationContext } from '@/contexts/LocationContext';

export const useLocation = () => {
  const {
    userLocation,
    isLoading,
    error,
    requestLocationPermission,
    calculateDistance
  } = useLocationContext();

  return {
    userLocation,
    isLoading,
    locationError: error,
    requestLocationPermission,
    calculateDistance
  };
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};
import { useState, useEffect } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocalización no está soportada por tu navegador');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
          console.log("Location obtained successfully:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          
          let errorMessage = 'Error al obtener tu ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Acceso a la ubicación denegado. Por favor, activa el permiso de ubicación en tu navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'La información de tu ubicación no está disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'La solicitud de ubicación ha expirado.';
              break;
          }
          
          setLocationError(errorMessage);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000
        }
      );
    };

    getUserLocation();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  return { userLocation, locationError, isLoading, calculateDistance };
};
