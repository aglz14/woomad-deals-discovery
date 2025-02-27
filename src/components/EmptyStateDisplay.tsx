
import { AlertCircle, LucideIcon } from "lucide-react";

interface EmptyStateDisplayProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyStateDisplay({ 
  title, 
  message, 
  icon: Icon = AlertCircle,
  className = ""
}: EmptyStateDisplayProps) {
  return (
    <div className={`text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}>
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
}
