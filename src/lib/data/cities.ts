// Per-city SEO content. Each city has genuinely unique copy, county/state facts,
// and a curated list of nearby cities so no two pages share the same body text or
// the same internal links. This is what lets each city page rank on its own.

export type CityInfo = {
  slug: string;
  name: string;
  state: "KS" | "MO";
  county: string;
  intro: string;
  nearby: string[]; // slugs of geographically adjacent cities
};

export const CITIES: Record<string, CityInfo> = {
  "overland-park": {
    slug: "overland-park",
    name: "Overland Park",
    state: "KS",
    county: "Johnson County",
    intro:
      "As the largest city in Johnson County and the second-largest in Kansas, Overland Park sees some of the busiest garage sale weekends in the metro. Spring and early-summer sales are especially active across neighborhoods from Deer Creek to Nottingham, and community-wide sales are common in the established areas north of 135th Street.",
    nearby: ["leawood", "lenexa", "olathe", "prairie-village", "shawnee"],
  },
  "olathe": {
    slug: "olathe",
    name: "Olathe",
    state: "KS",
    county: "Johnson County",
    intro:
      "Olathe, the Johnson County seat, is one of the fastest-growing cities in the metro, which means a steady supply of moving sales and neighborhood garage sales year-round. Family-friendly subdivisions on the west and south sides frequently organize multi-family sales in April, May, and September.",
    nearby: ["gardner", "lenexa", "overland-park", "shawnee"],
  },
  "kansas-city": {
    slug: "kansas-city",
    name: "Kansas City",
    state: "MO",
    county: "Jackson County",
    intro:
      "Kansas City, Missouri anchors the whole metro, and its garage sale scene is as varied as its neighborhoods — from Brookside and Waldo estate sales to Northland moving sales. Historic districts often hold well-publicized neighborhood-wide sales in late spring that draw buyers from across the region.",
    nearby: ["independence", "raytown", "gladstone", "north-kansas-city", "grandview"],
  },
  "shawnee": {
    slug: "shawnee",
    name: "Shawnee",
    state: "KS",
    county: "Johnson County",
    intro:
      "Shawnee blends older established neighborhoods with newer developments, so you'll find everything from vintage-heavy estate sales near downtown Shawnee to family garage sales in the western subdivisions. The city's annual community events often coincide with a surge in weekend sales.",
    nearby: ["lenexa", "merriam", "overland-park", "olathe"],
  },
  "lenexa": {
    slug: "lenexa",
    name: "Lenexa",
    state: "KS",
    county: "Johnson County",
    intro:
      "Lenexa's mix of Old Town charm and fast-growing developments near City Center makes for a strong garage sale calendar, especially in spring. Many Lenexa neighborhoods coordinate community sales, so it's worth checking listings across several weekends in May and June.",
    nearby: ["shawnee", "olathe", "overland-park", "merriam"],
  },
  "leawood": {
    slug: "leawood",
    name: "Leawood",
    state: "KS",
    county: "Johnson County",
    intro:
      "Leawood's upscale neighborhoods make it a favorite stop for buyers hunting quality furniture, décor, and estate finds. Sales here tend to feature well-kept, higher-end items, and the areas around Ironwoods and south of 135th Street are reliable spots on garage sale weekends.",
    nearby: ["overland-park", "prairie-village", "olathe"],
  },
  "prairie-village": {
    slug: "prairie-village",
    name: "Prairie Village",
    state: "KS",
    county: "Johnson County",
    intro:
      "Prairie Village is one of the metro's classic first-ring suburbs, and its tree-lined streets of mid-century homes are prime territory for vintage and estate sales. The tight-knit neighborhoods frequently hold well-attended community sales in spring and fall.",
    nearby: ["leawood", "overland-park", "mission", "merriam"],
  },
  "gardner": {
    slug: "gardner",
    name: "Gardner",
    state: "KS",
    county: "Johnson County",
    intro:
      "Gardner sits on the growing southwest edge of Johnson County, and its affordable, newer neighborhoods generate plenty of moving and garage sales as families come and go. Community-wide sales are a Gardner tradition, especially as the weather warms up in late spring.",
    nearby: ["olathe", "overland-park"],
  },
  "merriam": {
    slug: "merriam",
    name: "Merriam",
    state: "KS",
    county: "Johnson County",
    intro:
      "Small and centrally located, Merriam packs a lot of garage sale activity into its established neighborhoods just off I-35. Its older homes make it a good bet for vintage tools, collectibles, and estate sales within easy reach of the whole metro.",
    nearby: ["shawnee", "mission", "prairie-village", "overland-park"],
  },
  "mission": {
    slug: "mission",
    name: "Mission",
    state: "KS",
    county: "Johnson County",
    intro:
      "Mission is one of the most walkable, densely built suburbs in Johnson County, and its compact neighborhoods make for efficient garage sale routes. You'll often find apartment and downsizing sales here alongside classic single-family garage sales.",
    nearby: ["merriam", "prairie-village", "roeland-park", "shawnee"],
  },
  "roeland-park": {
    slug: "roeland-park",
    name: "Roeland Park",
    state: "KS",
    county: "Johnson County",
    intro:
      "Roeland Park's location right on the Kansas–Missouri line makes it a convenient garage sale stop for buyers coming from either state. Its post-war homes and close-knit blocks lend themselves to neighborhood sales, particularly in the spring months.",
    nearby: ["mission", "prairie-village", "merriam"],
  },
  "independence": {
    slug: "independence",
    name: "Independence",
    state: "MO",
    county: "Jackson County",
    intro:
      "Independence, one of Missouri's largest cities, has a deep supply of garage and estate sales thanks to its historic neighborhoods and long-settled communities. Areas around the historic square and the older residential districts are especially rich for antiques and collectibles.",
    nearby: ["kansas-city", "raytown", "blue-springs", "grain-valley"],
  },
  "lees-summit": {
    slug: "lees-summit",
    name: "Lee's Summit",
    state: "MO",
    county: "Jackson County",
    intro:
      "Lee's Summit is one of the metro's most popular suburbs, and its large, active subdivisions make for some of the biggest community garage sale weekends on the Missouri side. Spring and fall bring organized neighborhood-wide sales that are well worth planning a route around.",
    nearby: ["blue-springs", "raytown", "grandview", "grain-valley"],
  },
  "blue-springs": {
    slug: "blue-springs",
    name: "Blue Springs",
    state: "MO",
    county: "Jackson County",
    intro:
      "Blue Springs offers a steady stream of family garage sales across its many residential neighborhoods east of Kansas City. The city's newer developments generate frequent moving sales, while established areas near downtown are good for household goods and furniture.",
    nearby: ["independence", "lees-summit", "grain-valley"],
  },
  "liberty": {
    slug: "liberty",
    name: "Liberty",
    state: "MO",
    county: "Clay County",
    intro:
      "Liberty, a historic Clay County town in the Northland, combines charming older neighborhoods around its courthouse square with growing suburban developments. That mix produces both antique-rich estate sales and modern family garage sales throughout the warmer months.",
    nearby: ["gladstone", "north-kansas-city", "kansas-city"],
  },
  "gladstone": {
    slug: "gladstone",
    name: "Gladstone",
    state: "MO",
    county: "Clay County",
    intro:
      "Gladstone is a well-established Northland community where mid-century neighborhoods make for reliable garage sale hunting. Its central Northland location means easy access for buyers coming from Liberty, North Kansas City, and across the river.",
    nearby: ["liberty", "north-kansas-city", "kansas-city"],
  },
  "raytown": {
    slug: "raytown",
    name: "Raytown",
    state: "MO",
    county: "Jackson County",
    intro:
      "Raytown is a close-in Jackson County community with a strong small-town feel and lots of long-time residents, which makes it a great source of estate sales and vintage finds. Its neighborhoods are compact and easy to work through on a Saturday morning.",
    nearby: ["kansas-city", "independence", "grandview", "lees-summit"],
  },
  "grandview": {
    slug: "grandview",
    name: "Grandview",
    state: "MO",
    county: "Jackson County",
    intro:
      "Grandview, on the south side of the metro, offers affordable neighborhoods that turn over regularly, producing plenty of moving and garage sales. Its location near the Kansas–Missouri line and the south suburbs makes it a convenient stop on a broader sale route.",
    nearby: ["kansas-city", "belton", "raytown", "raymore"],
  },
  "belton": {
    slug: "belton",
    name: "Belton",
    state: "MO",
    county: "Cass County",
    intro:
      "Belton anchors the growing southern edge of the metro in Cass County, where newer subdivisions and family neighborhoods generate a steady flow of garage and moving sales. Community sales here are popular in late spring and early fall.",
    nearby: ["raymore", "grandview"],
  },
  "raymore": {
    slug: "raymore",
    name: "Raymore",
    state: "MO",
    county: "Cass County",
    intro:
      "Raymore is one of the fastest-growing communities in Cass County, and its expanding subdivisions mean frequent moving sales and neighborhood garage sales. The newer housing stock makes it a good spot for gently-used furniture, kids' items, and household goods.",
    nearby: ["belton", "grandview"],
  },
  "grain-valley": {
    slug: "grain-valley",
    name: "Grain Valley",
    state: "MO",
    county: "Jackson County",
    intro:
      "Grain Valley is a growing small town on the eastern edge of the metro, where family-oriented neighborhoods hold community garage sales that draw buyers from Blue Springs and Independence. Its close-knit developments often coordinate multi-family sale weekends.",
    nearby: ["blue-springs", "independence", "lees-summit"],
  },
  "north-kansas-city": {
    slug: "north-kansas-city",
    name: "North Kansas City",
    state: "MO",
    county: "Clay County",
    intro:
      "North Kansas City is a compact, historic Northland community right across the river from downtown. Its older homes and central location make it convenient for buyers, with garage and estate sales concentrated in its walkable residential blocks.",
    nearby: ["gladstone", "liberty", "kansas-city", "parkville"],
  },
  "parkville": {
    slug: "parkville",
    name: "Parkville",
    state: "MO",
    county: "Platte County",
    intro:
      "Parkville, a scenic river town in Platte County, pairs a historic downtown with newer upscale developments in the surrounding hills. That range brings both quality estate sales and family garage sales, especially through the spring and summer.",
    nearby: ["north-kansas-city", "platte-city", "gladstone"],
  },
  "platte-city": {
    slug: "platte-city",
    name: "Platte City",
    state: "MO",
    county: "Platte County",
    intro:
      "Platte City sits at the northern edge of the metro in Platte County, where a small-town atmosphere and growing subdivisions produce a mix of garage sales and moving sales. Its community sale weekends are a good draw for buyers exploring the far Northland.",
    nearby: ["parkville", "north-kansas-city"],
  },
};

export function getCity(slug: string): CityInfo | undefined {
  return CITIES[slug];
}
