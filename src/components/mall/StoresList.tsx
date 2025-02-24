
import { Store } from '@/types/store';
import { PublicStoreCard } from './PublicStoreCard';
import { useNavigate } from 'react-router-dom';

interface StoresListProps {
  stores: Store[];
  onStoreClick?: (storeId: string) => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export const StoresList = ({ 
  stores,
  onStoreClick,
  onEdit,
  onDelete
}: StoresListProps) => {
  const navigate = useNavigate();

  if (stores.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No hay tiendas disponibles</p>
      </div>
    );
  }

  const handleStoreClick = (storeId: string) => {
    if (onStoreClick) {
      onStoreClick(storeId);
    } else {
      navigate(`/store/${storeId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <PublicStoreCard
          key={store.id}
          store={store}
          onClick={() => handleStoreClick(store.id)}
        />
      ))}
    </div>
  );
};
