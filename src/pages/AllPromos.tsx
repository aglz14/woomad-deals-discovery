import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PromotionsList } from "@/components/home/PromotionsList";
import { Button } from "@/components/ui/button";
import { DatabasePromotion } from "@/types/promotion";
import { safeDbOperation } from "@/utils/supabaseHelpers";

// Define a Mall interface to properly type mall data
interface Mall {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export default function AllPromos() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMallId, setSelectedMallId] = useState<string>("all");
  const ITEMS_PER_PAGE = 12;
  const { t } = useTranslation();

  const { data: promotions, isLoading } = useQuery<DatabasePromotion[]>({
    queryKey: ["all-promotions"],
    queryFn: async () => {
      try {
        console.log("Fetching all promotions...");

        // Simplify the query to avoid type issues
        const { data, error } = await supabase
          .from("promotions")
          .select(
            `
            *,
            store:stores (
              *,
              mall:shopping_malls (*)
            )
          `
          )
          .gte("end_date", new Date().toISOString())
          .order("start_date", { ascending: false });

        if (error) {
          console.error("Error fetching promotions:", error);
          return [];
        }

        // Safely process the data
        const processedPromotions: DatabasePromotion[] = [];

        if (Array.isArray(data)) {
          console.log(`Found ${data.length} promotions`);

          // Process each promotion to ensure it has the correct structure
          data.forEach((item) => {
            if (item && typeof item === "object") {
              const promotion: DatabasePromotion = {
                id: item.id || "",
                created_at: item.created_at || "",
                title: item.title || "",
                description: item.description || "",
                start_date: item.start_date || "",
                end_date: item.end_date || "",
                promotion_type:
                  item.promotion_type || (item as any).type || "promotion",
                store: item.store,
                image: item.image,
                store_id: item.store_id,
                user_id: item.user_id,
                terms_conditions: item.terms_conditions,
              };
              processedPromotions.push(promotion);
            }
          });

          // Log a sample promotion
          if (processedPromotions.length > 0) {
            console.log("Sample processed promotion:", processedPromotions[0]);
          }
        }

        return processedPromotions;
      } catch (err) {
        console.error("Unexpected error fetching promotions:", err);
        return [];
      }
    },
  });

  // Get malls with active promotions
  const { data: malls } = useQuery<Mall[]>({
    queryKey: ["malls-with-active-promotions", promotions],
    queryFn: async () => {
      if (!promotions || promotions.length === 0) return [];

      try {
        // Get all unique mall IDs from promotions
        const mallIdsFromPromos = new Set<string>();
        promotions.forEach((promo) => {
          if (promo.store?.mall?.id) {
            mallIdsFromPromos.add(promo.store.mall.id);
          }
        });

        if (mallIdsFromPromos.size === 0) {
          return [];
        }

        // Fetch all malls and filter manually
        const { data, error } = await supabase
          .from("shopping_malls")
          .select("*");

        if (error) {
          console.error("Error fetching malls:", error);
          return [];
        }

        // Manually filter the malls that match our IDs
        // This avoids type issues with .in() and complex type assertions
        const filteredMalls: Mall[] = [];

        if (data) {
          for (const mall of data) {
            if (mall && mall.id && mallIdsFromPromos.has(mall.id)) {
              // Use type assertion after verifying the mall has an id
              filteredMalls.push(mall as unknown as Mall);
            }
          }
        }

        return filteredMalls;
      } catch (err) {
        console.error("Unexpected error fetching malls:", err);
        return [];
      }
    },
    enabled: !!promotions && promotions.length > 0,
  });

  const filterPromotions = (promotions: DatabasePromotion[]) => {
    if (!promotions) return [];
    let filtered = promotions;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (promotion) =>
          promotion.store?.name?.toLowerCase().includes(searchLower) ||
          promotion.store?.mall?.name?.toLowerCase().includes(searchLower) ||
          promotion.title?.toLowerCase().includes(searchLower) ||
          promotion.description?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMallId && selectedMallId !== "all") {
      filtered = filtered.filter(
        (promotion) => promotion.store?.mall?.id === selectedMallId
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

  const totalPages = Math.ceil(
    filterPromotions(promotions || []).length / ITEMS_PER_PAGE
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleMallFilter = (mallId: string) => {
    setSelectedMallId(mallId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome") || "Volver al inicio"}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Todas las Promociones
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="w-full md:w-1/2 lg:w-2/3 mb-4 md:mb-0">
              <SearchBar onSearch={handleSearch} className="w-full" />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 md:max-w-xs">
              <Select value={selectedMallId} onValueChange={handleMallFilter}>
                <SelectTrigger className="border-2 border-purple-100 w-full">
                  <SelectValue
                    placeholder={
                      t("selectMall") || "Seleccionar centro comercial"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    {t("allMalls") || "Todos los centros comerciales"}
                  </SelectItem>
                  {malls?.map((mall) => (
                    <SelectItem
                      key={mall.id}
                      value={mall.id}
                      className="cursor-pointer"
                    >
                      {mall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ErrorBoundary>
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
              <PromotionsList
                isLoading={isLoading}
                promotions={promotions}
                currentItems={getCurrentPageItems()}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                searchTerm={searchTerm}
              />
            </div>
          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}
