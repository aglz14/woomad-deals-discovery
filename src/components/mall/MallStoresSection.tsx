import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Pencil,
  X,
  MapPin,
  Phone,
} from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

type Store = {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  array_categories?: string[];
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

interface StoreCategoryMap {
  [storeId: string]: {
    categoryIds: string[];
    categoryNames: string[];
  };
}

export const MallStoresSection = ({
  stores,
  onStoreClick,
  onAddStore,
  onEditStore,
  onDeleteStore,
}: MallStoresSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [storeCategoryMap, setStoreCategoryMap] = useState<StoreCategoryMap>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesForStores = async () => {
      setIsLoading(true);
      try {
        // Step 1: Get all categories for reference
        const { data: allCategories, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          return;
        }

        // Create a mapping from category ID to name
        const categoryIdToName = allCategories.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {} as Record<string, string>);

        // Get unique category names for the dropdown
        const uniqueCategoryNames = [
          ...new Set(allCategories.map((c) => c.name)),
        ];
        setCategories(uniqueCategoryNames);

        // Step 2: Fetch store_categories entries for all stores
        const { data: storeCategories, error: storeCategoriesError } =
          await supabase
            .from("store_categories")
            .select("store_id, category_id")
            .in(
              "store_id",
              stores.map((store) => store.id)
            );

        if (storeCategoriesError) {
          console.error(
            "Error fetching store_categories:",
            storeCategoriesError
          );
          return;
        }

        // Step 3: Create a mapping from store ID to its categories
        const tempStoreCategoryMap: StoreCategoryMap = {};

        // Initialize with empty arrays for each store
        stores.forEach((store) => {
          tempStoreCategoryMap[store.id] = {
            categoryIds: [],
            categoryNames: [],
          };
        });

        // Populate with data from store_categories
        storeCategories.forEach((entry) => {
          if (tempStoreCategoryMap[entry.store_id]) {
            tempStoreCategoryMap[entry.store_id].categoryIds.push(
              entry.category_id
            );
            const categoryName = categoryIdToName[entry.category_id];
            if (categoryName) {
              tempStoreCategoryMap[entry.store_id].categoryNames.push(
                categoryName
              );
            }
          }
        });

        // Set the mapping in state
        setStoreCategoryMap(tempStoreCategoryMap);
      } catch (error) {
        console.error("Error in fetchCategoriesForStores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesForStores();
  }, [stores]);

  const filteredStores = stores.filter((store) => {
    // Check if store matches selected category
    const matchesCategory =
      selectedCategory === "all" ||
      storeCategoryMap[store.id]?.categoryNames.includes(selectedCategory);

    // Check if store matches search term
    const matchesSearch =
      searchTerm.trim() === "" ||
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (store.location_in_mall || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  console.log(
    "Filtered Stores:",
    filteredStores.map((store) => store.name)
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Tiendas</h2>
        <Button
          onClick={onAddStore}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
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
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">
            No se encontraron tiendas con los filtros actuales.
          </p>
          {searchTerm && (
            <Button
              variant="link"
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Limpiar búsqueda
            </Button>
          )}
          {selectedCategory !== "all" && (
            <Button
              variant="link"
              onClick={() => setSelectedCategory("all")}
              className="mt-2"
            >
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-2">
                    <h3 className="font-medium text-lg text-gray-900 line-clamp-1">
                      {store.name}
                    </h3>
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

                <p className="text-gray-600 text-sm line-clamp-2 mt-3 mb-4 flex-grow">
                  {store.description || "No description available"}
                </p>

                <div className="mt-auto space-y-1.5">
                  {store.location_in_mall && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                      <span className="line-clamp-1">
                        {store.location_in_mall}
                      </span>
                    </div>
                  )}
                  {store.contact_number && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                      <span>{store.contact_number}</span>
                    </div>
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
        {filteredStores.length > 0 &&
          (selectedCategory !== "all" || searchTerm !== "") && (
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
