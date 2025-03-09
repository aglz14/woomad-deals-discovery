import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { Location } from "@/hooks/use-location";

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  // Convert to lowercase and normalize
  const normalizedType = type.toLowerCase().trim();

  // Accept a wider range of promotion types
  return [
    "promotion",
    "coupon",
    "sale",
    "promoción",
    "cupón",
    "oferta",
    "promocion",
    "cupon",
    "descuento",
    "discount",
  ].includes(normalizedType);
};

export const getPromotions = async (
  userLocation: Location | null,
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number
) => {
  if (!userLocation) return [];

  // First, get all malls within the radius
  const { data: malls, error: mallsError } = await supabase
    .from("shopping_malls")
    .select("*");

  if (mallsError) throw mallsError;

  // Filter malls by distance (50km radius)
  const FIXED_RADIUS_KM = 50;
  const nearbyMallIds = malls
    .filter((mall) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mall.latitude,
        mall.longitude
      );
      return distance <= FIXED_RADIUS_KM;
    })
    .map((mall) => mall.id);

  if (nearbyMallIds.length === 0) return [];

  // Get stores from nearby malls
  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id")
    .in("mall_id", nearbyMallIds);

  if (storesError) throw storesError;

  if (stores.length === 0) return [];

  // Get active promotions from nearby stores
  // Format today's date in ISO format for comparison
  const now = new Date();
  const today = now.toISOString();
  console.log("Current date for filtering:", today);

  // First, get all promotions without date filtering to debug
  const { data: allPromotions } = await supabase
    .from("promotions")
    .select(
      `
      id, title, start_date, end_date, promotion_type
    `
    )
    .in(
      "store_id",
      stores.map((s) => s.id)
    );

  console.log("All promotions before filtering:", allPromotions?.length || 0);
  if (allPromotions && allPromotions.length > 0) {
    // Log a few promotions to check their date format
    console.log("Sample promotion dates:");
    allPromotions.slice(0, 3).forEach((p) => {
      console.log(
        `ID: ${p.id}, Start: ${p.start_date}, End: ${p.end_date}, Type: ${p.promotion_type}`
      );
    });
  }

  // Now get active promotions with date filtering
  const { data: rawPromotions, error: promotionsError } = await supabase
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
    .in(
      "store_id",
      stores.map((s) => s.id)
    )
    // Get promotions that haven't ended yet
    .gte("end_date", today)
    .order("start_date", { ascending: false }); // Show newest promotions first

  if (promotionsError) {
    console.error("Error fetching promotions:", promotionsError);
    throw promotionsError;
  }

  // Log filtered promotions for debugging
  console.log(
    "Active promotions after date filtering:",
    rawPromotions?.length || 0
  );

  // Process and filter the promotions
  const processedPromotions = (rawPromotions || []).map((promo) => {
    // Log each promotion for debugging
    console.log(
      `Processing promotion: ID=${promo.id}, Title=${promo.title}, Type=${promo.promotion_type}`
    );

    // Normalize the promotion data
    return {
      ...promo,
      // Ensure promotion_type is set correctly
      promotion_type:
        promo.promotion_type || (promo as any).type || "promotion",
    };
  });

  // Return all promotions without filtering by type to ensure we show all valid promotions
  return processedPromotions as DatabasePromotion[];
};
