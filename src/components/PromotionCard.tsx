
import React from 'react';
import { Calendar, Tag, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';

interface PromotionCardProps {
  promotion: {
    id: string;
    type: 'coupon' | 'promotion' | 'sale';
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    discount_value?: string;
    terms_conditions?: string;
    image_url?: string;
  };
}

export const PromotionCard = ({ promotion }: PromotionCardProps) => {
  const typeColors = {
    coupon: 'bg-blue-100 text-blue-800',
    promotion: 'bg-purple-100 text-purple-800',
    sale: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{promotion.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(promotion.start_date), 'MMM d')} -{' '}
              {format(new Date(promotion.end_date), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              typeColors[promotion.type]
            }`}
          >
            {promotion.type}
          </span>
        </div>
      </CardHeader>
      {promotion.image_url && (
        <div className="relative h-48 w-full">
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="pt-4">
        {promotion.discount_value && (
          <div className="flex items-center gap-2 text-lg font-semibold text-purple-600 mb-2">
            <Percent className="h-5 w-5" />
            {promotion.discount_value}
          </div>
        )}
        <p className="text-gray-600">{promotion.description}</p>
        {promotion.terms_conditions && (
          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium mb-1">Terms & Conditions:</p>
            <p>{promotion.terms_conditions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
