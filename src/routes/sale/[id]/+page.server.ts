import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabase/client";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const { data: sale, error: dbError } = await supabase
    .from("garage_sales")
    .select("*")
    .eq("id", params.id)
    .eq("is_verified", true)
    .single();

  if (dbError || !sale) {
    throw error(404, "Sale not found");
  }

  return { sale };
};
