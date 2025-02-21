
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

export const AuthModal = ({ isOpen, onClose, mode }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Log In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        <AuthForm mode={mode} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
