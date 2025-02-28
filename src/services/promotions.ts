import { supabase } from "@/integrations/supabase/client";
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
  console.log("Obteniendo promociones con ubicación:", userLocation);

  if (!userLocation) {
    console.warn("No hay ubicación de usuario disponible para getPromotions");
    return [];
  }

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
        const isNearby = distance <= FIXED_RADIUS_KM;
        console.log(`Mall ${mall.name}: distancia ${distance.toFixed(2)}km, cercano: ${isNearby}`);
        return isNearby;
      })
      .map(mall => mall.id);

    console.log(`Centros comerciales cercanos encontrados: ${nearbyMallIds.length}`);

    if (nearbyMallIds.length === 0) {
      console.log("No se encontraron centros comerciales dentro del radio de " + FIXED_RADIUS_KM + "km");
      return [];
    }

    // Get stores from nearby malls
    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select("id")
      .in("mall_id", nearbyMallIds);

    if (storesError) {
      console.error("Error al obtener tiendas:", storesError);
      throw storesError;
    }

    console.log(`Obtenidas ${stores?.length || 0} tiendas de los centros comerciales cercanos`);

    if (stores.length === 0) {
      console.log("No se encontraron tiendas en los centros comerciales cercanos.");
      return [];
    }

    // Get active promotions from nearby stores
    try {
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

      if (promotionsError) {
        console.error("Error al obtener promociones:", promotionsError);
        throw promotionsError;
      }

      console.log(`Obtenidas ${rawPromotions?.length || 0} promociones`);

      const promotionsWithType = (rawPromotions as DatabasePromotion[])
        .filter(promo => isValidPromotionType(promo.type))
        .map(promo => ({
          ...promo,
          type: promo.type as ValidPromotionType
        }));

        if (promotionsWithType.length < rawPromotions.length) {
          console.warn(`Se filtraron ${rawPromotions.length - promotionsWithType.length} promociones con tipo inválido`);
        }

      return promotionsWithType;
    } catch (error) {
      console.error("Error en la consulta de promociones:", error);
      return [];
    }
  } catch (error) {
    console.error("Error general al obtener promociones:", error);
    return [];
  }
};