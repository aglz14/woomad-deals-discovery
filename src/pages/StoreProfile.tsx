
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@/components/providers/SessionProvider";
import { StoreInfo } from "@/components/store/StoreInfo";
import { StoreLoadingState } from "@/components/store/StoreLoadingState";
import { StoreNotFound } from "@/components/store/StoreNotFound";
import { AddPromotionForm } from "@/components/promotions/AddPromotionForm";
import { EditPromotionForm } from "@/components/promotions/EditPromotionForm";
import { PromotionCard } from "@/components/promotions/PromotionCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, FilePlus, Info, MapPin, Plus, Store } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ValidPromotionType = "promotion" | "coupon" | "sale";

interface DatabasePromotion {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: ValidPromotionType;
  discount_percentage?: number;
  store_id: string;
  image_url?: string;
  created_at: string;
  store?: {
    id: string;
    name: string;
    mall?: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    };
  };
}

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export default function StoreProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [promotionToEdit, setPromotionToEdit] = useState<DatabasePromotion | null>(null);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [activeTab, setActiveTab] = useState("promotions");

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*, mall:shopping_malls(id, name, latitude, longitude, address)")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      return data;
    }
  });

  const { data: promotions, isLoading: isPromotionsLoading, refetch: refetchPromotions } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from("promotions")
        .select(`
          *,
          store:stores (
            id,
            name,
            mall:shopping_malls (
              id,
              name,
              latitude,
              longitude
            )
          )
        `)
        .eq("store_id", id)
        .order("start_date", { ascending: true });

      if (error) {
        toast.error("Failed to fetch promotions");
        throw error;
      }
      
      return rawData;
    },
  });

  const isOwner = session?.user?.id === store?.user_id;
  
  // Group promotions by status
  const now = new Date();
  const activePromotions = promotions?.filter(promo => 
    new Date(promo.start_date) <= now && new Date(promo.end_date) >= now
  ) || [];
  
  const upcomingPromotions = promotions?.filter(promo => 
    new Date(promo.start_date) > now
  ) || [];
  
  const expiredPromotions = promotions?.filter(promo => 
    new Date(promo.end_date) < now
  ) || [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 w-full border-b bg-white">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10 items-center">
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {store?.mall && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/admin/mall/${store.mall.id}`}>
                        {store.mall.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="font-semibold">
                    {isStoreLoading ? <Skeleton className="h-4 w-32" /> : store?.name || "Store"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <Button
                onClick={() => {
                  if (store?.mall?.id) {
                    navigate(`/admin/mall/${store.mall.id}`);
                  } else {
                    navigate(-1);
                  }
                }}
                variant="outline"
                size="sm"
                className="w-fit gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
          
          {isStoreLoading || isPromotionsLoading ? (
            <StoreLoadingState />
          ) : !store ? (
            <StoreNotFound />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StoreInfo store={store} />
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="bg-purple-50">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Promociones Activas</p>
                              <h3 className="text-2xl font-bold">{activePromotions.length}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <Store className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-blue-50">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Próximas</p>
                              <h3 className="text-2xl font-bold">{upcomingPromotions.length}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <FilePlus className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Expiradas</p>
                              <h3 className="text-2xl font-bold">{expiredPromotions.length}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Info className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="mb-4 sm:mb-0">
                      <TabsTrigger value="promotions" className="text-base">
                        Promociones Actuales
                        <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {activePromotions.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="upcoming" className="text-base">
                        Próximas
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {upcomingPromotions.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="expired" className="text-base">
                        Expiradas
                        <Badge className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                          {expiredPromotions.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    
                    {isOwner && (
                      <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
                        <DialogTrigger asChild>
                          <Button className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Promoción
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95%] sm:w-full max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Agregar Promoción</DialogTitle>
                          </DialogHeader>
                          <AddPromotionForm
                            onSuccess={() => {
                              setIsAddingPromotion(false);
                              refetchPromotions();
                            }}
                            onCancel={() => setIsAddingPromotion(false)}
                            storeId={id || ""}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  <TabsContent value="promotions" className="space-y-4">
                    {activePromotions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Store className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 text-lg font-medium text-gray-900">No hay promociones activas</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Las promociones activas aparecerán aquí.
                        </p>
                        {isOwner && (
                          <Button
                            onClick={() => setIsAddingPromotion(true)}
                            className="mt-4"
                            variant="outline"
                          >
                            Agregar promoción
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activePromotions.map((promotion) => (
                          <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            isOwner={isOwner}
                            onEdit={() => setPromotionToEdit(promotion)}
                            onDelete={async () => {
                              try {
                                const { error } = await supabase
                                  .from("promotions")
                                  .delete()
                                  .eq("id", promotion.id);
                                if (error) throw error;
                                toast.success("Promoción eliminada correctamente");
                                refetchPromotions();
                              } catch (error) {
                                toast.error("Error al eliminar la promoción");
                                console.error(error);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingPromotions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FilePlus className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 text-lg font-medium text-gray-900">No hay promociones programadas</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Las promociones futuras aparecerán aquí.
                        </p>
                        {isOwner && (
                          <Button
                            onClick={() => setIsAddingPromotion(true)}
                            className="mt-4"
                            variant="outline"
                          >
                            Programar promoción
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingPromotions.map((promotion) => (
                          <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            isOwner={isOwner}
                            onEdit={() => setPromotionToEdit(promotion)}
                            onDelete={async () => {
                              try {
                                const { error } = await supabase
                                  .from("promotions")
                                  .delete()
                                  .eq("id", promotion.id);
                                if (error) throw error;
                                toast.success("Promoción eliminada correctamente");
                                refetchPromotions();
                              } catch (error) {
                                toast.error("Error al eliminar la promoción");
                                console.error(error);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="expired" className="space-y-4">
                    {expiredPromotions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Info className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 text-lg font-medium text-gray-900">No hay promociones expiradas</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Las promociones que hayan finalizado aparecerán aquí.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expiredPromotions.map((promotion) => (
                          <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            isOwner={isOwner}
                            onEdit={() => setPromotionToEdit(promotion)}
                            onDelete={async () => {
                              try {
                                const { error } = await supabase
                                  .from("promotions")
                                  .delete()
                                  .eq("id", promotion.id);
                                if (error) throw error;
                                toast.success("Promoción eliminada correctamente");
                                refetchPromotions();
                              } catch (error) {
                                toast.error("Error al eliminar la promoción");
                                console.error(error);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
          
          {promotionToEdit && (
            <Dialog
              open={!!promotionToEdit}
              onOpenChange={(open) => {
                if (!open) setPromotionToEdit(null);
              }}
            >
              <DialogContent className="w-[95%] sm:w-full max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Promoción</DialogTitle>
                </DialogHeader>
                <EditPromotionForm
                  promotion={promotionToEdit}
                  onSuccess={() => {
                    setPromotionToEdit(null);
                    refetchPromotions();
                  }}
                  onCancel={() => setPromotionToEdit(null)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
}
