
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Calendar, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EditStoreDialog } from "@/components/store/EditStoreDialog";
import { EditPromotionDialog } from "@/components/promotion/EditPromotionDialog";
import { useState } from "react";
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

export default function StoreProfile() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<string | null>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

  const { data: store, isLoading: isStoreLoading, refetch: refetchStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions, isLoading: isPromotionsLoading, refetch: refetchPromotions } = useQuery({
    queryKey: ["promotions", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("store_id", storeId)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);

      if (error) throw error;

      toast.success("Promotion deleted successfully");
      refetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    }
    setPromotionToDelete(null);
  };

  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800 border-blue-200',
    promotion: 'bg-purple-100 text-purple-800 border-purple-200',
    sale: 'bg-red-100 text-red-800 border-red-200',
  };

  if (isStoreLoading || isPromotionsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              ← Volver
            </button>
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Cargando...</p>
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
            <button
              onClick={() => navigate(-1)}
              className="mb-6 text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              ← Volver
            </button>
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Tienda no encontrada</p>
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
            ← Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store Information */}
            <Card className="lg:col-span-1 relative">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingStore(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
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
                    <CardDescription>{store.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.description && (
                  <p className="text-gray-600">{store.description}</p>
                )}
                {store.location_in_mall && (
                  <p className="text-sm text-gray-600">
                    Location: {store.location_in_mall}
                  </p>
                )}
                {store.floor && (
                  <p className="text-sm text-gray-600">
                    Floor: {store.floor}
                  </p>
                )}
                {store.contact_number && (
                  <p className="text-sm text-gray-600">
                    Contact: {store.contact_number}
                  </p>
                )}
                {store.email && (
                  <p className="text-sm text-gray-600">
                    Email: {store.email}
                  </p>
                )}
                {store.website && (
                  <p className="text-sm text-gray-600">
                    Website: {store.website}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Promotions */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Active Promotions</h2>
              {promotions && promotions.length > 0 ? (
                promotions.map((promo) => (
                  <Card key={promo.id} className="relative overflow-hidden">
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPromotion(promo.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog
                        open={promotionToDelete === promo.id}
                        onOpenChange={(open) => !open && setPromotionToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setPromotionToDelete(promo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this promotion. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePromotion(promo.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <CardHeader className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className={`${typeColors[promo.type as keyof typeof typeColors]} capitalize mb-2`}
                      >
                        {promo.type}
                      </Badge>
                      <CardTitle>{promo.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(promo.start_date), 'MMM d')} -{' '}
                          {format(new Date(promo.end_date), 'MMM d, yyyy')}
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{promo.description}</p>
                      {promo.terms_conditions && (
                        <p className="text-sm text-gray-500 mt-4">
                          Terms & Conditions: {promo.terms_conditions}
                        </p>
                      )}
                      {promo.discount_value && (
                        <p className="text-sm font-semibold text-green-600 mt-2">
                          Discount: {promo.discount_value}
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
                      Check back later for new promotions and offers!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {store && isEditingStore && (
        <EditStoreDialog
          store={store}
          isOpen={isEditingStore}
          onClose={() => setIsEditingStore(false)}
          onSuccess={() => {
            refetchStore();
            setIsEditingStore(false);
          }}
        />
      )}

      {promotions?.map((promotion) => (
        editingPromotion === promotion.id && (
          <EditPromotionDialog
            key={promotion.id}
            promotion={promotion}
            isOpen={true}
            onClose={() => setEditingPromotion(null)}
            onSuccess={() => {
              refetchPromotions();
              setEditingPromotion(null);
            }}
          />
        )
      ))}

      <Footer />
    </div>
  );
}
