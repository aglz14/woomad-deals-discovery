
import React from 'react';
import { Store, Tag, Phone, MapPin, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Store as StoreType } from '@/types/store';
import { StoreActions } from './StoreActions';

interface AdminStoreCardProps {
  store: StoreType;
  mallId: string;
  mallUserId: string;
  onClick: () => void;
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
}

export const AdminStoreCard = ({ 
  store, 
  mallId,
  mallUserId,
  onClick, 
  onEdit, 
  onDelete 
}: AdminStoreCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white relative overflow-hidden"
      onClick={onClick}
    >
      <StoreActions
        storeId={store.id}
        mallId={mallId}
        mallUserId={mallUserId}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setDeleteDialogOpen={setIsDeleteDialogOpen}
      />
      <CardHeader className="text-left pt-14">
        <div className="flex items-start gap-4">
          {store.logo_url ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-purple-50">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Store className="w-8 h-8 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 text-left">{store.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="line-clamp-1">{store.category}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-left">
        <div className="space-y-2 text-sm text-gray-600">
          {store.description && (
            <p className="line-clamp-2 mb-3">{store.description}</p>
          )}
          {store.location_in_mall && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="line-clamp-1">{store.location_in_mall}</span>
            </p>
          )}
          {store.contact_number && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" />
              <span>{store.contact_number}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
