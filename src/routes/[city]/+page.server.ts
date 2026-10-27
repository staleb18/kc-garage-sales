import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabase/client";
import { error } from "@sveltejs/kit";
import { getCity } from "$lib/data/cities";
import { kcTodayStr } from "$lib/utils/dates";

export const load: PageServerLoad = async ({ params }) => {
  const city = getCity(params.city);

  if (!city) {
    throw error(404, "Page not found");
  }

  const { data: sales } = await supabase
    .from("garage_sales")
    .select("*")
    .eq("is_verified", true)
    // Case-insensitive so sales typed as "overland park" still show on /overland-park.
    .ilike("city", city.name)
    .gte("end_date", kcTodayStr())
    .order("start_date", { ascending: true });

  return {
    cityName: city.name,
    citySlug: city.slug,
    city,
    sales: sales || [],
  };
};
