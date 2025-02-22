
import React from 'react';
import { Store, Tag, Phone, MapPin, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Store as StoreType } from '@/types/store';
import { DeleteStoreDialog } from './DeleteStoreDialog';

interface AdminStoreCardProps {
  store: StoreType;
  onClick: () => void;
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
}

export const AdminStoreCard = ({ store, onClick, onEdit, onDelete }: AdminStoreCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(store.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(store.id);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white relative overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="text-left pt-14">
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white hover:bg-gray-100"
            onClick={handleEdit}
          >
            <Pencil className="h-3.5 w-3.5 text-purple-500" />
          </Button>
          <DeleteStoreDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDelete}
          />
        </div>
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
