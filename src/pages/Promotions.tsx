import { useEffect, useState } from "react";
import { Plus, Trash2, SearchIcon, Pencil, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/SessionProvider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddMallForm } from "@/components/mall/AddMallForm";
import { MallCard } from "@/components/mall/MallCard";
import { EditMallDialog } from "@/components/mall/EditMallDialog";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Promotions() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingMall, setIsAddingMall] = useState(false);
  // State for adding promotions removed - now handled in store profiles
  const [mallToDelete, setMallToDelete] = useState<string | null>(null);
  const [mallToEdit, setMallToEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: malls, refetch: refetchMalls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) {
        toast.error("Error al cargar centros comerciales");
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        toast.error(t("errorTitle"));
      }
    };

    checkAuth();
  }, [navigate, t]);

  const handleMallClick = (mallId: string) => {
    navigate(`/admin/mall/${mallId}`);
  };

  const handleDeleteMall = async (mallId: string) => {
    try {
      const { error } = await supabase
        .from("shopping_malls")
        .delete()
        .eq("id", mallId);

      if (error) throw error;

      toast.success("Centro comercial eliminado exitosamente");
      refetchMalls();
    } catch (error) {
      toast.error("Error al eliminar el centro comercial");
    }
    setMallToDelete(null);
  };

  const filteredMalls = malls?.filter(
    (mall) =>
      mall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mall.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mall.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isOwner = (mallUserId: string) => {
    return session?.user?.id === mallUserId;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />

      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Gestionar Centros Comerciales
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Add Promotion button removed - this functionality is now in store profiles */}

                <Dialog open={isAddingMall} onOpenChange={setIsAddingMall}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addShoppingMall")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("addShoppingMall")}</DialogTitle>
                    </DialogHeader>
                    <AddMallForm
                      onSuccess={() => {
                        setIsAddingMall(false);
                        refetchMalls();
                      }}
                      onCancel={() => setIsAddingMall(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Improved Search Bar and Filter */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex-grow">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t("searchMalls")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 h-10"
                    />
                  </div>
                </div>
                {/* Placeholder for future filter -  No filter data available in original code */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMalls?.map((mall) => (
                <div key={mall.id} className="relative group">
                  {isOwner(mall.user_id) && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMallToEdit(mall.id);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog
                        open={mallToDelete === mall.id}
                        onOpenChange={(open) => !open && setMallToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMallToDelete(mall.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("deleteMallTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("deleteMallDescription")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMall(mall.id);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  <MallCard
                    mall={mall}
                    onClick={() => handleMallClick(mall.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {malls?.map(
        (mall) =>
          mallToEdit === mall.id &&
          isOwner(mall.user_id) && (
            <EditMallDialog
              key={mall.id}
              mall={mall}
              isOpen={true}
              onClose={() => setMallToEdit(null)}
              onSuccess={() => {
                refetchMalls();
                setMallToEdit(null);
              }}
            />
          ),
      )}

      <Footer />
    </div>
  );
}