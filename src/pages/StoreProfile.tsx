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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/SessionProvider";
import { AddPromotionForm } from "@/components/promotion/AddPromotionForm";

// Helper function to validate promotion type
const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export default function StoreProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [promotionToEdit, setPromotionToEdit] =
    useState<DatabasePromotion | null>(null);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(
          "*, mall:shopping_malls(id, name, latitude, longitude, address)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      return data;
    },
  });

  const {
    data: promotions,
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from("promotions")
        .select(
          `
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
        `
        )
        .eq("store_id", id)
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
    },
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

  const isOwner = session?.user?.id === store?.user_id;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <button
            onClick={() => {
              if (store?.mall_id) {
                navigate(`/admin/mall/${store.mall_id}`);
              } else {
                navigate(-1);
              }
            }}
            className="mb-4 sm:mb-6 lg:mb-8 text-purple-600 hover:text-purple-700 flex items-center gap-2 transition-colors"
          >
            ← Volver
          </button>

          {isStoreLoading || isPromotionsLoading ? (
            <StoreLoadingState />
          ) : !store ? (
            <StoreNotFound />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="w-full">
                <StoreInfo store={store} />
              </div>
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Promociones Actuales
                  </h2>
                  {isOwner && (
                    <Dialog
                      open={isAddingPromotion}
                      onOpenChange={setIsAddingPromotion}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Promoción
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95%] sm:w-full max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar Promoción</DialogTitle>
                        </DialogHeader>
                        <AddPromotionForm
                          onSuccess={() => {
                            setIsAddingPromotion(false);
                            refetchPromotions();
                          }}
                          onCancel={() => setIsAddingPromotion(false)}
                          preselectedStoreId={id}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
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
