import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
    name: "",
    description: "",
    image: "",
    floor: "",
    phone: "",
    local_number: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  // Reset form data when store changes or dialog opens
  useEffect(() => {
    if (isOpen && store) {
      setStoreData({
        name: store.name || "",
        description: store.description || "",
        image: store.image || "",
        floor: store.floor || "",
        phone: store.phone || "",
        local_number: store.local_number || "",
      });

      // Initialize selected categories from array_categories
      if (categoriesData && store.array_categories) {
        initializeSelectedCategories();
      }
    }
  }, [isOpen, store, categoriesData]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStoreData({
      name: "",
      description: "",
      image: "",
      floor: "",
      phone: "",
      local_number: "",
    });
    setSelectedCategories([]);
    setSubmitting(false);
    setIsLoading(false);
  };

  const initializeSelectedCategories = () => {
    if (!categoriesData || !store.array_categories) return;

    setIsLoading(true);
    console.log(
      "Initializing categories from array_categories:",
      store.array_categories
    );

    const categoryIds = store.array_categories
      .map((categoryName) => {
        const category = categoriesData.find(
          (cat) => cat.name === categoryName
        );
        if (!category) {
          console.warn(`Category with name "${categoryName}" not found`);
          return null;
        }
        return category.id;
      })
      .filter((id) => id !== null) as string[];

    console.log("Mapped category IDs:", categoryIds);
    setSelectedCategories(categoryIds);
    setIsLoading(false);
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

      // Get category names for the array_categories field
      const categoryNames = selectedCategories
        .map((id) => {
          const category = categoriesData?.find((cat) => cat.id === id);
          if (!category) {
            console.warn(`Category with ID ${id} not found`);
            return null;
          }
          return category.name;
        })
        .filter((name) => name !== null) as string[];

      console.log("Updating store with categories:", categoryNames);

      // Update store information with array_categories only
      const { error: storeError } = await supabase
        .from("stores")
        .update({
          name: storeData.name,
          description: storeData.description,
          image: storeData.image,
          floor: storeData.floor,
          phone: storeData.phone,
          local_number: storeData.local_number,
          array_categories: categoryNames,
          mall_id: store.mall_id,
        })
        .eq("id", store.id);

      if (storeError) {
        console.error("Error updating store:", storeError);
        throw storeError;
      }

      toast.success("Tienda actualizada correctamente");
      resetForm();
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
              <Label htmlFor="local_number">Local</Label>
              <Input
                id="local_number"
                value={storeData.local_number}
                onChange={(e) =>
                  setStoreData({ ...storeData, local_number: e.target.value })
                }
                placeholder="Ej: 101, A-12"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Teléfono de Contacto</Label>
            <Input
              id="phone"
              value={storeData.phone}
              onChange={(e) =>
                setStoreData({ ...storeData, phone: e.target.value })
              }
              placeholder="Ej: +56 9 1234 5678"
            />
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
