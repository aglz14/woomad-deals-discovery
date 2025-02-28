import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocalización no está disponible en este navegador");
      return;
    }

    setIsLoading(true);

    const successHandler = (position: GeolocationPosition) => {
      console.log("Ubicación obtenida:", position.coords.latitude, position.coords.longitude);
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setIsLoading(false);
    };

    const errorHandler = (error: GeolocationPositionError) => {
      console.error("Error al obtener la ubicación:", error.message);
      setError(error);
      setIsLoading(false);

      // Si falla la geolocalización, proporcionar una ubicación predeterminada
      // (esta ubicación es Madrid, España, pero puedes cambiarla)
      setUserLocation({
        lat: 40.4168,
        lng: -3.7038,
      });
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
  }, []);

  return { userLocation, isLoading, error };
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Validar entrada
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.warn("Coordenadas inválidas para calcular distancia:", { lat1, lon1, lat2, lon2 });
      return Infinity; // Devolver un valor grande para que no se considere cercano
    }

    const R = 6371; // Radio de la tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en km

    console.log(`Distancia calculada entre [${lat1},${lon1}] y [${lat2},${lon2}]: ${d.toFixed(2)}km`);
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };


// Example usage (assuming you have arrays of promotions, stores, and malls with latitude and longitude)
//  const promotions = [{name: "Promo 1", lat: 40.7128, lng: -74.0060}, ...]
//  const stores = [{name: "Store A", lat: 40.7128, lng: -74.0060}, ...]
//  const malls = [{name: "Mall X", lat: 40.7128, lng: -74.0060}, ...]


// function findNearby(userLocation: Location | null, locations: {name: string; lat:number; lng:number}[]) {
//     if (!userLocation) return [];
//     return locations.filter(location => calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng) < 5); // 5km radius
// }

// const nearbyPromotions = findNearby(userLocation, promotions);
// const nearbyStores = findNearby(userLocation, stores);
// const nearbyMalls = findNearby(userLocation, malls);