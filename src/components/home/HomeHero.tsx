
import { MapPin } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationMap } from "@/components/maps/LocationMap";

interface HomeHeroProps {
  userLocation: { lat: number; lng: number; } | null;
  onSearch: (term: string) => void;
  onMallSelect: (mallId: string) => void;
  malls: Array<{
    id: string;
    name: string;
  }>;
  selectedMallId: string;
}

export const HomeHero = ({ userLocation, onSearch, onMallSelect, malls, selectedMallId }: HomeHeroProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/375924b8-bf3a-4f85-868b-b1befe051793.png')] opacity-5 bg-center bg-no-repeat bg-contain"></div>
      <div className="relative py-8 pt-24 lg:pt-28">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {userLocation ? t("nearMe") : t("deals")}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                {t("searchPlaceholder")}
              </p>
              {userLocation && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>{t("nearMe")}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 space-y-4 animate-fade-up">
              <SearchBar onSearch={onSearch} />
              
              <div className="max-w-md mx-auto">
                <Select value={selectedMallId} onValueChange={onMallSelect}>
                  <SelectTrigger className="bg-white/95 border-2 border-white/20 text-gray-800 h-12">
                    <SelectValue placeholder={t("selectMall")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      {t("allMalls")}
                    </SelectItem>
                    {malls.map((mall) => (
                      <SelectItem key={mall.id} value={mall.id} className="cursor-pointer">
                        {mall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 animate-fade-up">
              <LocationMap userLocation={userLocation} className="mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
