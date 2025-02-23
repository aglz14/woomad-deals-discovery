
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteStoreDialog } from "./DeleteStoreDialog";
import { useSession } from "@/components/providers/SessionProvider";

interface StoreActionsProps {
  storeId: string;
  storeUserId: string;
  onEdit: (storeId: string) => void;
  onDelete: (storeId: string) => void;
  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function StoreActions({ 
  storeId, 
  storeUserId,
  onEdit, 
  onDelete, 
  isDeleteDialogOpen,
  setDeleteDialogOpen 
}: StoreActionsProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === storeUserId;

  if (!isOwner) return null;

  return (
    <div className="absolute top-2 right-2 z-10 flex gap-2 p-2">
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(storeId);
        }}
      >
        <Pencil className="h-3.5 w-3.5 text-purple-500" />
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
