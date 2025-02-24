
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
      className="relative h-full bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo/Icon */}
            {store.logo_url ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Store className="w-12 h-12 text-purple-500" />
              </div>
            )}

            {/* Store Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-gray-900 break-words leading-tight mb-2">
                {store.name}
              </h3>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4 text-purple-500" />
                <span>{store.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-0 flex-1 flex flex-col">
          {/* Description */}
          {store.description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4 text-center sm:text-left">
              {store.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="mt-auto space-y-3">
            {store.location_in_mall && (
              <div className="flex items-center gap-3 text-sm text-gray-600 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.location_in_mall}</span>
              </div>
            )}
            {store.contact_number && (
              <div className="flex items-center gap-3 text-sm text-gray-600 justify-center sm:justify-start">
                <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="break-words">{store.contact_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
