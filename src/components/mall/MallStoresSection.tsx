
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoresList } from './StoresList';
import { Store } from '@/types/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const categories = [...new Set(stores.map(store => store.category))].sort();
  
  const filteredStores = stores.filter(store => 
    selectedCategory === "all" ? true : store.category === selectedCategory
  );

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Tiendas Disponibles ({filteredStores.length})
          </h2>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddStore} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tienda
        </Button>
      </div>
      <StoresList 
        stores={filteredStores} 
        onStoreClick={onStoreClick}
        onEdit={onEditStore}
        onDelete={onDeleteStore}
      />
    </div>
  );
};
