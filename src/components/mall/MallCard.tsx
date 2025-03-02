import { FC } from "react";
import { Button } from "../ui/button";
import { Building2, MapPin } from "lucide-react";
import { Mall } from "@/types/mall";
import { Card, CardContent } from "../ui/card";

interface MallCardProps {
  mall: Mall;
  onClick?: () => void;
  showDistance?: boolean;
}

export const MallCard: FC<MallCardProps> = ({ mall, onClick, showDistance = true }) => {
  return (
    <Card 
      className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {mall.image ? (
          <img 
            src={mall.image}
            alt={mall.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Replace with fallback icon if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-gray-400">
                    <path d="M6 8h12"></path><path d="M6 16h12"></path><path d="M6 12h12"></path><path d="M3 5v14"></path><path d="M21 5v14"></path>
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <Building2 className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <CardContent className="p-4 pb-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{mall.name}</h3>
        {mall.address && (
          <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{mall.address}</span>
          </div>
        )}
        {showDistance && mall.distance !== undefined && mall.distance !== null && (
          <p className="text-sm text-gray-500">
            {mall.distance < 1
              ? `${Math.round(mall.distance * 1000)} m`
              : `${mall.distance.toFixed(1)} km`}
          </p>
        )}
      </CardContent>
    </Card>
  );
};