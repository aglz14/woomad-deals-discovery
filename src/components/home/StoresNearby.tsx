
import { useQuery } from "@tanstack/react-query";
import { PublicStoreCard } from "@/components/mall/PublicStoreCard";
import { Loader, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { Slider } from "@/components/ui/slider";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

const MIN_DISTANCE_KM = 1;
const MAX_DISTANCE_KM = 50;
const DEFAULT_DISTANCE_KM = 10;

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRadius, setSearchRadius] = useState(DEFAULT_DISTANCE_KM);
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
      
      // Remove duplicate stores (a store might have multiple active promotions)
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

    // Filter by distance if user location is available
    if (userLocation) {
      filtered = filtered.filter((store) => {
        if (!store.mall?.latitude || !store.mall?.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          store.mall.latitude,
          store.mall.longitude
        );
        return distance <= searchRadius;
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

  const handleRadiusChange = (value: number[]) => {
    setSearchRadius(value[0]);
    setCurrentPage(1); // Reset to first page when radius changes
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-500">Cargando tiendas cercanas...</p>
      </div>
    );
  }

  if (!stores?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
          <p className="text-gray-500">No hay tiendas con promociones activas en este momento.</p>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentPageItems();

  if (currentItems.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
          <p className="text-gray-500">
            {userLocation 
              ? `No hay tiendas con promociones activas en un radio de ${searchRadius}km`
              : "Activa tu ubicación para ver tiendas cercanas con promociones activas"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tiendas con Promociones Activas</h2>
        {userLocation && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Radio de {searchRadius}km
          </span>
        )}
      </div>

      {userLocation && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="radius-slider" className="text-sm font-medium text-gray-700">
              Ajustar radio de búsqueda
            </label>
            <span className="text-sm text-gray-500">{searchRadius} km</span>
          </div>
          <Slider
            id="radius-slider"
            min={MIN_DISTANCE_KM}
            max={MAX_DISTANCE_KM}
            step={1}
            value={[searchRadius]}
            onValueChange={handleRadiusChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{MIN_DISTANCE_KM}km</span>
            <span>{MAX_DISTANCE_KM}km</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((store) => (
          <PublicStoreCard 
            key={store.id} 
            store={store} 
            onClick={() => handleStoreClick(store.id)}
          />
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
