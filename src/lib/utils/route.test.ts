import { describe, it, expect } from "vitest";
import {
  haversineKm,
  orderByProximity,
  buildRouteUrl,
  MAX_ROUTE_STOPS,
  type GeoPoint,
} from "./route";

const p = (latitude: number, longitude: number): GeoPoint => ({ latitude, longitude });

describe("haversineKm", () => {
  it("is zero for the same point", () => {
    expect(haversineKm(p(39.1, -94.5), p(39.1, -94.5))).toBe(0);
  });
  it("is ~111 km for one degree of latitude", () => {
    expect(haversineKm(p(0, 0), p(1, 0))).toBeCloseTo(111.19, 0);
  });
  it("is symmetric", () => {
    const a = p(39.0997, -94.5786);
    const b = p(38.9822, -94.6708);
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10);
  });
});

describe("orderByProximity", () => {
  it("returns the input for 0 or 1 stops", () => {
    expect(orderByProximity([])).toEqual([]);
    const one = [p(1, 1)];
    expect(orderByProximity(one)).toEqual(one);
  });

  it("visits nearest-first, anchored on the first stop when no origin", () => {
    // Points on a line at lat 0: a=0, b=3, c=1, d=2.
    const a = p(0, 0), b = p(0, 3), c = p(0, 1), d = p(0, 2);
    const ordered = orderByProximity([a, b, c, d]);
    expect(ordered).toEqual([a, c, d, b]);
  });

  it("starts from the stop nearest the origin when one is given", () => {
    const a = p(0, 0), b = p(0, 3), c = p(0, 1), d = p(0, 2);
    const ordered = orderByProximity([a, b, c, d], p(0, 3.5));
    expect(ordered).toEqual([b, d, c, a]);
  });

  it("does not mutate the input array", () => {
    const input = [p(0, 0), p(0, 3), p(0, 1)];
    const copy = [...input];
    orderByProximity(input, p(0, 5));
    expect(input).toEqual(copy);
  });
});

describe("buildRouteUrl", () => {
  it("returns null when there are no stops", () => {
    expect(buildRouteUrl([])).toBeNull();
  });

  it("returns null when every stop has null-island (0,0) coords", () => {
    expect(buildRouteUrl([p(0, 0), p(0, 0)])).toBeNull();
  });

  it("drops invalid coords (NaN / 0,0) before routing", () => {
    const url = buildRouteUrl([p(NaN, 1), p(0, 0), p(39.1, -94.5)]);
    expect(url).not.toBeNull();
    // Only the one valid stop remains -> a plain search link.
    expect(url).toContain("/maps/search/");
    expect(url).toContain("39.1%2C-94.5");
  });

  it("links a single stop (no origin) to a Maps search", () => {
    const url = buildRouteUrl([p(39.1, -94.5)])!;
    expect(url).toContain("https://www.google.com/maps/search/?api=1");
    expect(new URL(url).searchParams.get("query")).toBe("39.1,-94.5");
  });

  it("routes a single stop WITH an origin as directions", () => {
    const url = buildRouteUrl([p(39.2, -94.6)], p(39.0, -94.5))!;
    const u = new URL(url);
    expect(u.pathname).toContain("/maps/dir/");
    expect(u.searchParams.get("origin")).toBe("39,-94.5");
    expect(u.searchParams.get("destination")).toBe("39.2,-94.6");
    expect(u.searchParams.get("waypoints")).toBeNull();
    expect(u.searchParams.get("travelmode")).toBe("driving");
  });

  it("uses first stop as origin and last as destination (no origin, 2 stops)", () => {
    const url = buildRouteUrl([p(0, 0.1), p(0, 0.2)])!;
    const u = new URL(url);
    expect(u.searchParams.get("origin")).toBe("0,0.1");
    expect(u.searchParams.get("destination")).toBe("0,0.2");
    expect(u.searchParams.get("waypoints")).toBeNull();
  });

  it("puts the middle stops into waypoints", () => {
    // Longitudes 0.1,0.2,0.3,0.4 (avoid the (0,0) sentinel). Input order
    // a,b,c,d -> ordered a,c,d,b ; origin a, dest b, waypoints c,d.
    const url = buildRouteUrl([p(0, 0.1), p(0, 0.4), p(0, 0.2), p(0, 0.3)])!;
    const u = new URL(url);
    expect(u.searchParams.get("origin")).toBe("0,0.1");
    expect(u.searchParams.get("destination")).toBe("0,0.4");
    expect(u.searchParams.get("waypoints")).toBe("0,0.2|0,0.3");
  });

  it("passes the visitor's origin through and makes every stop a waypoint/destination", () => {
    const url = buildRouteUrl([p(0, 0.1), p(0, 0.2), p(0, 0.3)], p(0, 0))!;
    const u = new URL(url);
    expect(u.searchParams.get("origin")).toBe("0,0");
    // 3 stops: 2 become waypoints, 1 becomes the destination.
    const wp = u.searchParams.get("waypoints")!.split("|");
    expect(wp).toHaveLength(2);
  });

  it(`caps the route at ${MAX_ROUTE_STOPS} stops`, () => {
    const many: GeoPoint[] = Array.from({ length: 15 }, (_, i) => p(0, (i + 1) / 100));
    const url = buildRouteUrl(many)!;
    const u = new URL(url);
    // No origin: 10 stops used -> 1 origin + 8 waypoints + 1 destination.
    const wp = u.searchParams.get("waypoints")!.split("|");
    expect(wp).toHaveLength(MAX_ROUTE_STOPS - 2);
  });
});
