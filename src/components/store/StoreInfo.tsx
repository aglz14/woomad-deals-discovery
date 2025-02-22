
import { Store } from "lucide-react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreInfoProps {
  store: {
    name: string;
    category: string;
    logo_url?: string;
    description?: string;
    location_in_mall?: string;
  };
}

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <Card className="lg:col-span-1 h-fit">
      <CardHeader className="space-y-6">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-4 w-full">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-24 h-24 object-contain rounded-xl shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-purple-100 rounded-xl">
                <Store className="w-12 h-12 text-purple-500" />
              </div>
            )}
            <div className="space-y-2">
              <CardTitle className="text-2xl">{store.name}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {store.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {store.description && (
          <p className="text-gray-600 text-left">{store.description}</p>
        )}
        {store.location_in_mall && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{store.location_in_mall}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
