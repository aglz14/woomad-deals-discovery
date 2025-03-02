import React from "react";
import { PromotionCard } from "./PromotionCard";
import { Promotion } from "@/types/promotion";

interface PromotionsListProps {
  promotions: Promotion[];
  viewType: "grid" | "list";
}

export function PromotionsList({ promotions, viewType }: PromotionsListProps) {
  if (!promotions || promotions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay promociones disponibles</p>
      </div>
    );
  }

  return (
    <div className={viewType === "grid" 
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
      : "space-y-4"
    }>
      {promotions.map((promotion) => (
        <PromotionCard key={promotion.id} promotion={promotion} view={viewType} />
      ))}
    </div>
  );
}