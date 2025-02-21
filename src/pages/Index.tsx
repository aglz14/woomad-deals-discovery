
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, MapPin } from "lucide-react";
import { PromotionCard } from "@/components/PromotionCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

// Define valid promotion types
type ValidPromotionType = "promotion" | "coupon" | "sale";

// Type guard to check if a string is a valid promotion type
const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

// Interface for the promotion data from the database
interface DatabasePromotion {
  id: string;
  type: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_value?: string;
  terms_conditions?: string;
  image_url?: string;
  store: {
    id: string;
    name: string;
    mall: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    };
  };
}

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Get user's location
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

  // Fetch all promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions", userLocation],
    queryFn: async () => {
      const { data: malls, error: mallsError } = await supabase
        .from("shopping_malls")
        .select("*");

      if (mallsError) throw mallsError;

      // If we have user location, sort malls by distance
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

      // Get all stores from these malls
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("*")
        .in(
          "mall_id",
          sortedMalls.map((m) => m.id)
        );

      if (storesError) throw storesError;

      // Get all active promotions from these stores
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

      // Filter and validate promotion types
      return (rawPromotions as DatabasePromotion[])
        .filter((promo) => isValidPromotionType(promo.type))
        .map((promo) => ({
          ...promo,
          type: promo.type as ValidPromotionType
        }));
    },
  });

  // Calculate total pages
  const totalPages = Math.ceil((promotions?.length || 0) / ITEMS_PER_PAGE);

  // Get current page items
  const getCurrentPageItems = () => {
    if (!promotions) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return promotions.slice(start, end);
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {userLocation ? "Discover Deals Near You" : "Explore Amazing Deals"}
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                Find the best promotions, coupons, and sales from your favorite stores
              </p>
              {userLocation && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>Location access enabled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-gray-500">Finding the best deals for you...</p>
            </div>
          ) : promotions?.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">No active promotions found</h2>
                <p className="text-gray-500">
                  Check back later for new deals and promotions from your favorite stores.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentPageItems().map((promotion) => (
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
                            setCurrentPage((prev) => Math.max(1, prev - 1));
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
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
