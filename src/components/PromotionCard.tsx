
import React, { useState } from 'react';
import { Calendar, Store, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { DatabasePromotion } from '@/types/promotion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PromotionCardProps {
  promotion: DatabasePromotion;
}

export const PromotionCard = ({ promotion }: PromotionCardProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800 border-blue-200',
    promotion: 'bg-purple-100 text-purple-800 border-purple-200',
    sale: 'bg-green-100 text-green-800 border-green-200'
  };

  const typeLabels = {
    promotion: 'Promoción',
    coupon: 'Cupón',
    sale: 'Oferta'
  };

  const hasImage = !!promotion.image_url;

  const PromotionContent = ({ isDialog = false }: { isDialog?: boolean }) => (
    <>
      {hasImage && (
        <div className={`relative ${isDialog ? 'h-64' : 'h-48'} w-full overflow-hidden`}>
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className={`space-y-2 text-left ${!hasImage ? 'pt-8' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Badge 
              variant="outline" 
              className={`${typeColors[promotion.type]} capitalize mb-2`}
            >
              {typeLabels[promotion.type]}
            </Badge>
            <CardTitle className={`leading-tight ${isDialog ? '' : 'line-clamp-2'} text-left`}>
              {promotion.title}
            </CardTitle>
          </div>
        </div>

        {promotion.store && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{promotion.store.name}</span>
            </div>

            {promotion.store.mall && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>{promotion.store.mall.name}</span>
              </div>
            )}
          </>
        )}

        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>
            {format(new Date(promotion.start_date), 'MMM d')} -{' '}
            {format(new Date(promotion.end_date), 'MMM d, yyyy')}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className={`text-gray-600 text-sm ${isDialog ? '' : 'line-clamp-3'} text-left`}>
          {promotion.description}
        </p>
      </CardContent>
    </>
  );

  return (
    <>
      <Card 
        className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white cursor-pointer" 
        onClick={() => setShowDialog(true)}
      >
        <PromotionContent />
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Detalles de la promoción</DialogTitle>
          </DialogHeader>
          <Card className="border-none shadow-none">
            <PromotionContent isDialog={true} />
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
