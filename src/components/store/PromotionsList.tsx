
import { DatabasePromotion } from "@/types/promotion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "@/components/providers/SessionProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PromotionsListProps {
  promotions?: DatabasePromotion[];
  onEdit?: (promotion: DatabasePromotion) => void;
  onDelete?: (id: string) => void;
  storeId?: string;
}

export function PromotionsList({ promotions: externalPromotions, onEdit, onDelete, storeId }: PromotionsListProps) {
  const { session } = useSession();
  const [promotions, setPromotions] = useState<DatabasePromotion[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch promotions if storeId is provided and no external promotions
  useEffect(() => {
    if (storeId && !externalPromotions?.length) {
      const fetchPromotions = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('store_id', storeId);
          
          if (error) throw error;
          setPromotions(data || []);
        } catch (error) {
          console.error("Error fetching promotions:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPromotions();
    } else if (externalPromotions) {
      setPromotions(externalPromotions);
    }
  }, [storeId, externalPromotions]);

  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800',
    promotion: 'bg-purple-100 text-purple-800',
    sale: 'bg-green-100 text-green-800'
  };

  const typeLabels = {
    promotion: 'Promoción',
    coupon: 'Cupón',
    sale: 'Oferta'
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando promociones...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!promotions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay promociones activas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            ¡Vuelve más tarde para ver nuevas promociones y ofertas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {promotions.map(promo => {
        const isOwner = session?.user?.id === promo.user_id;
        const promoType = promo.type as keyof typeof typeColors;

        return (
          <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Badge className={`${typeColors[promoType] || ''} capitalize`}>
                    {typeLabels[promoType] || promo.type}
                  </Badge>
                  {isOwner && onEdit && onDelete && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-100"
                        onClick={() => onEdit(promo)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-purple-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white hover:bg-red-100"
                          >
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
                            <AlertDialogAction
                              onClick={() => onDelete(promo.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl text-left">{promo.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 whitespace-pre-wrap text-left">
                {promo.description}
              </p>
              {promo.start_date && promo.end_date && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {format(new Date(promo.start_date), 'd MMM')} -{' '}
                    {format(new Date(promo.end_date), 'd MMM, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
