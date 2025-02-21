
import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface MallCardProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description?: string;
    image_url?: string;
  };
  onClick: () => void;
}

export const MallCard = ({ mall, onClick }: MallCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-500" />
          {mall.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {mall.address}
        </CardDescription>
      </CardHeader>
      {mall.image_url && (
        <div className="relative h-48 w-full">
          <img
            src={mall.image_url}
            alt={mall.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 line-clamp-2">{mall.description}</p>
        <Button className="mt-4 w-full" onClick={onClick}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
