import { supabase } from "../lib/supabase";

/**
 * Interface for promotion type object
 */
export interface PromotionType {
  id: string;
  name: string;
}

/**
 * Supabase error interface
 */
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Safely gets a property from an object with fallback
 */
export function getSafeProperty<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  return obj && key in obj ? obj[key] : fallback;
}

/**
 * Generate a random fallback ID when a real ID is not available
 */
export function generateFallbackId(): string {
  return `fallback-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely fetch promotion types from the database
 */
export async function fetchPromotionTypes(): Promise<PromotionType[]> {
  try {
    const { data, error } = await supabase.from("promotion_type").select("*");

    if (error) {
      console.error("Error fetching promotion types:", error);
      return getFallbackPromotionTypes();
    }

    if (!data || data.length === 0) {
      // Create default promotion types if none exist
      const defaultTypes = [
        { type: "Promoción", name: "Promoción" },
        { type: "Cupón", name: "Cupón" },
        { type: "Oferta", name: "Oferta" },
      ];

      // @ts-expect-error - Supabase types incompatibility
      const { data: insertedData, error: insertError } = await supabase
        .from("promotion_type")
        .insert(defaultTypes)
        .select();

      if (insertError) {
        console.error("Error creating promotion types:", insertError);
        return getFallbackPromotionTypes();
      }

      return mapPromotionTypeData(insertedData);
    }

    return mapPromotionTypeData(data);
  } catch (err) {
    console.error("Error handling promotion types:", err);
    return getFallbackPromotionTypes();
  }
}

/**
 * Map raw promotion type data to PromotionType objects
 */
function mapPromotionTypeData(data: any[]): PromotionType[] {
  if (!data || !Array.isArray(data)) return getFallbackPromotionTypes();

  return data.map((item) => {
    // Try to get the display name from the correct column
    const displayName =
      getSafeProperty(item, "type", "") ||
      getSafeProperty(item, "name", "") ||
      Object.values(item || {})[1] ||
      "Unknown";

    return {
      id: getSafeProperty(item, "id", generateFallbackId()),
      name: displayName,
    };
  });
}

/**
 * Get fallback promotion types when database operations fail
 */
export function getFallbackPromotionTypes(): PromotionType[] {
  return [
    { id: "1", name: "Promoción" },
    { id: "2", name: "Cupón" },
    { id: "3", name: "Oferta" },
  ];
}

/**
 * Insert a promotion with proper type handling
 */
export async function insertPromotion(promotionData: any) {
  try {
    // @ts-expect-error - Supabase types incompatibility
    const { data, error } = await supabase
      .from("promotions")
      .insert(promotionData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error: SupabaseError | unknown) {
    console.error("Error inserting promotion:", error);
    return { data: null, error };
  }
}

/**
 * Update a promotion with proper type handling
 */
export async function updatePromotion(id: string, promotionData: any) {
  try {
    // @ts-expect-error - Supabase types incompatibility
    const { error } = await supabase
      .from("promotions")
      .update(promotionData)
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error: SupabaseError | unknown) {
    console.error("Error updating promotion:", error);
    return { error };
  }
}

/**
 * Delete a promotion with proper error handling
 */
export async function deletePromotion(id: string) {
  try {
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) throw error;
    return { error: null };
  } catch (error: SupabaseError | unknown) {
    console.error("Error deleting promotion:", error);
    return { error };
  }
}
