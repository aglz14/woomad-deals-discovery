import { useEffect, useState } from "react";
import { Store } from "@/types/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Store as StoreIcon,
  Building2,
  Tag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StoreInfoProps {
  store: Store;
}

interface Category {
  id: string;
  name: string;
}

export function StoreInfo({ store }: StoreInfoProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        if (
          !store.array_categories ||
          !Array.isArray(store.array_categories) ||
          store.array_categories.length === 0
        ) {
          // Fallback to the legacy category field if array_categories is not available
          if (store.category) {
            setCategories([store.category]);
          }
          return;
        }

        // First approach: If array_categories contains store_categories IDs
        // Get the category_ids from store_categories table
        const { data: storeCategoriesData, error: storeCategoriesError } =
          await supabase
            .from("store_categories")
            .select("category_id")
            .in("id", store.array_categories as any[]);

        if (storeCategoriesError) {
          console.error(
            "Error fetching store_categories:",
            storeCategoriesError
          );
          // Fallback to using the legacy category field
          if (store.category) {
            setCategories([store.category]);
          }
          return;
        }

        if (storeCategoriesData && storeCategoriesData.length > 0) {
          // Extract category IDs
          const categoryIds = storeCategoriesData.map(
            (item: any) => item.category_id
          );

          // Fetch category names from categories table
          const { data: categoriesData, error: categoriesError } =
            await supabase
              .from("categories")
              .select("name")
              .in("id", categoryIds as any[]);

          if (categoriesError) {
            console.error("Error fetching categories:", categoriesError);
            return;
          }

          if (categoriesData) {
            const categoryNames = categoriesData.map((item: any) => item.name);
            setCategories(categoryNames);
          }
        } else {
          // Second approach: If array_categories already contains category names
          // This is a fallback in case the first approach doesn't work
          setCategories(store.array_categories as string[]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to the legacy category field
        if (store.category) {
          setCategories([store.category]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [store]);

  return (
    <Card className="lg:col-span-1 h-fit overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-4 sm:space-y-6 bg-gradient-to-r from-purple-50 to-white pb-6">
        <div className="flex flex-col items-center gap-4">
          {/* Store Icon */}
          <div className="flex items-center justify-center">
            {store.image ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-purple-100 flex items-center justify-center">
                <StoreIcon className="w-12 h-12 text-purple-500" />
              </div>
            )}
          </div>

          {/* Store Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {isLoading ? (
              <Badge
                variant="outline"
                className="capitalize text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 font-medium"
              >
                Cargando...
              </Badge>
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="capitalize text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 font-medium"
                >
                  {category}
                </Badge>
              ))
            ) : (
              <Badge
                variant="outline"
                className="capitalize text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 font-medium"
              >
                Sin categoría
              </Badge>
            )}
          </div>

          {/* Store Name */}
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl break-words font-bold text-gray-800 text-center">
            {store.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 px-6">
        {/* About */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 text-left">
            Acerca de
          </h3>
          <p className="text-gray-600 text-left">
            {store.description ||
              "No hay descripción disponible para esta tienda."}
          </p>
        </div>

        {/* Mall Information */}
        {store.mall && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 text-left">
              Centro Comercial
            </h3>
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800 font-medium text-left">
                  {store.mall.name}
                </p>
                {store.mall.address && (
                  <p className="text-gray-600 text-sm mt-1 text-left">
                    {store.mall.address}
                  </p>
                )}
              </div>
            </div>
            {store.floor && (
              <div className="flex items-start gap-2 mt-2">
                <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-left">Piso: {store.floor}</p>
              </div>
            )}
            {store.local_number && (
              <div className="flex items-start gap-2 mt-2">
                <Tag className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-left">
                  Local: {store.local_number}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {store.phone && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 text-left">
              Contacto
            </h3>
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 text-left">{store.phone}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
