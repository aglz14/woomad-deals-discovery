
import { MallCard } from "@/components/mall/MallCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface MallsNearbyProps {
  searchTerm: string;
  selectedMallId: string;
}

export const MallsNearby = ({ searchTerm, selectedMallId }: MallsNearbyProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const { data: malls, isLoading } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredMalls = malls?.filter(mall => {
    if (selectedMallId !== 'all' && mall.id !== selectedMallId) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      mall.name.toLowerCase().includes(searchLower) ||
      mall.address.toLowerCase().includes(searchLower) ||
      mall.description?.toLowerCase().includes(searchLower)
    );
  });

  const getCurrentPageItems = () => {
    if (!filteredMalls) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredMalls.slice(start, end);
  };

  const totalPages = Math.ceil((filteredMalls?.length || 0) / ITEMS_PER_PAGE);

  const handleMallClick = (mallId: string) => {
    console.log("Navigating to mall:", mallId);
    navigate(`/mall/${mallId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando centros comerciales...</p>
      </div>
    );
  }

  if (!filteredMalls?.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron centros comerciales</h3>
        <p className="mt-2 text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  const currentItems = getCurrentPageItems();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Centros Comerciales Cercanos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((mall) => (
          <MallCard
            key={mall.id}
            mall={mall}
            onClick={() => handleMallClick(mall.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
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
