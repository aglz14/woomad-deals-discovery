
export interface Mall {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  website?: string;
  phone?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  stores_count?: number;
  distance?: number; // Added for distance calculations
}
