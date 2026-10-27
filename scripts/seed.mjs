// Dev seed: inserts a spread of verified KC-metro garage sales so the
// Today / This Weekend filters and the route planner have something to work
// with. Safe to re-run — it first deletes any rows it previously created
// (identified by the SEED_EMAIL marker). Remove them anytime with:
//   node scripts/seed.mjs --clear
//
// Usage:  node scripts/seed.mjs          (clear old seed rows, then insert)
//         node scripts/seed.mjs --clear  (just delete the seed rows)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- load .env (no extra dependency) ---------------------------------------
function loadEnv() {
  const txt = readFileSync(join(__dirname, "..", ".env"), "utf8");
  const env = {};
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}
const env = loadEnv();
const url = env.PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}
const supabase = createClient(url, key);

const SEED_EMAIL = "seed@kcgaragesales.test"; // marker so we can find/remove these

// --- date helpers (relative to today) --------------------------------------
const now = new Date();
const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
};
const today = iso(now);
const daysUntilSat = (6 - now.getDay() + 7) % 7;
const sat = addDays(now, daysUntilSat);
const sun = addDays(sat, 1);
const satStr = iso(sat);
const sunStr = iso(sun);
const nextSatStr = iso(addDays(sat, 7));
const nextSunStr = iso(addDays(sat, 8));

// --- the sales (real-ish coords spread across the metro) -------------------
const rows = [
  {
    title: "Big Garage Sale — Tools & Furniture",
    description: "Power tools, a solid oak dining set, and a workbench. Everything must go!",
    address: "9200 Metcalf Ave", city: "Overland Park", state: "KS", zip_code: "66212",
    latitude: 38.9280, longitude: -94.6670,
    start_date: today, end_date: today, start_time: "08:00", end_time: "15:00",
    categories: ["Tools", "Furniture"], is_featured: true,
  },
  {
    title: "Kids & Baby Everything Sale",
    description: "Strollers, clothes 0–5T, toys, and a crib in great shape.",
    address: "4500 Main St", city: "Kansas City", state: "MO", zip_code: "64111",
    latitude: 39.0470, longitude: -94.5880,
    start_date: today, end_date: today, start_time: "07:30", end_time: "13:00",
    categories: ["Kids & Baby", "Clothing"], is_featured: false,
  },
  {
    title: "Multi-Family Block Sale",
    description: "Six families, one driveway. Electronics, kitchenware, books, and more.",
    address: "15300 W 119th St", city: "Olathe", state: "KS", zip_code: "66062",
    latitude: 38.9180, longitude: -94.7760,
    start_date: satStr, end_date: sunStr, start_time: "08:00", end_time: "14:00",
    categories: ["Electronics", "Kitchen & Home", "Books & Media"], is_featured: false,
  },
  {
    title: "Antiques & Collectibles Estate Sale",
    description: "Mid-century furniture, vintage glassware, vinyl records, and costume jewelry.",
    address: "6100 Nieman Rd", city: "Shawnee", state: "KS", zip_code: "66203",
    latitude: 39.0280, longitude: -94.7200,
    start_date: satStr, end_date: satStr, start_time: "09:00", end_time: "16:00",
    categories: ["Antiques & Collectibles", "Jewelry & Accessories"], is_featured: true,
  },
  {
    title: "Moving Sale — Whole House",
    description: "Couches, patio set, snowblower, and garden tools. Priced to sell fast.",
    address: "800 NW Blue Pkwy", city: "Lee's Summit", state: "MO", zip_code: "64063",
    latitude: 38.9170, longitude: -94.3820,
    start_date: sunStr, end_date: sunStr, start_time: "08:00", end_time: "13:00",
    categories: ["Furniture", "Garden & Patio", "Tools"], is_featured: false,
  },
  {
    title: "Electronics & Gaming Garage Sale",
    description: "Consoles, monitors, cables, and a desktop PC. Cash only.",
    address: "1200 SW State Route 7", city: "Blue Springs", state: "MO", zip_code: "64014",
    latitude: 39.0170, longitude: -94.2810,
    start_date: satStr, end_date: sunStr, start_time: "08:00", end_time: "15:00",
    categories: ["Electronics", "Sports & Outdoors"], is_featured: false,
  },
  {
    title: "Garden, Patio & Holiday Decor",
    description: "Planters, a fire pit, Christmas decorations, and outdoor furniture.",
    address: "200 E Kansas St", city: "Liberty", state: "MO", zip_code: "64068",
    latitude: 39.2460, longitude: -94.4190,
    start_date: satStr, end_date: satStr, start_time: "08:30", end_time: "14:00",
    categories: ["Garden & Patio", "Holiday & Seasonal"], is_featured: false,
  },
  {
    title: "Weekend-Long Barn Sale",
    description: "Runs all weekend — tools, antiques, furniture, and a riding mower.",
    address: "9700 Lee Blvd", city: "Leawood", state: "KS", zip_code: "66206",
    latitude: 38.9670, longitude: -94.6170,
    start_date: today, end_date: sunStr, start_time: "09:00", end_time: "17:00",
    categories: ["Tools", "Antiques & Collectibles", "Furniture"], is_featured: false,
  },
  {
    title: "Neighborhood Yard Sale",
    description: "Clothing, shoes, home decor, and small appliances.",
    address: "11100 E 23rd St S", city: "Independence", state: "MO", zip_code: "64052",
    latitude: 39.0910, longitude: -94.4150,
    start_date: nextSatStr, end_date: nextSunStr, start_time: "08:00", end_time: "14:00",
    categories: ["Clothing", "Kitchen & Home"], is_featured: false,
  },
  {
    title: "Arts, Crafts & Books Sale",
    description: "Craft supplies, yarn, hundreds of books, and framed art.",
    address: "7700 Mission Rd", city: "Prairie Village", state: "KS", zip_code: "66208",
    latitude: 38.9900, longitude: -94.6330,
    start_date: nextSatStr, end_date: nextSatStr, start_time: "09:00", end_time: "15:00",
    categories: ["Arts & Crafts", "Books & Media"], is_featured: false,
  },
];

async function clearSeed() {
  const { error } = await supabase.from("garage_sales").delete().eq("email", SEED_EMAIL);
  if (error) throw error;
  console.log("Cleared previous seed rows.");
}

async function insertSeed() {
  const payload = rows.map((r) => ({
    id: randomUUID(),
    email: SEED_EMAIL,
    photos: [],
    is_verified: true,
    verification_token: randomUUID(),
    edit_token: randomUUID(),
    ...r,
  }));
  const { data, error } = await supabase.from("garage_sales").insert(payload).select("id");
  if (error) throw error;
  console.log(`Inserted ${data.length} seed sales.`);
}

try {
  await clearSeed();
  if (!process.argv.includes("--clear")) {
    await insertSeed();
    console.log(`\nToday:        ${today}`);
    console.log(`This weekend: ${satStr} – ${sunStr}`);
    console.log(`Next weekend: ${nextSatStr} – ${nextSunStr}`);
    console.log("\nOpen the home page and try the Today / Weekend filters and Plan Route.");
  }
} catch (e) {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
}
