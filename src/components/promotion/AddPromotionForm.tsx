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

// Add helper functions for getting date values
const getTomorrowStart = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
};

const getTomorrowEnd = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  return tomorrow.toISOString().slice(0, 16);
};

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
    start_date: getTomorrowStart(),
    end_date: getTomorrowEnd(),
    terms_conditions: "",
    image_url: "",
    is_active: true,
    store_id: preselectedStoreId || "",
  });

  // Fetch real promotion types from database
  useEffect(() => {
    const fetchPromotionTypes = async () => {
      setIsLoading(true);
      try {
        console.log("Attempting to fetch promotion types from database...");

        // First check if promotion_type table has data
        const { data, error } = await supabase
          .from("promotion_type")
          .select("*");

        console.log("Raw promotion_type data:", data);

        if (error) {
          console.error("Error fetching promotion types:", error);
          toast.error(`Failed to fetch promotion types: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Map the data based on the structure
          const formattedTypes = data.map((item) => {
            // Try to get the display name from the correct column
            const displayName =
              item.type || item.name || Object.values(item)[1];

            return {
              id: item.id,
              name: displayName,
            };
          });

          console.log("Existing promotion types:", formattedTypes);
          setPromotionTypes(formattedTypes);
          toast.success(`Loaded ${formattedTypes.length} promotion types`);
        } else {
          // No promotion types found, we need to create them
          console.log("No promotion types found, creating default ones...");

          // Define the default promotion types to create
          const defaultTypes = [
            { type: "Promoción" },
            { type: "Cupón" },
            { type: "Oferta" },
          ];

          // Insert the default types
          const { data: insertedData, error: insertError } = await supabase
            .from("promotion_type")
            .insert(defaultTypes)
            .select();

          if (insertError) {
            console.error("Error creating promotion types:", insertError);
            toast.error(
              `Failed to create promotion types: ${insertError.message}`
            );

            // Use fallback without real IDs
            setPromotionTypes([
              { id: "1", name: "Promoción" },
              { id: "2", name: "Cupón" },
              { id: "3", name: "Oferta" },
            ]);
          } else if (insertedData) {
            console.log("Created promotion types:", insertedData);

            // Map the newly inserted data
            const newTypes = insertedData.map((item) => ({
              id: item.id,
              name: item.type,
            }));

            setPromotionTypes(newTypes);
            toast.success(`Created ${newTypes.length} promotion types`);
          }
        }
      } catch (err) {
        console.error("Error handling promotion types:", err);
        // Use fallback without real IDs as last resort
        setPromotionTypes([
          { id: "1", name: "Promoción" },
          { id: "2", name: "Cupón" },
          { id: "3", name: "Oferta" },
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
        title: newPromotion.title,
        description: newPromotion.description,
        promotion_type: newPromotion.promotion_type, // This is now a UUID reference
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        terms_conditions: newPromotion.terms_conditions || null,
        image_url: newPromotion.image_url || null,
        store_id: preselectedStoreId || newPromotion.store_id,
        user_id: session.user.id,
        is_active: true,
      };

      console.log("Sending promotion data:", newPromotionData);

      // Use type assertion for database operations
      const { data, error } = await supabase
        .from("promotions")
        .insert(newPromotionData as unknown as Record<string, unknown>)
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
          value={newPromotion.image_url}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, image_url: e.target.value })
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
