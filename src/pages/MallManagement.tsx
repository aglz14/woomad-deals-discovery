import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/providers/SessionProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddStoreDialog } from "@/components/mall/AddStoreDialog";
import { StoresList } from "@/components/mall/StoresList";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditStoreDialog } from "@/components/store/EditStoreDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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

  const { data: stores, refetch: refetchStores, isLoading: isStoresLoading } = useQuery({
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

  if (isMallLoading || isStoresLoading) {
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
          <div className="mb-6">
            <Button
              variant="ghost"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={() => navigate('/promotions')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Promociones
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{mall?.name}</h1>
              <p className="text-gray-600">{mall?.address}</p>
            </div>
            <AddStoreDialog
              mallId={mallId!}
              isOpen={isAddStoreDialogOpen}
              onClose={() => setIsAddStoreDialogOpen(false)}
              onSuccess={() => {
                refetchStores();
                setIsAddStoreDialogOpen(false);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <div key={store.id} className="relative group">
                <div onClick={() => handleStoreClick(store.id)} className="cursor-pointer">
                  <StoresList stores={[store]} onStoreClick={() => {}} />
                </div>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStoreToEdit(store.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={storeToDelete === store.id} onOpenChange={(open) => !open && setStoreToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoreToDelete(store.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the store and all its promotions. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(store.id);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
