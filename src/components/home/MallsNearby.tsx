import { MallCard } from "@/components/mall/MallCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, AlertCircle, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLocation } from "@/hooks/use-location";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";
import { useGeofencing } from "@/hooks/use-geofencing"; // Placeholder for the missing hook
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


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

  const filteredMalls = malls?.map(mall => {
    // Calculate distance if user location is available
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mall.latitude,
        mall.longitude
      );
      return { ...mall, distance };
    }
    return mall;
  }).filter(mall => {
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
    if (userLocation && mall.distance !== undefined) {
      return mall.distance <= MAX_DISTANCE_KM;
    }

    return true; // Include all malls if user location is not available
  });

  // Set up geofencing with the malls data
  const { isMonitoring } = useGeofencing(malls || []);

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

  // Notifications functionality moved to Profile page only
  // This function is no longer needed as mentioned in the comment above
  // const handleToggleNotifications = (enabled: boolean) => {
  //   setNotificationsEnabled(enabled);
  //   if (enabled) {
  //     startMonitoring();
  //   } else {
  //     stopMonitoring();
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-500">Cargando centros comerciales...</p>
      </div>
    );
  }

  if (!filteredMalls?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Centros Comerciales Cercanos</h2>
        <EmptyStateDisplay
          title="No se encontraron centros comerciales cercanos"
          message={userLocation 
            ? "No hay centros comerciales en un radio de 50km"
            : "Activa tu ubicación para ver centros comerciales cercanos"}
          icon={Building2}
        />
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

      {/* Notification toggle removed - now only in Profile page */}

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