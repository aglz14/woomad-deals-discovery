
import { Store } from "lucide-react";

export function StoreLoadingState() {
  return (
    <div className="flex justify-start items-center h-48">
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
