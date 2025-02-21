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
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Promotions() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingMall, setIsAddingMall] = useState(false);
  const [newMall, setNewMall] = useState({
    name: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (!session) {
      navigate("/");
      toast.error("Please login to access this page");
    }
  }, [session, navigate]);

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
