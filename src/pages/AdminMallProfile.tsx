
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoresList } from "@/components/mall/StoresList";
import { Building2, MapPin, ChevronLeft, Plus, PencilLine, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { EditMallDialog } from "@/components/mall/EditMallDialog";
import { AddStoreDialog } from "@/components/mall/AddStoreDialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AdminMallProfile() {
  const { t } = useTranslation();
  const { mallId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);

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
        toast({
          variant: "destructive",
          title: "Error",
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

  if (isLoadingMall || isLoadingStores) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" disabled>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a Promociones
            </Button>
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mall) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" asChild>
              <Link to="/promotions">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Promociones
              </Link>
            </Button>
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Centro Comercial No Encontrado</h3>
              <p className="mt-2 text-gray-500">El centro comercial que buscas no existe o ha sido eliminado</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <div className="bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" asChild>
              <Link to="/promotions">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Promociones
              </Link>
            </Button>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-md space-y-6 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-xl bg-purple-100 ring-1 ring-purple-200">
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{mall.name}</h1>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
                          <p className="text-lg leading-relaxed">{mall.address}</p>
                        </div>
                      </div>
                      
                      {mall.description && (
                        <div className="flex items-start gap-2 max-w-3xl">
                          <InfoIcon className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" />
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {mall.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="hover:bg-purple-50"
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">Tiendas Disponibles</h2>
                  <Button onClick={() => setIsAddStoreDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Tienda
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StoresList stores={stores || []} onStoreClick={handleStoreClick} />
                </div>
              </div>
            </div>
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
    </div>
  );
}
