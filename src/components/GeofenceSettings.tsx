import { useState, useEffect } from "react";
import { geofencingService } from "@/services/geofencing";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';


interface GeofenceSettingsProps {
  className?: string;
}

export const GeofenceSettings = ({ className }: GeofenceSettingsProps) => {
  const { t } = useTranslation();
  const { session } = useSession();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("geofenceNotificationsEnabled") === "true" || false
  );
  const [notificationRadius, setNotificationRadius] = useState(
    parseInt(localStorage.getItem("geofenceNotificationRadius") || "500")
  );
  const [saving, setSaving] = useState(false);

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

  const saveSettings = async () => {
    if (!session?.user) return;

    setSaving(true);

    try {
      // Save to localStorage for immediate use
      localStorage.setItem("geofenceNotificationsEnabled", notificationsEnabled.toString());
      localStorage.setItem("geofenceNotificationRadius", notificationRadius.toString());

      // Save to Supabase for persistence
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          notifications_enabled: notificationsEnabled,
          notification_radius: notificationRadius,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success(t("geofence.settings_saved"));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(t("geofence.settings_save_error"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      toast.error(t("geofence.notifications_not_supported"));
      setNotificationsEnabled(false);
    }

    // Load settings from Supabase if user is logged in
    if (session?.user) {
      const loadSettings = async () => {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('notifications_enabled, notification_radius')
            .eq('user_id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            // PGRST116 is code for "no rows returned" - not an error for new users
            console.error('Error loading notification settings:', error);
            return;
          }

          if (data) {
            setNotificationsEnabled(data.notifications_enabled);
            setNotificationRadius(data.notification_radius);

            // Update localStorage to match
            localStorage.setItem("geofenceNotificationsEnabled", data.notifications_enabled.toString());
            localStorage.setItem("geofenceNotificationRadius", data.notification_radius.toString());
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      };

      loadSettings();
    }
  }, [t, session]);

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
          <Label>Radio de detección: {notificationRadius} metros</Label>
          <Slider
            disabled={!notificationsEnabled}
            value={[notificationRadius]}
            min={100}
            max={2000}
            step={100}
            onValueChange={(value) => setNotificationRadius(value[0])}
          />
          <p className="text-xs text-gray-500">
            Define a qué distancia de un centro comercial deseas recibir notificaciones
          </p>
        </div>

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? t("common.saving") : t("geofence.save_settings")}
        </Button>
      </CardContent>
    </Card>
  );
};