
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

export const AuthForm = ({ mode, onClose, onModeChange }: AuthFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success("Check your email for the password reset link!");
        onModeChange("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Successfully logged in!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "reset") {
    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Send Reset Link"}
          </Button>
        </form>
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => onModeChange("login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : mode === "login" ? "Log In" : "Sign Up"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {mode === "login" ? (
          <>
            <Button
              variant="link"
              className="text-sm"
              onClick={() => onModeChange("reset")}
            >
              Forgot your password?
            </Button>
            <div>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => onModeChange("signup")}
              >
                Need an account? Sign up
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="link"
            className="text-sm"
            onClick={() => onModeChange("login")}
          >
            Already have an account? Log in
          </Button>
        )}
      </div>
    </div>
  );
};
