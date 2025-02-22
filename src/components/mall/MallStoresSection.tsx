
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Tiendas Disponibles</h2>
        <Button onClick={onAddStore}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tienda
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StoresList 
          stores={stores} 
          onStoreClick={onStoreClick}
          onEdit={onEditStore}
          onDelete={onDeleteStore}
        />
      </div>
    </div>
  );
};
