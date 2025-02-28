
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, CalendarRange, Store, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import AddPromotionForm from "@/components/promotions/AddPromotionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateDisplay } from "@/components/EmptyStateDisplay";

export default function Promotions() {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMall, setFilterMall] = useState("all");

  // Get all promotions
  const { data: promotions, isLoading: isLoadingPromotions, refetch: refetchPromotions } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select(`
          *,
          store:stores (
            id,
            name,
            mall:shopping_malls (
              id,
              name
            )
          )
        `)
        .order("start_date", { ascending: false });

      if (error) {
        toast.error(t("errorTitle"));
        throw error;
      }
      return data;
    },
  });

  // Get all malls for filtering
  const { data: malls } = useQuery({
    queryKey: ["shopping-malls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_malls")
        .select("*");
      
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

  // Filter and search functions
  const filteredPromotions = promotions?.filter(promo => {
    const matchesSearch = searchTerm === "" || 
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      promo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.store?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.store?.mall?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const isActive = new Date(promo.end_date) >= now;
    const isExpired = new Date(promo.end_date) < now;
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && isActive) || 
      (filterStatus === "expired" && isExpired);
    
    const matchesMall = 
      filterMall === "all" || 
      promo.store?.mall?.id === filterMall;
    
    return matchesSearch && matchesStatus && matchesMall;
  });

  // Get promotion status with color
  const getPromotionStatus = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (end < now) {
      return { label: t("expired"), color: "text-red-500 bg-red-100" };
    } else {
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        return { label: `${daysLeft} ${t("daysLeft")}`, color: "text-orange-500 bg-orange-100" };
      } else {
        return { label: t("active"), color: "text-green-500 bg-green-100" };
      }
    }
  };

  // Loading skeleton
  if (isLoadingPromotions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden border border-gray-200 bg-white">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header and Add Promotion Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('managePromotions')}</h1>
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
                    onSuccess={() => {
                      setIsAddingPromotion(false);
                      refetchPromotions();
                    }}
                    onCancel={() => setIsAddingPromotion(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t('searchPromotions')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4 text-gray-500" />
                          <SelectValue placeholder={t('status')} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allStatuses')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="expired">{t('expired')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative">
                    <Select value={filterMall} onValueChange={setFilterMall}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <div className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4 text-gray-500" />
                          <SelectValue placeholder={t('selectMall')} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allMalls')}</SelectItem>
                        {malls?.map(mall => (
                          <SelectItem key={mall.id} value={mall.id}>{mall.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotions List */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions && filteredPromotions.length > 0 ? (
                  filteredPromotions.map((promotion) => {
                    const status = getPromotionStatus(promotion.end_date);
                    return (
                      <Card 
                        key={promotion.id} 
                        className="overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={status.color}>{status.label}</Badge>
                            <Badge variant="outline" className="text-gray-600">
                              {promotion.type}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {promotion.title}
                          </h3>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Store className="h-4 w-4 mr-2" />
                              <span className="line-clamp-1">{promotion.store?.name} · {promotion.store?.mall?.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarRange className="h-4 w-4 mr-2" />
                              <span>
                                {format(new Date(promotion.start_date), 'MMM d')} - {format(new Date(promotion.end_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="text-gray-700 line-clamp-2 text-sm">
                              {promotion.description}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/admin/store/${promotion.store?.id}`)}
                          >
                            {t('viewDetails')}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <EmptyStateDisplay
                      title={t('noPromotionsFound')}
                      message={t('tryAdjustingFilters')}
                      icon={Filter}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
