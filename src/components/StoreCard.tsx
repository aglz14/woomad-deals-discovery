
import React from 'react';
import { Store, Tag, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    location_in_mall?: string;
    category: string;
    contact_number?: string;
  };
  onClick: () => void;
}

export const StoreCard = ({ store, onClick }: StoreCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-16 h-16 object-contain rounded-lg"
            />
          ) : (
            <Store className="w-16 h-16 text-purple-500" />
          )}
          <div className="flex-1">
            <CardTitle>{store.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {store.category}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          {store.description && <p>{store.description}</p>}
          {store.location_in_mall && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {store.location_in_mall}
            </p>
          )}
          {store.contact_number && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {store.contact_number}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
