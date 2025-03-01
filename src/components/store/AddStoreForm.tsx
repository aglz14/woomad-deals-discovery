
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "@/components/providers/SessionProvider";

interface AddStoreFormProps {
  mallId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
}

export function AddStoreForm({ mallId, onSuccess, onCancel }: AddStoreFormProps) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    floor: "",
    local_number: "",
    category: "",
  });

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("Debe iniciar sesión para agregar una tienda");
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error("El nombre de la tienda es obligatorio");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('stores')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            floor: formData.floor,
            local_number: formData.local_number,
            category: formData.category,
            mall_id: mallId,
            created_by: session.user.id
          }
        ])
        .select();
      
      if (error) {
        toast.error("Error al crear la tienda: " + error.message);
        return;
      }
      
      toast.success("Tienda creada exitosamente");
      onSuccess();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error("Error al crear la tienda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre de la tienda"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción de la tienda"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="floor">Piso</Label>
          <Input
            id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            placeholder="Piso"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="local_number">Número de local</Label>
          <Input
            id="local_number"
            name="local_number"
            value={formData.local_number}
            onChange={handleChange}
            placeholder="Número de local"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
