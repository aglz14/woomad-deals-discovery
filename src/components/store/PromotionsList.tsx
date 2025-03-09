import { DatabasePromotion } from "@/types/promotion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "@/components/providers/SessionProvider";

interface PromotionsListProps {
  promotions: DatabasePromotion[];
  onEdit: (promotion: DatabasePromotion) => void;
  onDelete: (id: string) => void;
}

export function PromotionsList({
  promotions,
  onEdit,
  onDelete,
}: PromotionsListProps) {
  const { session } = useSession();

  const typeColors = {
    coupon: "bg-blue-100 text-blue-800",
    promotion: "bg-purple-100 text-purple-800",
    sale: "bg-green-100 text-green-800",
  };

  const typeLabels = {
    promotion: "Promoción",
    coupon: "Cupón",
    sale: "Oferta",
  };

  if (!promotions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay promociones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            ¡No hay promociones disponibles para esta tienda!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {promotions.map((promo) => {
        const isOwner = session?.user?.id === promo.user_id;

        const now = new Date();
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        const isCurrent = startDate <= now && endDate >= now;

        const typeKey = (promo.promotion_type || "").toLowerCase();
        const typeLabel =
          typeLabels[typeKey as keyof typeof typeLabels] || "Promoción";
        const typeColor =
          typeColors[typeKey as keyof typeof typeColors] ||
          typeColors.promotion;

        return (
          <Card
            key={promo.id}
            className="overflow-hidden transition-shadow hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 text-left w-full">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className={`${typeColor} capitalize`}>
                      {typeLabel}
                    </Badge>

                    {isCurrent ? (
                      <Badge className="bg-green-100 text-green-800">
                        Vigente
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Expirada
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-left">{promo.title}</CardTitle>
                </div>
                {isOwner && (
                  <div className="flex space-x-2">
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
                          <AlertDialogTitle>
                            ¿Eliminar promoción?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la promoción.
                            Esta acción no se puede deshacer.
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
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap text-left mb-4">
                {promo.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(promo.start_date), "dd/MM/yyyy")} -{" "}
                  {format(new Date(promo.end_date), "dd/MM/yyyy")}
                </span>
              </div>
              {promo.terms_conditions && (
                <div className="mt-4 text-sm text-gray-500">
                  <h4 className="font-medium">Términos y condiciones:</h4>
                  <p className="whitespace-pre-wrap">
                    {promo.terms_conditions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
