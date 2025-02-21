
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup" | "reset";
}

export const AuthModal = ({ isOpen, onClose, mode: initialMode }: AuthModalProps) => {
  const [mode, setMode] = useState(initialMode);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" 
              ? "Log In" 
              : mode === "signup" 
              ? "Create Account"
              : "Reset Password"}
          </DialogTitle>
        </DialogHeader>
        <AuthForm 
          mode={mode} 
          onClose={onClose}
          onModeChange={setMode}
        />
      </DialogContent>
    </Dialog>
  );
};
