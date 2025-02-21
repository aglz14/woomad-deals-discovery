
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { HomeHero } from "@/components/home/HomeHero";
import { PromotionsList } from "@/components/home/PromotionsList";
import { DatabasePromotion } from "@/types/promotion";
import { useLocation } from "@/hooks/use-location";
import { getPromotions } from "@/services/promotions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMallId, setSelectedMallId] = useState<string>("all");
  const ITEMS_PER_PAGE = 10;

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

  const filterPromotions = (promotions: DatabasePromotion[]) => {
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HomeHero 
          userLocation={userLocation} 
          onSearch={handleSearch}
          onMallSelect={handleMallFilter}
          malls={malls || []}
          selectedMallId={selectedMallId}
        />

        <div className="container mx-auto px-4 py-12">
          <ErrorBoundary>
            <PromotionsList
              isLoading={isLoading}
              promotions={promotions}
              currentItems={getCurrentPageItems()}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              searchTerm={searchTerm}
            />
          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}
