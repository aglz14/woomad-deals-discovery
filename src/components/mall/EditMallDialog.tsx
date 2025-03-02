import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

    // Validate coordinates
    const lat = parseFloat(String(editedMall.latitude));
    const lng = parseFloat(String(editedMall.longitude));

    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be a valid number between -90 and 90");
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be a valid number between -180 and 180");
      return;
    }

    try {
      const { error } = await supabase
        .from("shopping_malls")
        .update({
          name: editedMall.name,
          address: editedMall.address,
          description: editedMall.description,
          latitude: lat,
          longitude: lng,
        })
        .eq("id", mall.id);

      if (error) throw error;

      toast.success(t("mallUpdatedSuccess"));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating mall:", error);
      toast.error("Error al actualizar el centro comercial"); //This line is changed.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editShoppingMall")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-mall-name">{t("name")}</Label>
            <Input
              id="edit-mall-name"
              value={editedMall.name}
              onChange={(e) => setEditedMall({ ...editedMall, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-mall-address">{t("address")}</Label>
            <Input
              id="edit-mall-address"
              value={editedMall.address}
              onChange={(e) => setEditedMall({ ...editedMall, address: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-mall-description">{t("description")}</Label>
            <Textarea
              id="edit-mall-description"
              value={editedMall.description}
              onChange={(e) => setEditedMall({ ...editedMall, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-mall-latitude">{t("latitude")}</Label>
              <Input
                id="edit-mall-latitude"
                type="number"
                step="any"
                value={editedMall.latitude}
                onChange={(e) => setEditedMall({ ...editedMall, latitude: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mall-longitude">{t("longitude")}</Label>
              <Input
                id="edit-mall-longitude"
                type="number"
                step="any"
                value={editedMall.longitude}
                onChange={(e) => setEditedMall({ ...editedMall, longitude: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}