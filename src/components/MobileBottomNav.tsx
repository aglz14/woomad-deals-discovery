import { HomeIcon, SearchIcon, MapPinIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 z-50 md:hidden">
      <div className="flex items-center justify-around h-full px-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            isActive("/") ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <HomeIcon className="w-5 h-5 mb-1" />
          <span className="text-xs">Inicio</span>
        </Link>

        <Link 
          to="/allpromos" 
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            isActive("/allpromos") ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <SearchIcon className="w-5 h-5 mb-1" />
          <span className="text-xs">Promociones</span>
        </Link>

        <Link 
          to="/allmalls" 
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            isActive("/allmalls") ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <MapPinIcon className="w-5 h-5 mb-1" />
          <span className="text-xs">Centros</span>
        </Link>
      </div>
    </div>
  );
};