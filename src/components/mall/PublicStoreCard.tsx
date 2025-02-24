
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
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white h-full"
      onClick={onClick}
    >
      <CardHeader className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {store.logo_url ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-purple-50">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Store className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 break-words leading-tight">{store.name}</CardTitle>
            <CardDescription className="flex items-center justify-center sm:justify-start gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">{store.category}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {store.description && (
            <p className="text-sm text-gray-700 break-words leading-relaxed text-center sm:text-left">{store.description}</p>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {store.location_in_mall && (
              <p className="flex items-center gap-3 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.location_in_mall}</span>
              </p>
            )}
            {store.contact_number && (
              <p className="flex items-center gap-3 justify-center sm:justify-start">
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
