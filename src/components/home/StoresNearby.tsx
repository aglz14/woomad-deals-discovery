import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { StoresGrid } from "./StoresGrid";
import { StoresStateDisplay } from "./StoresStateDisplay";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

const FIXED_RADIUS_KM = 10;

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, calculateDistance } = useLocation();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores-with-active-promotions"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          mall:shopping_malls (
            id,
            name,
            latitude,
            longitude,
            address
          ),
          promotions!inner (*)
        `)
        .gt('promotions.end_date', now)
        .order('name');

      if (error) throw error;
      const uniqueStores = Array.from(new Map(data.map(store => [store.id, store])).values());
      return uniqueStores;
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
          store.mall?.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== "all") {
      filtered = filtered.filter((store) => store.mall_id === selectedMallId);
    }

    if (userLocation) {
      filtered = filtered.filter((store) => {
        if (!store.mall?.latitude || !store.mall?.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          store.mall.latitude,
          store.mall.longitude
        );
        return distance <= FIXED_RADIUS_KM;
      });
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
    navigate(`/store/${storeId}`);
  };

  const currentItems = getCurrentPageItems();

  if (isLoading || !stores?.length || currentItems.length === 0) {
    return (
      <StoresStateDisplay
        isLoading={isLoading}
        isEmpty={!stores?.length}
        noResults={stores?.length > 0 && currentItems.length === 0}
        searchRadius={FIXED_RADIUS_KM}
        hasLocation={!!userLocation}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tiendas con Promociones Activas</h2>
        {userLocation && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Radio de {FIXED_RADIUS_KM}km
          </span>
        )}
      </div>

      <StoresGrid 
        stores={currentItems}
        onStoreClick={handleStoreClick}
      />

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
