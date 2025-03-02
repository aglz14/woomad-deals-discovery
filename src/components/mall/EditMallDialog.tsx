
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMall } from "@/hooks/useMalls";
import { Upload } from "@/components/ui/upload";
import { ImageIcon } from "lucide-react";

interface EditMallDialogProps {
  mall: {
    id: string;
    name: string;
    address: string;
    description: string;
    image: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMallDialog({ mall, open, onOpenChange, onSuccess }: EditMallDialogProps) {
  const [formData, setFormData] = useState({
    name: mall.name,
    address: mall.address,
    description: mall.description,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(mall.image);

  const { mutate: updateMall, isPending } = useUpdateMall();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("address", formData.address);
    formDataToSubmit.append("description", formData.description);
    
    if (selectedImage) {
      formDataToSubmit.append("image", selectedImage);
    }
    
    updateMall(
      { id: mall.id, data: formDataToSubmit },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Centro Comercial</DialogTitle>
          <DialogDescription>
            Actualiza la información del centro comercial aquí
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Dirección
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <div className="flex items-start gap-4">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Mall logo preview" 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <Upload
                  className="h-10 px-4 py-2 bg-gray-100 rounded-md text-sm flex items-center justify-center"
                  icon={<span>Cambiar Logo</span>}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
