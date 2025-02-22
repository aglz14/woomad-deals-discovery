import React from 'react';
import { PublicStoreCard } from '@/components/mall/PublicStoreCard';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";

interface StoresNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export const StoresNearby = ({ searchTerm, selectedMallId }: StoresNearbyProps) => {
  const navigate = useNavigate();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores", selectedMallId],
    queryFn: async () => {
      let query = supabase.from("stores").select("*, mall:shopping_malls(*)");
      
      if (selectedMallId !== 'all') {
        query = query.eq('mall_id', selectedMallId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredStores = stores?.filter(store => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(searchLower) ||
      store.category.toLowerCase().includes(searchLower) ||
      store.description?.toLowerCase().includes(searchLower) ||
      store.mall.name.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando tiendas...</p>
      </div>
    );
  }

  if (!filteredStores?.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Store className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron tiendas</h3>
        <p className="mt-2 text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Tiendas Cercanas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <PublicStoreCard
            key={store.id}
            store={store}
            onClick={() => navigate(`/store/${store.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
