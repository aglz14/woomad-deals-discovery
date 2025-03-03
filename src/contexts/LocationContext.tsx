
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

type Location = {
  lat: number;
  lng: number;
};

interface LocationContextType {
  userLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<void>;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (err: any) {
      console.error('Error getting location:', err);
      setError(err.message || 'Error al obtener ubicación');
      toast.error('No se pudo acceder a tu ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Request location on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      requestLocationPermission();
    } else {
      setError('Geolocalización no soportada en este navegador');
      setIsLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider value={{
      userLocation,
      isLoading,
      error,
      requestLocationPermission,
      calculateDistance
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
