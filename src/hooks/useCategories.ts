import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories");
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      console.log("Categories fetched:", data);
      return data || [];
    },
  });
}
