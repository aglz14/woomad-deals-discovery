import React from 'react';
import { Building2, MapPin, Pencil, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/providers/SessionProvider';

interface MallHeaderProps {
  name: string;
  address: string;
  description?: string;
  mallUserId: string;
  onEdit: () => void;
}

export const MallHeader = ({ 
  name, 
  address, 
  description, 
  mallUserId,
  onEdit 
}: MallHeaderProps) => {
  const { user } = useSession();
  const canEdit = user?.id === mallUserId;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      <div className="flex-grow space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-purple-100 flex-shrink-0">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{name}</h1>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit} 
              className="gap-1.5 ml-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-500" />
          <p className="text-base md:text-lg">{address}</p>
        </div>

        {description && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Acerca del centro comercial</h3>
            <p className="text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3 w-full md:w-auto">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 w-full md:w-64">
          <h3 className="text-sm font-medium text-purple-800 mb-2">Información rápida</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-purple-500" />
              <span className="text-gray-600">Tiendas: <b>{/* Add store count here */}</b></span>
            </div>
            {/* Add more quick stats if available */}
          </div>
        </div>
      </div>
    </div>
  );
};