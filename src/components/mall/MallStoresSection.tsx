
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoresList } from './StoresList';
import { Store } from '@/types/store';

interface MallStoresSectionProps {
  stores: Store[];
  onStoreClick: (storeId: string) => void;
  onAddStore: () => void;
  onEditStore: (storeId: string) => void;
  onDeleteStore: (storeId: string) => void;
}

export const MallStoresSection = ({
  stores,
  onStoreClick,
  onAddStore,
  onEditStore,
  onDeleteStore
}: MallStoresSectionProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Tiendas Disponibles</h2>
        <Button onClick={onAddStore} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tienda
        </Button>
      </div>
      <StoresList 
        stores={stores} 
        onStoreClick={onStoreClick}
        onEdit={onEditStore}
        onDelete={onDeleteStore}
      />
    </div>
  );
};
