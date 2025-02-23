
import { PublicStoreCard } from "@/components/mall/PublicStoreCard";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "@/hooks/use-location";
import { useNavigate } from "react-router-dom";

interface StoreGridProps {
  stores: any[];
  currentItems: any[];
}

export function StoreGrid({ stores, currentItems }: StoreGridProps) {
  const navigate = useNavigate();
  const { userLocation, formatDistance } = useLocation();

  const handleStoreClick = (storeId: string) => {
    navigate(`/stores/${storeId}`);
  };

  if (!stores?.length) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
        <p className="text-gray-500">No hay tiendas disponibles en este momento.</p>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
        <p className="text-gray-500">No se encontraron tiendas que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentItems.map((store) => (
        <div key={store.id} className="relative">
          <PublicStoreCard 
            store={store} 
            onClick={() => handleStoreClick(store.id)}
          />
          {userLocation && store.mall && (
            <Badge 
              className="absolute top-4 right-4 bg-purple-100 text-purple-800 border-purple-200"
            >
              {formatDistance(store.mall.latitude, store.mall.longitude)}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
