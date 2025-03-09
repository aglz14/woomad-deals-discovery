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
    image: store.image || "",
    floor: store.floor || "",
    contact_number: store.contact_number || "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  // Initialize selected categories from store.array_categories
  useEffect(() => {
    if (isOpen && categoriesData && store.array_categories) {
      const categoryIds = store.array_categories
        .map((categoryName) => {
          const category = categoriesData.find(
            (cat) => cat.name === categoryName
          );
          return category ? category.id : null;
        })
        .filter((id) => id !== null) as string[];

      setSelectedCategories(categoryIds);
    }
  }, [isOpen, categoriesData, store.array_categories]);

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

      // Get category names for the array_categories field
      const categoryNames = selectedCategories
        .map((id) => categoriesData?.find((cat) => cat.id === id)?.name)
        .filter((name) => name !== undefined) as string[];

      // Update store information with array_categories
      const { error: storeError } = await supabase
        .from("stores")
        .update({
          name: storeData.name,
          description: storeData.description,
          image: storeData.image,
          floor: storeData.floor,
          contact_number: storeData.contact_number,
          array_categories: categoryNames,
          mall_id: store.mall_id,
        })
        .eq("id", store.id);

      if (storeError) throw storeError;

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor">Piso</Label>
              <Input
                id="floor"
                value={storeData.floor}
                onChange={(e) =>
                  setStoreData({ ...storeData, floor: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="contact">Número de Contacto</Label>
              <Input
                id="contact"
                value={storeData.contact_number}
                onChange={(e) =>
                  setStoreData({ ...storeData, contact_number: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="image">URL de la Imagen (opcional)</Label>
            <Input
              id="image"
              value={storeData.image}
              onChange={(e) =>
                setStoreData({ ...storeData, image: e.target.value })
              }
              placeholder="https://ejemplo.com/imagen.png"
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
