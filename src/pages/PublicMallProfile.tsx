
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

export default function PublicMallProfile() {
  const { t } = useTranslation();
  const { mallId } = useParams();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const categories = stores ? [...new Set(stores.map(store => store.category))].sort() : [];
  
  const filteredStores = stores?.filter(store => 
    selectedCategory === "all" ? true : store.category === selectedCategory
  ) || [];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-48 bg-gray-200 rounded-lg"></div>
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
          <div className="text-center py-12 bg-white rounded-lg">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Button variant="ghost" className="mb-4 sm:mb-6" asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-purple-100/50">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 rounded-xl bg-purple-100 ring-1 ring-purple-200 flex-shrink-0">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <div className="space-y-4 w-full sm:w-auto">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words text-left">{mall.name}</h1>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
                      <p className="text-base sm:text-lg leading-relaxed text-left">{mall.address}</p>
                    </div>
                  </div>
                  
                  {mall.description && (
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl text-left">
                      {mall.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Tiendas Disponibles
                </h2>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <StoresList stores={filteredStores} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
