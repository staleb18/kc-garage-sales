import type { RequestHandler } from "./$types";
import { supabaseAdmin } from "$lib/supabase/server";
import { PUBLIC_APP_URL } from "$env/static/public";

const STATIC_PAGES = [
  { path: "", changefreq: "daily" },
  { path: "/about", changefreq: "monthly" },
  { path: "/contact", changefreq: "monthly" },
  { path: "/privacy", changefreq: "monthly" },
  { path: "/terms", changefreq: "monthly" },
  { path: "/post", changefreq: "monthly" },
];

const CITY_SLUGS = [
  "overland-park",
  "olathe",
  "kansas-city",
  "shawnee",
  "lenexa",
  "leawood",
  "prairie-village",
  "gardner",
  "merriam",
  "mission",
  "roeland-park",
  "independence",
  "lees-summit",
  "blue-springs",
  "liberty",
  "gladstone",
  "raytown",
  "grandview",
  "belton",
  "raymore",
  "grain-valley",
  "north-kansas-city",
  "parkville",
  "platte-city",
];

export const GET: RequestHandler = async () => {
  const { data: sales } = await supabaseAdmin
    .from("garage_sales")
    .select("id, updated_at")
    .eq("is_verified", true)
    .order("updated_at", { ascending: false });

  const baseUrl = PUBLIC_APP_URL || "https://kcgaragesales.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(
  (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
  </url>`
).join("\n")}
${CITY_SLUGS.map(
  (slug) => `  <url>
    <loc>${baseUrl}/${slug}</loc>
    <changefreq>daily</changefreq>
  </url>`
).join("\n")}
${(sales || [])
  .map(
    (sale) => `  <url>
    <loc>${baseUrl}/sale/${sale.id}</loc>
    <lastmod>${sale.updated_at?.split("T")[0] ?? ""}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600",
    },
  });
};
