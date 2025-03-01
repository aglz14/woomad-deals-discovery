
import { Phone, MapPin, Store, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StoreInfoProps {
  store: {
    name: string;
    category: string;
    logo_url?: string;
    description?: string;
    location_in_mall?: string;
    contact_number?: string;
    website?: string;
  };
}

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <Card className="lg:col-span-1 h-fit overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-4 sm:space-y-6 bg-gradient-to-r from-purple-50 to-white pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
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
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-purple-100 rounded-2xl shadow-md">
                <Store className="w-12 h-12 sm:w-14 sm:h-14 text-purple-500" />
              </div>
            )}
          </div>
          <div className="space-y-3 flex-1">
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl break-words font-bold text-gray-800">
              {store.name}
            </CardTitle>
            <Badge variant="outline" className="capitalize text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 font-medium">
              {store.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 px-6">
        {store.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Acerca de</h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{store.description}</p>
          </div>
        )}
        
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Información</h3>
          
          {store.location_in_mall && (
            <div className="flex items-center gap-3 text-gray-700 group">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm sm:text-base">{store.location_in_mall}</span>
            </div>
          )}
          
          {store.contact_number && (
            <div className="flex items-center gap-3 text-gray-700 group">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
              <a 
                href={`tel:${store.contact_number}`} 
                className="text-sm sm:text-base hover:text-purple-700 transition-colors"
              >
                {store.contact_number}
              </a>
            </div>
          )}
          
          {store.website && (
            <div className="flex items-center gap-3 text-gray-700 group">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                <ExternalLink className="h-4 w-4 text-purple-600" />
              </div>
              <a 
                href={store.website}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm sm:text-base hover:text-purple-700 transition-colors"
              >
                {store.website}
              </a>
            </div>
          )}
        </div>
        
        {store.contact_number && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300 transition-all"
              onClick={() => window.location.href = `tel:${store.contact_number}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Llamar ahora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
