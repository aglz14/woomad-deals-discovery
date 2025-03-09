import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store as StoreIcon, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreInfo } from "@/components/store/StoreInfo";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types/store";

// Define promotion interface
interface Promotion {
  id: string;
  title: string;
  description: string;
  promotion_type?: string;
  type?: string; // For backward compatibility
  start_date: string;
  end_date: string;
  store_id: string;
  image?: string;
  terms_conditions?: string;
}

export default function PublicStoreProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError,
  } = useQuery<Store | null>({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!id) throw new Error("No store ID provided");

      try {
        // @ts-expect-error - Supabase types are complex
        const { data, error } = await supabase
          .from("stores")
          .select("*, mall:shopping_malls(*)")
          .eq("id", id as any)
          .maybeSingle();

        if (error) {
          toast.error("Error al cargar la tienda");
          throw error;
        }

        if (!data) {
          throw new Error("Store not found");
        }

        console.log("Store data:", data);
        return data as unknown as Store;
      } catch (error) {
        console.error("Error fetching store:", error);
        throw error;
      }
    },
    retry: false,
    enabled: !!id,
  });

  const { data: promotions, isLoading: isPromotionsLoading } = useQuery<
    Promotion[]
  >({
    queryKey: ["promotions", id],
    queryFn: async () => {
      if (!id) throw new Error("No store ID provided");

      try {
        // @ts-expect-error - Supabase types are complex
        const { data, error } = await supabase
          .from("promotions")
          .select("*")
          .eq("store_id", id as any)
          .gte("end_date", new Date().toISOString())
          .order("start_date", { ascending: true });

        if (error) {
          toast.error("Error al cargar las promociones");
          throw error;
        }

        return (data || []) as unknown as Promotion[];
      } catch (error) {
        console.error("Error fetching promotions:", error);
        throw error;
      }
    },
    enabled: !!id && !!store,
  });

  const typeColors = {
    coupon: "bg-blue-100 text-blue-800",
    promotion: "bg-purple-100 text-purple-800",
    sale: "bg-red-100 text-red-800",
  };

  const typeLabels = {
    promotion: "Promoción",
    coupon: "Cupón",
    sale: "Oferta",
  };

  // Helper function to get a default type if promotion_type is not valid
  const getPromotionType = (promotion: Promotion): string => {
    const type = promotion.promotion_type || promotion.type || "promotion";
    return type in typeColors ? type : "promotion";
  };

  // Helper function to get a label for the promotion type
  const getPromotionLabel = (promotion: Promotion): string => {
    const type = getPromotionType(promotion);
    return typeLabels[type as keyof typeof typeLabels] || "Promoción";
  };

  if (isStoreLoading || isPromotionsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <StoreIcon className="w-12 h-12 text-gray-400" />
              <p className="text-xl font-semibold text-gray-800">
                Tienda no encontrada
              </p>
              <p className="text-gray-600">
                Lo sentimos, no pudimos encontrar la tienda que buscas
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-4 py-2 text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                ← Volver al inicio
              </button>
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
          <div className="mb-8 grid grid-cols-1 gap-8">
            {/* Back Button */}
            <div className="flex justify-start mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Volver</span>
              </Button>
            </div>

            {/* Store Info Component */}
            <StoreInfo store={store} />
            <div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">
                  Promociones Actuales
                </h2>
                {promotions && promotions.length > 0 ? (
                  <div className="space-y-4">
                    {promotions.map((promo) => (
                      <Card key={promo.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 text-left w-full">
                              <Badge
                                className={`${
                                  typeColors[
                                    getPromotionType(
                                      promo
                                    ) as keyof typeof typeColors
                                  ]
                                } capitalize`}
                              >
                                {getPromotionLabel(promo)}
                              </Badge>
                              <CardTitle className="text-left">
                                {promo.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-600 whitespace-pre-wrap text-left">
                            {promo.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(promo.start_date), "MMM d")} -{" "}
                              {format(new Date(promo.end_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
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
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
