
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full max-w-[600px]">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Tiendas Disponibles ({filteredStores.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <SearchBar 
              onSearch={setSearchTerm}
              placeholder="Buscar por nombre, descripción o ubicación..."
              initialValue={searchTerm}
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[240px] min-w-[240px] h-10">
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
