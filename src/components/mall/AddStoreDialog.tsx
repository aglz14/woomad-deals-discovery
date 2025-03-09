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
    location_in_mall: "",
    contact_number: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
    try {
      if (!session?.user?.id) {
        toast.error("Debes iniciar sesión para agregar una tienda");
        return;
      }

      if (selectedCategories.length === 0) {
        toast.error("Debes seleccionar al menos una categoría");
        return;
      }

      // Insert the store first
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert({
          name: store.name,
          // Use the first category as the main category for backward compatibility
          category:
            categoriesData?.find((cat) => cat.id === selectedCategories[0])
              ?.name || "",
          description: store.description,
          location_in_mall: store.location_in_mall,
          contact_number: store.contact_number,
          mall_id: mallId,
          user_id: session.user.id,
        })
        .select("id")
        .single();

      if (storeError) throw storeError;

      // Insert the store-category relationships
      const storeCategoriesToInsert = selectedCategories.map((categoryId) => ({
        store_id: newStore.id,
        category_id: categoryId,
      }));

      const { error: categoriesError } = await supabase
        .from("store_categories")
        .insert(storeCategoriesToInsert);

      if (categoriesError) throw categoriesError;

      toast.success("Tienda agregada exitosamente");
      setStore({
        name: "",
        description: "",
        location_in_mall: "",
        contact_number: "",
      });
      setSelectedCategories([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error("Error al agregar la tienda");
    }
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
          <div>
            <Label htmlFor="location">Ubicación en el Centro Comercial</Label>
            <Input
              id="location"
              value={store.location_in_mall}
              onChange={(e) =>
                setStore({ ...store, location_in_mall: e.target.value })
              }
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
