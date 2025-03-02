
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log the signup attempt (without password)
      console.log("Attempting signup with email:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Add any additional data needed for user profiles
          // data: { firstName: firstName, lastName: lastName }
        }
      });
      
      if (error) throw error;
      
      console.log("Signup response:", data);
      
      // Check if user was created
      if (data.user) {
        // Create initial user preference record if needed
        try {
          console.log("Attempting to create user preferences for user ID:", data.user.id);
          
          // Check if user_preferences table exists
          const { error: checkError } = await supabase
            .from('user_preferences')
            .select('*')
            .limit(1);
          
          if (checkError) {
            console.error("Error checking user_preferences table:", checkError);
            // If the table doesn't exist, we might need to create it
            // This is likely the source of your database error
          }
          
          // Attempt to create the user preferences
          const { error: prefError } = await supabase
            .from('user_preferences')
            .insert([
              { 
                user_id: data.user.id,
                notifications_enabled: false
              }
            ]);
            
          if (prefError) {
            console.error("Error creating user preferences:", prefError);
            console.error("Error details:", prefError.details, prefError.hint, prefError.code);
            
            // Don't let this error block the signup flow
            // Still proceed with the signup process
          } else {
            console.log("User preferences created successfully");
          }
        } catch (prefErr) {
          console.error("Failed to create user preferences:", prefErr);
          // Continue with signup even if preferences creation fails
        }
        
        toast.success("¡Revisa tu correo para confirmar tu cuenta!");
        navigate("/");
      } else {
        // In some cases, user might be null even though there's no error
        toast.error("No se pudo crear el usuario. Intenta nuevamente.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Log detailed Supabase error information if available
      if (error.code) {
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
      }
      
      // Show a more specific error message if possible
      if (error.code === '23505') {
        toast.error("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
      } else if (error.code === 'PGRST116') {
        toast.error("Error en la base de datos. La tabla user_preferences podría no existir.");
      } else {
        toast.error(error.message || "Error al crear la cuenta. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta nueva
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{" "}
            <button
              onClick={() => navigate("/")}
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              ir a Woomad.com
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>
      </div>
    </div>
  );
}
