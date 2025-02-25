
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PasswordReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      // Sign out and clean up the session
      await supabase.auth.signOut();
      toast.success("Contraseña actualizada con éxito");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the recovery token from URL
  useEffect(() => {
    const handleRecoveryToken = async () => {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const fragment = location.hash;
      if (fragment.includes('access_token') && fragment.includes('type=recovery')) {
        // Extract the access token
        const accessToken = new URLSearchParams(fragment.substring(1)).get('access_token');
        
        if (!accessToken) {
          toast.error("Token de recuperación no válido");
          navigate("/");
          return;
        }

        try {
          // Set the session with the recovery token
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });

          if (error || !session) {
            throw error;
          }

          setIsValidToken(true);
        } catch (error) {
          console.error('Error setting session:', error);
          toast.error("Error al procesar el token de recuperación");
          navigate("/");
        }
      } else if (!fragment) {
        // If there's no recovery token in URL, redirect to home
        navigate("/");
      }
    };

    handleRecoveryToken();
  }, [location, navigate]);

  // If token is not valid yet, show loading state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Validando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restablecer contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
