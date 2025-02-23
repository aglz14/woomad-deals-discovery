
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { toast } from "sonner";
import { format } from "date-fns";

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
    type: promotion.type,
    start_date: format(new Date(promotion.start_date), "yyyy-MM-dd'T'HH:mm"),
    end_date: format(new Date(promotion.end_date), "yyyy-MM-dd'T'HH:mm"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("promotions")
        .update({
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        })
        .eq("id", promotion.id);

      if (error) throw error;

      toast.success("Promoción actualizada exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Error al actualizar la promoción");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Promoción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ValidPromotionType })}
              required
            >
              <option value="promotion">Promoción</option>
              <option value="coupon">Cupón</option>
              <option value="sale">Oferta</option>
            </select>
          </div>
          <div>
            <Label htmlFor="start_date">Fecha de inicio</Label>
            <Input
              type="datetime-local"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">Fecha de fin</Label>
            <Input
              type="datetime-local"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
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
