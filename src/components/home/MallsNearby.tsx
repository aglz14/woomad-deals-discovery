
import { MallCard } from "@/components/mall/MallCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Badge } from "@/components/ui/badge";

interface MallsNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export const MallsNearby = ({ searchTerm, selectedMallId }: MallsNearbyProps) => {
  const navigate = useNavigate();
  const { userLocation, calculateDistance, formatDistance, isWithinDistance } = useLocation();

  const { data: malls, isLoading } = useQuery({
    queryKey: ["shopping-malls", userLocation],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;

      if (userLocation) {
        return data
          .filter(mall => isWithinDistance(mall.latitude, mall.longitude))
          .sort((a, b) => {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
            return distA - distB;
          });
      }
      
      return data;
    },
  });

  const filteredMalls = malls?.filter(mall => {
    if (selectedMallId !== 'all' && mall.id !== selectedMallId) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      mall.name.toLowerCase().includes(searchLower) ||
      mall.address.toLowerCase().includes(searchLower) ||
      mall.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleMallClick = (mallId: string) => {
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron centros comerciales</h3>
        <p className="mt-2 text-gray-500">Intenta ajustar tus filtros de búsqueda o tu ubicación</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Centros Comerciales Cercanos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMalls.map((mall) => (
          <div key={mall.id} className="relative">
            <MallCard
              mall={mall}
              onClick={() => handleMallClick(mall.id)}
            />
            {userLocation && (
              <Badge 
                className="absolute top-4 right-4 bg-purple-100 text-purple-800 border-purple-200"
              >
                {formatDistance(mall.latitude, mall.longitude)}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
