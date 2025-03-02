import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/components/providers/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Save, UserCog, MapPin, Bell } from "lucide-react";
import { GeofenceSettings } from "@/components/GeofenceSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider"; // Import Slider component
import { Switch } from "@/components/ui/switch";


export default function Profile() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationRadius, setNotificationRadius] = useState(500); // Add state for notification radius


  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate("/");
      toast.error("Debes iniciar sesión para ver tu perfil");
    } else {
      fetchProfileData();
    }
  }, [session, navigate]);

  const fetchProfileData = async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setProfileData(profileData);
        setName(profileData.full_name || "");
      }

      // Fetch notification preferences separately
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('notifications_enabled, notification_radius') //Added notification_radius
        .eq('user_id', session.user.id)
        .single();

      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error("Error fetching notification preferences:", prefsError);
      }

      if (prefsData) {
        setNotificationsEnabled(prefsData.notifications_enabled || false);
        setNotificationRadius(prefsData.notification_radius || 500); // Set initial radius
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const updateProfile = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      // Update profile data (name only)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: name
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Handle notification preferences separately
      // Check if preference record exists first
      const { data: existingPrefs, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // Update or insert notification preferences
      let prefsError;
      if (existingPrefs) {
        // Update existing record
        const { error } = await supabase
          .from('user_preferences')
          .update({
            notifications_enabled: notificationsEnabled,
            notification_radius: notificationRadius,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
        prefsError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            notifications_enabled: notificationsEnabled,
            notification_radius: notificationRadius,
            updated_at: new Date().toISOString()
          });
        prefsError = error;
      }

      if (prefsError) throw prefsError;

      toast.success("Perfil actualizado con éxito");

      // Update localStorage for geofence settings
      localStorage.setItem("geofenceNotificationsEnabled", notificationsEnabled.toString());
      localStorage.setItem("geofenceNotificationRadius", notificationRadius.toString());
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        {session && (
          <div className="flex flex-col md:flex-row gap-8">
            <Card className="w-full md:w-1/3">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileData?.avatar_url} />
                    <AvatarFallback>{session.user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{name || session.user.email}</CardTitle>
                    <CardDescription>{session.user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Miembro desde</div>
                  <div>{new Date(session.user.created_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              <Tabs defaultValue="account">
                <TabsList className="mb-6">
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span>Cuenta</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notificaciones</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de la cuenta</CardTitle>
                      <CardDescription>
                        Actualiza tu información personal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          value={session.user.email}
                          disabled
                          placeholder="tu@email.com"
                        />
                        <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={updateProfile} disabled={loading} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>{loading ? "Guardando..." : "Guardar cambios"}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notificaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={notificationsEnabled}
                            id="notifications"
                            onCheckedChange={setNotificationsEnabled}
                          />
                          <Label htmlFor="notifications">Habilitar notificaciones</Label>
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
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}