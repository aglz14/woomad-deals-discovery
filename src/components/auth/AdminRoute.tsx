import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useSession } from "@/components/providers/SessionProvider";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { session, isLoading: sessionLoading } = useSession();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, redirect to home
    if (!sessionLoading && !session) {
      toast.error("Debes iniciar sesión para acceder a esta página");
      navigate("/");
    }
    // If logged in but not admin, redirect to home with error message
    else if (!sessionLoading && !adminLoading && session && !isAdmin) {
      toast.error("No tienes permisos para acceder a esta página");
      navigate("/");
    }
  }, [session, isAdmin, sessionLoading, adminLoading, navigate]);

  // Show nothing while checking authentication and admin status
  if (sessionLoading || adminLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  // If authenticated and admin, render the protected content
  return session && isAdmin ? <>{children}</> : null;
};
