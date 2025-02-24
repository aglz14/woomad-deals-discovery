
import React, { useState } from 'react';
import { PublicStoreCard } from './PublicStoreCard';
import { AdminStoreCard } from './AdminStoreCard';
import { Store } from '@/types/store';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/search/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const isAdminView = !!onEdit && !!onDelete;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleStoreClick = (storeId: string) => {
    if (onStoreClick) {
      onStoreClick(storeId);
    } else {
      navigate(`/store/${storeId}`);
    }
  };

  const uniqueCategories = Array.from(new Set(stores.map(store => store.category)));

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-96">
          <SearchBar 
            onSearch={setSearchTerm}
            placeholder="Buscar tiendas..."
            initialValue={searchTerm}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            isAdminView ? (
              <AdminStoreCard 
                key={store.id} 
                store={store}
                onClick={() => handleStoreClick(store.id)}
                onEdit={onEdit!}
                onDelete={onDelete!}
              />
            ) : (
              <PublicStoreCard 
                key={store.id} 
                store={store} 
                onClick={() => handleStoreClick(store.id)}
              />
            )
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No se encontraron tiendas que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
