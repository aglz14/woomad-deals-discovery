import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EditMallDialog } from "@/components/mall/EditMallDialog";
import { AddStoreDialog } from "@/components/mall/AddStoreDialog";
import { EditStoreDialog } from "@/components/store/EditStoreDialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminMallLoadingState } from "@/components/mall/AdminMallLoadingState";
import { AdminMallNotFound } from "@/components/mall/AdminMallNotFound";
import { AdminMallContent } from "@/components/mall/AdminMallContent";
import { toast } from "sonner";

export default function AdminMallProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<string | null>(null);

  const {
    data: mall,
    isLoading: isLoadingMall,
    refetch: refetchMall,
  } = useQuery({
    queryKey: ["mall", id],
    queryFn: async () => {
      console.log("Fetching mall with ID:", id);
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching mall:", error);
        toast("Error", {
          description: "No se pudo cargar el centro comercial",
        });
        throw error;
      }

      return data;
    },
  });

  const {
    data: stores,
    isLoading: isLoadingStores,
    refetch: refetchStores,
  } = useQuery({
    queryKey: ["mall-stores", id],
    enabled: !!id,
    queryFn: async () => {
      console.log("Fetching stores for mall:", id);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", id);

      if (error) {
        console.error("Error fetching stores:", error);
        throw error;
      }

      // Fetch promotion counts for each store
      const storeIds = data.map((store) => store.id);
      const { data: promotionCounts, error: promotionsError } = await supabase
        .from("promotions")
        .select("store_id, count")
        .in("store_id", storeIds)
        .eq("is_active", true)
        .group("store_id");

      if (promotionsError) {
        console.error("Error fetching promotion counts:", promotionsError);
      } else if (promotionCounts) {
        // Create a mapping of store IDs to promotion counts
        const countMap = promotionCounts.reduce(
          (acc: Record<string, number>, item: any) => {
            acc[item.store_id] = parseInt(item.count, 10);
            return acc;
          },
          {}
        );

        // Add the promotion count to each store
        data.forEach((store: any) => {
          store.activePromotionCount = countMap[store.id] || 0;
        });
      }

      return data;
    },
  });

  const handleDeleteStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeId);

      if (error) throw error;

      toast("Éxito", {
        description: "Tienda eliminada exitosamente",
      });
      refetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
      toast("Error", {
        description: "Error al eliminar la tienda",
      });
    }
  };

  if (isLoadingMall || isLoadingStores) {
    return <AdminMallLoadingState />;
  }

  if (!mall) {
    return <AdminMallNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow mt-16">
        <AdminMallContent
          mall={mall}
          stores={stores || []}
          onEditMall={() => setIsEditDialogOpen(true)}
          onAddStore={() => setIsAddStoreDialogOpen(true)}
          onEditStore={(storeId) => setStoreToEdit(storeId)}
          onDeleteStore={handleDeleteStore}
          onStoreClick={(storeId) => navigate(`/admin/store/${storeId}`)}
        />
      </main>
      <Footer />

      <EditMallDialog
        mall={mall}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          refetchMall();
          setIsEditDialogOpen(false);
        }}
      />

      <AddStoreDialog
        mallId={mall.id}
        isOpen={isAddStoreDialogOpen}
        onClose={() => setIsAddStoreDialogOpen(false)}
        onSuccess={() => {
          refetchStores();
          setIsAddStoreDialogOpen(false);
        }}
      />

      {storeToEdit && stores?.find((s) => s.id === storeToEdit) && (
        <EditStoreDialog
          store={stores.find((s) => s.id === storeToEdit)!}
          isOpen={true}
          onClose={() => setStoreToEdit(null)}
          onSuccess={() => {
            refetchStores();
            setStoreToEdit(null);
          }}
        />
      )}
    </div>
  );
}
