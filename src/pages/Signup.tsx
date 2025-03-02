
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
          const { error: prefError } = await supabase
            .from('user_preferences')
            .insert([
              { 
                user_id: data.user.id,
                notifications_enabled: false
              }
            ]);
            
          if (prefError) console.error("Error creating user preferences:", prefError);
        } catch (prefErr) {
          console.error("Failed to create user preferences:", prefErr);
        }
        
        toast.success("¡Revisa tu correo para confirmar tu cuenta!");
        navigate("/");
      } else {
        // In some cases, user might be null even though there's no error
        toast.error("No se pudo crear el usuario. Intenta nuevamente.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Error al crear la cuenta. Intenta nuevamente.");
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
