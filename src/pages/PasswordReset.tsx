
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
        console.log("Starting auth callback handling");
        // Check both hash and search parameters
        const fragment = location.hash;
        const search = location.search;
        
        let accessToken = null;
        let type = null;
        let refreshToken = '';

        // Check hash parameters first (old format)
        if (fragment) {
          const hashParams = new URLSearchParams(fragment.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token') || '';
          type = hashParams.get('type');
        }

        // If not in hash, check search parameters (new format)
        if (!accessToken && search) {
          const searchParams = new URLSearchParams(search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token') || '';
          type = searchParams.get('type');
        }

        // Check for recovery token in combination with other params
        if (search && search.includes('type=recovery')) {
          type = 'recovery';
          
          // Look for token parameter which might be named differently
          const searchParams = new URLSearchParams(search);
          // Check all possible token parameter names
          const token = searchParams.get('token') || 
                       searchParams.get('t') || 
                       searchParams.get('code') || 
                       searchParams.get('recovery_token');
          
          if (token) {
            console.log("Found token in search params with length:", token.length);
            accessToken = token;
          }
        }
        
        // Also check for token as a standalone parameter
        if (!accessToken && search) {
          const searchParams = new URLSearchParams(search);
          const rawToken = searchParams.get('token');
          if (rawToken) {
            console.log("Found standalone token in URL");
            accessToken = rawToken;
            type = 'recovery'; // Assume recovery if only token is present
          }
        }

        // If no token found, show the email form
        if (!accessToken) {
          console.log('No access token found in URL, showing email form');
          setShowResetForm(true);
          return;
        }

        console.log('Token found, type:', type);
        
        // Clear any existing session first to avoid conflicts
        await supabase.auth.signOut();
        
        // Mark as having token before verification to keep UI consistent
        setHasToken(true);

        // First check the token type before proceeding
        if (type === 'recovery') {
          try {
            console.log("Verifying recovery token:", accessToken.substring(0, 5) + "...");
            // For recovery tokens, we validate the token and establish a session
            // This is crucial for password update to work later
            const { data, error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token: accessToken,
              options: {
                // When verifying, make sure to capture the session by redirecting here
                redirectTo: `${window.location.origin}/password-reset`
              }
            });

            if (error) {
              console.error("Token verification error:", error.message);
              throw error;
            }
            
            // Log the session state
            const { data: sessionData } = await supabase.auth.getSession();
            console.log("Session after verification:", sessionData?.session ? "Active" : "Not active");
            
            // If token is valid, show the reset form
            console.log("Recovery token valid, showing reset form");
            setShowResetForm(true);
          } catch (tokenError) {
            console.error("Invalid recovery token:", tokenError);
            toast.error("Token de recuperación inválido o expirado");
            setHasToken(false);
            setShowResetForm(true);
          }
        } else if (type === 'signup' || type === 'magiclink') {
          // For other types, we complete the authentication flow
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
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
          setHasToken(false);
          setShowResetForm(true);
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error(error.message || "Error procesando la autenticación");
        setHasToken(false);
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
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session before password update:", session ? "Active" : "None");
      
      // If we don't have a session, try to get URL parameters again
      // This helps in case the token is still in the URL but wasn't processed correctly
      if (!session) {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const token = urlParams.get('token') || hashParams.get('access_token');
        
        if (token) {
          console.log("Trying to verify token again before password update");
          try {
            // Try to verify the token again
            await supabase.auth.verifyOtp({
              type: 'recovery',
              token: token
            });
          } catch (e) {
            console.error("Failed to re-verify token:", e);
          }
        }
      }
      
      // Try to update the password regardless of session state
      // The auth API might still have the token in context even if getSession doesn't show it
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        // If error contains "JWT" or "token", it's likely a token issue
        if (error.message.includes("JWT") || error.message.includes("token") || error.message.includes("session")) {
          toast.error("Tu sesión de recuperación ha expirado. Por favor, solicita un nuevo enlace.");
          // Reset the form to request a new link
          setHasToken(false);
          setShowResetForm(true);
          return;
        }
        throw error;
      }

      // Password was updated successfully
      toast.success("Contraseña actualizada con éxito");
      
      // Sign out and clean up the session
      await supabase.auth.signOut();
      
      // Show a message and provide a link instead of automatic redirect
      setShowResetForm(false);
      setShowSuccess(true); 
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Error al actualizar la contraseña");
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
