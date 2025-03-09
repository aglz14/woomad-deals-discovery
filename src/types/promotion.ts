export type ValidPromotionType = "promotion" | "coupon" | "sale";

export interface DatabasePromotion {
  id: string;
  type: ValidPromotionType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  image_url?: string;
  store_id?: string;
  user_id?: string;
  created_at: string;
  is_active?: boolean;
  status?: "active" | "inactive";
  store?: {
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
