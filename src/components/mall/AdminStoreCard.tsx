
import React from 'react';
import { Store, Tag, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Store as StoreType } from '@/types/store';
import { StoreActions } from './StoreActions';

interface AdminStoreCardProps {
  store: StoreType;
  onClick: () => void;
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
}

export const AdminStoreCard = ({ 
  store, 
  onClick, 
  onEdit, 
  onDelete 
}: AdminStoreCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white relative overflow-hidden min-h-[200px]"
      onClick={onClick}
    >
      <StoreActions
        storeId={store.id}
        storeUserId={store.user_id}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setDeleteDialogOpen={setIsDeleteDialogOpen}
      />
      <CardHeader className="text-left pt-14 pb-3">
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminStoreCardProps {
  store: Store & { promotions?: any[] };
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
  onClick: (storeId: string) => void;
}

export function AdminStoreCard({ store, onEdit, onDelete, onClick }: AdminStoreCardProps) {
  const { t } = useTranslation();
  const activePromotionsCount = store.promotions?.filter(
    (promo) => new Date(promo.end_date) >= new Date()
  ).length || 0;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => onClick(store.id)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-left truncate">{store.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {store.description && (
          <p className="text-sm text-gray-600 text-left line-clamp-2">{store.description}</p>
        )}
        {store.location_in_mall && (
          <p className="text-sm text-gray-500 text-left">
            {t('locationInMall')}: {store.location_in_mall}
          </p>
        )}
        <div className="pt-2">
          <Badge variant={activePromotionsCount > 0 ? "secondary" : "outline"}>
            {activePromotionsCount} {activePromotionsCount === 1 ? t('promotion') : t('promotions')}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(store.id);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(store.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
