import { useQuery } from "@tanstack/react-query";
import { MapPin, AlertCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { StoresGrid } from "./StoresGrid";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";
import { toast } from "@/components/ui/use-toast";


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

  const { data: stores, isLoading, error: storesError } = useQuery({
    queryKey: ["stores-with-active-promotions", userLocation],
    queryFn: async () => {
      if (!userLocation) {
        console.warn("No hay ubicación de usuario disponible para StoresNearby");
        return [];
      }

      console.log("Buscando tiendas cercanas con ubicación:", userLocation);

      try {
        // First, get all malls within the radius
        const { data: malls, error: mallsError } = await supabase
          .from("shopping_malls")
          .select("*");

        if (mallsError) {
          console.error("Error al obtener centros comerciales:", mallsError);
          throw mallsError;
        }

        console.log(`Centros comerciales obtenidos: ${malls?.length || 0}`);

        // Filter malls by distance
        const nearbyMallIds = malls
          .filter(mall => {
            if (!mall.latitude || !mall.longitude) {
              console.warn(`Mall sin coordenadas: ${mall.name} (${mall.id})`);
              return false;
            }

            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              mall.latitude,
              mall.longitude
            );
            const isNearby = distance <= FIXED_RADIUS_KM;
            console.log(`Mall ${mall.name}: distancia ${distance.toFixed(2)}km, cercano: ${isNearby}`);
            return isNearby;
          })
          .map(mall => mall.id);

        console.log(`Centros comerciales cercanos encontrados: ${nearbyMallIds.length}`);

        if (nearbyMallIds.length === 0) return [];

        // Then get stores with active promotions from those malls
        const now = new Date().toISOString();
        console.log(`Buscando tiendas en malls con IDs: ${nearbyMallIds.join(', ')}`);

        try {
          const { data, error } = await supabase
            .from("stores")
            .select(`
              id, name, address, description, image_url, 
              latitude, longitude, mall_id,
              promotions!inner(
                id, title, description, start_date, end_date, image_url, active
              )
            `)
            .in('mall_id', nearbyMallIds)
            .gte('promotions.end_date', now)
            .eq('promotions.active', true);

          if (error) {
            toast.error("Error al cargar tiendas cercanas"); 
            console.error("Error de Supabase al cargar tiendas:", error);
            return [];
          }

          console.log(`Tiendas encontradas con promociones activas: ${data?.length || 0}`);

          if (!data || data.length === 0) {
            console.log("No se encontraron tiendas con promociones activas en los malls cercanos");
            return [];
          }

          return data;
        } catch (queryError) {
          toast.error("Error al procesar datos de tiendas");
          console.error("Error al ejecutar la consulta de tiendas:", queryError);
          return [];
        }
      }


        // Calculate distance for each store
        const storesWithDistance = data.map(store => ({
          ...store,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            store.latitude,
            store.longitude
          )
        }));

        // Remove duplicate stores (a store might have multiple active promotions)
        const uniqueStores = Array.from(new Map(storesWithDistance.map(store => [store.id, store])).values());

        // Sort stores by distance
        const sortedStores = uniqueStores.sort((a, b) => a.distance - b.distance);
        console.log("Stores with promotions found:", sortedStores.length, sortedStores);
        return sortedStores;
      } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
      }
    },
    enabled: !!userLocation, 
  });

  const filterStores = (stores: any[]) => {
    if (!stores) return [];
    let filtered = stores;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchLower) ||
          (store.address && store.address.toLowerCase().includes(searchLower)) ||
          (store.description && store.description.toLowerCase().includes(searchLower))
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