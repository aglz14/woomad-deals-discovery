
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddStoreDialogProps {
  mallId: string;
  onStoreAdded: () => void;
}

export function AddStoreDialog({ mallId, onStoreAdded }: AddStoreDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    description: "",
    category: "",
    floor: "",
    location_in_mall: "",
    contact_number: "",
  });

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("stores").insert([
        {
          ...newStore,
          mall_id: mallId,
        },
      ]);

      if (error) throw error;

      toast.success("Store added successfully");
      setIsOpen(false);
      setNewStore({
        name: "",
        description: "",
        category: "",
        floor: "",
        location_in_mall: "",
        contact_number: "",
      });
      onStoreAdded();
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error("Failed to add store");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('addStore')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newStore')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddStore} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('storeName')}</Label>
            <Input
              id="name"
              value={newStore.name}
              onChange={(e) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="category">{t('storeCategory')}</Label>
            <Input
              id="category"
              value={newStore.category}
              onChange={(e) =>
                setNewStore({ ...newStore, category: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="description">{t('storeDescription')}</Label>
            <Textarea
              id="description"
              value={newStore.description}
              onChange={(e) =>
                setNewStore({ ...newStore, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="floor">{t('storeFloor')}</Label>
            <Input
              id="floor"
              value={newStore.floor}
              onChange={(e) =>
                setNewStore({ ...newStore, floor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="location">{t('storeLocation')}</Label>
            <Input
              id="location"
              value={newStore.location_in_mall}
              onChange={(e) =>
                setNewStore({ ...newStore, location_in_mall: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="contact">{t('storeContact')}</Label>
            <Input
              id="contact"
              value={newStore.contact_number}
              onChange={(e) =>
                setNewStore({ ...newStore, contact_number: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            {t('addStore')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
