export type ValidPromotionType =
  | "promotion"
  | "coupon"
  | "sale"
  | "promoción"
  | "cupón"
  | "oferta"
  | "promocion"
  | "cupon"
  | "descuento"
  | "discount";

export interface DatabasePromotion {
  id: string;
  created_at: string;
  store_id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image?: string;
  user_id?: string;
  promotion_type: string;
  terms_conditions?: string;
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
