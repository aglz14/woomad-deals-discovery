
import { useEffect, useState } from 'react';
import { geofencingService, Geofence } from '@/services/geofencing';
import { Mall } from '@/types/mall';
import { useLocation } from '@/hooks/use-location';

export const useGeofencing = (malls: Mall[] | null, radiusInMeters: number = 500) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { userLocation } = useLocation();
  
  // Initialize geofences when malls are loaded
  useEffect(() => {
    if (malls && malls.length > 0) {
      geofencingService.createGeofencesFromMalls(malls, radiusInMeters);
    }
    
    return () => {
      geofencingService.clearGeofences();
    };
  }, [malls, radiusInMeters]);
  
  // Start/stop monitoring based on user location
  useEffect(() => {
    if (userLocation && !isMonitoring) {
      startMonitoring();
    }
    
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [userLocation]);
  
  const startMonitoring = () => {
    geofencingService.startMonitoring();
    setIsMonitoring(true);
  };
  
  const stopMonitoring = () => {
    geofencingService.stopMonitoring();
    setIsMonitoring(false);
  };
  
  const addGeofence = (geofence: Geofence) => {
    geofencingService.addGeofence(geofence);
  };
  
  const removeGeofence = (id: string) => {
    geofencingService.removeGeofence(id);
  };
  
  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    addGeofence,
    removeGeofence
  };
};
