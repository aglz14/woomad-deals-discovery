
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocationMap } from "@/components/maps/LocationMap";

interface HomeHeroProps {
  userLocation: { lat: number; lng: number; } | null;
}

export const HomeHero = ({ userLocation }: HomeHeroProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/375924b8-bf3a-4f85-868b-b1befe051793.png')] opacity-5 bg-center bg-no-repeat bg-contain"></div>
      <div className="relative py-6 sm:py-8 pt-20 sm:pt-22 md:pt-24 lg:pt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {userLocation ? t("nearMe") : t("deals")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
                {t("searchPlaceholder")}
              </p>
              {userLocation && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>{t("nearMe")}</span>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 animate-fade-up w-full max-w-4xl mx-auto px-2 sm:px-4">
              <LocationMap userLocation={userLocation} className="w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
