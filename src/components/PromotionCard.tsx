import React, { useState } from "react";
import { Calendar, Store, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { DatabasePromotion } from "@/types/promotion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface PromotionCardProps {
  promotion: DatabasePromotion;
}

export const PromotionCard = ({ promotion }: PromotionCardProps) => {
  const [showDialog, setShowDialog] = useState(false);

  // Get the promotion type, falling back to legacy field if needed
  const promotionType =
    promotion.promotion_type || (promotion as any).type || "promotion";

  // Normalize the promotion type to handle different variations
  const normalizeType = (type: string): string => {
    const lowerType = type.toLowerCase().trim();

    // Map similar types to standard ones
    if (
      lowerType.includes("promo") ||
      lowerType === "promoción" ||
      lowerType === "promocion"
    ) {
      return "promotion";
    }
    if (
      lowerType.includes("cup") ||
      lowerType === "cupón" ||
      lowerType === "cupon"
    ) {
      return "coupon";
    }
    if (
      lowerType.includes("ofer") ||
      lowerType.includes("sale") ||
      lowerType.includes("discount") ||
      lowerType.includes("desc")
    ) {
      return "sale";
    }

    // Default to promotion if unknown
    return "promotion";
  };

  const normalizedType = normalizeType(promotionType);

  const typeColors = {
    coupon: "bg-blue-100 text-blue-800 border-blue-200",
    promotion: "bg-purple-100 text-purple-800 border-purple-200",
    sale: "bg-green-100 text-green-800 border-green-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const typeLabels = {
    promotion: "Promoción",
    coupon: "Cupón",
    sale: "Oferta",
    default: "Promoción",
  };

  // Get the appropriate color and label based on the normalized type
  const typeColor = typeColors[normalizedType] || typeColors.default;
  const typeLabel =
    typeLabels[normalizedType] || promotionType || typeLabels.default;

  const hasImage = !!promotion.image || !!promotion.image_url;
  const imageUrl = promotion.image || promotion.image_url;

  const PromotionContent = ({ isDialog = false }: { isDialog?: boolean }) => (
    <>
      {hasImage && (
        <div
          className={`relative ${
            isDialog ? "h-48 md:h-64" : "h-48"
          } w-full overflow-hidden`}
        >
          <img
            src={imageUrl}
            alt={promotion.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <CardHeader className={`space-y-2 text-left ${!hasImage ? "pt-8" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Badge variant="outline" className={`${typeColor} capitalize mb-2`}>
              {typeLabel}
            </Badge>
            <CardTitle
              className={`leading-tight ${
                isDialog
                  ? "text-xl md:text-2xl"
                  : "text-lg md:text-xl line-clamp-2"
              } text-left`}
            >
              {promotion.title}
            </CardTitle>
          </div>
        </div>

        {promotion.store && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{promotion.store.name}</span>
            </div>

            {promotion.store.mall && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>{promotion.store.mall.name}</span>
              </div>
            )}
          </>
        )}

        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>
            {format(new Date(promotion.start_date), "MMM d")} -{" "}
            {format(new Date(promotion.end_date), "MMM d, yyyy")}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p
          className={`text-gray-600 text-sm ${
            isDialog ? "" : "line-clamp-3"
          } text-left`}
        >
          {promotion.description}
        </p>
      </CardContent>
    </>
  );

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <PromotionContent />
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95%] md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Detalles de la promoción
            </DialogTitle>
          </DialogHeader>
          <Card className="border-none shadow-none">
            <PromotionContent isDialog={true} />
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
