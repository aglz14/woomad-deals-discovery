
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check both hash and search parameters
        const fragment = location.hash;
        const search = location.search;
        
        let accessToken = null;
        let type = null;

        // Check hash parameters first (old format)
        if (fragment) {
          const hashParams = new URLSearchParams(fragment.substring(1));
          accessToken = hashParams.get('access_token');
          type = hashParams.get('type');
        }

        // If not in hash, check search parameters (new format)
        if (!accessToken && search) {
          const searchParams = new URLSearchParams(search);
          accessToken = searchParams.get('access_token');
          type = searchParams.get('type');
        }

        // Check for recovery token in combination with other params
        if (search && search.includes('type=recovery')) {
          type = 'recovery';
          
          // Look for token parameter which might be named differently
          const searchParams = new URLSearchParams(search);
          const token = searchParams.get('token') || searchParams.get('t');
          if (token) accessToken = token;
        }

        // If no token found, show the email form
        if (!accessToken) {
          console.log('No access token found in URL, showing email form');
          setShowResetForm(true);
          return;
        }

        setHasToken(true);

        // Clear any existing session first to avoid conflicts
        await supabase.auth.signOut();

        // First check the token type before proceeding
        if (type === 'recovery') {
          try {
            // For recovery tokens, we just validate the token but don't complete authentication
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: '',
            });

            if (error) throw error;
            
            // If token is valid, show the reset form
            setShowResetForm(true);
            console.log("Password reset form should display now");
          } catch (tokenError) {
            console.error("Invalid recovery token:", tokenError);
            toast.error("Token de recuperación inválido");
            setShowResetForm(true);
          }
        } else if (type === 'signup' || type === 'magiclink') {
          // For other types, we complete the authentication flow
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });
          
          if (error) throw error;
          
          if (session) {
            toast.success("Autenticación exitosa");
            navigate("/");
          } else {
            throw new Error("No se pudo establecer la sesión");
          }
        } else {
          console.error('Unknown auth callback type:', type);
          toast.error("Tipo de autenticación no válido");
          setShowResetForm(true);
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error(error.message || "Error procesando la autenticación");
        setShowResetForm(true);
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`
      });

      if (error) throw error;

      toast.success("Se ha enviado un enlace a tu correo electrónico");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      
      // Show a message and provide a link instead of automatic redirect
      setShowResetForm(false);
      setShowSuccess(true); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show loading if we're still processing the token and haven't determined what to show yet
  if (!showResetForm && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando autenticación...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ¡Contraseña actualizada!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {hasToken ? "Restablecer contraseña" : "Recuperar cuenta"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {hasToken ? "Ingresa tu nueva contraseña" : "Ingresa tu correo electrónico para recibir un enlace de recuperación"}
          </p>
        </div>

        {hasToken ? (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
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
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSendResetLink}>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
            
            <div className="text-center">
              <Button variant="link" onClick={() => navigate("/")}>
                Volver al inicio
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
