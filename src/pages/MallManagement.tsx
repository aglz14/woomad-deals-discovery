import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/providers/SessionProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoresList } from "@/components/mall/StoresList";
import { toast } from "sonner";
import { EditStoreDialog } from "@/components/store/EditStoreDialog";
import { useState } from "react";
import { MallHeader } from "@/components/mall/MallHeader";
import { StoreActions } from "@/components/mall/StoreActions";

export default function MallManagement() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const [storeToEdit, setStoreToEdit] = useState<string | null>(null);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);

  const { data: mall, isLoading: isMallLoading } = useQuery({
    queryKey: ["mall", mallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .eq("id", mallId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!mallId,
  });

  const { data: stores, refetch: refetchStores, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", mallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", mallId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!mallId,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        toast.error("Please login to access this page");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleStoreClick = (storeId: string) => {
    navigate(`/store/${storeId}/promotions`);
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;

      toast.success("Store deleted successfully");
      refetchStores();
    } catch (error) {
      toast.error("Error deleting store");
    }
    setStoreToDelete(null);
  };

  if (isMallLoading || isLoadingStores) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mall) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Mall not found</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <MallHeader
            name={mall.name}
            address={mall.address}
            description={mall.description}
            mallUserId={mall.user_id}
            onEdit={() => setIsAddStoreDialogOpen(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <div key={store.id} className="relative group">
                <StoresList 
                  stores={[store]} 
                  onStoreClick={() => handleStoreClick(store.id)}
                  onEdit={setStoreToEdit}
                  onDelete={(storeId) => setStoreToDelete(storeId)}
                  mallId={mall.id}
                  mallUserId={mall.user_id}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {stores?.map((store) => (
        storeToEdit === store.id && (
          <EditStoreDialog
            key={store.id}
            store={store}
            isOpen={true}
            onClose={() => setStoreToEdit(null)}
            onSuccess={() => {
              refetchStores();
              setStoreToEdit(null);
            }}
          />
        )
      ))}

      <Footer />
    </div>
  );
}
