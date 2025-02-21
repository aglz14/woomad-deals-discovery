
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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

export default function Promotions() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingMall, setIsAddingMall] = useState(false);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('managePromotions')}</h1>
            <div className="flex gap-4">
              <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addPromotion')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('addPromotion')}</DialogTitle>
                  </DialogHeader>
                  <AddPromotionForm
                    onSuccess={() => {
                      setIsAddingPromotion(false);
                    }}
                    onCancel={() => setIsAddingPromotion(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingMall} onOpenChange={setIsAddingMall}>
                <DialogTrigger asChild>
                  <Button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {malls?.map((mall) => (
              <MallCard
                key={mall.id}
                mall={mall}
                onClick={() => handleMallClick(mall.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
