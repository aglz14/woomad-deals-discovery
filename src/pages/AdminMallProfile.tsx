
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
import { Search, X } from "lucide-react";

export default function AdminMallProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<string | null>(null);

  const { data: mall, isLoading: isLoadingMall, refetch: refetchMall } = useQuery({
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
          description: "No se pudo cargar el centro comercial"
        });
        throw error;
      }
      
      return data;
    },
  });

  const { data: stores, isLoading: isLoadingStores, refetch: refetchStores } = useQuery({
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
        description: "Tienda eliminada exitosamente"
      });
      refetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
      toast("Error", {
        description: "Error al eliminar la tienda"
      });
    }
  };

  if (isLoadingMall || isLoadingStores) {
    return <AdminMallLoadingState />;
  }

  if (!mall) {
    return <AdminMallNotFound />;
  }

  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter stores based on search query
  const filteredStores = (stores || []).filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow mt-16">
        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-16 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar tiendas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {filteredStores.length} tiendas
            </div>
          </div>
        </div>

        <AdminMallContent
          mall={mall}
          stores={filteredStores}
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

      {storeToEdit && stores?.find(s => s.id === storeToEdit) && (
        <EditStoreDialog
          store={stores.find(s => s.id === storeToEdit)!}
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
