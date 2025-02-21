
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditPromotionFormProps {
  promotion: {
    id: string;
    title: string;
    description: string;
    type: string;
    start_date: string;
    end_date: string;
    terms_conditions?: string;
    discount_value?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPromotionDialog({ promotion, isOpen, onClose, onSuccess }: EditPromotionFormProps) {
  const { t } = useTranslation();
  const [editedPromotion, setEditedPromotion] = useState({
    title: promotion.title,
    description: promotion.description,
    type: promotion.type,
    start_date: new Date(promotion.start_date).toISOString().split('.')[0],
    end_date: new Date(promotion.end_date).toISOString().split('.')[0],
    terms_conditions: promotion.terms_conditions || "",
    discount_value: promotion.discount_value || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("promotions")
        .update({
          title: editedPromotion.title,
          description: editedPromotion.description,
          type: editedPromotion.type,
          start_date: editedPromotion.start_date,
          end_date: editedPromotion.end_date,
          terms_conditions: editedPromotion.terms_conditions,
          discount_value: editedPromotion.discount_value,
        })
        .eq("id", promotion.id);

      if (error) throw error;

      toast.success("Promotion updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Failed to update promotion");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('promotion')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('promotion')}</Label>
            <Select
              value={editedPromotion.type}
              onValueChange={(value) =>
                setEditedPromotion({ ...editedPromotion, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promotion">{t('promotion')}</SelectItem>
                <SelectItem value="coupon">{t('coupon')}</SelectItem>
                <SelectItem value="sale">{t('sale')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">{editedPromotion.type === "coupon" ? t('coupon') : t('promotion')}</Label>
            <Input
              value={editedPromotion.title}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              value={editedPromotion.description}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, description: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              value={editedPromotion.terms_conditions}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, terms_conditions: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="discount">Discount Value</Label>
            <Input
              value={editedPromotion.discount_value}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, discount_value: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="startDate">{t('startDate')}</Label>
            <Input
              type="datetime-local"
              value={editedPromotion.start_date}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, start_date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">{t('endDate')}</Label>
            <Input
              type="datetime-local"
              value={editedPromotion.end_date}
              onChange={(e) =>
                setEditedPromotion({ ...editedPromotion, end_date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('addPromotion')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
