
import { MallCard } from "@/components/mall/MallCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

interface MallsNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export const MallsNearby = ({ searchTerm, selectedMallId }: MallsNearbyProps) => {
  const navigate = useNavigate();

  const { data: malls, isLoading } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron centros comerciales</h3>
        <p className="mt-2 text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Centros Comerciales Cercanos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMalls.map((mall) => (
          <MallCard
            key={mall.id}
            mall={mall}
            onClick={() => handleMallClick(mall.id)}
          />
        ))}
      </div>
    </div>
  );
};
