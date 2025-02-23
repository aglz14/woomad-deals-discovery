
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteStoreDialog } from "./DeleteStoreDialog";
import { useSession } from "@/components/providers/SessionProvider";

interface StoreActionsProps {
  storeId: string;
  storeUserId: string; // Changed from mallUserId to storeUserId
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function StoreActions({ 
  storeId, 
  storeUserId, // Changed from mallUserId to storeUserId
  onEdit, 
  onDelete, 
  isDeleteDialogOpen,
  setDeleteDialogOpen 
}: StoreActionsProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === storeUserId;

  if (!isOwner) return null;

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
