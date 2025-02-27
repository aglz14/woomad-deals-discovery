import { MallCard } from "@/components/mall/MallCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLocation } from "@/hooks/use-location";

interface MallsNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

const MAX_DISTANCE_KM = 50; // Show malls within 50km

export const MallsNearby = ({ searchTerm, selectedMallId }: MallsNearbyProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, calculateDistance } = useLocation();

  const { data: malls, isLoading } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredMalls = malls?.filter(mall => {
    // First filter by mall ID if selected
    if (selectedMallId !== 'all' && mall.id !== selectedMallId) return false;
    
    // Then filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = mall.name.toLowerCase().includes(searchLower) ||
        mall.address.toLowerCase().includes(searchLower) ||
        mall.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Finally, filter by distance if user location is available
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mall.latitude,
        mall.longitude
      );
      return distance <= MAX_DISTANCE_KM;
    }

    return true; // Include all malls if user location is not available
  });

  const getCurrentPageItems = () => {
    if (!filteredMalls) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredMalls.slice(start, end);
  };

  const totalPages = Math.ceil((filteredMalls?.length || 0) / ITEMS_PER_PAGE);

  const handleMallClick = (mallId: string) => {
    console.log("Navigating to mall:", mallId);
    navigate(`/mall/${mallId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando centros comerciales...</p>
      </div>
    );
  }

  if (!filteredMalls?.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron centros comerciales cercanos</h3>
        <p className="mt-2 text-gray-500">
          {userLocation 
            ? "No hay centros comerciales en un radio de 50km"
            : "Activa tu ubicación para ver centros comerciales cercanos"}
        </p>
      </div>
    );
  }

  const currentItems = getCurrentPageItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Centros Comerciales Cercanos</h2>
        {userLocation && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Radio de {MAX_DISTANCE_KM}km
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((mall) => (
          <MallCard
            key={mall.id}
            mall={mall}
            onClick={() => handleMallClick(mall.id)}
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
};
