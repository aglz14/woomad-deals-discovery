
import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { Location } from "@/hooks/use-location";

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export const getPromotions = async (userLocation: Location | null, calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number) => {
  if (!userLocation) return [];

  // First, get all malls within the radius
  const { data: malls, error: mallsError } = await supabase
    .from("shopping_malls")
    .select("*");

  if (mallsError) throw mallsError;

  // Filter malls by distance (10km radius)
  const FIXED_RADIUS_KM = 10;
  const nearbyMallIds = malls
    .filter(mall => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mall.latitude,
        mall.longitude
      );
      return distance <= FIXED_RADIUS_KM;
    })
    .map(mall => mall.id);

  if (nearbyMallIds.length === 0) return [];

  // Get stores from nearby malls
  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id")
    .in("mall_id", nearbyMallIds);

  if (storesError) throw storesError;

  if (stores.length === 0) return [];

  // Get active promotions from nearby stores
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
};
