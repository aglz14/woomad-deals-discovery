
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddStoreForm } from "./AddStoreForm";

interface AddStoreDialogProps {
  mallId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStoreDialog({ mallId, isOpen, onClose, onSuccess }: AddStoreDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Tienda</DialogTitle>
        </DialogHeader>
        <AddStoreForm 
          mallId={mallId} 
          onSuccess={handleSuccess} 
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
