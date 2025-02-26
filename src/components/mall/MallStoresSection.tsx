
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoresList } from './StoresList';
import { Store } from '@/types/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchBar } from '@/components/search/SearchBar';

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
  const [searchTerm, setSearchTerm] = useState("");
  
  const categories = [...new Set(stores.map(store => store.category))].sort();
  
  const filteredStores = stores.filter(store => {
    const matchesCategory = selectedCategory === "all" ? true : store.category === selectedCategory;
    const matchesSearch = searchTerm.trim() === "" ? true : 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.location_in_mall || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 whitespace-nowrap">
          Tiendas Disponibles ({filteredStores.length})
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto sm:max-w-none">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <SearchBar 
              onSearch={setSearchTerm}
              placeholder="Buscar por nombre, descripción o ubicación..."
              initialValue={searchTerm}
              className="w-full sm:w-[300px]"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[240px] h-10">
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
          <Button onClick={onAddStore} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Tienda
          </Button>
        </div>
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
