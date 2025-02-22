
import React from 'react';
import { Building2, MapPin, InfoIcon, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MallHeaderProps {
  name: string;
  address: string;
  description?: string;
  onEdit: () => void;
}

export const MallHeader = ({ name, address, description, onEdit }: MallHeaderProps) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md space-y-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6">
          <div className="p-4 rounded-xl bg-purple-100 ring-1 ring-purple-200">
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
                <p className="text-lg leading-relaxed">{address}</p>
              </div>
            </div>
            
            {description && (
              <div className="flex items-start gap-2 max-w-3xl">
                <InfoIcon className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" />
                <p className="text-gray-600 text-lg leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="hover:bg-purple-50"
        >
          <PencilLine className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  );
};
