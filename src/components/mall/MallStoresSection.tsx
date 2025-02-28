import React, { useState } from 'react';
import { Plus, Pencil, Trash, MapPin } from 'lucide-react';
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
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tiendas</h2>
            <p className="text-sm text-gray-500 mt-1">{stores.length} tiendas en este centro comercial</p>
          </div>
          <Button onClick={onAddStore} className="gap-2 bg-purple-600 hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4" />
            Agregar tienda
          </Button>
        </div>
      </div>

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
      </div>

      {filteredStores.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Store className="h-16 w-16 mb-4 opacity-20 text-purple-300" />
          <p className="text-lg mb-2">No hay tiendas en este centro comercial</p>
          <Button variant="outline" onClick={onAddStore} className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50">
            Agregar la primera tienda
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div 
              key={store.id} 
              className="border rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-200 hover:border-purple-200"
            >
              <div
                className="cursor-pointer p-4 h-full flex flex-col"
                onClick={() => onStoreClick(store.id)}
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{store.name}</h3>
                  {store.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {store.description}
                    </p>
                  )}
                  {store.location_in_mall && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{store.location_in_mall}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStoreClick(store.id);
                    }}
                  >
                    Ver detalles
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStore(store.id);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-gray-500 hover:text-purple-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStore(store.id);
                      }}
                    >
                      <Trash className="h-4 w-4 text-gray-500 hover:text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};