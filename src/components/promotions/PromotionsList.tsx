
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPromotions } from "@/services/promotionService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, Store, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function PromotionsList() {
  const { data: promotions, isLoading, error } = useQuery({
    queryKey: ["all-promotions"],
    queryFn: fetchAllPromotions,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error al cargar las promociones</p>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay promociones disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <Card key={promotion.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{promotion.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Store className="h-3 w-3" />
                  <span>{promotion.store?.name || "Tienda"}</span>
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-purple-50">
                {promotion.discount_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {promotion.valid_until && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>
                    Válido hasta {new Date(promotion.valid_until).toLocaleDateString()}
                  </span>
                </div>
              )}
              {promotion.mall && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  <span>{promotion.mall.name}</span>
                </div>
              )}
              {promotion.category && (
                <div className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  <span>{promotion.category}</span>
                </div>
              )}
            </div>
            {promotion.created_at && (
              <p className="text-xs text-gray-400 mt-3">
                Publicado {formatDistanceToNow(new Date(promotion.created_at), { addSuffix: true, locale: es })}
              </p>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between">
            {promotion.store && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/store/${promotion.store.id}`}>Ver tienda</Link>
              </Button>
            )}
            {promotion.mall && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/mall/${promotion.mall.id}`}>Ver centro comercial</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
