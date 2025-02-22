
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoresList } from "@/components/mall/StoresList";
import { Building2, MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PublicMallProfile() {
  const { t } = useTranslation();
  const { mallId } = useParams();
  const { toast } = useToast();

  const { data: mall, isLoading: isLoadingMall } = useQuery({
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
    }
  });

  const { data: stores, isLoading: isLoadingStores } = useQuery({
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
    }
  });

  if (isLoadingMall || isLoadingStores) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-grow pt-20">
          <Button variant="ghost" className="mb-6" disabled>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('backToHome')}
          </Button>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!mall) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-grow pt-20">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Centro Comercial No Encontrado
            </h3>
            <p className="mt-2 text-gray-500">
              El centro comercial que buscas no existe o ha sido eliminado
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-b from-purple-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
          
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-md space-y-6 hover:shadow-lg transition-all duration-300 border border-purple-100/50">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-xl bg-purple-100/50 hover:bg-purple-100 transition-colors duration-300">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="space-y-5 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {mall.name}
                  </h1>
                  
                  <div className="flex items-start gap-3 group">
                    <MapPin className="h-5 w-5 mt-1 flex-shrink-0 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    <p className="text-lg text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                      {mall.address}
                    </p>
                  </div>
                  
                  {mall.description && (
                    <p className="text-gray-600 max-w-3xl text-lg leading-relaxed pl-8 border-l-2 border-purple-100 font-normal text-left">
                      {mall.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Tiendas Disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StoresList stores={stores || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
