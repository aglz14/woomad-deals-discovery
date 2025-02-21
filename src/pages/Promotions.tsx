
import { useEffect, useState } from "react";
import { Plus, Trash2, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/SessionProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddMallForm } from "@/components/mall/AddMallForm";
import { AddPromotionForm } from "@/components/promotion/AddPromotionForm";
import { MallCard } from "@/components/mall/MallCard";
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
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [mallToDelete, setMallToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: malls, refetch: refetchMalls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_malls").select("*");
      if (error) {
        toast.error(t("errorTitle"));
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        toast.error(t("errorTitle"));
      }
    };
    
    checkAuth();
  }, [navigate, t]);

  const handleMallClick = (mallId: string) => {
    navigate(`/mall/${mallId}/manage`);
  };

  const handleDeleteMall = async (mallId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_malls')
        .delete()
        .eq('id', mallId);

      if (error) throw error;

      toast.success(t("mallDeletedSuccess"));
      refetchMalls();
    } catch (error) {
      toast.error(t("errorDeletingMall"));
    }
    setMallToDelete(null);
  };

  const filteredMalls = malls?.filter(mall => 
    mall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mall.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mall.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('managePromotions')}</h1>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addPromotion')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('addPromotion')}</DialogTitle>
                    </DialogHeader>
                    <AddPromotionForm
                      onSuccess={() => setIsAddingPromotion(false)}
                      onCancel={() => setIsAddingPromotion(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddingMall} onOpenChange={setIsAddingMall}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addShoppingMall')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('addShoppingMall')}</DialogTitle>
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

            <div className="relative">
              <Input
                type="text"
                placeholder={t('searchMalls')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMalls?.map((mall) => (
                <div key={mall.id} className="relative group">
                  <MallCard
                    mall={mall}
                    onClick={() => handleMallClick(mall.id)}
                  />
                  <AlertDialog open={mallToDelete === mall.id} onOpenChange={(open) => !open && setMallToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <AlertDialogTitle>{t('deleteMallTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteMallDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMall(mall.id);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
