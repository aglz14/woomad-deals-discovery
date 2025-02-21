import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/providers/SessionProvider";
import { StoreCard } from "@/components/StoreCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export default function MallManagement() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    description: "",
    category: "",
    floor: "",
    location_in_mall: "",
    contact_number: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (!session) {
      navigate("/");
      toast.error("Please login to access this page");
    }
  }, [session, navigate]);

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

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("stores").insert([
        {
          ...newStore,
          mall_id: mallId,
        },
      ]);

      if (error) throw error;

      toast.success("Store added successfully");
      setIsAddingStore(false);
      setNewStore({
        name: "",
        description: "",
        category: "",
        floor: "",
        location_in_mall: "",
        contact_number: "",
        email: "",
        website: "",
      });
      refetchStores();
    } catch (error) {
      console.error("Error adding store:", error);
      toast.error("Failed to add store");
    }
  };

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
              <h1 className="text-2xl font-bold">{mall.name}</h1>
              <p className="text-gray-600">{mall.address}</p>
            </div>
            <Dialog open={isAddingStore} onOpenChange={setIsAddingStore}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Store</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStore} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Store Name</Label>
                    <Input
                      id="name"
                      value={newStore.name}
                      onChange={(e) =>
                        setNewStore({ ...newStore, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newStore.category}
                      onChange={(e) =>
                        setNewStore({ ...newStore, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newStore.description}
                      onChange={(e) =>
                        setNewStore({ ...newStore, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={newStore.floor}
                      onChange={(e) =>
                        setNewStore({ ...newStore, floor: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location in Mall</Label>
                    <Input
                      id="location"
                      value={newStore.location_in_mall}
                      onChange={(e) =>
                        setNewStore({ ...newStore, location_in_mall: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      value={newStore.contact_number}
                      onChange={(e) =>
                        setNewStore({ ...newStore, contact_number: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStore.email}
                      onChange={(e) =>
                        setNewStore({ ...newStore, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={newStore.website}
                      onChange={(e) =>
                        setNewStore({ ...newStore, website: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Store
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => handleStoreClick(store.id)}
              />
            ))}
            {stores?.length === 0 && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2 text-gray-500">
                    <Store className="h-6 w-6" />
                    No stores yet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500">
                    Click the "Add Store" button to add your first store to this mall.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
