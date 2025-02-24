
import React, { useState } from 'react';
import { PublicStoreCard } from './PublicStoreCard';
import { AdminStoreCard } from './AdminStoreCard';
import { Store } from '@/types/store';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout, Store as StoreIcon } from 'lucide-react';

interface StoresListProps {
  stores: Store[];
  onStoreClick?: (storeId: string) => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export const StoresList = ({ stores, onStoreClick, onEdit, onDelete }: StoresListProps) => {
  const navigate = useNavigate();
  const isAdminView = !!onEdit && !!onDelete;
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
    return selectedCategory === 'all' || store.category === selectedCategory;
  });

  return (
    <div className="w-full space-y-8">
      {/* Filter Section */}
      <div className="mx-auto w-full max-w-2xl bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-purple-100/20">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full bg-white">
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

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>{filteredStores.length} {filteredStores.length === 1 ? 'tienda encontrada' : 'tiendas encontradas'}</span>
          </div>
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-2">
              <span>Mostrando: {selectedCategory}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
          {filteredStores.map((store) => (
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
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl text-center p-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100/20">
          <StoreIcon className="mx-auto h-12 w-12 text-purple-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron tiendas</h3>
          <p className="mt-2 text-sm text-gray-500">
            No hay tiendas que coincidan con tu búsqueda. Intenta con otra categoría.
          </p>
        </div>
      )}
    </div>
  );
};
