
import { supabase } from "@/integrations/supabase/client";
import { DatabasePromotion, ValidPromotionType } from "@/types/promotion";
import { Location } from "@/hooks/use-location";

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export const getPromotions = async (userLocation: Location | null, calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number) => {
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
};
