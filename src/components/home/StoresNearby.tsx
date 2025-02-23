
import { useQuery } from "@tanstack/react-query";
import { PublicStoreCard } from "@/components/mall/PublicStoreCard";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { Badge } from "@/components/ui/badge";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, calculateDistance, formatDistance, isWithinDistance } = useLocation();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores", userLocation],
    queryFn: async () => {
      const { data: malls } = await supabase
        .from("shopping_malls")
        .select("*");

      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          mall:shopping_malls (
            *
          )
        `);

      if (error) throw error;

      if (userLocation && malls) {
        return data
          .filter(store => {
            const mall = malls.find(m => m.id === store.mall_id);
            return mall ? isWithinDistance(mall.latitude, mall.longitude) : true;
          })
          .sort((a, b) => {
            const mallA = malls.find(m => m.id === a.mall_id);
            const mallB = malls.find(m => m.id === b.mall_id);
            if (!mallA || !mallB) return 0;
            
            const distA = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              mallA.latitude,
              mallA.longitude
            );
            const distB = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              mallB.latitude,
              mallB.longitude
            );
            return distA - distB;
          });
      }

      return data;
    },
  });

  const filterStores = (stores: any[]) => {
    if (!stores) return [];
    let filtered = stores;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchLower) ||
          store.mall.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== "all") {
      filtered = filtered.filter((store) => store.mall_id === selectedMallId);
    }

    return filtered;
  };

  const getCurrentPageItems = () => {
    if (!stores) return [];
    const filteredStores = filterStores(stores);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredStores.slice(start, end);
  };

  const totalPages = Math.ceil((filterStores(stores || []).length) / ITEMS_PER_PAGE);

  const handleStoreClick = (storeId: string) => {
    navigate(`/stores/${storeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-500">Cargando tiendas cercanas...</p>
      </div>
    );
  }

  const currentItems = getCurrentPageItems();

  if (!stores?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas Cercanas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
          <p className="text-gray-500">No hay tiendas disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas Cercanas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
          <p className="text-gray-500">No se encontraron tiendas que coincidan con tu búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Tiendas Cercanas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((store) => (
          <div key={store.id} className="relative">
            <PublicStoreCard 
              store={store} 
              onClick={() => handleStoreClick(store.id)}
            />
            {userLocation && store.mall && (
              <Badge 
                className="absolute top-4 right-4 bg-purple-100 text-purple-800 border-purple-200"
              >
                {formatDistance(store.mall.latitude, store.mall.longitude)}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.max(1, currentPage - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
