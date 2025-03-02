
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

export default function Profile() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfileData(data);
        setName(data.full_name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  const updateProfile = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          updated_at: new Date()
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      toast.success("Perfil actualizado con éxito");
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
                  <GeofenceSettings className="w-full" />
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
