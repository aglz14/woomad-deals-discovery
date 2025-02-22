
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";

interface MallCardProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description?: string;
    latitude: number;
    longitude: number;
  };
  onClick: () => void;
  onEdit?: () => void;
}

export function MallCard({ mall, onClick, onEdit }: MallCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <Card
      className="cursor-pointer group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white"
      onClick={handleClick}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2">{mall.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{mall.address}</p>
        </div>
        {mall.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">{mall.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
