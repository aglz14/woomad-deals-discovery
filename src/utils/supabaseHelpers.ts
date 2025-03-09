import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { Store } from "../types/store";

/**
 * Mall entity from database
 */
export interface Mall {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  user_id?: string;
  created_at?: string;
}

/**
 * Interface for promotion type object
 */
export interface PromotionType {
  id: string;
  name: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  message: string;
  details?: string;
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
 * Converts any error to a standardized ErrorResponse
 */
export function normalizeError(error: unknown): ErrorResponse {
  if (error instanceof PostgrestError) {
    return {
      message: error.message,
      details: error.details,
      code: error.code,
    };
  } else if (error instanceof Error) {
    return {
      message: error.message,
    };
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return {
      message: String((error as { message: unknown }).message),
    };
  }

  return {
    message: "Unknown error occurred",
  };
}

/**
 * Safely fetch promotion types from the database
 */
export async function fetchPromotionTypes(): Promise<PromotionType[]> {
  try {
    console.log("Fetching promotion types from database...");
    const { data, error } = await supabase.from("promotion_type").select("*");
    console.log("Raw promotion types data:", data);

    if (error) {
      console.error("Error fetching promotion types:", error);
      return getFallbackPromotionTypes();
    }

    if (!data || data.length === 0) {
      console.log("No promotion types found in database, creating defaults...");
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

      console.log("Inserted promotion types data:", insertedData);

      if (insertError) {
        console.error("Error creating promotion types:", insertError);
        return getFallbackPromotionTypes();
      }

      const mappedTypes = mapPromotionTypeData(insertedData);
      console.log("Mapped promotion types after insertion:", mappedTypes);
      return mappedTypes;
    }

    const mappedTypes = mapPromotionTypeData(data);
    console.log("Mapped promotion types from existing data:", mappedTypes);
    return mappedTypes;
  } catch (err) {
    console.error("Error handling promotion types:", err);
    return getFallbackPromotionTypes();
  }
}

/**
 * Map raw promotion type data to PromotionType objects
 */
function mapPromotionTypeData(data: Record<string, any>[]): PromotionType[] {
  if (!data || !Array.isArray(data)) return getFallbackPromotionTypes();

  console.log("Raw promotion type data for mapping:", JSON.stringify(data));

  return data.map((item) => {
    // Extract the keys from the item to help with debugging
    const keys = Object.keys(item);
    console.log("Item keys:", keys);

    // Try multiple strategies to get the name
    let displayName = "Unknown";

    // Strategy 1: Try direct property access
    if (item.type) displayName = item.type;
    else if (item.name) displayName = item.name;
    // Strategy 2: If no direct property, inspect all keys and find a string value
    else {
      for (const key of keys) {
        const value = item[key];
        if (
          typeof value === "string" &&
          value.length > 0 &&
          key !== "id" &&
          key !== "created_at"
        ) {
          displayName = value;
          console.log(`Found displayName in property "${key}": ${value}`);
          break;
        }
      }
    }

    // Ensure we have a valid ID
    const id = item.id || generateFallbackId();

    console.log(`Mapped promotion type: id=${id}, name=${displayName}`);

    return {
      id,
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
 * Type for database operations
 */
export type DbOperationResult<T = any> = {
  data: T | null;
  error: ErrorResponse | null;
};

/**
 * Insert a promotion with proper type handling
 */
export async function insertPromotion(
  promotionData: Record<string, unknown>
): Promise<DbOperationResult> {
  try {
    // @ts-expect-error - Supabase types incompatibility
    const { data, error } = await supabase
      .from("promotions")
      .insert(promotionData)
      .select();

    if (error) return { data: null, error: normalizeError(error) };
    return { data, error: null };
  } catch (error) {
    console.error("Error inserting promotion:", error);
    return { data: null, error: normalizeError(error) };
  }
}

/**
 * Update a promotion with proper type handling
 */
export async function updatePromotion(
  id: string,
  promotionData: Record<string, unknown>
): Promise<DbOperationResult> {
  try {
    // @ts-expect-error - Supabase types incompatibility
    const { error } = await supabase
      .from("promotions")
      .update(promotionData)
      .eq("id", id);

    if (error) return { data: null, error: normalizeError(error) };
    return { data: null, error: null };
  } catch (error) {
    console.error("Error updating promotion:", error);
    return { data: null, error: normalizeError(error) };
  }
}

/**
 * Delete a promotion with proper error handling
 */
export async function deletePromotion(id: string): Promise<DbOperationResult> {
  try {
    // @ts-expect-error - Supabase types incompatibility
    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (error) return { data: null, error: normalizeError(error) };
    return { data: null, error: null };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return { data: null, error: normalizeError(error) };
  }
}

/**
 * Safely fetch, update or delete from any table with proper error handling
 */
export async function safeDbOperation<T = any>(
  operation: () => Promise<{ data?: T; error?: PostgrestError | null }>
): Promise<DbOperationResult<T>> {
  try {
    const { data, error } = await operation();

    if (error) return { data: null, error: normalizeError(error) };
    return { data: data || null, error: null };
  } catch (error) {
    console.error("Database operation error:", error);
    return { data: null, error: normalizeError(error) };
  }
}

/**
 * Get a mall by ID
 */
export async function getMallById(
  id: string
): Promise<DbOperationResult<Mall>> {
  return safeDbOperation(async () => {
    // @ts-expect-error - Supabase types incompatibility
    return await supabase
      .from("shopping_malls")
      .select("*")
      .eq("id", id)
      .maybeSingle();
  });
}

/**
 * Get stores by mall ID
 */
export async function getStoresByMallId(
  mallId: string
): Promise<DbOperationResult<Store[]>> {
  return safeDbOperation(async () => {
    // @ts-expect-error - Supabase types incompatibility
    return await supabase.from("stores").select("*").eq("mall_id", mallId);
  });
}

/**
 * Delete a store by ID
 */
export async function deleteStore(storeId: string): Promise<DbOperationResult> {
  return safeDbOperation(async () => {
    // @ts-expect-error - Supabase types incompatibility
    return await supabase.from("stores").delete().eq("id", storeId);
  });
}
