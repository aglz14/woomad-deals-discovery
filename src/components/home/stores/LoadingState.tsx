
import { Loader } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader className="w-8 h-8 animate-spin text-purple-500" />
      <p className="text-gray-500">Cargando tiendas cercanas...</p>
    </div>
  );
}
