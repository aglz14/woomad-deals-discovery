
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MallCardProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description?: string;
  };
  onClick: () => void;
}

export function MallCard({ mall, onClick }: MallCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{mall.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{mall.address}</p>
        {mall.description && (
          <p className="text-sm text-gray-500 mt-2">{mall.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
