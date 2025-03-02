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
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GeofenceSettings } from "@/components/GeofenceSettings"; // Added import for GeofenceSettings


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

  // Animation classes for content sections
  const sectionClasses = "px-3 py-6 sm:px-4 sm:py-8 md:py-12 transition-all duration-300 hover:bg-gray-50/50";
  const sectionHeaderClasses = "flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3";
  const sectionTitleClasses = "text-xl sm:text-2xl md:text-3xl font-bold text-gray-900";

  // Get malls with active promotions
  const { data: malls } = useQuery({
    queryKey: ["malls-with-active-promotions", promotions],
    queryFn: async () => {
      if (!promotions || promotions.length === 0) return [];

      // Extract unique mall IDs from active promotions
      const mallIds = new Set(promotions.map(promo => promo.store.mall.id));

      // Get full mall data
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .in('id', Array.from(mallIds));

      if (error) throw error;
      return data;
    },
    enabled: !!promotions && promotions.length > 0,
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

      <main className="flex-grow pt-14 sm:pt-16">
        <HomeHero 
          userLocation={userLocation}
        />

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 space-y-8 sm:space-y-12 md:space-y-16">
          {/* Banner for all promotions */}
          <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 border border-white/10">
            <Link to="/allpromos" className="block p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center text-white">
                <div className="mb-4 sm:mb-0 animate-fade-up">
                  <div className="flex items-center">
                    <div className="h-10 w-1.5 bg-yellow-400 rounded-full mr-3"></div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Ver todas las promociones</h3>
                  </div>
                  <p className="mt-3 text-white/90 text-lg ml-4">Sin límite de distancia - Encuentra ofertas en cualquier parte</p>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm py-3 px-6 rounded-full transition-all duration-300 hover:bg-white/30 group">
                  <span className="mr-2 font-medium">Explorar</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>

          {/* Banner for all shopping malls */}
          <div className="w-full bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 border border-white/10">
            <Link to="/allmalls" className="block p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center text-white">
                <div className="mb-4 sm:mb-0 animate-fade-up">
                  <div className="flex items-center">
                    <div className="h-10 w-1.5 bg-yellow-400 rounded-full mr-3"></div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Ver todos los centros comerciales</h3>
                  </div>
                  <p className="mt-3 text-white/90 text-lg ml-4">Sin límite de distancia - Encuentra plazas en cualquier parte</p>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm py-3 px-6 rounded-full transition-all duration-300 hover:bg-white/30 group">
                  <span className="mr-2 font-medium">Explorar</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="w-full md:w-1/2 lg:w-2/3 mb-4 md:mb-0">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Busca ofertas, tiendas y centros comerciales a 50 km"
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 md:max-w-xs">
              <Select value={selectedMallId} onValueChange={handleMallFilter}>
                <SelectTrigger className="border-2 border-purple-100 w-full">
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
            <div className="space-y-8 sm:space-y-12 md:space-y-16 animate-fade-in">
              <section className="rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
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

              <section className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <StoresNearby 
                  searchTerm={searchTerm}
                  selectedMallId={selectedMallId}
                />
              </section>

              <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
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