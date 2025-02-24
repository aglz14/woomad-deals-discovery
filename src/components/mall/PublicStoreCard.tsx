
import React from 'react';
import { Store, Tag, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Store as StoreType } from '@/types/store';

interface PublicStoreCardProps {
  store: StoreType;
  onClick: () => void;
}

export const PublicStoreCard = ({ store, onClick }: PublicStoreCardProps) => {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white min-h-[200px]"
      onClick={onClick}
    >
      <CardHeader className="text-left pb-3">
        <div className="flex items-start gap-6">
          {store.logo_url ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-purple-50">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Store className="w-10 h-10 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <CardTitle className="text-xl font-semibold text-gray-900 break-words">{store.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">{store.category}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-left">
        <div className="space-y-4">
          {store.description && (
            <p className="text-sm text-gray-700 break-words">{store.description}</p>
          )}
          <div className="space-y-2 text-sm text-gray-600">
            {store.location_in_mall && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.location_in_mall}</span>
              </p>
            )}
            {store.contact_number && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.contact_number}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
