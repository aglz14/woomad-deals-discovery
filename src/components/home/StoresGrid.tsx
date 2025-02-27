
import { PublicStoreCard } from "@/components/mall/PublicStoreCard";

interface Store {
  id: string;
  name: string;
  category: string;
  mall_id: string;
  user_id: string;
  mall?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface StoresGridProps {
  stores: Store[];
  onStoreClick: (storeId: string) => void;
}

export function StoresGrid({ stores, onStoreClick }: StoresGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <PublicStoreCard 
          key={store.id} 
          store={store} 
          onClick={() => onStoreClick(store.id)}
        />
      ))}
    </div>
  );
}
