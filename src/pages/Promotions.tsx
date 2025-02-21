
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/components/providers/SessionProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Promotions() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingMall, setIsAddingMall] = useState(false);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [selectedMall, setSelectedMall] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  
  const [newMall, setNewMall] = useState({
    name: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    type: "",
    discount_value: "",
    start_date: "",
    end_date: "",
    terms_conditions: "",
  });

  // Fetch malls
  const { data: malls, refetch: refetchMalls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*");
      
      if (error) {
        toast.error("Failed to fetch shopping malls");
        throw error;
      }
      return data;
    },
  });

  // Fetch stores for selected mall
  const { data: stores } = useQuery({
    queryKey: ["stores", selectedMall],
    enabled: !!selectedMall,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("mall_id", selectedMall);
      
      if (error) {
        toast.error("Failed to fetch stores");
        throw error;
      }
      return data;
    },
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

  const handleAddMall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("shopping_malls").insert([
        {
          name: newMall.name,
          address: newMall.address,
          description: newMall.description,
          latitude: parseFloat(newMall.latitude),
          longitude: parseFloat(newMall.longitude),
          user_id: session?.user.id,
        },
      ]);

      if (error) throw error;

      toast.success("Shopping mall added successfully");
      setIsAddingMall(false);
      setNewMall({
        name: "",
        address: "",
        description: "",
        latitude: "",
        longitude: "",
      });
      refetchMalls();
    } catch (error) {
      console.error("Error adding mall:", error);
      toast.error("Failed to add shopping mall");
    }
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("promotions").insert([
        {
          store_id: selectedStore,
          title: newPromotion.title,
          description: newPromotion.description,
          type: newPromotion.type,
          discount_value: newPromotion.discount_value,
          start_date: new Date(newPromotion.start_date).toISOString(),
          end_date: new Date(newPromotion.end_date).toISOString(),
          terms_conditions: newPromotion.terms_conditions,
        },
      ]);

      if (error) throw error;

      toast.success("Promotion added successfully");
      setIsAddingPromotion(false);
      setNewPromotion({
        title: "",
        description: "",
        type: "",
        discount_value: "",
        start_date: "",
        end_date: "",
        terms_conditions: "",
      });
      setSelectedMall("");
      setSelectedStore("");
    } catch (error) {
      console.error("Error adding promotion:", error);
      toast.error("Failed to add promotion");
    }
  };

  const handleMallClick = (mallId: string) => {
    navigate(`/mall/${mallId}/manage`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Promotions</h1>
            <div className="flex gap-4">
              <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Promotion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Promotion</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPromotion} className="space-y-4">
                    <div>
                      <Label>Select Mall</Label>
                      <Select
                        value={selectedMall}
                        onValueChange={setSelectedMall}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mall" />
                        </SelectTrigger>
                        <SelectContent>
                          {malls?.map((mall) => (
                            <SelectItem key={mall.id} value={mall.id}>
                              {mall.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Store</Label>
                      <Select
                        value={selectedStore}
                        onValueChange={setSelectedStore}
                        disabled={!selectedMall}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores?.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Promotion Title</Label>
                      <Input
                        id="title"
                        value={newPromotion.title}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPromotion.description}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Promotion Type</Label>
                      <Select
                        value={newPromotion.type}
                        onValueChange={(value) =>
                          setNewPromotion({ ...newPromotion, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="bogo">Buy One Get One</SelectItem>
                          <SelectItem value="coupon">Coupon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="discount_value">Discount Value</Label>
                      <Input
                        id="discount_value"
                        value={newPromotion.discount_value}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, discount_value: e.target.value })
                        }
                        placeholder="e.g., 50% or BOGO"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={newPromotion.start_date}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, start_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={newPromotion.end_date}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, end_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        value={newPromotion.terms_conditions}
                        onChange={(e) =>
                          setNewPromotion({ ...newPromotion, terms_conditions: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedStore}
                    >
                      Add Promotion
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingMall} onOpenChange={setIsAddingMall}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shopping Mall
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Shopping Mall</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddMall} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Mall Name</Label>
                      <Input
                        id="name"
                        value={newMall.name}
                        onChange={(e) =>
                          setNewMall({ ...newMall, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newMall.address}
                        onChange={(e) =>
                          setNewMall({ ...newMall, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newMall.description}
                        onChange={(e) =>
                          setNewMall({ ...newMall, description: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={newMall.latitude}
                        onChange={(e) =>
                          setNewMall({ ...newMall, latitude: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={newMall.longitude}
                        onChange={(e) =>
                          setNewMall({ ...newMall, longitude: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add Mall
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {malls?.map((mall) => (
              <Card
                key={mall.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMallClick(mall.id)}
              >
                <CardHeader>
                  <CardTitle>{mall.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{mall.address}</p>
                  {mall.description && (
                    <p className="text-sm text-gray-500 mt-2">{mall.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
