
import { Store } from "@/types/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Store as StoreIcon, Building2 } from "lucide-react";

interface StoreInfoProps {
  store: Store;
}

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <Card className="lg:col-span-1 h-fit overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-4 sm:space-y-6 bg-gradient-to-r from-purple-50 to-white pb-6">
        <div className="flex flex-col items-center gap-4">
          {/* Store Icon */}
          <div className="flex items-center justify-center">
            {store.logo_url ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-purple-100 flex items-center justify-center">
                <StoreIcon className="w-12 h-12 text-purple-500" />
              </div>
            )}
          </div>
          
          {/* Store Category */}
          <Badge variant="outline" className="capitalize text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 font-medium">
            {store.category}
          </Badge>
          
          {/* Store Name */}
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl break-words font-bold text-gray-800 text-center">
            {store.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 px-6">
        {/* About */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Acerca de</h3>
          <p className="text-gray-600">
            {store.description || "No hay descripción disponible para esta tienda."}
          </p>
        </div>
        
        {/* Mall Information */}
        {store.mall && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 text-center">Centro Comercial</h3>
            <div className="flex flex-col items-center text-center">
              <Building2 className="h-6 w-6 text-purple-500 mb-2" />
              <div className="text-center">
                <p className="text-gray-800 font-medium">{store.mall.name}</p>
                {store.mall.address && (
                  <p className="text-gray-600 text-sm mt-1">{store.mall.address}</p>
                )}
              </div>
              {store.floor && (
                <div className="flex items-center gap-2 mt-3">
                  <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <p className="text-gray-600">Piso: {store.floor}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Location */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Ubicación</h3>
          {store.location_in_mall && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600">{store.location_in_mall}</p>
            </div>
          )}
        </div>
        
        {/* Contact */}
        {store.contact_number && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600">{store.contact_number}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
