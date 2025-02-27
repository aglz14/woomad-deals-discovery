
import { Loader } from "lucide-react";

interface StoresStateDisplayProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  noResults?: boolean;
  searchRadius?: number;
  hasLocation?: boolean;
}

export function StoresStateDisplay({ 
  isLoading, 
  isEmpty, 
  noResults,
  searchRadius,
  hasLocation 
}: StoresStateDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-500">Cargando tiendas cercanas...</p>
      </div>
    );
  }

  if (isEmpty || noResults) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiendas con Promociones Activas</h2>
        <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-100">
          <p className="text-gray-500">
            {isEmpty ? (
              "No hay tiendas con promociones activas en este momento."
            ) : hasLocation ? (
              `No hay tiendas con promociones activas en un radio de ${searchRadius}km`
            ) : (
              "Activa tu ubicación para ver tiendas cercanas con promociones activas"
            )}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
