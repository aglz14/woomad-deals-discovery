
import { Phone, MapPin, Store } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreInfoProps {
  store: {
    name: string;
    category: string;
    logo_url?: string;
    description?: string;
    location_in_mall?: string;
    contact_number?: string;
  };
}

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <Card className="lg:col-span-1 h-fit">
      <CardHeader className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="flex items-center justify-center">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-purple-100 rounded-xl">
                <Store className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
              </div>
            )}
          </div>
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl break-words">
              {store.name}
            </CardTitle>
            <Badge variant="outline" className="capitalize text-sm">
              {store.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {store.description && (
          <p className="text-gray-600 text-sm sm:text-base">{store.description}</p>
        )}
        {store.location_in_mall && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sm:text-base">{store.location_in_mall}</span>
          </div>
        )}
        {store.contact_number && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sm:text-base">{store.contact_number}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
