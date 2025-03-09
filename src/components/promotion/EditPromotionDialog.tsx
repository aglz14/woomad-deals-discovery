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
import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPromotionTypes,
  PromotionType,
  updatePromotion,
} from "../../utils/supabaseHelpers";

interface EditPromotionDialogProps {
  promotion: DatabasePromotion;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPromotionDialog({
  promotion,
  isOpen,
  onClose,
  onSuccess,
}: EditPromotionDialogProps) {
  const [formData, setFormData] = useState({
    title: promotion.title,
    description: promotion.description,
    promotion_type: promotion.promotion_type,
    start_date: format(new Date(promotion.start_date), "yyyy-MM-dd'T'HH:mm"),
    end_date: format(new Date(promotion.end_date), "yyyy-MM-dd'T'HH:mm"),
    terms_conditions: promotion.terms_conditions || "",
    image: promotion.image || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);

  // Fetch promotion types
  useEffect(() => {
    const loadPromotionTypes = async () => {
      setIsLoading(true);
      try {
        console.log("Loading promotion types in EditPromotionDialog...");
        const types = await fetchPromotionTypes();
        console.log("Received promotion types:", types);
        setPromotionTypes(types);
        toast.success(`Loaded ${types.length} promotion types`);
      } catch (err) {
        console.error("Error loading promotion types:", err);
        toast.error("Failed to load promotion types");
      } finally {
        setIsLoading(false);
      }
    };

    loadPromotionTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        promotion_type: formData.promotion_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        terms_conditions: formData.terms_conditions || null,
        image: formData.image || null,
      };

      console.log("Submitting promotion update:", promotionData);
      const { data, error } = await updatePromotion(
        promotion.id,
        promotionData
      );

      if (error) {
        toast.error(`Error: ${error.message}`);
        return;
      }

      console.log("Promotion updated successfully:", data);
      toast.success("Promoción actualizada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Error: Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Promoción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_type">Tipo</Label>
            <Select
              value={formData.promotion_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  promotion_type: value,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading ? "Cargando tipos..." : "Selecciona un tipo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {promotionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de inicio</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de fin</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms_conditions">Términos y condiciones</Label>
            <Textarea
              id="terms_conditions"
              value={formData.terms_conditions}
              onChange={(e) =>
                setFormData({ ...formData, terms_conditions: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL de imagen</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
