
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
    },
    enabled: !!userLocation,
  });

  const filterStores = (stores: any[]) => {
    if (!stores) return [];
    
    let filtered = stores;
    
    // Apply mall filter if selected
    if (selectedMallId) {
      filtered = filtered.filter(store => store.mall_id === selectedMallId);
    }
    
    // Apply search filter if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        store => 
          store.name.toLowerCase().includes(searchLower) ||
          store.mall?.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const filteredStores = filterStores(stores || []);
  
  // Pagination
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredStores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handleStoreClick = (storeId: string) => {
    navigate(`/stores/${storeId}`);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <EmptyStateDisplay
          title="Error al cargar tiendas"
          message="Ocurrió un error al cargar las tiendas. Intenta más tarde."
          icon={AlertCircle}
        />
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
