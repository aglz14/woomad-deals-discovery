import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/hooks/use-location";
import { StoresGrid } from "./StoresGrid";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";
import { toast } from "@/components/ui/use-toast";
import { StoresStateDisplay } from "./StoresStateDisplay";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, calculateDistance } = useLocation();
  const FIXED_RADIUS_KM = 50;

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>

      {isLoading ? (
        <StoresStateDisplay isLoading={true} />
      ) : storesError ? (
        <div className="text-center py-10">
          <p className="text-red-500">Error al cargar tiendas. Por favor intente nuevamente.</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <StoresStateDisplay isEmpty={true} searchRadius={FIXED_RADIUS_KM} hasLocation={!!userLocation} />
      ) : (
        <>
          <StoresGrid 
            stores={paginatedStores} 
            onSelect={(id) => navigate(`/store/${id}`)}
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}