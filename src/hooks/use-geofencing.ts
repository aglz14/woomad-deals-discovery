import { useState, useEffect } from 'react';
import { useLocation } from './use-location';
import { Mall } from '@/types/mall';

export const useGeofencing = (malls: Mall[]) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [nearbyMalls, setNearbyMalls] = useState<Mall[]>([]);
  const { userLocation, calculateDistance } = useLocation();

  // Geofencing radius in kilometers
  const GEOFENCE_RADIUS = 2;

  // Start monitoring for nearby malls
  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  // Calculate which malls are within the geofence radius
  useEffect(() => {
    if (!isMonitoring || !userLocation || malls.length === 0) {
      return;
    }

    // Find malls within the geofence radius
    const nearby = malls.filter(mall => {
      if (!mall.latitude || !mall.longitude) return false;

      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        mall.latitude, 
        mall.longitude
      );

      return distance <= GEOFENCE_RADIUS;
    });

    setNearbyMalls(nearby);
  }, [isMonitoring, userLocation, malls, calculateDistance]);

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    nearbyMalls
  };
};

// Define the geofence interface (from original code)
export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

//Existing GeofencingService class remains unchanged.  It's no longer directly used, but keeping it for potential future use.
class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();
  private isMonitoring: boolean = false;
  private watchId: number | null = null;

  // Create geofences from mall data
  createGeofencesFromMalls(malls: Mall[], radiusInMeters: number = 500): void {
    malls.forEach(mall => {
      if (mall.latitude && mall.longitude) {
        this.addGeofence({
          id: mall.id,
          name: mall.name,
          latitude: mall.latitude,
          longitude: mall.longitude,
          radius: radiusInMeters
        });
      }
    });

    console.log(`Created ${this.geofences.size} geofences from ${malls.length} malls`);
  }

  // Add a single geofence
  addGeofence(geofence: Geofence): void {
    this.geofences.set(geofence.id, geofence);
  }

  // Remove a geofence by ID
  removeGeofence(id: string): void {
    this.geofences.delete(id);
  }

  // Clear all geofences
  clearGeofences(): void {
    this.geofences.clear();
  }

  // Start monitoring user location against geofences
  startMonitoring(): void {
    if (this.isMonitoring || !navigator.geolocation) {
      return;
    }

    this.isMonitoring = true;

    // Set up regular location checks
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        //this.checkGeofences(position.coords.latitude, position.coords.longitude); //Commented out as this functionality is now handled in the new hook
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.stopMonitoring();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );

    console.log('Geofence monitoring started');
  }

  // Stop monitoring user location
  stopMonitoring(): void {
    if (!this.isMonitoring || !this.watchId) {
      return;
    }

    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.isMonitoring = false;

    console.log('Geofence monitoring stopped');
  }

  // Check if user is within any geofences
  private checkGeofences(latitude: number, longitude: number): void {
    this.geofences.forEach((geofence) => {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        geofence.latitude, 
        geofence.longitude
      );

      const isInside = distance <= (geofence.radius / 1000); // Convert meters to km

      // If user just entered a geofence
      if (isInside) {
        this.triggerGeofenceEntry(geofence);
      }
    });
  }

  // Handle geofence entry event
  private triggerGeofenceEntry(geofence: Geofence): void {
    // Implement user notifications here
    console.log(`Entered geofence: ${geofence.name}`);

    // Show a browser notification if the API is available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Centro comercial cercano', {
        body: `Estás cerca de ${geofence.name}. ¡Revisa las ofertas disponibles!`,
        icon: '/pwa-icons/icon-192x192.png'
      });
    } else {
      // Fall back to toast notification
      // toast.info(`Estás cerca de ${geofence.name}. ¡Revisa las ofertas disponibles!`); //Commented out as toast is not imported
    }
  }

  // Calculate distance between two coordinates in kilometers
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Request notification permissions
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

// Create a singleton instance of the geofencing service
export const geofencingService = new GeofencingService();