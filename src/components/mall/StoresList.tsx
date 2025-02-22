
import { Store } from "@/types/store";
import { AdminStoreCard } from "./AdminStoreCard";
import { PublicStoreCard } from "./PublicStoreCard";

interface StoresListProps {
  stores: Store[];
  onStoreClick: (storeId: string) => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export const StoresList = ({ stores, onStoreClick, onEdit, onDelete }: StoresListProps) => {
  const isAdminView = !!onEdit && !!onDelete;

  return (
    <>
      {stores.map((store) => (
        isAdminView ? (
          <AdminStoreCard 
            key={store.id} 
            store={store} 
            onClick={() => onStoreClick(store.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <PublicStoreCard 
            key={store.id} 
            store={store} 
            onClick={() => onStoreClick(store.id)}
          />
        )
      ))}
    </>
  );
};
