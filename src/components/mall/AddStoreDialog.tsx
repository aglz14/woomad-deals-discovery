
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddStoreDialogProps {
  mallId: string;
  onStoreAdded: () => void;
}

export function AddStoreDialog({ mallId, onStoreAdded }: AddStoreDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    description: "",
    category: "",
    floor: "",
    location_in_mall: "",
    contact_number: "",
    email: "",
    website: "",
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
        email: "",
        website: "",
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
          Add Store
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddStore} className="space-y-4">
          <div>
            <Label htmlFor="name">Store Name</Label>
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
            <Label htmlFor="category">Category</Label>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newStore.description}
              onChange={(e) =>
                setNewStore({ ...newStore, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              value={newStore.floor}
              onChange={(e) =>
                setNewStore({ ...newStore, floor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="location">Location in Mall</Label>
            <Input
              id="location"
              value={newStore.location_in_mall}
              onChange={(e) =>
                setNewStore({ ...newStore, location_in_mall: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={newStore.contact_number}
              onChange={(e) =>
                setNewStore({ ...newStore, contact_number: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newStore.email}
              onChange={(e) =>
                setNewStore({ ...newStore, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={newStore.website}
              onChange={(e) =>
                setNewStore({ ...newStore, website: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Add Store
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
