// Get stores for this mall with their active promotions
  const { data: stores, refetch: refetchStores } = useQuery({
    queryKey: ["mall-stores", mallId],
    queryFn: async () => {
      console.log("Fetching stores for mall:", mallId);
      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          promotions(*)
        `)
        .eq("mall_id", mallId);
      if (error) throw error;
      return data;
    },
  });

{stores?.map((store) => {
              // Filter active promotions
              const activePromotions = store.promotions?.filter(
                promo => new Date(promo.end_date) >= new Date()
              ) || [];

              return (
                <div key={store.id} className="col-span-1">
                  <AdminStoreCard
                    store={{...store, promotions: activePromotions}}
                    onEdit={handleEditStore}
                    onDelete={setStoreToDelete}
                    onClick={handleStoreClick}
                  />
                </div>
              );
            })}