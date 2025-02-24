
import React from 'react';
import { Store, Tag, Phone, MapPin } from 'lucide-react';
import { Store as StoreType } from '@/types/store';

interface PublicStoreCardProps {
  store: StoreType;
  onClick: () => void;
}

export const PublicStoreCard = ({ store, onClick }: PublicStoreCardProps) => {
  return (
    <div 
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo/Icon */}
          {store.logo_url ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100">
              <Store className="w-10 h-10 text-purple-500" />
            </div>
          )}

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1 group-hover:text-purple-600 transition-colors">
              {store.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">{store.category}</span>
            </div>
            {store.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Contact Info */}
      {(store.location_in_mall || store.contact_number) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="space-y-2">
            {store.location_in_mall && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="truncate">{store.location_in_mall}</span>
              </div>
            )}
            {store.contact_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span>{store.contact_number}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
