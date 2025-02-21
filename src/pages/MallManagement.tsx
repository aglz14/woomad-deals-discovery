import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/providers/SessionProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddStoreDialog } from "@/components/mall/AddStoreDialog";
import { StoresList } from "@/components/mall/StoresList";
import { toast } from "sonner";

export default function MallManagement() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();

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

  const { data: mall } = useQuery({
    queryKey: ["mall", mallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .eq("id", mallId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stores, refetch: refetchStores } = useQuery({
    queryKey: ["stores", mallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", mallId);
      
      if (error) throw error;
      return data;
    },
  });

  const handleStoreClick = (storeId: string) => {
    navigate(`/store/${storeId}/promotions`);
  };

  if (!mall) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{mall?.name}</h1>
              <p className="text-gray-600">{mall?.address}</p>
            </div>
            <AddStoreDialog 
              mallId={mallId!} 
              onStoreAdded={refetchStores} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StoresList 
              stores={stores || []} 
              onStoreClick={handleStoreClick} 
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
