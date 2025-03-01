import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "./providers/SessionProvider";
import { AuthModal } from "./auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, LogOut, Plus, Star, User } from "lucide-react";
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
        <div className="mx-auto max-w-7xl px-2 sm:px-4"> {/* Responsive padding */}
          <div className="flex items-center justify-between h-16 px-2 sm:px-[40px]">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/375924b8-bf3a-4f85-868b-b1befe051793.png" alt="Woomad Commerce" className="h-8" />
            </Link>

            <div className="flex items-center">
              {session ? (
                <>
                  {/* Desktop dropdown */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-white py-2 px-4 flex items-center gap-1 hover:bg-white/20">
                          <span className="flex-shrink truncate max-w-[200px]">{session.user?.email}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Mi Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/favorites')}>
                          <Star className="mr-2 h-4 w-4" />
                          <span>Mis Favoritos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Administrar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile hamburger menu */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-white p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" x2="20" y1="12" y2="12"/>
                            <line x1="4" x2="20" y1="6" y2="6"/>
                            <line x1="4" x2="20" y1="18" y2="18"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-sm">
                        <div className="px-2 py-1.5 text-sm font-medium text-gray-500 border-b">
                          {session.user?.email}
                        </div>
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Mi Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/favorites')}>
                          <Star className="mr-2 h-4 w-4" />
                          <span>Mis Favoritos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Administrar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop buttons */}
                  <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} className="text-white hover:text-sky-500/90">
                      Iniciar Sesión
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/signup")} className="text-white bg-transparent border-white hover:bg-white hover:text-purple-500">
                      Registrarse
                    </Button>
                  </div>

                  {/* Mobile hamburger menu */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-white p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" x2="20" y1="12" y2="12"/>
                            <line x1="4" x2="20" y1="6" y2="6"/>
                            <line x1="4" x2="20" y1="18" y2="18"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-sm">
                        <DropdownMenuItem onClick={() => {
                          setIsAuthModalOpen(true);
                        }} className="cursor-pointer">
                          Iniciar Sesión
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/signup")} className="cursor-pointer">
                          Registrarse
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="login" />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>;
};