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
import { AddPromotionForm } from "@/components/promotion/AddPromotionForm";
import { useSession } from "@/components/providers/SessionProvider";

// Helper function to validate promotion type
const isValidPromotionType = (
  type: string | null | undefined
): type is ValidPromotionType => {
  if (!type) return false;
  const normalizedType = type.toString().toLowerCase();
  return ["promotion", "coupon", "sale"].includes(normalizedType);
};

// Helper function to normalize promotion data
const normalizePromotion = (promotion: any): DatabasePromotion => {
  const effectiveType = (
    promotion.promotion_type ||
    promotion.type ||
    "promotion"
  )
    .toString()
    .toLowerCase();

  return {
    ...promotion,
    type: effectiveType as ValidPromotionType,
  };
};

export default function StoreProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [promotionToEdit, setPromotionToEdit] =
    useState<DatabasePromotion | null>(null);

  // Fetch store data
  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError,
  } = useQuery({
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

      return store;
    },
    enabled: !!id,
  });

  // Fetch all promotions, calculate status based on new schema
  const {
    data: promotions = [],
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      // Get ALL promotions for this store
      const { data, error } = await supabase
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
        .order("created_at", { ascending: false }); // Show newest first

      if (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Failed to fetch promotions");
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }

      // Process promotions according to new schema
      const processedPromotions = data
        .filter((promo: any) => {
          // Skip invalid objects
          if (!promo || typeof promo !== "object") return false;

          // Check if type is valid
          const typeValue = promo.promotion_type || promo.type || "";
          return isValidPromotionType(typeValue);
        })
        .map((promotion: any) => {
          // Add status based on dates and is_active field
          const now = new Date();
          const startDate = promotion.start_date
            ? new Date(promotion.start_date)
            : null;
          const endDate = promotion.end_date
            ? new Date(promotion.end_date)
            : null;

          // A promotion is active if:
          // 1. It's not explicitly marked inactive
          // 2. Current date is within date range
          const isDateActive =
            startDate && endDate ? startDate <= now && endDate >= now : true;
          const isExplicitlyActive = promotion.is_active !== false;

          // Normalize promotion
          const normalized = normalizePromotion(promotion);

          // Add properly typed status field
          return {
            ...normalized,
            status:
              isDateActive && isExplicitlyActive
                ? ("active" as const)
                : ("inactive" as const),
          };
        });

      return processedPromotions;
    },
    enabled: !!id,
  });

  // Get available (active) promotions for main display
  const availablePromotions = promotions.filter(
    (promo) => promo.status === "active"
  );
  // Get inactive promotions for secondary display
  const inactivePromotions = promotions.filter(
    (promo) => promo.status === "inactive"
  );

  // Handle deleting a promotion
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

  // Check if the current user is the store owner
  const isOwner = session?.user?.id === (store as any)?.user_id;

  // Show loading state while data is being fetched
  if (isStoreLoading || isPromotionsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <StoreLoadingState />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show not found state if store doesn't exist
  if (storeError || !store) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <StoreNotFound />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-wrap gap-2 mb-6">
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

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="space-y-6 sm:space-y-8">
              {/* Store Info Section */}
              <div className="w-full">
                <StoreInfo store={store as any} />
              </div>

              {/* Available Promotions Section */}
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Promociones Disponibles
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

                {/* Available Promotions List */}
                <PromotionsList
                  promotions={availablePromotions}
                  onEdit={setPromotionToEdit}
                  onDelete={handleDeletePromotion}
                  showStatus={false}
                />
              </div>

              {/* Inactive Promotions Section - Only show if there are any */}
              {inactivePromotions.length > 0 && (
                <div className="w-full border-t pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                      Promociones Inactivas
                    </h2>
                  </div>

                  {/* Inactive Promotions List */}
                  <PromotionsList
                    promotions={inactivePromotions}
                    onEdit={setPromotionToEdit}
                    onDelete={handleDeletePromotion}
                    showStatus={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Edit Promotion Dialog */}
          {promotionToEdit && (
            <EditPromotionDialog
              promotion={promotionToEdit}
              isOpen={true}
              onClose={() => setPromotionToEdit(null)}
              onSuccess={() => {
                setPromotionToEdit(null);
                refetchPromotions();
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
