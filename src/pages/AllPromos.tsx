import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromotionsList } from "@/components/promotions/PromotionsList";
import { useAllPromotions } from "@/hooks/usePromotions";
import { useTranslation } from "react-i18next";
import { useSession } from "@/components/providers/SessionProvider";

export default function AllPromos() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { promotions, isLoading: isLoadingPromotions } = useAllPromotions();
  const { isLoadingSession } = useSession();

  useEffect(() => {
    if (!isLoadingPromotions && !isLoadingSession) {
      setIsLoading(false);
    }
  }, [isLoadingPromotions, isLoadingSession]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow pt-20">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          {t('allPromotions')}
        </h1>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <PromotionsList promotions={promotions} viewType="grid" />
        )}
      </div>
      <Footer />
    </div>
  );
}