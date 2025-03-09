import { useState, useEffect } from "react";
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
  // Use proper IDs from the database instead of string identifiers
  const [promotionTypes, setPromotionTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    promotion_type: "",
    start_date: "",
    end_date: "",
    image: "",
    terms_conditions: "",
  });

  // Fetch real promotion types from database
  useEffect(() => {
    const fetchPromotionTypes = async () => {
      setIsLoading(true);
      try {
        // Attempt to fetch from promotion_type table with the correct column 'type' instead of 'name'
        const { data, error } = await supabase
          .from("promotion_type")
          .select("id, type");

        if (error) {
          console.error("Error fetching promotion types:", error);
          // Fallback to hardcoded values if table doesn't exist or can't be accessed
          setPromotionTypes([
            { id: "1c8930f0-9168-4247-9b3c-5a3c8d94a10e", name: "Promoción" },
            { id: "2d7841a1-0279-5358-0c4d-6b4d7e05b11f", name: "Cupón" },
            { id: "3e6752b2-1389-6469-1e5e-7c5e8f16c20g", name: "Oferta" },
          ]);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Map from 'type' to 'name' for consistent interface
          const formattedTypes = data.map((item: any) => ({
            id: item.id,
            name: item.type, // Use the 'type' column as the displayed name
          }));
          setPromotionTypes(formattedTypes);
        } else {
          // Fallback if no data
          setPromotionTypes([
            { id: "1c8930f0-9168-4247-9b3c-5a3c8d94a10e", name: "Promoción" },
            { id: "2d7841a1-0279-5358-0c4d-6b4d7e05b11f", name: "Cupón" },
            { id: "3e6752b2-1389-6469-1e5e-7c5e8f16c20g", name: "Oferta" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching promotion types:", err);
        // Fallback
        setPromotionTypes([
          { id: "1c8930f0-9168-4247-9b3c-5a3c8d94a10e", name: "Promoción" },
          { id: "2d7841a1-0279-5358-0c4d-6b4d7e05b11f", name: "Cupón" },
          { id: "3e6752b2-1389-6469-1e5e-7c5e8f16c20g", name: "Oferta" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotionTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user?.id) {
        toast.error("Debes iniciar sesión para agregar una promoción");
        return;
      }

      if (!newPromotion.promotion_type) {
        toast.error("Selecciona un tipo de promoción");
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
        promotion_type: newPromotion.promotion_type, // This is now a UUID reference
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        image: newPromotion.image || null,
        terms_conditions: newPromotion.terms_conditions || null,
        user_id: session.user.id,
      };

      console.log("Sending promotion data:", newPromotionData);

      // Using 'as any' to bypass TypeScript issues with the Supabase types
      const { data, error } = await supabase
        .from("promotions")
        .insert(newPromotionData as any)
        .select();

      if (error) throw error;

      console.log("Promotion created:", data);
      toast.success("Promoción agregada exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error adding promotion:", error);
      toast.error("Error al agregar la promoción: " + JSON.stringify(error));
    }
  };

  // Find the coupon type for conditional rendering
  const couponTypeId = promotionTypes.find((t) => t.name === "Cupón")?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tipo de Promoción</Label>
        <Select
          value={newPromotion.promotion_type}
          onValueChange={(value) =>
            setNewPromotion({ ...newPromotion, promotion_type: value })
          }
          disabled={isLoading}
          required
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "Cargando tipos..." : "Seleccionar tipo"}
            />
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
          {newPromotion.promotion_type === couponTypeId
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
