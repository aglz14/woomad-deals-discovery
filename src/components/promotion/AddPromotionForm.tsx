import { useState, useEffect } from "react";
// Remove supabase import since it's not found and we're using supabaseHelpers instead
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
import {
  fetchPromotionTypes,
  PromotionType,
  insertPromotion,
} from "../../utils/supabaseHelpers";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    promotion_type: "",
    start_date: getTomorrowStart(),
    end_date: getTomorrowEnd(),
    terms_conditions: "",
    image: "",
    store_id: preselectedStoreId || "",
  });

  useEffect(() => {
    const loadPromotionTypes = async () => {
      setIsLoading(true);
      try {
        console.log("Loading promotion types in AddPromotionForm...");
        const types = await fetchPromotionTypes();
        console.log("Received promotion types:", types);
        setPromotionTypes(types);

        // If types are loaded but no promotion_type is selected and types exist, select the first one
        if (types.length > 0 && !formState.promotion_type) {
          console.log("Auto-selecting first promotion type:", types[0]);
          setFormState((prev) => ({ ...prev, promotion_type: types[0].id }));
        }

        toast.success(`Loaded ${types.length} promotion types`);
      } catch (err) {
        console.error("Error loading promotion types:", err);
        toast.error("Failed to load promotion types");
      } finally {
        setIsLoading(false);
      }
    };

    loadPromotionTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formState.title ||
      !formState.description ||
      !formState.promotion_type
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const newPromotionData = {
        title: formState.title,
        description: formState.description,
        promotion_type: formState.promotion_type,
        start_date: formState.start_date,
        end_date: formState.end_date,
        terms_conditions: formState.terms_conditions,
        image: formState.image,
        store_id: preselectedStoreId || formState.store_id,
        user_id: session?.user?.id || "",
      };

      const result = await insertPromotion(newPromotionData);

      if (result.error) {
        toast.error(`Error: ${result.error.message}`);
        return;
      }

      toast.success("Promoción creada exitosamente");
      onSuccess();
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Error: Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the coupon type for conditional rendering
  const couponTypeId = promotionTypes.find((t) => t.name === "Cupón")?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tipo de Promoción</Label>
        <Select
          value={formState.promotion_type}
          onValueChange={(value) =>
            setFormState({ ...formState, promotion_type: value })
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
          {formState.promotion_type === couponTypeId
            ? "Código del Cupón"
            : "Título"}
        </Label>
        <Input
          value={formState.title}
          onChange={(e) =>
            setFormState({ ...formState, title: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={formState.description}
          onChange={(e) =>
            setFormState({ ...formState, description: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Términos y Condiciones</Label>
        <Textarea
          value={formState.terms_conditions}
          onChange={(e) =>
            setFormState({
              ...formState,
              terms_conditions: e.target.value,
            })
          }
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>URL de la Imagen</Label>
        <Input
          value={formState.image}
          onChange={(e) =>
            setFormState({ ...formState, image: e.target.value })
          }
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>Fecha de inicio</Label>
        <Input
          type="datetime-local"
          value={formState.start_date}
          onChange={(e) =>
            setFormState({ ...formState, start_date: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Fecha de fin</Label>
        <Input
          type="datetime-local"
          value={formState.end_date}
          onChange={(e) =>
            setFormState({ ...formState, end_date: e.target.value })
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
