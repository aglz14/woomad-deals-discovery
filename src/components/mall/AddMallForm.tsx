import { useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddMallFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMallForm({ onSuccess, onCancel }: AddMallFormProps) {
  const { t } = useTranslation();
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

    // Validate the form data
    if (!newMall.name || !newMall.address) {
      toast.error("Name and address are required");
      return;
    }

    // Parse and validate coordinates
    const lat = parseFloat(newMall.latitude);
    const lng = parseFloat(newMall.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be a valid number between -90 and 90");
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be a valid number between -180 and 180");
      return;
    }

    try {
      const { error } = await supabase.from("shopping_malls").insert([
        {
          name: newMall.name,
          address: newMall.address,
          description: newMall.description,
          latitude: lat,
          longitude: lng,
          user_id: session?.user.id,
        },
      ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast.success("Centro comercial añadido exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error adding mall:", error);
      toast.error("Error al añadir el centro comercial");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t('storeName')}</Label>
        <Input
          id="name"
          value={newMall.name}
          onChange={(e) => setNewMall({ ...newMall, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">{t('address')}</Label>
        <Input
          id="address"
          value={newMall.address}
          onChange={(e) => setNewMall({ ...newMall, address: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={newMall.description}
          onChange={(e) => setNewMall({ ...newMall, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="latitude">Latitud</Label>
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
        <Label htmlFor="longitude">Longitud</Label>
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
          {t('cancel')}
        </Button>
        <Button type="submit">{t('addShoppingMall')}</Button>
      </div>
    </form>
  );
}