
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

const FIXED_RADIUS_KM = 50;

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

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
            
            console.log(`${mall.name}: distancia ${distance.toFixed(2)}km, cercano: ${distance <= FIXED_RADIUS_KM}`);
            
            return distance <= FIXED_RADIUS_KM;
          })
          .map(mall => mall.id);

        console.log(`Centros comerciales cercanos encontrados: ${nearbyMallIds.length}`);

        if (nearbyMallIds.length === 0) {
          console.log("No se encontraron centros comerciales dentro del radio de " + FIXED_RADIUS_KM + "km");
          return [];
        }

        // Then get stores with active promotions from those malls
        const now = new Date().toISOString();
        console.log(`Buscando tiendas en malls con IDs: ${nearbyMallIds.join(', ')}`);

        try {
          const { data, error } = await supabase
            .from("stores")
            .select(`
              *,
              mall:shopping_malls (*),
              promotions!inner (*)
            `)
            .in("mall_id", nearbyMallIds)
            .gt("promotions.end_date", now)
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

          // Calculate distance for each store
          const storesWithDistance = data.map(store => ({
            ...store,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              store.mall.latitude,
              store.mall.longitude
            )
          }));

          // Remove duplicates (same store with multiple promotions)
          const storeIds = new Set();
          const uniqueStores = storesWithDistance.filter(store => {
            if (storeIds.has(store.id)) {
              return false;
            }
            storeIds.add(store.id);
            return true;
          });

          // Sort stores by distance
          const sortedStores = uniqueStores.sort((a, b) => a.distance - b.distance);
          console.log("Stores with promotions found:", sortedStores.length, sortedStores);
          return sortedStores;
        } catch (error) {
          console.error("Error fetching stores:", error);
          return [];
        }
      } catch (error) {
        console.error("Error in stores query:", error);
        return [];
      }
    },
    enabled: !!userLocation,
  });

  const filterStores = (stores: any[]) => {
    if (!stores) return [];
    let filteredStores = [...stores];

    // Apply mall filter if selected
    if (selectedMallId) {
      filteredStores = filteredStores.filter(store => store.mall.id === selectedMallId);
    }

    // Apply search term filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredStores = filteredStores.filter(
        store =>
          store.name.toLowerCase().includes(term) ||
          (store.description && store.description.toLowerCase().includes(term)) ||
          (store.mall && store.mall.name.toLowerCase().includes(term))
      );
    }

    return filteredStores;
  };

  const filteredStores = filterStores(stores || []);
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <Loader className="h-8 w-8 animate-spin mb-2" />
        <p>Cargando tiendas cercanas...</p>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error al cargar tiendas</p>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <MapPin className="h-8 w-8 mb-2" />
        <p>Activando ubicación para encontrar tiendas cercanas...</p>
      </div>
    );
  }

  if (!filteredStores || filteredStores.length === 0) {
    return (
      <EmptyStateDisplay
        title="No hay tiendas cercanas"
        description="No se encontraron tiendas con promociones activas en un radio de 50 km"
        icon={MapPin}
      />
    );
  }

  return (
    <div className="space-y-4">
      <StoresGrid
        stores={paginatedStores}
        onStoreClick={(storeId) => navigate(`/store/${storeId}`)}
      />
      
      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page => Math.max(1, page - 1));
                  }}
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page => Math.min(totalPages, page + 1));
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
