
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

  // Debug state tracking
  useEffect(() => {
    console.log("Current states - hasToken:", hasToken, "showResetForm:", showResetForm);
  }, [hasToken, showResetForm]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const search = location.search;
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get('code');

        if (!code) {
          console.log('No access token found in URL, showing email form');
          setShowResetForm(true);
          return;
        }

        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setHasToken(true);
          setShowResetForm(true);
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          toast.error("Token de recuperación inválido o expirado");
          setShowResetForm(true);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error(error.message || "Error procesando la autenticación");
        setShowResetForm(true);
      }
    };

    handleAuthCallback();
  }, [location.search]);

  const handleSendResetLink = async (e) => {
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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Prevent accidental navigation away
    window.onbeforeunload = () => "Por favor, espera mientras actualizamos tu contraseña.";
    
    setLoading(true);
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session before password update:", session ? "Active" : "None");
      
      // If we don't have a session, try multiple fallback methods
      if (!session) {
        console.log("No active session found, trying fallback methods");
        
        // Method 1: Check for token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        let token = urlParams.get('token') || hashParams.get('access_token');
        
        // Method 2: Check for token in localStorage (set during initial verification)
        if (!token) {
          token = localStorage.getItem('pending_reset_token');
          if (token) console.log("Retrieved token from localStorage");
        }
        
        // Method 3: Check all possible token parameter names in URL
        if (!token) {
          const possibleTokenNames = ['t', 'code', 'recovery_token', 'reset_token'];
          for (const name of possibleTokenNames) {
            token = urlParams.get(name) || hashParams.get(name);
            if (token) {
              console.log(`Found token with parameter name: ${name}`);
              break;
            }
          }
        }
        
        if (token) {
          console.log("Found token for password update, attempting verification");
          try {
            // Try to verify the token again
            const { error: verifyError } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token: token
            });
            
            if (verifyError) {
              console.error("Token verification failed:", verifyError.message);
              
              // As a last resort, try to create a direct session
              try {
                console.log("Attempting direct session creation with token");
                await supabase.auth.setSession({
                  access_token: token,
                  refresh_token: '' // No refresh token available
                });
              } catch (sessionError) {
                console.error("Direct session creation failed:", sessionError);
              }
            }
          } catch (e) {
            console.error("Failed to re-verify token:", e);
          }
        }
        
        // Clean up localStorage after attempt
        localStorage.removeItem('pending_reset_token');
      }
      
      // Try to update the password using multiple methods
      let updateError = null;
      
      // Method 1: Standard update through session
      try {
        console.log("Attempting password update with session");
        const { error } = await supabase.auth.updateUser({ 
          password: password 
        });
        
        if (!error) {
          console.log("Password updated successfully with standard method");
          updateError = null; // Clear any error
        } else {
          updateError = error;
          console.error("Standard password update failed:", error.message);
        }
      } catch (e) {
        console.error("Exception during standard password update:", e);
        updateError = e;
      }
      
      // Method 2: If standard update failed and we have a token in URL, try direct API method
      if (updateError) {
        try {
          // Get token from URL or localStorage
          const urlParams = new URLSearchParams(window.location.search);
          const storedToken = localStorage.getItem('pending_reset_token');
          const token = urlParams.get('token') || storedToken;
          
          if (token) {
            console.log("Attempting direct password reset with token");
            
            // Try one more verification before password update
            await supabase.auth.verifyOtp({
              type: 'recovery',
              token: token
            });
            
            // Immediately try to update password after verification
            const { error } = await supabase.auth.updateUser({ 
              password: password 
            });
            
            if (!error) {
              console.log("Password updated successfully with direct method");
              updateError = null; // Clear any error
            }
          }
        } catch (directError) {
          console.error("Direct password update method failed:", directError);
        }
      }
      
      // Check if we still have an error after all attempts
      if (updateError) {
        // If error contains "JWT" or "token", it's likely a token issue
        if (updateError.message.includes("JWT") || 
            updateError.message.includes("token") || 
            updateError.message.includes("session")) {
          toast.error("Tu sesión de recuperación ha expirado. Por favor, solicita un nuevo enlace.");
          // Reset the form to request a new link
          setHasToken(false);
          setShowResetForm(true);
          return;
        }
        throw updateError;
      }

      // Password was updated successfully
      toast.success("Contraseña actualizada con éxito");
      
      // Clean up all stored tokens and session data
      sessionStorage.removeItem('password_reset_token');
      sessionStorage.removeItem('token_verified');
      localStorage.removeItem('pending_reset_token');
      
      // Sign out and clean up the session
      await supabase.auth.signOut();
      
      // Show a message and provide a link instead of automatic redirect
      setShowResetForm(false);
      setShowSuccess(true);
      
      // Remove navigation warning
      window.onbeforeunload = null; 
    } catch (error) {
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
