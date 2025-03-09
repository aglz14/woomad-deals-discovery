export interface Store {
  id: string;
  name: string;
  description?: string;
  image?: string;
  array_categories?: string[];
  phone?: string;
  local_number?: string;
  floor?: string;
  mall_id: string;
  user_id: string;
  mall?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
}
