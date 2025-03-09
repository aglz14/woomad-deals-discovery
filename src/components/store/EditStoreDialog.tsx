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
import { useCategories, Category } from "@/hooks/useCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoreCategoryRelation {
  id: string;
  category_id: string;
}

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
  const [storeCategoryRelations, setStoreCategoryRelations] = useState<
    StoreCategoryRelation[]
  >([]);
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

      // Fetch store categories when dialog opens
      if (store.id && categoriesData) {
        fetchStoreCategories();
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
    setStoreCategoryRelations([]);
    setSubmitting(false);
    setIsLoading(false);
  };

  const fetchStoreCategories = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching categories for store ID:", store.id);

      // Get categories from the junction table with their IDs
      const { data, error } = await supabase
        .from("store_categories")
        .select("id, category_id")
        .eq("store_id", store.id as any);

      if (error) {
        console.error(
          "Error fetching store categories from junction table:",
          error
        );
        // Try to initialize from array_categories as a fallback
        initializeFromArrayCategories();
      } else if (data && data.length > 0) {
        // Store the full relation objects for later use
        setStoreCategoryRelations(data as StoreCategoryRelation[]);

        // Extract just the category IDs for the UI
        const categoryIds = data.map((item: any) => item.category_id);
        console.log("Found categories in junction table:", categoryIds);
        setSelectedCategories(categoryIds);
      } else {
        // Fall back to array_categories if junction table is empty
        console.log("Junction table empty, falling back to array_categories");
        initializeFromArrayCategories();
      }
    } catch (error) {
      console.error("Error in fetchStoreCategories:", error);
      toast.error("Error al cargar las categorías de la tienda");

      // Try to initialize from array_categories as a fallback
      initializeFromArrayCategories();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFromArrayCategories = () => {
    if (!store.array_categories || !Array.isArray(store.array_categories)) {
      console.warn("No array_categories available or invalid format");
      return;
    }

    console.log("Initializing from array_categories:", store.array_categories);

    // If we have category IDs in the array_categories, we need to fetch the corresponding store_categories entries
    // This is a fallback and might not work perfectly
    if (categoriesData) {
      // Try to find category IDs that match our categories data
      const categoryIds = store.array_categories
        .map((item) => {
          // Check if this looks like a UUID for a category
          const category = (categoriesData as Category[]).find(
            (cat) => cat.id === item
          );
          if (category) {
            return category.id;
          }
          return null;
        })
        .filter((id) => id !== null) as string[];

      if (categoryIds.length > 0) {
        console.log(
          "Extracted category IDs from array_categories:",
          categoryIds
        );
        setSelectedCategories(categoryIds);
      }
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

      // For display purposes, get the first category name
      const firstCategoryName =
        (categoriesData as Category[])?.find(
          (cat) => cat.id === selectedCategories[0]
        )?.name || "";

      console.log("Selected category IDs for store:", selectedCategories);
      console.log("First category name (for display):", firstCategoryName);

      // First update the store without array_categories
      const { error: storeError } = await supabase
        .from("stores")
        .update({
          name: storeData.name,
          description: storeData.description,
          image: storeData.image,
          floor: storeData.floor,
          phone: storeData.phone,
          local_number: storeData.local_number,
          mall_id: store.mall_id,
        } as any)
        .eq("id", store.id as any);

      if (storeError) {
        console.error("Error updating store:", storeError);
        throw storeError;
      }

      console.log("Store updated successfully");

      // Update the store_categories junction table
      try {
        // First delete existing relationships
        console.log(
          "Deleting existing store categories for store ID:",
          store.id
        );
        const { error: deleteError } = await supabase
          .from("store_categories")
          .delete()
          .eq("store_id", store.id as any);

        if (deleteError) {
          console.error(
            "Error deleting existing store categories:",
            deleteError
          );
        }

        // Then insert new relationships
        const storeCategoriesToInsert = selectedCategories.map(
          (categoryId) => ({
            store_id: store.id,
            category_id: categoryId,
          })
        );

        console.log("Inserting new store categories:", storeCategoriesToInsert);
        const { data: insertedCategories, error: insertError } = await supabase
          .from("store_categories")
          .insert(storeCategoriesToInsert as any)
          .select("id");

        if (insertError) {
          console.error("Error inserting new store categories:", insertError);
        } else if (insertedCategories) {
          // Update the store with the store_categories IDs
          const storeCategoryIds = (insertedCategories as any[]).map(
            (item) => item.id
          );
          console.log(
            "Updating store with store_categories IDs:",
            storeCategoryIds
          );

          const { error: updateError } = await supabase
            .from("stores")
            .update({
              array_categories: storeCategoryIds,
            } as any)
            .eq("id", store.id as any);

          if (updateError) {
            console.error(
              "Error updating store with array_categories:",
              updateError
            );
          }
        }
      } catch (error) {
        console.error("Error managing store_categories:", error);
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
              ) : categoriesData &&
                (categoriesData as Category[]).length > 0 ? (
                <div className="space-y-2">
                  {(categoriesData as Category[]).map((cat) => (
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
