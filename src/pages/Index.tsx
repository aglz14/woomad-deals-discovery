
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HomeHero } from "@/components/home/HomeHero";
import { PromotionsList } from "@/components/home/PromotionsList";
import { StoresNearby } from "@/components/home/StoresNearby";
import { MallsNearby } from "@/components/home/MallsNearby";
import { useLocation } from "@/hooks/use-location";
import { getPromotions } from "@/services/promotions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMallId, setSelectedMallId] = useState<string>("all");
  const ITEMS_PER_PAGE = 9;
  const { t } = useTranslation();

  const { userLocation, calculateDistance } = useLocation();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions", userLocation],
    queryFn: () => getPromotions(userLocation, calculateDistance),
  });

  const { data: malls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filterPromotions = (promotions: any[]) => {
    if (!promotions) return [];
    let filtered = promotions;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(promotion => 
        promotion.store.name.toLowerCase().includes(searchLower) ||
        promotion.store.mall.name.toLowerCase().includes(searchLower) ||
        promotion.title.toLowerCase().includes(searchLower) ||
        promotion.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== 'all') {
      filtered = filtered.filter(promotion => 
        promotion.store.mall.id === selectedMallId
      );
    }

    return filtered;
  };

  const getCurrentPageItems = () => {
    if (!promotions) return [];
    const filteredPromotions = filterPromotions(promotions);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPromotions.slice(start, end);
  };

  const totalPages = Math.ceil((filterPromotions(promotions || []).length) / ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleMallFilter = (mallId: string) => {
    setSelectedMallId(mallId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <Header />
      
      <main className="flex-grow pt-16">
        <HomeHero 
          userLocation={userLocation}
        />

        <div className="container mx-auto px-4 py-12 space-y-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-1/2 lg:w-2/3">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder={t("searchPromotionsAndStores") || "Buscar promociones y tiendas..."} 
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 md:max-w-xs">
              <Select value={selectedMallId} onValueChange={handleMallFilter}>
                <SelectTrigger className="border-2 border-purple-100">
                  <SelectValue placeholder={t("selectMall") || "Select a Mall"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    {t("allMalls") || "All Malls"}
                  </SelectItem>
                  {malls?.map((mall) => (
                    <SelectItem key={mall.id} value={mall.id} className="cursor-pointer">
                      {mall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <ErrorBoundary>
            <div className="space-y-16 animate-fade-in">
              <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <PromotionsList
                  isLoading={isLoading}
                  promotions={promotions}
                  currentItems={getCurrentPageItems()}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  searchTerm={searchTerm}
                />
              </section>

              <section className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <StoresNearby 
                  searchTerm={searchTerm}
                  selectedMallId={selectedMallId}
                />
              </section>

              <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <MallsNearby 
                  searchTerm={searchTerm}
                  selectedMallId={selectedMallId}
                />
              </section>
            </div>
          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}
