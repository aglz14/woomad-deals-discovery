
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/hooks/use-location";
import { LoadingState } from "./stores/LoadingState";
import { StoreGrid } from "./stores/StoreGrid";
import { StoresPagination } from "./stores/StoresPagination";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export function StoresNearby({ searchTerm, selectedMallId }: StoresNearbyProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { userLocation, isWithinDistance } = useLocation();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores", userLocation],
    queryFn: async () => {
      const { data: malls } = await supabase
        .from("shopping_malls")
        .select("*");

      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          mall:shopping_malls (
            *
          )
        `);

      if (error) throw error;

      if (userLocation && malls) {
        return data
          .filter(store => {
            const mall = malls.find(m => m.id === store.mall_id);
            return mall ? isWithinDistance(mall.latitude, mall.longitude) : true;
          });
      }

      return data;
    },
  });

  const filterStores = (stores: any[]) => {
    if (!stores) return [];
    let filtered = stores;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchLower) ||
          store.mall.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== "all") {
      filtered = filtered.filter((store) => store.mall_id === selectedMallId);
    }

    return filtered;
  };

  const getCurrentPageItems = () => {
    if (!stores) return [];
    const filteredStores = filterStores(stores);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredStores.slice(start, end);
  };

  const totalPages = Math.ceil((filterStores(stores || []).length) / ITEMS_PER_PAGE);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Tiendas Cercanas</h2>
      <StoreGrid 
        stores={stores || []} 
        currentItems={getCurrentPageItems()} 
      />
      <StoresPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
