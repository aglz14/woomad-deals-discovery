import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Promotion {
  id: string;
  title: string;
  description: string;
  store: {
    name: string;
    mall: {
      name: string;
      id: string;
    };
  };
  valid_from: string;
  valid_to: string;
}

interface PromotionsListProps {
  promotions: Promotion[];
  isLoading?: boolean;
}

export function PromotionsList({ promotions, isLoading = false }: PromotionsListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Card key={n} className="animate-pulse">
            <CardHeader className="h-28 bg-gray-200 dark:bg-gray-800" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">{t("noPromotionsFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promotions.map((promotion) => (
        <Card key={promotion.id} className="overflow-hidden transform transition-all hover:shadow-lg">
          <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-lg">{promotion.title}</CardTitle>
            <CardDescription className="text-white/90">
              {promotion.store.name} - {promotion.store.mall.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p className="line-clamp-3 text-gray-600 dark:text-gray-300">
              {promotion.description}
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>{t("validFrom")}: {new Date(promotion.valid_from).toLocaleDateString()}</p>
              <p>{t("validTo")}: {new Date(promotion.valid_to).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}