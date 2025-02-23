
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MallHeader } from "@/components/mall/MallHeader";
import { MallStoresSection } from "@/components/mall/MallStoresSection";
import { Store } from "@/types/store";

interface AdminMallContentProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description?: string;
    user_id: string;
  };
  stores: Store[];
  onEditMall: () => void;
  onAddStore: () => void;
  onEditStore: (storeId: string) => void;
  onDeleteStore: (storeId: string) => void;
  onStoreClick: (storeId: string) => void;
}

export function AdminMallContent({
  mall,
  stores,
  onEditMall,
  onAddStore,
  onEditStore,
  onDeleteStore,
  onStoreClick,
}: AdminMallContentProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-4 sm:py-6 lg:py-8 mt-16">
      <Button variant="ghost" className="mb-4 sm:mb-6" asChild>
        <Link to="/promotions" className="inline-flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a Promociones
        </Link>
      </Button>
      
      <div className="space-y-6 sm:space-y-8">
        <MallHeader
          name={mall.name}
          address={mall.address}
          description={mall.description}
          mallUserId={mall.user_id}
          onEdit={onEditMall}
        />

        <MallStoresSection
          stores={stores}
          onStoreClick={onStoreClick}
          onAddStore={onAddStore}
          onEditStore={onEditStore}
          onDeleteStore={onDeleteStore}
        />
      </div>
    </div>
  );
}
