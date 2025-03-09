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
import { useCategories } from "@/hooks/useCategories";
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
    contact_number: "",
    floor: "",
    image: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();

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
        return;
      }

      if (selectedCategories.length === 0) {
        toast.error("Debes seleccionar al menos una categoría");
        return;
      }

      // Get category names for the array_categories field
      const categoryNames = selectedCategories
        .map((id) => {
          const category = categoriesData?.find((cat) => cat.id === id);
          if (!category) {
            console.warn(`Category with ID ${id} not found`);
          }
          return category?.name;
        })
        .filter((name) => name !== undefined) as string[];

      console.log("Adding store with categories:", categoryNames);

      // Insert the store with array_categories
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert({
          name: store.name,
          description: store.description,
          contact_number: store.contact_number,
          floor: store.floor,
          image: store.image,
          array_categories: categoryNames,
          mall_id: mallId,
          user_id: session.user.id,
        })
        .select("id")
        .single();

      if (storeError) {
        console.error("Error inserting store:", storeError);
        throw storeError;
      }

      console.log("Store added successfully with ID:", newStore?.id);

      // Skip junction table operations if store_categories table doesn't exist
      // or if we don't have a store ID
      if (!newStore?.id) {
        console.warn("No store ID returned, skipping store_categories insert");
        toast.success("Tienda agregada exitosamente");
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      try {
        // Also insert into the junction table for proper relational structure
        const storeCategoriesToInsert = selectedCategories.map(
          (categoryId) => ({
            store_id: newStore.id,
            category_id: categoryId,
          })
        );

        console.log("Inserting store categories:", storeCategoriesToInsert);

        const { error: categoriesError } = await supabase
          .from("store_categories")
          .insert(storeCategoriesToInsert);

        if (categoriesError) {
          console.error("Error inserting store categories:", categoriesError);
          // Continue anyway since we already have the array_categories
        }
      } catch (junctionError) {
        console.error("Error with junction table operations:", junctionError);
        // Continue since we already saved the store with array_categories
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
      contact_number: "",
      floor: "",
      image: "",
    });
    setSelectedCategories([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              <Label htmlFor="contact">Número de Contacto</Label>
              <Input
                id="contact"
                value={store.contact_number}
                onChange={(e) =>
                  setStore({ ...store, contact_number: e.target.value })
                }
              />
            </div>
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
              onClick={onClose}
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
