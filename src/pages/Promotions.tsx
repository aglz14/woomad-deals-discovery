
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Search, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddPromotionForm } from "@/components/forms/AddPromotionForm";
import { EditMallForm } from "@/components/forms/EditMallForm";
import { AddMallForm } from "@/components/forms/AddMallForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function Promotions() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingMall, setIsAddingMall] = useState(false);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [mallToDelete, setMallToDelete] = useState<string | null>(null);
  const [mallToEdit, setMallToEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: malls, refetch: refetchMalls, isLoading } = useQuery({
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
    navigate(`/admin/mall/${mallId}`);
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
    mall.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section with improved layout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold text-gray-900">{t('managePromotions')}</h1>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
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
                        <Button variant="outline" className="w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('addMall')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t('addMall')}</DialogTitle>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    className="pl-10 bg-gray-50 border-gray-200"
                    placeholder={t('searchMalls')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Malls Grid with improved visuals */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{t('shoppingMalls')}</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border border-gray-100">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredMalls && filteredMalls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMalls.map((mall) => (
                    <Card key={mall.id} className="overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">{mall.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-gray-500 line-clamp-2">{mall.address}</p>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleMallClick(mall.id)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          {t('viewMall')}
                        </Button>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setMallToEdit(mall.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('editMall')}</DialogTitle>
                              </DialogHeader>
                              {mallToEdit === mall.id && (
                                <EditMallForm
                                  mallId={mallToEdit}
                                  initialData={mall}
                                  onSuccess={() => {
                                    setMallToEdit(null);
                                    refetchMalls();
                                  }}
                                  onCancel={() => setMallToEdit(null)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog open={mallToDelete === mall.id} onOpenChange={(open) => !open && setMallToDelete(null)}>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setMallToDelete(mall.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('deleteMallConfirmation')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('deleteMallWarning')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMall(mall.id)} className="bg-red-500 hover:bg-red-600">
                                  {t('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    {searchTerm ? t('noMallsMatchSearch') : t('noMallsCreated')}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    {searchTerm ? t('tryDifferentSearch') : t('createYourFirstMall')}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsAddingMall(true)}
                      className="mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addMall')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
