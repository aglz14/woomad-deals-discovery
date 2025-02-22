
import React from 'react';
import { Calendar, Store, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

interface PromotionCardProps {
  promotion: {
    id: string;
    type: 'coupon' | 'promotion' | 'sale';
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    image_url?: string;
    store: {
      id: string;
      name: string;
      mall: {
        id: string;
        name: string;
      };
    };
  };
}

export const PromotionCard = ({ promotion }: PromotionCardProps) => {
  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800 border-blue-200',
    promotion: 'bg-purple-100 text-purple-800 border-purple-200',
    sale: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
      {promotion.image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="space-y-2 text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Badge 
              variant="outline" 
              className={`${typeColors[promotion.type]} capitalize mb-2`}
            >
              {promotion.type}
            </Badge>
            <CardTitle className="leading-tight line-clamp-2 text-left">{promotion.title}</CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{promotion.store.name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-purple-500" />
          <span>{promotion.store.mall.name}</span>
        </div>

        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>
            {format(new Date(promotion.start_date), 'MMM d')} -{' '}
            {format(new Date(promotion.end_date), 'MMM d, yyyy')}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-3 text-left">{promotion.description}</p>
      </CardContent>
    </Card>
  );
};
