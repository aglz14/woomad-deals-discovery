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
const isValidPromotionType = (
  type: string | null | undefined
): type is ValidPromotionType => {
  if (!type) return false;
  const normalizedType = type.toString().toLowerCase();
  return ["promotion", "coupon", "sale"].includes(normalizedType);
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
      console.log("Fetching store with ID:", id);
      const { data: store, error } = await supabase
        .from("stores")
        .select(
          `
            *,
            mall:shopping_malls(id, name, latitude, longitude, address)
          `
        )
        .eq("id", id as any)
        .maybeSingle();
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      if (!store) {
        toast.error("Store not found");
        throw new Error("Store not found");
      }
      console.log("Store data:", store);
      return store;
    },
    enabled: !!id,
  });

  const {
    data: promotions = [],
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      console.log("Fetching promotions for store ID:", id);
      const { data: rawData, error } = await supabase
        .from("promotions")
        .select(
          `
            *,
            store:stores(
              id,
              name,
              mall:shopping_malls(
                id,
                name,
                latitude,
                longitude
              )
            )
          `
        )
        .eq("store_id", id as any)
        .gte("end_date", new Date().toISOString()) // Match the public store profile
        .order("start_date", { ascending: true });

      console.log("Raw promotions data:", rawData);

      if (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Failed to fetch promotions");
        throw error;
      }

      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.log("No promotions found for this store");
        return [];
      }

      // Log each promotion to check column names
      rawData.forEach((promo: any, index) => {
        if (promo && typeof promo === "object") {
          console.log(`Promotion ${index + 1}:`, {
            id: promo.id,
            typeColumn: promo.type,
            promotionTypeColumn: promo.promotion_type,
            title: promo.title,
            startDate: promo.start_date,
            endDate: promo.end_date,
            isActive: promo.is_active,
          });
        }
      });

      // Simplified filtering approach that matches the public store profile
      // but still keeps the is_active check for admin view
      const validPromotions = (rawData as any[])
        .filter((promotion: any) => {
          if (!promotion || typeof promotion !== "object") {
            return false;
          }

          // Check active status if present (additional check for admin view)
          const isActive = promotion.is_active !== false; // Consider true if undefined or null

          // Apply type normalization for display
          const typeValue = (promotion.promotion_type || promotion.type || "")
            .toString()
            .toLowerCase();
          const isValidType = isValidPromotionType(typeValue);

          return isValidType && isActive;
        })
        .map((promotion: any) => {
          // Normalize the type field to ensure consistent data
          const effectiveType = (
            promotion.promotion_type ||
            promotion.type ||
            ""
          )
            .toString()
            .toLowerCase();
          return {
            ...promotion,
            type: effectiveType as ValidPromotionType,
          };
        });

      console.log("Final filtered promotions:", validPromotions.length);
      return validPromotions as DatabasePromotion[];
    },
    enabled: !!id,
  });

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId as any);
      if (error) throw error;
      toast.success("Promoción eliminada exitosamente");
      refetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar la promoción");
    }
  };

  const isOwner = session?.user?.id === (store as any)?.user_id;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              ← Volver al Panel Admin
            </button>
            <button
              onClick={() => {
                if ((store as any)?.mall_id) {
                  navigate(`/admin/mall/${(store as any).mall_id}`);
                } else {
                  navigate(-1);
                }
              }}
              className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              ← Volver al Centro Comercial
            </button>
          </div>

          {isStoreLoading || isPromotionsLoading ? (
            <StoreLoadingState />
          ) : !store ? (
            <StoreNotFound />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="w-full">
                <StoreInfo store={store as any} />
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
