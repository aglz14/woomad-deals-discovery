
import React from 'react';
import { Building2, MapPin, InfoIcon, PencilLine } from 'lucide-react';
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
  const { session } = useSession();
  const isOwner = session?.user?.id === mallUserId;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md space-y-6 transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 rounded-xl bg-purple-100 ring-1 ring-purple-200 flex-shrink-0">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
          <div className="space-y-4 w-full sm:w-auto">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words">{name}</h1>
              <div className="flex items-start sm:items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500 mt-0.5 sm:mt-0" />
                <p className="text-base sm:text-lg leading-relaxed">{address}</p>
              </div>
            </div>
            
            {description && (
              <div className="flex items-start gap-2 max-w-3xl">
                <InfoIcon className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" />
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="hover:bg-purple-50 self-start"
          >
            <PencilLine className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
    </div>
  );
};
