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