import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreInfo } from "@/components/store/StoreInfo"; // Import StoreInfo component
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";


export default function PublicStoreProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError
  } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!id) throw new Error("No store ID provided");
      const {
        data,
        error
      } = await supabase.from("stores").select("*, mall:shopping_malls(*)").eq("id", id).maybeSingle();
      if (error) {
        toast.error("Error al cargar la tienda");
        throw error;
      }
      if (!data) {
        throw new Error("Store not found");
      }
      console.log("Store data:", data);
      return data;
    },
    retry: false,
    enabled: !!id
  });

  const {
    data: promotions,
    isLoading: isPromotionsLoading
  } = useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      if (!id) throw new Error("No store ID provided");
      const {
        data,
        error
      } = await supabase.from("promotions").select("*").eq("store_id", id).gte("end_date", new Date().toISOString()).order("start_date", {
        ascending: true
      });
      if (error) {
        toast.error("Error al cargar las promociones");
        throw error;
      }
      return data;
    },
    enabled: !!id && !!store
  });

  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800',
    promotion: 'bg-purple-100 text-purple-800',
    sale: 'bg-red-100 text-red-800'
  };

  const typeLabels = {
    promotion: 'Promoción',
    coupon: 'Cupón',
    sale: 'Oferta'
  };

  if (isStoreLoading || isPromotionsLoading) {
    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }

  if (storeError || !store) {
    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <Store className="w-12 h-12 text-gray-400" />
              <p className="text-xl font-semibold text-gray-800">Tienda no encontrada</p>
              <p className="text-gray-600">Lo sentimos, no pudimos encontrar la tienda que buscas</p>
              <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 text-purple-600 hover:text-purple-700 flex items-center gap-2">
                ← Volver al inicio
              </button>
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
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Back Button */}
            <div className="lg:col-span-3 flex justify-start mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Volver</span>
              </Button>
            </div>

            {/* Store Info Component */}
            <StoreInfo store={store} />
            <div className="lg:col-span-3"> {/*Ensuring promotions are displayed below the StoreInfo component */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">Promociones Actuales</h2>
                {promotions && promotions.length > 0 ? <div className="space-y-4">
                    {promotions.map(promo => <Card key={promo.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 text-left w-full">
                              <Badge className={`${typeColors[promo.type as keyof typeof typeColors]} capitalize`}>
                                {typeLabels[promo.type as keyof typeof typeLabels]}
                              </Badge>
                              <CardTitle className="text-left">{promo.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-600 whitespace-pre-wrap text-left">{promo.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(promo.start_date), 'MMM d')} -{' '}
                              {format(new Date(promo.end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div> : <Card>
                    <CardHeader>
                      <CardTitle className="text-center text-gray-500">
                        No hay promociones activas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500">
                        ¡Vuelve más tarde para ver nuevas promociones y ofertas!
                      </p>
                    </CardContent>
                  </Card>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}