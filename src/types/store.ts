
export interface Store {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  location_in_mall?: string;
  category: string;
  contact_number?: string;
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
