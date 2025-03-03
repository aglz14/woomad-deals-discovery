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