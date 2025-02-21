
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddPromotionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddPromotionForm({ onSuccess, onCancel }: AddPromotionFormProps) {
  const [selectedMall, setSelectedMall] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    type: "",
    discount_value: "",
    start_date: "",
    end_date: "",
    terms_conditions: "",
  });

  const { data: malls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores", selectedMall],
    enabled: !!selectedMall,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", selectedMall);
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("promotions").insert([
        {
          store_id: selectedStore,
          title: newPromotion.title,
          description: newPromotion.description,
          type: newPromotion.type,
          discount_value: newPromotion.discount_value,
          start_date: new Date(newPromotion.start_date).toISOString(),
          end_date: new Date(newPromotion.end_date).toISOString(),
          terms_conditions: newPromotion.terms_conditions,
        },
      ]);

      if (error) throw error;

      toast.success("Promotion added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding promotion:", error);
      toast.error("Failed to add promotion");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Select Mall</Label>
        <Select value={selectedMall} onValueChange={setSelectedMall}>
          <SelectTrigger>
            <SelectValue placeholder="Select a mall" />
          </SelectTrigger>
          <SelectContent>
            {malls?.map((mall) => (
              <SelectItem key={mall.id} value={mall.id}>
                {mall.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Select Store</Label>
        <Select
          value={selectedStore}
          onValueChange={setSelectedStore}
          disabled={!selectedMall}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a store" />
          </SelectTrigger>
          <SelectContent>
            {stores?.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Promotion Title</Label>
        <Input
          id="title"
          value={newPromotion.title}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, title: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={newPromotion.description}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, description: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Promotion Type</Label>
        <Select
          value={newPromotion.type}
          onValueChange={(value) =>
            setNewPromotion({ ...newPromotion, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="discount">Discount</SelectItem>
            <SelectItem value="bogo">Buy One Get One</SelectItem>
            <SelectItem value="coupon">Coupon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="discount_value">Discount Value</Label>
        <Input
          id="discount_value"
          value={newPromotion.discount_value}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, discount_value: e.target.value })
          }
          placeholder="e.g., 50% or BOGO"
          required
        />
      </div>

      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="datetime-local"
          value={newPromotion.start_date}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, start_date: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="datetime-local"
          value={newPromotion.end_date}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, end_date: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          value={newPromotion.terms_conditions}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, terms_conditions: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedStore}>
          Add Promotion
        </Button>
      </div>
    </form>
  );
}
