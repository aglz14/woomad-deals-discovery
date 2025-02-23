
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditMallDialog } from "@/components/mall/EditMallDialog";
import { AddStoreDialog } from "@/components/mall/AddStoreDialog";
import { EditStoreDialog } from "@/components/store/EditStoreDialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MallHeader } from "@/components/mall/MallHeader";
import { MallStoresSection } from "@/components/mall/MallStoresSection";
import { toast } from "sonner";

export default function AdminMallProfile() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<string | null>(null);

  const handleStoreClick = (storeId: string) => {
    navigate(`/store/${storeId}/promotions`);
  };

  const { data: mall, isLoading: isLoadingMall, refetch: refetchMall } = useQuery({
    queryKey: ["mall", mallId],
    queryFn: async () => {
      console.log("Fetching mall with ID:", mallId);
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .eq("id", mallId)
        .single();

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
    queryKey: ["mall-stores", mallId],
    enabled: !!mallId,
    queryFn: async () => {
      console.log("Fetching stores for mall:", mallId);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", mallId);

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
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8">
          <Button variant="ghost" className="mb-6" disabled>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Promociones
          </Button>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mall) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/promotions">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a Promociones
            </Link>
          </Button>
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Centro Comercial No Encontrado</h3>
            <p className="mt-2 text-gray-500">El centro comercial que buscas no existe o ha sido eliminado</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/promotions" className="inline-flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a Promociones
            </Link>
          </Button>
          
          <div className="space-y-8">
            <MallHeader
              name={mall.name}
              address={mall.address}
              description={mall.description}
              mallUserId={mall.user_id}
              onEdit={() => setIsEditDialogOpen(true)}
            />

            <MallStoresSection
              stores={stores || []}
              onStoreClick={handleStoreClick}
              onAddStore={() => setIsAddStoreDialogOpen(true)}
              onEditStore={(storeId) => setStoreToEdit(storeId)}
              onDeleteStore={handleDeleteStore}
            />
          </div>
        </div>
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
