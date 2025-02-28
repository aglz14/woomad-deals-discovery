import { Loader } from "lucide-react";
import { PromotionCard } from "@/components/PromotionCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DatabasePromotion } from "@/types/promotion";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Promociones</h2>
          <div className="hidden sm:block h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <PromotionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!promotions?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Promociones</h2>
        <EmptyStateDisplay
          title={t('noActivePromotions') || "No hay promociones activas"}
          message={t('checkBackLater') || "Vuelve más tarde para descubrir nuevas ofertas"}
          icon={AlertCircle}
        />
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Promociones</h2>
        <EmptyStateDisplay
          title={t('noMatchesFound') || "No se encontraron resultados"}
          message={t('tryAdjustingSearch') || "Intenta ajustar tu búsqueda o filtros para encontrar promociones"}
          icon={AlertCircle}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Promociones</h2>
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
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for loading state of promotion cards
export const PromotionCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};
