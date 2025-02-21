
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HomeHero } from "@/components/home/HomeHero";
import { PromotionsList } from "@/components/home/PromotionsList";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Showing all promotions instead.");
        }
      );
    }
  }, []);

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions", userLocation],
    queryFn: async () => {
      const { data: malls, error: mallsError } = await supabase
        .from("shopping_malls")
        .select("*");

      if (mallsError) throw mallsError;

      const sortedMalls = userLocation
        ? malls.sort((a, b) => {
            const distA = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              a.latitude,
              a.longitude
            );
            const distB = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              b.latitude,
              b.longitude
            );
            return distA - distB;
          })
        : malls;

      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("*")
        .in(
          "mall_id",
          sortedMalls.map((m) => m.id)
        );

      if (storesError) throw storesError;

      const { data: rawPromotions, error: promotionsError } = await supabase
        .from("promotions")
        .select(`
          *,
          store:stores (
            *,
            mall:shopping_malls (*)
          )
        `)
        .in(
          "store_id",
          stores.map((s) => s.id)
        )
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (promotionsError) throw promotionsError;

      return (rawPromotions as DatabasePromotion[])
        .filter(promo => isValidPromotionType(promo.type))
        .map(promo => ({
          ...promo,
          type: promo.type as ValidPromotionType
        }));
    },
  });

  const filterPromotions = (promotions: DatabasePromotion[]) => {
    if (!searchTerm) return promotions;
    
    const searchLower = searchTerm.toLowerCase();
    return promotions.filter(promotion => 
      promotion.store.name.toLowerCase().includes(searchLower) ||
      promotion.store.mall.name.toLowerCase().includes(searchLower) ||
      promotion.title.toLowerCase().includes(searchLower) ||
      promotion.description.toLowerCase().includes(searchLower)
    );
  };

  const getCurrentPageItems = () => {
    if (!promotions) return [];
    const filteredPromotions = filterPromotions(promotions);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPromotions.slice(start, end);
  };

  const totalPages = Math.ceil((promotions?.length || 0) / ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HomeHero userLocation={userLocation} onSearch={handleSearch} />

        <div className="container mx-auto px-4 py-12">
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
      </main>

      <Footer />
    </div>
  );
}
