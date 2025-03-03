
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "login" | "signup" | "reset";
  onClose: () => void;
  onModeChange: (mode: "login" | "signup" | "reset") => void;
}

export const AuthForm = ({
  mode,
  onClose,
  onModeChange
}: AuthFormProps) => {
  const {
    t
  } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        toast.success("¡Revisa tu correo para confirmar tu cuenta!");
      } else if (mode === "reset") {
        const {
          error
        } = await supabase.auth.resetPasswordForEmail(email, {
          // Using the URL pattern that Supabase will recognize and properly process
          redirectTo: `${window.location.origin}/password-reset`
        });
        if (error) throw error;
        toast.success("¡Revisa tu correo para restablecer tu contraseña!");
        onModeChange("login");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("¡Has iniciado sesión exitosamente!");
      }
      // Close the popup form if it's open
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "reset") {
    return <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : "Enviar enlace"}
          </Button>
        </form>
        <div className="text-center">
          <Button variant="link" className="text-sm" onClick={() => onModeChange("login")}>
            Volver al inicio de sesión
          </Button>
        </div>
      </div>;
  }

  return <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando..." : mode === "login" ? "Iniciar Sesión" : "Registrarse"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {mode === "login" ? (
            <Button variant="link" className="text-sm" onClick={() => onModeChange("reset")}>¿Olvidaste tu contraseña? Iniciar Sesión</Button>
          ) : (
            <Button variant="link" className="text-sm" onClick={() => onModeChange("login")}>
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          )}
      </div>
    </div>;
};
