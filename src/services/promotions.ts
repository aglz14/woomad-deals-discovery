
import { supabase } from "@/integrations/supabase";
import { Location } from "@/hooks/use-location";

export type ValidPromotionType = "promotion" | "coupon" | "sale";

export interface DatabasePromotion {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  type: ValidPromotionType;
  store: {
    id: string;
    name: string;
    mall: {
      id: string;
      name: string;
    }
  };
}

const isValidPromotionType = (type: string): type is ValidPromotionType => {
  return ["promotion", "coupon", "sale"].includes(type);
};

export const getPromotions = async (userLocation: Location | null, calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number) => {
  if (!userLocation) {
    console.warn("No hay ubicación de usuario disponible para getPromotions");
    return [];
  }

  console.log("Obteniendo promociones con ubicación:", userLocation);

  try {
    // First, get all malls within the radius
    const { data: malls, error: mallsError } = await supabase
      .from("shopping_malls")
      .select("*");

    if (mallsError) {
      console.error("Error al obtener centros comerciales:", mallsError);
      throw mallsError;
    }

    console.log(`Centros comerciales obtenidos: ${malls?.length || 0}`);

    // Filter malls by distance (50km radius)
    const FIXED_RADIUS_KM = 50;
    const nearbyMallIds = malls
      .filter(mall => {
        if (!mall.latitude || !mall.longitude) {
          console.warn(`Mall sin coordenadas: ${mall.name} (${mall.id})`);
          return false;
        }
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mall.latitude,
          mall.longitude
        );
        return distance <= FIXED_RADIUS_KM;
      })
      .map(mall => mall.id);

    console.log(`Centros comerciales cercanos encontrados: ${nearbyMallIds.length}`);

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

    const promotionsWithType = (rawPromotions as DatabasePromotion[])
      .filter(promo => isValidPromotionType(promo.type))
      .map(promo => ({
        ...promo,
        type: promo.type as ValidPromotionType
      }));
    
    return promotionsWithType;
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return [];
  }
};
