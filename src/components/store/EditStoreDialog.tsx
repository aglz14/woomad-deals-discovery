import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store } from "@/types/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditStoreDialogProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStoreDialog({
  store,
  isOpen,
  onClose,
  onSuccess,
}: EditStoreDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeData, setStoreData] = useState({
    name: store.name || "",
    description: store.description || "",
    logo_url: store.logo_url || "",
    location_in_mall: store.location_in_mall || "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  // Fetch store categories when dialog opens
  useEffect(() => {
    if (isOpen && store.id) {
      fetchStoreCategories();
    }
  }, [isOpen, store.id]);

  const fetchStoreCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("store_categories")
        .select("category_id")
        .eq("store_id", store.id);

      if (error) throw error;

      if (data) {
        setSelectedCategories(data.map((item) => item.category_id));
      }
    } catch (error) {
      console.error("Error fetching store categories:", error);
      toast.error("Error al cargar las categorías de la tienda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedCategories.length === 0) {
        toast.error("Debes seleccionar al menos una categoría");
        setSubmitting(false);
        return;
      }

      // Update store information
      const { error: storeError } = await supabase
        .from("stores")
        .update({
          name: storeData.name,
          description: storeData.description,
          // Use the first category as the main category for backward compatibility
          category:
            categoriesData?.find((cat) => cat.id === selectedCategories[0])
              ?.name || store.category,
          logo_url: storeData.logo_url,
          location_in_mall: storeData.location_in_mall,
          mall_id: store.mall_id,
        })
        .eq("id", store.id);

      if (storeError) throw storeError;

      // Delete existing store-category relationships
      const { error: deleteError } = await supabase
        .from("store_categories")
        .delete()
        .eq("store_id", store.id);

      if (deleteError) throw deleteError;

      // Insert new store-category relationships
      const storeCategoriesToInsert = selectedCategories.map((categoryId) => ({
        store_id: store.id,
        category_id: categoryId,
      }));

      const { error: insertError } = await supabase
        .from("store_categories")
        .insert(storeCategoriesToInsert);

      if (insertError) throw insertError;

      toast.success("Tienda actualizada correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error(
        `Error al actualizar la tienda: ${
          error instanceof Error ? error.message : "Desconocido"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Tienda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la tienda</Label>
            <Input
              id="name"
              value={storeData.name}
              onChange={(e) =>
                setStoreData({ ...storeData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              Categorías (selecciona al menos una)
            </Label>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {isLoading || isCategoriesLoading ? (
                <div className="text-sm text-muted-foreground">
                  Cargando categorías...
                </div>
              ) : categoriesData?.length > 0 ? (
                <div className="space-y-2">
                  {categoriesData.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat.id}`}
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id)}
                      />
                      <Label
                        htmlFor={`category-${cat.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No hay categorías disponibles
                </div>
              )}
            </ScrollArea>
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={storeData.description}
              onChange={(e) =>
                setStoreData({ ...storeData, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación en el centro comercial</Label>
            <Input
              id="location_in_mall"
              value={storeData.location_in_mall}
              onChange={(e) =>
                setStoreData({ ...storeData, location_in_mall: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
