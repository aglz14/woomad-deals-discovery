
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditMallDialogProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description?: string;
    latitude: number;
    longitude: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMallDialog({ mall, isOpen, onClose, onSuccess }: EditMallDialogProps) {
  const { t } = useTranslation();
  const [editedMall, setEditedMall] = useState({
    name: mall.name,
    address: mall.address,
    description: mall.description || "",
    latitude: mall.latitude,
    longitude: mall.longitude,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("shopping_malls")
        .update({
          name: editedMall.name,
          address: editedMall.address,
          description: editedMall.description,
          latitude: editedMall.latitude,
          longitude: editedMall.longitude,
        })
        .eq("id", mall.id);

      if (error) throw error;

      toast.success(t("mallUpdatedSuccess"));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating mall:", error);
      toast.error(t("errorTitle"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editMall')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('mallName')}</Label>
            <Input
              id="name"
              value={editedMall.name}
              onChange={(e) => setEditedMall({ ...editedMall, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              value={editedMall.address}
              onChange={(e) => setEditedMall({ ...editedMall, address: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={editedMall.description}
              onChange={(e) => setEditedMall({ ...editedMall, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="latitude">{t('latitude')}</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={editedMall.latitude}
              onChange={(e) => setEditedMall({ ...editedMall, latitude: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="longitude">{t('longitude')}</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={editedMall.longitude}
              onChange={(e) => setEditedMall({ ...editedMall, longitude: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('update')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
