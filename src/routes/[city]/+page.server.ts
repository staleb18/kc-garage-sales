import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabase/client";
import { error } from "@sveltejs/kit";

const CITY_SLUG_MAP: Record<string, string> = {
  "overland-park": "Overland Park",
  "olathe": "Olathe",
  "kansas-city": "Kansas City",
  "shawnee": "Shawnee",
  "lenexa": "Lenexa",
  "leawood": "Leawood",
  "prairie-village": "Prairie Village",
  "gardner": "Gardner",
  "merriam": "Merriam",
  "mission": "Mission",
  "roeland-park": "Roeland Park",
  "independence": "Independence",
  "lees-summit": "Lee's Summit",
  "blue-springs": "Blue Springs",
  "liberty": "Liberty",
  "gladstone": "Gladstone",
  "raytown": "Raytown",
  "grandview": "Grandview",
  "belton": "Belton",
  "raymore": "Raymore",
  "grain-valley": "Grain Valley",
  "north-kansas-city": "North Kansas City",
  "parkville": "Parkville",
  "platte-city": "Platte City",
};

export const load: PageServerLoad = async ({ params }) => {
  const cityName = CITY_SLUG_MAP[params.city];

  if (!cityName) {
    throw error(404, "Page not found");
  }

  const { data: sales } = await supabase
    .from("garage_sales")
    .select("*")
    .eq("is_verified", true)
    .eq("city", cityName)
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("start_date", { ascending: true });

  return {
    cityName,
    citySlug: params.city,
    sales: sales || [],
  };
};
