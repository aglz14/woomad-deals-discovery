
import { useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddMallFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMallForm({ onSuccess, onCancel }: AddMallFormProps) {
  const { session } = useSession();
  const [newMall, setNewMall] = useState({
    name: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("shopping_malls").insert([
        {
          name: newMall.name,
          address: newMall.address,
          description: newMall.description,
          latitude: parseFloat(newMall.latitude),
          longitude: parseFloat(newMall.longitude),
          user_id: session?.user.id,
        },
      ]);

      if (error) throw error;

      toast.success("Shopping mall added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding mall:", error);
      toast.error("Failed to add shopping mall");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Mall Name</Label>
        <Input
          id="name"
          value={newMall.name}
          onChange={(e) => setNewMall({ ...newMall, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={newMall.address}
          onChange={(e) => setNewMall({ ...newMall, address: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={newMall.description}
          onChange={(e) => setNewMall({ ...newMall, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          type="number"
          step="any"
          value={newMall.latitude}
          onChange={(e) => setNewMall({ ...newMall, latitude: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          type="number"
          step="any"
          value={newMall.longitude}
          onChange={(e) => setNewMall({ ...newMall, longitude: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Mall</Button>
      </div>
    </form>
  );
}
