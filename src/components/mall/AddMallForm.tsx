import { useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Upload } from "@/components/ui/upload"; // Assuming this component exists

interface AddMallFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMallForm({ onSuccess, onCancel }: AddMallFormProps) {
  const { t } = useTranslation();
  const { session } = useSession();
  const [formData, setFormData] = useState({
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
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `/${file.name}`;

    try {
      setUploadProgress(0);

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t("mall.imageUploadError"));
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if present
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("shopping_malls").insert([
        {
          name: formData.name,
          address: formData.address,
          description: formData.description,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          user_id: session?.user?.id,
          image: imageUrl
        },
      ]);

      if (error) throw error;

      toast.success(t("mall.addSuccess"));
      setFormData({
        name: "",
        address: "",
        description: "",
        latitude: "",
        longitude: "",
        image: ""
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding mall:", error);
      toast.error(t("mall.addError"));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="mall-image">{t("mall.image") || "Imagen"}</Label>
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
                    <div 
                      className="bg-primary h-1" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <label htmlFor="mall-image" className="cursor-pointer">
                <div className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md">
                  {imageFile ? "Cambiar imagen" : "Subir imagen"}
                </div>
                <input
                  id="mall-image"
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
          <Label htmlFor="mall-name">{t("mall.name")}</Label>
          <Input
            id="mall-name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder={t("mall.namePlaceholder")}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">{t('address')}</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {t('addShoppingMall')}
        </Button>
      </div>
    </form>
  );
}