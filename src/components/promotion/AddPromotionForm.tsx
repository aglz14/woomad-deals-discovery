
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddPromotionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddPromotionForm({ onSuccess, onCancel }: AddPromotionFormProps) {
  const { t } = useTranslation();
  const [selectedMall, setSelectedMall] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    type: "",
    start_date: "",
    end_date: "",
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
          start_date: new Date(newPromotion.start_date).toISOString(),
          end_date: new Date(newPromotion.end_date).toISOString(),
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
        <Label>{t('selectMall')}</Label>
        <Select value={selectedMall} onValueChange={setSelectedMall}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectMall')} />
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
        <Label>{t('selectStore')}</Label>
        <Select
          value={selectedStore}
          onValueChange={setSelectedStore}
          disabled={!selectedMall}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectStore')} />
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
        <Label>Tipo</Label>
        <Select
          value={newPromotion.type}
          onValueChange={(value) =>
            setNewPromotion({ ...newPromotion, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="promotion">{t('promotion')}</SelectItem>
            <SelectItem value="coupon">{t('coupon')}</SelectItem>
            <SelectItem value="sale">{t('sale')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>
          {newPromotion.type === "coupon" ? "Cupón" : "Título"}
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
        <Label>{t('description')}</Label>
        <Textarea
          value={newPromotion.description}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, description: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>{t('startDate')}</Label>
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
        <Label>{t('endDate')}</Label>
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
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!selectedStore}>
          {t('addPromotion')}
        </Button>
      </div>
    </form>
  );
}
