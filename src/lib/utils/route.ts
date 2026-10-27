// Build an optimized, multi-stop driving route through a set of garage sales
// and hand it off to Google Maps.
//
// Google Maps' directions URL (`/maps/dir/?api=1`) takes an origin, a single
// destination, and intermediate waypoints. We order the stops greedily by
// proximity (nearest-neighbor) so the morning route doesn't zig-zag across the
// metro, then render the URL. Everything here is pure and side-effect free so
// it can be unit tested without a browser.

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Google Maps caps a single directions URL at 9 intermediate waypoints, i.e.
// 10 stops once the destination is included (plus the origin). We keep the
// first stops after ordering and drop the rest rather than produce a URL Maps
// will silently truncate in a worse order.
export const MAX_ROUTE_STOPS = 10;

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Order stops into a sensible visiting sequence using nearest-neighbor.
 *
 * Starts from `origin` when given (the visitor's location); otherwise starts
 * from the first stop and keeps it fixed. Does not mutate the input array.
 */
export function orderByProximity<T extends GeoPoint>(
  stops: readonly T[],
  origin?: GeoPoint,
): T[] {
  const remaining = [...stops];
  if (remaining.length <= 1) return remaining;

  const ordered: T[] = [];
  let current: GeoPoint;

  if (origin) {
    current = origin;
  } else {
    // No origin: anchor on the first stop so the result is deterministic.
    current = remaining.shift()!;
    ordered.push(current as T);
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = next;
  }

  return ordered;
}

function coord(p: GeoPoint): string {
  return `${p.latitude},${p.longitude}`;
}

/**
 * Build a Google Maps URL for an optimized driving route through `stops`.
 *
 * - With an `origin`, the route starts at the visitor's location and visits
 *   every stop, ending at the farthest-along one.
 * - Without an `origin`, the first (ordered) stop becomes the start.
 * - A single stop (no origin) opens that location in Maps directly.
 *
 * Returns `null` when there is nothing to route.
 */
export function buildRouteUrl(
  stops: readonly GeoPoint[],
  origin?: GeoPoint,
): string | null {
  // Drop anything without real coordinates (0,0 is the null-island sentinel).
  const valid = stops.filter(
    (s) =>
      Number.isFinite(s.latitude) &&
      Number.isFinite(s.longitude) &&
      !(s.latitude === 0 && s.longitude === 0),
  );
  if (valid.length === 0) return null;

  const ordered = orderByProximity(valid, origin).slice(0, MAX_ROUTE_STOPS);

  // One stop and no starting point: just show that place.
  if (!origin && ordered.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coord(ordered[0]))}`;
  }

  const start = origin ?? ordered.shift()!;
  const destination = ordered.pop()!; // ordered still has >=1 here
  const waypoints = ordered; // may be empty

  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    origin: coord(start),
    destination: coord(destination),
  });
  let url = `https://www.google.com/maps/dir/?${params.toString()}`;
  if (waypoints.length > 0) {
    // waypoints are joined with "|"; encode it as %7C.
    const wp = waypoints.map(coord).join("|");
    url += `&waypoints=${encodeURIComponent(wp)}`;
  }
  return url;
}
