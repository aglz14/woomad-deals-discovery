
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocationMap } from "@/components/maps/LocationMap";

interface HomeHeroProps {
  userLocation: { lat: number; lng: number; } | null;
}

export const HomeHero = ({ userLocation }: HomeHeroProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/375924b8-bf3a-4f85-868b-b1befe051793.png')] opacity-10 bg-center bg-no-repeat bg-cover mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative py-6 px-4 pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                <span className="text-xs sm:text-sm font-medium text-white">✨ Descubre ofertas exclusivas cerca de ti</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                {userLocation ? t("nearMe") : t("deals")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto px-2 leading-relaxed">
                Ofertas Cerca de Ti
              </p>
              {userLocation && (
                <div className="inline-flex items-center justify-center gap-2 py-1 px-3 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{t("nearMe")}</span>
                </div>
              )}
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10 animate-fade-up w-full max-w-4xl mx-auto px-2 sm:px-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <LocationMap 
                  userLocation={userLocation} 
                  className="relative w-full h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] rounded-xl shadow-xl" 
                />
              </div>
              <p className="mt-3 text-sm text-white/70 text-center">
                {userLocation ? "Basado en tu ubicación actual" : "Activa tu ubicación para ver centros comerciales cercanos"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
