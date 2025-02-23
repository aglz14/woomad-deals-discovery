
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    start_date: new Date(promotion.start_date),
    end_date: new Date(promotion.end_date),
  });

  const [startDate, setStartDate] = useState<Date>(new Date(promotion.start_date));
  const [endDate, setEndDate] = useState<Date>(new Date(promotion.end_date));
  const [startTime, setStartTime] = useState(format(new Date(promotion.start_date), "HH:mm"));
  const [endTime, setEndTime] = useState(format(new Date(promotion.end_date), "HH:mm"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const finalStartDate = new Date(startDate);
      finalStartDate.setHours(startHours, startMinutes);

      const finalEndDate = new Date(endDate);
      finalEndDate.setHours(endHours, endMinutes);

      const { error } = await supabase
        .from("promotions")
        .update({
          ...formData,
          start_date: finalStartDate.toISOString(),
          end_date: finalEndDate.toISOString(),
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
          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-[150px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha de fin</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-[150px]"
              />
            </div>
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
