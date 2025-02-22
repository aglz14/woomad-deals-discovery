
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { useState } from "react";
import { EditPromotionDialog } from "@/components/promotion/EditPromotionDialog";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { StoreLoadingState } from "@/components/store/StoreLoadingState";
import { StoreNotFound } from "@/components/store/StoreNotFound";
import { StoreInfo } from "@/components/store/StoreInfo";
import { PromotionsList } from "@/components/store/PromotionsList";

// Helper function to validate promotion type
const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export default function StoreProfile() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [promotionToEdit, setPromotionToEdit] = useState<DatabasePromotion | null>(null);

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      return data;
    }
  });

  const { data: promotions, isLoading: isPromotionsLoading, refetch: refetchPromotions } = useQuery({
    queryKey: ["promotions", storeId],
    queryFn: async () => {
      const currentDate = new Date().toISOString();
      const { data: rawData, error } = await supabase
        .from("promotions")
        .select(`
          *,
          store:stores (
            id,
            name,
            mall:shopping_malls (
              id,
              name,
              latitude,
              longitude
            )
          )
        `)
        .eq("store_id", storeId)
        .lte("start_date", currentDate)  // Start date is before or equal to now
        .gte("end_date", currentDate)    // End date is after or equal to now
        .order("start_date", { ascending: true });
      
      if (error) {
        toast.error("Failed to fetch promotions");
        throw error;
      }

      // Filter and validate the promotion types
      const validPromotions = rawData
        .filter((promotion) => isValidPromotionType(promotion.type))
        .map((promotion) => ({
          ...promotion,
          type: promotion.type as ValidPromotionType,
        })) as DatabasePromotion[];

      return validPromotions;
    }
  });

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);
      if (error) throw error;
      toast.success("Promoción eliminada exitosamente");
      refetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar la promoción");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-purple-600 hover:text-purple-700 flex items-center gap-2 transition-colors"
          >
            ← Volver
          </button>

          {isStoreLoading || isPromotionsLoading ? (
            <StoreLoadingState />
          ) : !store ? (
            <StoreNotFound />
          ) : (
            <div className="space-y-8">
              <div className="w-full">
                <StoreInfo store={store} />
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Promociones Actuales
                </h2>
                <PromotionsList
                  promotions={promotions || []}
                  onEdit={setPromotionToEdit}
                  onDelete={handleDeletePromotion}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {promotionToEdit && (
        <EditPromotionDialog
          promotion={promotionToEdit}
          isOpen={true}
          onClose={() => setPromotionToEdit(null)}
          onSuccess={() => {
            refetchPromotions();
            setPromotionToEdit(null);
          }}
        />
      )}
    </div>
  );
}
