import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMall, Mall } from "@/services/mallService";
import { Upload } from "@/components/ui/upload";
import { Camera } from "lucide-react";
import { uploadImage } from "@/services/imageService";

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  description: z.string().optional(),
  image: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

interface EditMallDialogProps {
  mall: Mall;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMallDialog({ mall, open, onOpenChange }: EditMallDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: mall.name,
      address: mall.address,
      description: mall.description || "",
      image: mall.image || "",
      latitude: mall.latitude,
      longitude: mall.longitude,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return updateMall(mall.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mall", mall.id] });
      queryClient.invalidateQueries({ queryKey: ["malls"] });
      toast.success("Centro comercial actualizado correctamente");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Error al actualizar el centro comercial");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      const url = await uploadImage(file, "mall-images");
      form.setValue("image", url);
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      toast.error("Error al cargar la imagen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Centro Comercial</DialogTitle>
          <DialogDescription>
            Actualiza la información del centro comercial
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del centro comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección del centro comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del centro comercial"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="URL de la imagen" {...field} />
                    </FormControl>
                    <Upload
                      icon={<Camera className="w-5 h-5" />}
                      className="h-10 w-10 border rounded-md flex items-center justify-center bg-gray-50"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}