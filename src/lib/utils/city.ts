import { CITIES } from "$lib/data/cities";

// Lookup from a normalized slug -> the city's official display name.
const SLUG_TO_NAME = new Map(
  Object.values(CITIES).map((c) => [c.slug, c.name]),
);

// Turn a free-typed city into a comparable slug: lowercase, apostrophes dropped
// ("Lee's" -> "lees"), every run of other non-alphanumerics collapsed to a single
// hyphen, and leading/trailing hyphens trimmed. "overland park", "Overland Park",
// and "  overland  park " all map to "overland-park".
export function citySlug(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Canonical display name for a city. Known KC-metro cities get their official
// name regardless of how they were typed; anything else falls back to a tidied
// title-cased version so casing/whitespace never splits one city into several.
export function canonicalCity(raw: string): string {
  if (!raw || !raw.trim()) return "";
  return SLUG_TO_NAME.get(citySlug(raw)) ?? titleCase(raw);
}
