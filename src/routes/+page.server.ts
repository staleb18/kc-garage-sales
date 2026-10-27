import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabase/client";
import { kcTodayStr } from "$lib/utils/dates";

export const load: PageServerLoad = async () => {
  const { data: sales, error } = await supabase
    .from("garage_sales")
    .select("*")
    .eq("is_verified", true)
    .gte("end_date", kcTodayStr())
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching sales:", error);
    return { sales: [] };
  }

  return {
    sales: sales || [],
  };
};
