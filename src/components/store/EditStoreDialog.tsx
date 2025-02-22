
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store } from "@/types/store";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditStoreDialogProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStoreDialog({ store, isOpen, onClose, onSuccess }: EditStoreDialogProps) {
  const [formData, setFormData] = useState({
    name: store.name,
    category: store.category,
    description: store.description || "",
    location_in_mall: store.location_in_mall || "",
    contact_number: store.contact_number || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("stores")
        .update(formData)
        .eq("id", store.id);

      if (error) throw error;

      toast.success("Tienda actualizada exitosamente");
      onSuccess();
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación en el centro comercial</Label>
            <Input
              id="location"
              value={formData.location_in_mall}
              onChange={(e) => setFormData({ ...formData, location_in_mall: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact">Número de contacto</Label>
            <Input
              id="contact"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
