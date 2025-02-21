
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthModal } from "./auth/AuthModal";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "./providers/SessionProvider";
import { User } from "lucide-react";

export const Header = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully logged out!");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Woomad
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {session ? (
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{session.user.email}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode("signup");
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </header>
  );
};
