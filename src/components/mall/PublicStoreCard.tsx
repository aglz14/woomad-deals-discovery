
import { Store as StoreIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Store } from "@/types/store";
import { useSession } from "@/components/providers/SessionProvider";

interface PublicStoreCardProps {
  store: Store;
  onClick: () => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export function PublicStoreCard({ store, onClick, onEdit, onDelete }: PublicStoreCardProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === store.user_id;

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
    >
      {isOwner && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(store.id);
              }}
            >
              <Pencil className="h-4 w-4 text-purple-500" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(store.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      )}
      
      <CardHeader className="flex flex-row items-start space-x-4 p-6">
        <div className="w-16 h-16 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <StoreIcon className="w-8 h-8 text-purple-500" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-lg text-gray-900">{store.name}</h3>
          <p className="text-sm text-gray-500">{store.category}</p>
        </div>
      </CardHeader>
      {(store.description || store.location_in_mall || store.contact_number) && (
        <CardContent className="space-y-2">
          {store.description && (
            <p className="text-sm text-gray-600">{store.description}</p>
          )}
          {store.location_in_mall && (
            <p className="text-sm text-gray-500">
              Ubicación: {store.location_in_mall}
            </p>
          )}
          {store.contact_number && (
            <p className="text-sm text-gray-500">
              Contacto: {store.contact_number}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
