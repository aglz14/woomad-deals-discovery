
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Store, Calendar, Percent } from "lucide-react";
import { toast } from "sonner";

export default function StoreProfile() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  // Fetch store data
  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();
      
      if (error) {
        toast.error("Failed to fetch store details");
        throw error;
      }
      return data;
    },
  });

  // Fetch promotions data
  const { data: promotions, isLoading: isPromotionsLoading } = useQuery({
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
    },
  });

  if (isStoreLoading || isPromotionsLoading) {
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

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Store not found</p>
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
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store Information */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  ) : (
                    <Store className="w-16 h-16 text-purple-500" />
                  )}
                  <div>
                    <CardTitle>{store.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {store.category}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {store.description && (
                    <p className="text-gray-600">{store.description}</p>
                  )}
                  {store.location_in_mall && (
                    <p className="text-sm text-gray-600">
                      Location: {store.location_in_mall}
                      {store.floor && ` - Floor ${store.floor}`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Promotions */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Current Promotions</h2>
              {promotions && promotions.length > 0 ? (
                promotions.map((promo) => (
                  <Card key={promo.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Percent className="h-5 w-5 text-purple-500" />
                            {promo.title}
                          </CardTitle>
                          <CardDescription>{promo.description}</CardDescription>
                        </div>
                        {promo.discount_value && (
                          <span className="text-lg font-bold text-purple-600">
                            {promo.discount_value}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Valid until {new Date(promo.end_date).toLocaleDateString()}
                      </div>
                      {promo.terms_conditions && (
                        <p className="mt-2 text-sm text-gray-500">
                          {promo.terms_conditions}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-gray-500">
                      No active promotions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-gray-500">
                      Check back later for new promotions and deals!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
