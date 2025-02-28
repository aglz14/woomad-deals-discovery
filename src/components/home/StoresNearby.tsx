
import { useQuery } from "@tanstack/react-query";
import { MapPin, AlertCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { StoresGrid } from "./StoresGrid";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

const FIXED_RADIUS_KM = 50;

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, calculateDistance } = useLocation();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores-with-active-promotions", userLocation],
    queryFn: async () => {
      if (!userLocation) return [];

      // First, get all malls within the radius
      const { data: malls, error: mallsError } = await supabase
        .from("shopping_malls")
        .select("*");

      if (mallsError) throw mallsError;

      // Filter malls by distance
      const nearbyMallIds = malls
        .filter(mall => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            mall.latitude,
            mall.longitude
          );
          return distance <= FIXED_RADIUS_KM;
        })
        .map(mall => mall.id);

      if (nearbyMallIds.length === 0) return [];

      // Then get stores with active promotions from those malls
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
        .in('mall_id', nearbyMallIds)
        .gt('promotions.end_date', now)
        .order('name');

      if (error) throw error;
      
      // Remove duplicate stores (a store might have multiple active promotions)
      const uniqueStores = Array.from(new Map(data.map(store => [store.id, store])).values());
      return uniqueStores;
    },
    enabled: !!userLocation, // Only run query if we have user location
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
        <EmptyStateDisplay
          title="No hay tiendas con promociones activas"
          message={userLocation 
            ? "No hay tiendas con promociones activas en este momento."
            : "Activa tu ubicación para ver tiendas cercanas con promociones activas"}
          icon={AlertCircle}
        />
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <EmptyStateDisplay
          title="No se encontraron resultados"
          message="Intenta ajustar tu búsqueda o filtros para encontrar tiendas"
          icon={AlertCircle}
        />
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
