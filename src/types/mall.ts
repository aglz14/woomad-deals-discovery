
export interface Mall {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  stores?: any[];
  distance?: number;
  image_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  business_hours?: string;
  category?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}
