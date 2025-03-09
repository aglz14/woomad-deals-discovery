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
import { Store } from "@/types/store";
import { deletePromotion } from "../utils/supabaseHelpers";

// Define types for raw database records
interface RawPromotion {
  id: string;
  created_at: string;
  store_id?: string;
  title: string;
  description: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  user_id?: string;
  promotion_type?: string;
  terms_conditions?: string;
  store?: RawStore;
}

interface RawStore {
  id: string;
  name: string;
  user_id?: string;
  mall_id?: string;
  mall?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// Helper function to validate promotion type
const isValidPromotionType = (
  type: string | null | undefined
): type is ValidPromotionType => {
  if (!type) return false;
  const normalizedType = type.toString().toLowerCase();
  return ["promotion", "coupon", "sale"].includes(normalizedType);
};

// Helper function to normalize promotion data
const normalizePromotion = (promotion: RawPromotion): DatabasePromotion => {
  return {
    id: promotion.id,
    created_at: promotion.created_at,
    store_id: promotion.store_id,
    title: promotion.title,
    description: promotion.description,
    start_date: promotion.start_date || new Date().toISOString(),
    end_date: promotion.end_date || new Date().toISOString(),
    image: promotion.image,
    user_id: promotion.user_id,
    promotion_type: promotion.promotion_type || "promotion",
    terms_conditions: promotion.terms_conditions,
    store: promotion.store
      ? {
          id: promotion.store.id,
          name: promotion.store.name,
          mall: promotion.store.mall
            ? {
                id: promotion.store.mall.id,
                name: promotion.store.mall.name,
                latitude: promotion.store.mall.latitude,
                longitude: promotion.store.mall.longitude,
              }
            : undefined,
        }
      : undefined,
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
  } = useQuery<Store | null>({
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
        // @ts-expect-error - Supabase types incompatibility
        .eq("id", id || "")
        .maybeSingle();

      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }

      if (!store) {
        toast.error("Store not found");
        throw new Error("Store not found");
      }

      return store as unknown as RawStore;
    },
    enabled: !!id,
  });

  // Fetch and display all promotions (no status filtering)
  const {
    data: promotionsData = [],
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      console.log("Fetching promotions for store ID:", id);

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
        // @ts-expect-error - Supabase types incompatibility
        .eq("store_id", id || "")
        .order("created_at", { ascending: false }); // Show newest first

      console.log("Raw promotions data:", data);

      if (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Failed to fetch promotions");
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("No promotions found for store ID:", id);
        return [];
      }

      // Process promotions - only filter out invalid objects, keep all valid promotions
      const processedPromotions = (data as unknown as RawPromotion[])
        .filter((promo) => {
          // Skip invalid objects
          return promo && typeof promo === "object";
        })
        .map(normalizePromotion);

      console.log("All promotions:", processedPromotions.length);
      return processedPromotions;
    },
    enabled: !!id,
  });

  const handleDeletePromotion = async (promotionId: string) => {
    if (window.confirm("¿Estás seguro que deseas eliminar esta promoción?")) {
      try {
        const { error } = await deletePromotion(promotionId);

        if (error) {
          toast.error(`Error: ${error.message}`);
          return;
        }

        // Refetch promotions instead of using setPromotions
        refetchPromotions();
        toast.success("Promoción eliminada exitosamente");
      } catch (error) {
        console.error("Error deleting promotion:", error);
        toast.error("Error: Unexpected error occurred");
      }
    }
  };

  // Check if the current user is the store owner
  const isOwner = session?.user?.id === store?.user_id;

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

  // Debug information
  console.log("Promotions state:", promotionsData);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                if (store?.mall_id) {
                  navigate(`/admin/mall/${store.mall_id}`);
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
                <StoreInfo store={store as Store} />
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

                {/* Debug information */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                    <p>Debug: Found {promotionsData?.length || 0} promotions</p>
                  </div>
                )}

                {/* Promotions List - show all promotions */}
                <PromotionsList
                  promotions={promotionsData}
                  onEdit={setPromotionToEdit}
                  onDelete={handleDeletePromotion}
                />
              </div>
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
