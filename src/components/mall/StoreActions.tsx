
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteStoreDialog } from "./DeleteStoreDialog";

interface StoreActionsProps {
  storeId: string;
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function StoreActions({ 
  storeId, 
  onEdit, 
  onDelete, 
  isDeleteDialogOpen,
  setDeleteDialogOpen 
}: StoreActionsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(storeId);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteStoreDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={(e) => {
          e.stopPropagation();
          onDelete(storeId);
        }}
      />
    </div>
  );
}
