
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSession } from "@/components/providers/SessionProvider";

interface AddStoreDialogProps {
  mallId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStoreDialog({ mallId, isOpen, onClose, onSuccess }: AddStoreDialogProps) {
  const { session } = useSession();
  const [store, setStore] = useState({
    name: "",
    category: "",
    description: "",
    location_in_mall: "",
    contact_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user?.id) {
        toast.error("You must be logged in to add a store");
        return;
      }

      const { error } = await supabase
        .from("stores")
        .insert([
          {
            ...store,
            mall_id: mallId,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success("Store added successfully");
      onSuccess();
      onClose();
      setStore({
        name: "",
        category: "",
        description: "",
        location_in_mall: "",
        contact_number: "",
      });
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error("Error adding store");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={store.category}
              onChange={(e) => setStore({ ...store, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={store.description}
              onChange={(e) => setStore({ ...store, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location in Mall</Label>
            <Input
              id="location"
              value={store.location_in_mall}
              onChange={(e) => setStore({ ...store, location_in_mall: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={store.contact_number}
              onChange={(e) => setStore({ ...store, contact_number: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
