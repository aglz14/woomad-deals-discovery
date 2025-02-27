
import { Loader } from "lucide-react";
import { PromotionCard } from "@/components/PromotionCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DatabasePromotion } from "@/types/promotion";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";

interface PromotionsListProps {
  isLoading: boolean;
  promotions: DatabasePromotion[] | null;
  currentItems: DatabasePromotion[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  searchTerm: string;
}

export const PromotionsList = ({ 
  isLoading, 
  promotions, 
  currentItems, 
  currentPage, 
  totalPages, 
  setCurrentPage,
  searchTerm 
}: PromotionsListProps) => {
  const { t } = useTranslation();
  const FIXED_RADIUS_KM = 10;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-500">Buscando las mejores ofertas para ti...</p>
      </div>
    );
  }

  if (!promotions?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Promociones Cercanas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100 shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('noActivePromotions')}</h2>
            <p className="text-gray-500">
              {t('checkBackLater')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Promociones Cercanas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100 shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('noMatchesFound')}</h2>
            <p className="text-gray-500">
              {t('tryAdjustingSearch')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Promociones Cercanas</h2>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Radio de {FIXED_RADIUS_KM}km
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((promotion) => (
          <div key={promotion.id} className="transform transition-all duration-300 hover:scale-[1.02]">
            <PromotionCard promotion={promotion} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.max(1, currentPage - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
