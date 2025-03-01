import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store } from "@/types/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

interface EditStoreDialogProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStoreDialog({ store, isOpen, onClose, onSuccess }: EditStoreDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    name: store.name || "",
    category: store.category || "",
    description: store.description || "",
    logo_url: store.logo_url || "",
    location: store.location || "",
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("stores")
        .update({...storeData, id: store.id})
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
              value={storeData.name}
              onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={storeData.category}
              onValueChange={(value) => setStoreData({ ...storeData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={storeData.description}
              onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación en el centro comercial</Label>
            <Input
              id="location"
              value={storeData.location}
              onChange={(e) => setStoreData({ ...storeData, location: e.target.value })}
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