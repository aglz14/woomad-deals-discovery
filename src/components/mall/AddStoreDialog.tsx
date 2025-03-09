import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "@/components/providers/SessionProvider";
import { useCategories, Category } from "@/hooks/useCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddStoreDialogProps {
  mallId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStoreDialog({
  mallId,
  isOpen,
  onClose,
  onSuccess,
}: AddStoreDialogProps) {
  const { session } = useSession();
  const [store, setStore] = useState({
    name: "",
    description: "",
    phone: "",
    local_number: "",
    floor: "",
    image: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

  // Reset form when dialog is opened or closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
    setIsSubmitting(true);

    try {
      if (!session?.user?.id) {
        toast.error("Debes iniciar sesión para agregar una tienda");
        setIsSubmitting(false);
        return;
      }

      if (selectedCategories.length === 0) {
        toast.error("Debes seleccionar al menos una categoría");
        setIsSubmitting(false);
        return;
      }

      // For display purposes, get the first category name
      const firstCategoryName =
        (categoriesData as Category[])?.find(
          (cat) => cat.id === selectedCategories[0]
        )?.name || "";

      console.log("Selected category IDs for store:", selectedCategories);
      console.log("First category name (for display):", firstCategoryName);

      // First insert the store without array_categories
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert({
          name: store.name,
          description: store.description,
          phone: store.phone,
          local_number: store.local_number,
          floor: store.floor,
          image: store.image,
          mall_id: mallId,
          user_id: session.user.id,
        } as any)
        .select("id")
        .single();

      if (storeError) {
        console.error("Error inserting store:", storeError);
        throw storeError;
      }

      console.log("Store added successfully with ID:", newStore?.id);

      // Skip store_categories operations if we don't have a store ID
      if (!newStore?.id) {
        console.warn("No store ID returned, skipping store_categories insert");
        toast.success("Tienda agregada exitosamente");
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      // Insert into store_categories junction table and collect the IDs
      try {
        const storeCategoriesToInsert = selectedCategories.map(
          (categoryId) => ({
            store_id: newStore.id,
            category_id: categoryId,
          })
        );

        console.log("Inserting store_categories:", storeCategoriesToInsert);

        const { data: insertedCategories, error: categoriesError } =
          await supabase
            .from("store_categories")
            .insert(storeCategoriesToInsert as any)
            .select("id");

        if (categoriesError) {
          console.error("Error inserting store_categories:", categoriesError);
          // Continue anyway
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
            .eq("id", newStore.id as any);

          if (updateError) {
            console.error(
              "Error updating store with array_categories:",
              updateError
            );
          }
        }
      } catch (error) {
        console.error("Error with store_categories operations:", error);
        // Continue since we already saved the store
      }

      toast.success("Tienda agregada exitosamente");
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error(
        `Error al agregar la tienda: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStore({
      name: "",
      description: "",
      phone: "",
      local_number: "",
      floor: "",
      image: "",
    });
    setSelectedCategories([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tienda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la Tienda</Label>
            <Input
              id="name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              Categorías (selecciona al menos una)
            </Label>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {isCategoriesLoading ? (
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
              value={store.description}
              onChange={(e) =>
                setStore({ ...store, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor">Piso</Label>
              <Input
                id="floor"
                value={store.floor}
                onChange={(e) => setStore({ ...store, floor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="local_number">Local</Label>
              <Input
                id="local_number"
                value={store.local_number}
                onChange={(e) =>
                  setStore({ ...store, local_number: e.target.value })
                }
                placeholder="Ej: 101, A-12"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Teléfono de Contacto</Label>
            <Input
              id="phone"
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>
          <div>
            <Label htmlFor="image">URL de la Imagen (opcional)</Label>
            <Input
              id="image"
              value={store.image}
              onChange={(e) => setStore({ ...store, image: e.target.value })}
              placeholder="https://ejemplo.com/imagen.png"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
