
import { Store } from "lucide-react";

export function StoreNotFound() {
  return (
    <div className="flex flex-col items-start h-48">
      <Store className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Tienda no encontrada</h2>
      <p className="text-gray-600">La tienda que buscas no existe o ha sido eliminada</p>
    </div>
  );
}
