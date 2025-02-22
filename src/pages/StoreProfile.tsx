import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EditPromotionDialog } from "@/components/promotion/EditPromotionDialog";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DatabasePromotion } from "@/types/promotion";

export default function StoreProfile() {
  const {
    storeId
  } = useParams();
  const navigate = useNavigate();
  const [promotionToEdit, setPromotionToEdit] = useState<DatabasePromotion | null>(null);

  const {
    data: store,
    isLoading: isStoreLoading
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("stores").select("*").eq("id", storeId).single();
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      return data;
    }
  });

  const {
    data: promotions,
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions
  } = useQuery({
    queryKey: ["promotions", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("store_id", storeId)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });
      if (error) {
        toast.error("Failed to fetch promotions");
        throw error;
      }
      return data;
    }
  });

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const {
        error
      } = await supabase.from("promotions").delete().eq("id", promotionId);
      if (error) throw error;
      toast.success("Promoción eliminada exitosamente");
      refetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar la promoción");
    }
  };

  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800',
    promotion: 'bg-purple-100 text-purple-800',
    sale: 'bg-red-100 text-red-800'
  };

  if (isStoreLoading || isPromotionsLoading) {
    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-start items-center h-48">
              <div className="animate-pulse space-y-4 w-full max-w-2xl">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }

  if (!store) {
    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-start h-48">
              <Store className="h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tienda no encontrada</h2>
              <p className="text-gray-600">La tienda que buscas no existe o ha sido eliminada</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }

  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => navigate(-1)} className="mb-8 text-purple-600 hover:text-purple-700 flex items-center gap-2 transition-colors">
            ← Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Store Information */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader className="space-y-6">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-4 w-full">
                    {store.logo_url ? <img src={store.logo_url} alt={store.name} className="w-24 h-24 object-contain rounded-xl shadow-sm" /> : <div className="w-24 h-24 flex items-center justify-center bg-purple-100 rounded-xl">
                        <Store className="w-12 h-12 text-purple-500" />
                      </div>}
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{store.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {store.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {store.description && <p className="text-gray-600 text-left">{store.description}</p>}
                {store.location_in_mall && <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{store.location_in_mall}</span>
                  </div>}
              </CardContent>
            </Card>

            {/* Promotions */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Promociones Actuales</h2>
              {promotions && promotions.length > 0 ? <div className="space-y-6">
                  {promotions.map(promo => <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
                      <CardHeader>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Badge className={`${typeColors[promo.type as keyof typeof typeColors]} capitalize`}>
                              {promo.type}
                            </Badge>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white hover:bg-gray-100" onClick={() => setPromotionToEdit(promo)}>
                                <Pencil className="h-3.5 w-3.5 text-purple-500" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-white hover:bg-red-100">
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción eliminará permanentemente la promoción. Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePromotion(promo.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <CardTitle className="text-xl text-left">{promo.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 whitespace-pre-wrap text-left">{promo.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {format(new Date(promo.start_date), 'd MMM')} -{' '}
                            {format(new Date(promo.end_date), 'd MMM, yyyy')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>)}
                </div> : <Card>
                  <CardHeader>
                    <CardTitle>No hay promociones activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      ¡Vuelve más tarde para ver nuevas promociones y ofertas!
                    </p>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {promotionToEdit && <EditPromotionDialog promotion={promotionToEdit} isOpen={true} onClose={() => setPromotionToEdit(null)} onSuccess={() => {
      refetchPromotions();
      setPromotionToEdit(null);
    }} />}
    </div>;
}
