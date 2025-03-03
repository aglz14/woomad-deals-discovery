
export interface Mall {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  image_url?: string;
  distance?: number;
  stores?: any[];
}
