import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Upload } from "@/components/ui/upload"; // Assuming this component exists


interface AddMallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMallForm({ isOpen, onClose, onSuccess }: AddMallFormProps) {
  const { t } = useTranslation();
  const [mallData, setMallData] = useState({
    name: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `/${fileName}`;

    try {
      setUploadProgress(0);
      const { data, error } = await supabase.storage
        .from("logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });
      if (error) throw error;
      const { data: urlData } = await supabase.storage.from("logos").getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("mall.imageUploadError"));
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const newImageUrl = await uploadImage(imageFile);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      const { error } = await supabase
        .from("shopping_malls")
        .insert({
          name: mallData.name,
          address: mallData.address,
          description: mallData.description,
          latitude: parseFloat(mallData.latitude),
          longitude: parseFloat(mallData.longitude),
          image: imageUrl,
        });

      if (error) throw error;

      toast.success(t("mallAddedSuccess"));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding mall:", error);
      toast.error(t("errorTitle"));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addMall")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-mall-image">{t("mall.image") || "Imagen"}</Label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="w-32 h-32 object-cover rounded-md border border-gray-200"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setMallData({ ...mallData, image: "" });
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                        <Upload className="text-gray-400" />
                      </div>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-1">
                        <div className="bg-primary h-1" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>
                  <label htmlFor="add-mall-image" className="cursor-pointer">
                    <div className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md">
                      {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                    </div>
                    <input
                      id="add-mall-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-mall-name">{t("mall.name")}</Label>
              <Input
                id="add-mall-name"
                value={mallData.name}
                onChange={(e) => setMallData({ ...mallData, name: e.target.value })}
                placeholder={t("mall.namePlaceholder")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-mall-address">{t("address")}</Label>
              <Input
                id="add-mall-address"
                value={mallData.address}
                onChange={(e) => setMallData({ ...mallData, address: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-mall-description">{t("description")}</Label>
              <Textarea
                id="add-mall-description"
                value={mallData.description}
                onChange={(e) => setMallData({ ...mallData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-mall-latitude">{t("latitude")}</Label>
              <Input
                id="add-mall-latitude"
                type="number"
                step="any"
                value={mallData.latitude}
                onChange={(e) => setMallData({ ...mallData, latitude: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-mall-longitude">{t("longitude")}</Label>
              <Input
                id="add-mall-longitude"
                type="number"
                step="any"
                value={mallData.longitude}
                onChange={(e) => setMallData({ ...mallData, longitude: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("loading") : t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}