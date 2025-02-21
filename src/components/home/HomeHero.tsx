
import { MapPin } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

interface HomeHeroProps {
  userLocation: { lat: number; lng: number; } | null;
  onSearch: (term: string) => void;
}

export const HomeHero = ({ userLocation, onSearch }: HomeHeroProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-16 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {userLocation ? "Discover Deals Near You" : "Explore Amazing Deals"}
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Find the best promotions, coupons, and sales from your favorite stores
            </p>
            {userLocation && (
              <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4" />
                <span>Location access enabled</span>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </div>
  );
};
