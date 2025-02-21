
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditStoreDialogProps {
  store: {
    id: string;
    name: string;
    description?: string;
    category: string;
    location_in_mall?: string;
    contact_number?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStoreDialog({ store, isOpen, onClose, onSuccess }: EditStoreDialogProps) {
  const { t } = useTranslation();
  const [editedStore, setEditedStore] = useState({
    name: store.name,
    description: store.description || "",
    category: store.category,
    location_in_mall: store.location_in_mall || "",
    contact_number: store.contact_number || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: editedStore.name,
          description: editedStore.description,
          category: editedStore.category,
          location_in_mall: editedStore.location_in_mall,
          contact_number: editedStore.contact_number,
        })
        .eq("id", store.id);

      if (error) throw error;

      toast.success("Tienda actualizada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Error al actualizar la tienda");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tienda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la tienda</Label>
            <Input
              id="name"
              value={editedStore.name}
              onChange={(e) => setEditedStore({ ...editedStore, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={editedStore.category}
              onChange={(e) => setEditedStore({ ...editedStore, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={editedStore.description}
              onChange={(e) => setEditedStore({ ...editedStore, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={editedStore.location_in_mall}
              onChange={(e) => setEditedStore({ ...editedStore, location_in_mall: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact">Contacto</Label>
            <Input
              id="contact"
              value={editedStore.contact_number}
              onChange={(e) => setEditedStore({ ...editedStore, contact_number: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
