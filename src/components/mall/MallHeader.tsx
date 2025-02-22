
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddStoreDialog } from "./AddStoreDialog";

interface MallHeaderProps {
  mallName: string;
  mallAddress: string;
  mallId: string;
  isAddStoreDialogOpen: boolean;
  onAddStoreDialogClose: () => void;
  onAddStoreSuccess: () => void;
}

export function MallHeader({
  mallName,
  mallAddress,
  mallId,
  isAddStoreDialogOpen,
  onAddStoreDialogClose,
  onAddStoreSuccess,
}: MallHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          onClick={() => navigate('/promotions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Promociones
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{mallName}</h1>
          <p className="text-gray-600">{mallAddress}</p>
        </div>
        <AddStoreDialog
          mallId={mallId}
          isOpen={isAddStoreDialogOpen}
          onClose={onAddStoreDialogClose}
          onSuccess={onAddStoreSuccess}
        />
      </div>
    </>
  );
}
