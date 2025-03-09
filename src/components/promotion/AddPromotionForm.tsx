import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "@/components/providers/SessionProvider";

interface AddPromotionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  preselectedStoreId?: string;
}

export function AddPromotionForm({
  onSuccess,
  onCancel,
  preselectedStoreId,
}: AddPromotionFormProps) {
  const { session } = useSession();
  // Define fixed promotion types since there's no promotion_types table
  const promotionTypes = [
    { id: "promotion", name: "Promoción" },
    { id: "coupon", name: "Cupón" },
    { id: "sale", name: "Oferta" },
  ];

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    promotion_type: "",
    start_date: "",
    end_date: "",
    image: "", // Changed from image_url to image
    terms_conditions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user?.id) {
        toast.error("Debes iniciar sesión para agregar una promoción");
        return;
      }

      // Validate dates
      const startDate = new Date(newPromotion.start_date);
      const endDate = new Date(newPromotion.end_date);

      if (endDate <= startDate) {
        toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
        return;
      }

      // Logic to add a new promotion to the database
      const newPromotionData = {
        store_id: preselectedStoreId,
        title: newPromotion.title,
        description: newPromotion.description,
        type: newPromotion.promotion_type, // Map promotion_type to type
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        image: newPromotion.image || null, // Use image instead of image_url
        terms_conditions: newPromotion.terms_conditions || null,
        user_id: session.user.id,
      };

      // Using 'as any' to bypass TypeScript issues with the Supabase types
      const { error } = await supabase
        .from("promotions")
        .insert(newPromotionData as any);

      if (error) throw error;

      toast.success("Promoción agregada exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error adding promotion:", error);
      toast.error("Error al agregar la promoción");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tipo de Promoción</Label>
        <Select
          value={newPromotion.promotion_type}
          onValueChange={(value) =>
            setNewPromotion({ ...newPromotion, promotion_type: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {promotionTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>
          {newPromotion.promotion_type === "coupon"
            ? "Código del Cupón"
            : "Título"}
        </Label>
        <Input
          value={newPromotion.title}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, title: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={newPromotion.description}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, description: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Términos y Condiciones</Label>
        <Textarea
          value={newPromotion.terms_conditions}
          onChange={(e) =>
            setNewPromotion({
              ...newPromotion,
              terms_conditions: e.target.value,
            })
          }
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>URL de la Imagen</Label>
        <Input
          value={newPromotion.image}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, image: e.target.value })
          }
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>Fecha de inicio</Label>
        <Input
          type="datetime-local"
          value={newPromotion.start_date}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, start_date: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Fecha de fin</Label>
        <Input
          type="datetime-local"
          value={newPromotion.end_date}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, end_date: e.target.value })
          }
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Agregar Promoción</Button>
      </div>
    </form>
  );
}
