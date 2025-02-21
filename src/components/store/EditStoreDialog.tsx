
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditStoreFormProps {
  store: {
    id: string;
    name: string;
    description?: string;
    category: string;
    location_in_mall?: string;
    floor?: string;
    contact_number?: string;
    email?: string;
    website?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStoreDialog({ store, isOpen, onClose, onSuccess }: EditStoreFormProps) {
  const { t } = useTranslation();
  const [editedStore, setEditedStore] = useState({
    name: store.name,
    description: store.description || "",
    category: store.category,
    location_in_mall: store.location_in_mall || "",
    floor: store.floor || "",
    contact_number: store.contact_number || "",
    email: store.email || "",
    website: store.website || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: editedStore.name,
          description: editedStore.description,
          category: editedStore.category,
          location_in_mall: editedStore.location_in_mall,
          floor: editedStore.floor,
          contact_number: editedStore.contact_number,
          email: editedStore.email,
          website: editedStore.website,
        })
        .eq("id", store.id);

      if (error) throw error;

      toast.success("Store updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Failed to update store");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newStore')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('storeName')}</Label>
            <Input
              id="name"
              value={editedStore.name}
              onChange={(e) => setEditedStore({ ...editedStore, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">{t('storeCategory')}</Label>
            <Input
              id="category"
              value={editedStore.category}
              onChange={(e) => setEditedStore({ ...editedStore, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">{t('storeDescription')}</Label>
            <Textarea
              id="description"
              value={editedStore.description}
              onChange={(e) => setEditedStore({ ...editedStore, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="floor">{t('storeFloor')}</Label>
            <Input
              id="floor"
              value={editedStore.floor}
              onChange={(e) => setEditedStore({ ...editedStore, floor: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">{t('storeLocation')}</Label>
            <Input
              id="location"
              value={editedStore.location_in_mall}
              onChange={(e) => setEditedStore({ ...editedStore, location_in_mall: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact">{t('storeContact')}</Label>
            <Input
              id="contact"
              value={editedStore.contact_number}
              onChange={(e) => setEditedStore({ ...editedStore, contact_number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedStore.email}
              onChange={(e) => setEditedStore({ ...editedStore, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={editedStore.website}
              onChange={(e) => setEditedStore({ ...editedStore, website: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('addStore')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
