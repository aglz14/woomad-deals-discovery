
import { Store } from "@/types/store";
import { StoreCard } from "@/components/StoreCard";

interface StoresListProps {
  stores: any[];
  onStoreClick: (storeId: string) => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export const StoresList = ({ stores, onStoreClick, onEdit, onDelete }: StoresListProps) => {
  return (
    <>
      {stores.map((store) => (
        <StoreCard 
          key={store.id} 
          store={store} 
          onClick={() => onStoreClick(store.id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};
