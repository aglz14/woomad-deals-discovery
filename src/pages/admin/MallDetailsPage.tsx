
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Store } from "@/types/store";
import { Loader, Plus } from "lucide-react";
import { StoreCard } from "@/components/store/StoreCard";
import { AddStoreDialog } from "@/components/store/AddStoreDialog";
import { useSession } from "@/components/providers/SessionProvider";

export default function MallDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  const { data: mall, isLoading: isLoadingMall } = useQuery({
    queryKey: ["mall", id],
    queryFn: async () => {
      console.log("Fetching mall with ID:", id);
      const { data, error } = await supabase
        .from("malls")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!session,
  });

  const { data: stores, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", id],
    queryFn: async () => {
      console.log("Fetching stores for mall:", id);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", id)
        .order("name");

      if (error) throw error;
      return data as Store[];
    },
    enabled: !!id && !!session,
  });

  const handleStoreAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["stores", id] });
  };

  if (isLoadingMall || isLoadingStores) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!mall) {
    return <div>Centro comercial no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{mall.name}</h1>
        <Button onClick={() => setIsAddStoreDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Tienda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores?.map((store) => (
          <StoreCard key={store.id} store={store} onUpdate={handleStoreAdded} />
        ))}
      </div>

      {stores?.length === 0 && (
        <div className="text-center py-8">
          <p>No hay tiendas registradas en este centro comercial.</p>
        </div>
      )}

      <AddStoreDialog
        mallId={id || ""}
        isOpen={isAddStoreDialogOpen}
        onClose={() => setIsAddStoreDialogOpen(false)}
        onSuccess={handleStoreAdded}
      />
    </div>
  );
}
