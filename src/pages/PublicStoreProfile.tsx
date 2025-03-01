import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Phone, ArrowLeft, Tag, Store } from 'lucide-react';
import { StoreNotFound } from '@/components/store/StoreNotFound';
import { StoreLoadingState } from '@/components/store/StoreLoadingState';
import { StoreInfo } from '@/components/store/StoreInfo';
import { PromotionsList } from '@/components/store/PromotionsList';
import { useTranslation } from 'react-i18next';

export default function PublicStoreProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);

  const { data: store, isLoading, error } = useQuery(
    ['store', id],
    async () => {
      if (!id) throw new Error("Store ID is required");
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          mall:shopping_malls (
            name,
            address,
            city,
            country
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("name")
          .order("name");
        
        if (error) throw error;
        setCategories(data?.map(cat => cat.name) || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) return <StoreLoadingState />;
  if (error || !store) return <StoreNotFound />;

  return (
    <div className="bg-gradient-to-b from-purple-50 via-white to-purple-50 min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToHome") || "Volver al inicio"}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-8">
              {(store as any).logo_url ? (
                <img src={(store as any).logo_url} alt={store.name} className="h-24 w-24 object-cover rounded-lg shadow-md" />
              ) : (
                <div className="h-24 w-24 flex items-center justify-center bg-purple-100 rounded-lg shadow-md">
                  <Store className="h-12 w-12 text-purple-500" />
                </div>
              )}
              <StoreInfo store={store} categories={categories} />
            </div>
            <div className="md:w-2/3 p-8 border-l border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("promotions")}</h2>
              <PromotionsList storeId={store.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
