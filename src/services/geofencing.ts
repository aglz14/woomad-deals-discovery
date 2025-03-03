
import { toast } from "sonner";
import { Mall } from "@/types/mall";
import { Location } from "@/hooks/use-location";

// Define the geofence interface
export interface Geofence {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusInMeters: number;
  isInside: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();
  private watchId: number | null = null;
  private lastPosition: Location | null = null;
  private notificationPermissionGranted = false;

  constructor() {
    this.checkNotificationPermission();
  }

  private async checkNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      this.notificationPermissionGranted = true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.notificationPermissionGranted = permission === "granted";
    }
  }

  // Create geofences from mall data
  public createGeofencesFromMalls(malls: Mall[], radiusInMeters: number = 500) {
    malls.forEach(mall => {
      if (mall.latitude && mall.longitude) {
        this.addGeofence({
          id: mall.id,
          name: mall.name,
          centerLat: mall.latitude,
          centerLng: mall.longitude,
          radiusInMeters,
          isInside: false,
          onEnter: () => this.showNotification(`¡Estás cerca de ${mall.name}!`, 
                                              `Hay promociones activas en este centro comercial.`),
          onExit: () => console.log(`Left ${mall.name} geofence`)
        });
      }
    });
  }

  // Add a single geofence
  public addGeofence(geofence: Geofence) {
    this.geofences.set(geofence.id, geofence);
  }

  // Remove a geofence
  public removeGeofence(id: string) {
    this.geofences.delete(id);
  }

  // Clear all geofences
  public clearGeofences() {
    this.geofences.clear();
  }

  // Start monitoring geofences
  public startMonitoring() {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible en este navegador");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // Reduced from 27000ms to 10000ms
      maximumAge: 30000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        this.checkGeofences(currentPosition);
        this.lastPosition = currentPosition;
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Permiso de ubicación denegado");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Ubicación no disponible");
            break;
          case error.TIMEOUT:
            toast.error("Tiempo de espera agotado, reintentando...");
            // Retry with less accurate position
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const currentPosition = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                this.checkGeofences(currentPosition);
                this.lastPosition = currentPosition;
              },
              () => toast.error("No se pudo obtener la ubicación"),
              { ...options, enableHighAccuracy: false }
            );
            break;
          default:
            toast.error("Error al obtener la ubicación");
        }
        console.error("Geolocation error:", error);
      },
      options
    );

    toast.success("Monitoreo de ubicación iniciado");
  }

  // Stop monitoring geofences
  public stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      toast.info("Monitoreo de ubicación detenido");
    }
  }

  // Check if user is inside any geofences
  private checkGeofences(position: Location) {
    this.geofences.forEach(geofence => {
      const distance = this.calculateDistance(
        position.lat, 
        position.lng,
        geofence.centerLat,
        geofence.centerLng
      );
      
      const isInside = distance * 1000 <= geofence.radiusInMeters;
      
      // If state has changed
      if (isInside !== geofence.isInside) {
        if (isInside) {
          // User entered geofence
          geofence.onEnter?.();
        } else {
          // User exited geofence
          geofence.onExit?.();
        }
        
        // Update state
        geofence.isInside = isInside;
      }
    });
  }

  // Show notification
  private showNotification(title: string, body: string) {
    if (!this.notificationPermissionGranted) {
      this.checkNotificationPermission();
      return;
    }

    // Show system notification if available
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
    
    // Also show in-app toast notification
    toast(title, {
      description: body,
      duration: 5000,
    });
  }

  // Calculate distance between two points in km (haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const geofencingService = new GeofencingService();
