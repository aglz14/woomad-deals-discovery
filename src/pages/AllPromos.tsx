import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PromotionsList } from "@/components/promotions/PromotionsList";
import { Button } from "@/components/ui/button";
import { DatabasePromotion } from "@/types/promotion";
import { Helmet } from "react-helmet";

const AllPromos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMallId, setSelectedMallId] = useState<string>("all");
  const ITEMS_PER_PAGE = 12;
  const { t } = useTranslation();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["all-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select(`
          *,
          store:stores (
            *,
            mall:shopping_malls (*)
          )
        `)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as DatabasePromotion[];
    },
  });

  // Get malls with active promotions
  const { data: malls } = useQuery({
    queryKey: ["malls-with-active-promotions", promotions],
    queryFn: async () => {
      if (!promotions || promotions.length === 0) return [];

      // Extract unique mall IDs from active promotions
      const mallIds = new Set(promotions.map(promo => promo.store?.mall.id).filter(Boolean));

      // Get full mall data
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*")
        .in('id', Array.from(mallIds));

      if (error) throw error;
      return data;
    },
    enabled: !!promotions && promotions.length > 0,
  });

  const filterPromotions = (promotions: DatabasePromotion[]) => {
    if (!promotions) return [];
    let filtered = promotions;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(promotion =>
        promotion.store?.name.toLowerCase().includes(searchLower) ||
        promotion.store?.mall.name.toLowerCase().includes(searchLower) ||
        promotion.title.toLowerCase().includes(searchLower) ||
        promotion.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== 'all') {
      filtered = filtered.filter(promotion =>
        promotion.store?.mall.id === selectedMallId
      );
    }

    return filtered;
  };

  const getCurrentPageItems = () => {
    if (!promotions) return [];
    const filteredPromotions = filterPromotions(promotions);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPromotions.slice(start, end);
  };

  const totalPages = Math.ceil((filterPromotions(promotions || []).length) / ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleMallFilter = (mallId: string) => {
    setSelectedMallId(mallId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Todas las Promociones | PromoCerca</title>
        <meta name="description" content="Explora todas las promociones disponibles en centros comerciales cercanos" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow pt-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>

        <h1 className="text-2xl font-bold mb-6">Todas las Promociones</h1>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <PromotionsList promotions={promotions} isLoading={isLoading} malls={malls}/>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllPromos;