
import { useState } from "react";
import { Plus, Search, Filter, Trash2, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Store = {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  category: string;
  location_in_mall?: string;
  contact_number?: string;
};

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
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Tiendas</h2>
        <Button onClick={onAddStore} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Agregar Tienda</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar tiendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border border-gray-300 rounded-md"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="w-full md:w-1/2 flex items-center gap-2">
          <Filter className="text-gray-500 h-4 w-4" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border border-gray-300 rounded-md">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">No se encontraron tiendas con los filtros actuales.</p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
              Limpiar búsqueda
            </Button>
          )}
          {selectedCategory !== "all" && (
            <Button variant="link" onClick={() => setSelectedCategory("all")} className="mt-2">
              Mostrar todas las categorías
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card 
              key={store.id} 
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer group"
              onClick={() => onStoreClick(store.id)}
            >
              <CardContent className="p-0">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <h3 className="font-medium text-lg text-gray-900 line-clamp-1">{store.name}</h3>
                      <Badge variant="outline" className="mt-1">{store.category}</Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditStore(store.id);
                              }}
                            >
                              <Pencil className="h-4 w-4 text-purple-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteStore(store.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {store.logo_url ? (
                    <div className="w-full h-32 bg-gray-100 rounded-md mb-3 overflow-hidden">
                      <img 
                        src={store.logo_url} 
                        alt={`${store.name} logo`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md mb-3">
                      <span className="text-gray-400 text-sm">No logo</span>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {store.description || "No description available"}
                  </p>
                  
                  {store.location_in_mall && (
                    <p className="text-xs text-gray-400 mt-auto">
                      <span className="font-medium">Ubicación:</span> {store.location_in_mall}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-gray-500">
          Mostrando {filteredStores.length} de {stores.length} tiendas
        </p>
        {filteredStores.length > 0 && (selectedCategory !== "all" || searchTerm !== "") && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};
