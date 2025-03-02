import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";

export default function AllMalls() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 12;
  const { t } = useTranslation();
  const { userLocation, calculateDistance } = useLocation();
  const MAX_DISTANCE_KM = 50; // Show malls within 50km

  // Fetch all malls
  const { data: malls, isLoading } = useQuery({
    queryKey: ["all-shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filterMalls = (malls: any[]) => {
    if (!malls) return [];
    let filtered = malls;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(mall => 
        mall.name.toLowerCase().includes(searchLower) ||
        mall.address.toLowerCase().includes(searchLower) ||
        (mall.description && mall.description.toLowerCase().includes(searchLower))
      );
    }

    // Show all malls regardless of distance
    return filtered;
  };

  const getCurrentPageItems = () => {
    if (!malls) return [];
    const filteredMalls = filterMalls(malls);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredMalls.slice(start, end);
  };

  const totalPages = Math.ceil((filterMalls(malls || []).length) / ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <Button variant="ghost" className="mb-4 pt-4 sm:pt-6" asChild> {/* Added padding here */}
          <Link to="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToHome")}
          </Link>
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Todos los Centros Comerciales</h1>

        <div className="w-full mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={t("searchMalls") || "Search malls..."}
            className="w-full"
          />
        </div>

        <ErrorBoundary>
          <div className="space-y-6 animate-fade-in">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 h-48 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {getCurrentPageItems().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {getCurrentPageItems().map((mall) => (
                      <Link
                        to={`/mall/${mall.id}`}
                        key={mall.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{mall.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{mall.address}</p>
                        {mall.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{mall.description}</p>
                        )}
                        {userLocation && (
                          <p className="text-sm text-purple-600 mt-auto">
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              mall.latitude,
                              mall.longitude
                            ).toFixed(1)}{" "}
                            km
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("noMallsFound")}
                    </h3>
                    <p className="text-gray-500">
                      {t("tryAdjustingSearch")}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          className={`w-10 h-10 p-0 ${
                            currentPage === i + 1 ? "bg-purple-600" : ""
                          }`}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}