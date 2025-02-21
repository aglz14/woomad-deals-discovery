
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
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group bg-white"
      onClick={onClick}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 pr-20"> {/* Added right padding to prevent title from going under icons */}
            <CardTitle className="text-lg font-semibold line-clamp-2">{mall.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{mall.address}</p>
        </div>
        {mall.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">{mall.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
