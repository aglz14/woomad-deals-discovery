
import { useState, useEffect } from "react";
import { geofencingService } from "@/services/geofencing";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GeofenceSettingsProps {
  className?: string;
}

export const GeofenceSettings = ({ className }: GeofenceSettingsProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(500); // Default 500m

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          toast.success("Notificaciones de geofence activadas");
        } else {
          toast.error("Necesitamos permiso para enviar notificaciones");
          setNotificationsEnabled(false);
          return;
        }
      }
    } else {
      setNotificationsEnabled(false);
      toast.info("Notificaciones de geofence desactivadas");
    }
  };

  const saveSettings = () => {
    localStorage.setItem("geofenceSettings", JSON.stringify({
      enabled: notificationsEnabled,
      radius: geofenceRadius,
    }));
    
    toast.success("Configuración de geofence guardada");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notificaciones de Geofence</CardTitle>
        <CardDescription>
          Recibe notificaciones cuando estés cerca de centros comerciales con promociones activas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch 
            id="geofence-notifications" 
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
          <Label htmlFor="geofence-notifications">Activar notificaciones de proximidad</Label>
        </div>
        
        <div className="space-y-3">
          <Label>Radio de detección: {geofenceRadius} metros</Label>
          <Slider
            disabled={!notificationsEnabled}
            value={[geofenceRadius]}
            min={100}
            max={2000}
            step={100}
            onValueChange={(value) => setGeofenceRadius(value[0])}
          />
          <p className="text-xs text-gray-500">
            Define a qué distancia de un centro comercial deseas recibir notificaciones
          </p>
        </div>
        
        <Button onClick={saveSettings} disabled={!notificationsEnabled}>
          Guardar configuración
        </Button>
      </CardContent>
    </Card>
  );
};
