
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
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white min-h-[240px] w-full max-w-[500px] mx-auto"
      onClick={onClick}
    >
      <CardHeader className="text-left pb-3">
        <div className="flex items-start gap-8">
          {store.logo_url ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-purple-50">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Store className="w-12 h-12 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <CardTitle className="text-2xl font-semibold text-gray-900 break-words leading-tight">{store.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">{store.category}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-left pt-2">
        <div className="space-y-4">
          {store.description && (
            <p className="text-sm text-gray-700 break-words leading-relaxed">{store.description}</p>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {store.location_in_mall && (
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.location_in_mall}</span>
              </p>
            )}
            {store.contact_number && (
              <p className="flex items-center gap-3">
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
