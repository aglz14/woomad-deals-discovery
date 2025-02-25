import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "./providers/SessionProvider";
import { AuthModal } from "./auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, LogOut, Star, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "./ui/button";
export const Header = () => {
  const {
    t
  } = useTranslation();
  const {
    session,
    isLoading
  } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      navigate('/');
      toast.success("Sesión cerrada con éxito");
    } catch (error: any) {
      console.error('Error during logout:', error);
      toast.error("Error al cerrar sesión");
    }
  };
  if (isLoading) {
    return null;
  }
  return <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="container mx-auto">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/375924b8-bf3a-4f85-868b-b1befe051793.png" alt="Woomad Commerce" className="h-8" />
            </Link>

            <div className="flex items-center gap-4">
              {session?.user ? <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/90 transition-colors rounded-md">
                    <User className="h-4 w-4" />
                    <span>{session.user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white shadow-lg z-50" align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/promotions")}>
                      <Star className="mr-2 h-4 w-4" />
                      <span>Promociones</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> : <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} className="text-white hover:text-sky-500/90">
                    Iniciar Sesión
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/signup")} className="text-white bg-transparent border-white hover:bg-white hover:text-purple-500">
                    Registrarse
                  </Button>
                  <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="login" />
                </div>}
            </div>
          </div>
        </div>
      </nav>
    </header>;
};