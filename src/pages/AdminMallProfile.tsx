import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import {
  getMallById,
  getStoresByMallId,
  deleteStore,
  Mall,
} from "@/utils/supabaseHelpers";
import { Store } from "@/types/store";

export default function AdminMallProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<string | null>(null);

  const {
    data: mall,
    isLoading: isLoadingMall,
    refetch: refetchMall,
  } = useQuery<Mall | null>({
    queryKey: ["mall", id],
    queryFn: async () => {
      if (!id) throw new Error("Mall ID is required");

      console.log("Fetching mall with ID:", id);
      const { data, error } = await getMallById(id);

      if (error) {
        console.error("Error fetching mall:", error);
        toast("Error", {
          description: "No se pudo cargar el centro comercial",
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  const {
    data: stores,
    isLoading: isLoadingStores,
    refetch: refetchStores,
  } = useQuery<Store[] | null>({
    queryKey: ["mall-stores", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Mall ID is required");

      console.log("Fetching stores for mall:", id);
      const { data, error } = await getStoresByMallId(id);

      if (error) {
        console.error("Error fetching stores:", error);
        throw error;
      }

      return data as Store[];
    },
  });

  const handleDeleteStore = async (storeId: string) => {
    try {
      const { error } = await deleteStore(storeId);

      if (error) {
        console.error("Error deleting store:", error);
        toast("Error", {
          description: `Error al eliminar la tienda: ${error.message}`,
        });
        return;
      }

      toast("Éxito", {
        description: "Tienda eliminada exitosamente",
      });
      refetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
      toast("Error", {
        description: "Error inesperado al eliminar la tienda",
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
          mall={{
            id: mall.id,
            name: mall.name,
            address: mall.address,
            description: mall.description,
            user_id: mall.user_id!
          }}
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

      {storeToEdit && stores && stores.find((s) => s.id === storeToEdit) && (
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
