
export type ValidPromotionType = "promotion" | "coupon" | "sale";

export interface DatabasePromotion {
  id: string;
  type: ValidPromotionType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_value?: string;
  terms_conditions?: string;
  image_url?: string;
  store_id?: string;
  created_at: string;
}
