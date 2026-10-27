import { describe, it, expect } from "vitest";
import {
  localDateStr,
  kcTodayStr,
  overlaps,
  weekendRange,
  isToday,
  isThisWeekend,
  matchesDateFilter,
} from "./dates";

// Reference instants, given as absolute UTC moments so the tests don't depend
// on the machine's timezone. Each is noon CDT (UTC-5) in Kansas City, i.e. an
// unambiguous KC calendar day: Wed 2026-05-06, Sat 05-09, Sun 05-10.
const WED = new Date("2026-05-06T17:00:00Z");
const SAT = new Date("2026-05-09T17:00:00Z");
const SUN = new Date("2026-05-10T17:00:00Z");

describe("localDateStr", () => {
  it("formats a date as local YYYY-MM-DD", () => {
    expect(localDateStr(new Date(2026, 4, 6, 12, 0))).toBe("2026-05-06");
  });

  it("uses the LOCAL day, not UTC (late-evening correctness)", () => {
    // 11:30pm local on May 6 is still May 6 regardless of timezone. The old
    // toISOString().slice(0,10) approach would roll this to May 7 west of UTC.
    expect(localDateStr(new Date(2026, 4, 6, 23, 30))).toBe("2026-05-06");
  });
});

describe("kcTodayStr", () => {
  it("uses the KC calendar day, not the server's UTC day", () => {
    // 02:00 UTC on Oct 27 is 21:00 (9pm) CDT on Oct 26 in Kansas City.
    // The old toISOString()-based cutoff would have said Oct 27 and dropped
    // sales still happening on Oct 26.
    expect(kcTodayStr(new Date("2026-10-27T02:00:00Z"))).toBe("2026-10-26");
  });
  it("returns the current KC day during the daytime", () => {
    // 15:00 UTC = 10:00am CDT on Oct 27.
    expect(kcTodayStr(new Date("2026-10-27T15:00:00Z"))).toBe("2026-10-27");
  });
});

describe("overlaps", () => {
  it("matches a single-day sale on that day", () => {
    expect(overlaps({ start_date: "2026-05-09", end_date: "2026-05-09" }, "2026-05-09", "2026-05-09")).toBe(true);
  });
  it("matches a multi-day sale that spans into the window", () => {
    expect(overlaps({ start_date: "2026-05-08", end_date: "2026-05-10" }, "2026-05-09", "2026-05-09")).toBe(true);
  });
  it("rejects a sale entirely before the window", () => {
    expect(overlaps({ start_date: "2026-05-01", end_date: "2026-05-02" }, "2026-05-09", "2026-05-10")).toBe(false);
  });
  it("rejects a sale entirely after the window", () => {
    expect(overlaps({ start_date: "2026-05-20", end_date: "2026-05-21" }, "2026-05-09", "2026-05-10")).toBe(false);
  });
  it("falls back to start_date when end_date is missing", () => {
    expect(overlaps({ start_date: "2026-05-09" }, "2026-05-09", "2026-05-09")).toBe(true);
    expect(overlaps({ start_date: "2026-05-09", end_date: null }, "2026-05-10", "2026-05-10")).toBe(false);
  });
});

describe("weekendRange", () => {
  it("returns the coming Sat/Sun on a weekday", () => {
    expect(weekendRange(WED)).toEqual({ sat: "2026-05-09", sun: "2026-05-10" });
  });
  it("returns today + tomorrow on Saturday", () => {
    expect(weekendRange(SAT)).toEqual({ sat: "2026-05-09", sun: "2026-05-10" });
  });
  it("points at NEXT weekend on Sunday", () => {
    expect(weekendRange(SUN)).toEqual({ sat: "2026-05-16", sun: "2026-05-17" });
  });
});

describe("isToday / isThisWeekend", () => {
  it("flags a sale happening today", () => {
    expect(isToday({ start_date: "2026-05-06", end_date: "2026-05-06" }, WED)).toBe(true);
    expect(isThisWeekend({ start_date: "2026-05-06", end_date: "2026-05-06" }, WED)).toBe(false);
  });
  it("flags a weekend sale from a weekday", () => {
    expect(isToday({ start_date: "2026-05-09", end_date: "2026-05-09" }, WED)).toBe(false);
    expect(isThisWeekend({ start_date: "2026-05-09", end_date: "2026-05-09" }, WED)).toBe(true);
  });
  it("does not double-count: a sale that is today is not also 'this weekend'", () => {
    // On Saturday, a Saturday sale is 'today', so isThisWeekend must be false.
    expect(isToday({ start_date: "2026-05-09", end_date: "2026-05-09" }, SAT)).toBe(true);
    expect(isThisWeekend({ start_date: "2026-05-09", end_date: "2026-05-09" }, SAT)).toBe(false);
  });
});

describe("matchesDateFilter", () => {
  const sat = { start_date: "2026-05-09", end_date: "2026-05-09" };
  const sun = { start_date: "2026-05-10", end_date: "2026-05-10" };
  const wed = { start_date: "2026-05-06", end_date: "2026-05-06" };
  const fri = { start_date: "2026-05-08", end_date: "2026-05-08" };
  const mon = { start_date: "2026-05-11", end_date: "2026-05-11" };

  it("'all' always passes", () => {
    expect(matchesDateFilter(sat, "all", WED)).toBe(true);
    expect(matchesDateFilter(mon, "all", WED)).toBe(true);
  });

  it("'today' only passes sales happening on the current local day", () => {
    expect(matchesDateFilter(wed, "today", WED)).toBe(true);
    expect(matchesDateFilter(sat, "today", WED)).toBe(false);
  });

  it("'weekend' passes Sat and Sun but not Fri or Mon", () => {
    expect(matchesDateFilter(sat, "weekend", WED)).toBe(true);
    expect(matchesDateFilter(sun, "weekend", WED)).toBe(true);
    expect(matchesDateFilter(fri, "weekend", WED)).toBe(false);
    expect(matchesDateFilter(mon, "weekend", WED)).toBe(false);
  });

  it("'weekend' includes a Saturday sale when today is Saturday", () => {
    expect(matchesDateFilter(sat, "weekend", SAT)).toBe(true);
  });

  it("anchors 'today' to KC, not UTC, in the evening", () => {
    // 02:00 UTC on May 7 is 9pm CDT on May 6 in KC. A May-6 sale is still
    // "today" to a KC visitor even though the UTC date has rolled to May 7.
    const kcWedEvening = new Date("2026-05-07T02:00:00Z");
    expect(matchesDateFilter(wed, "today", kcWedEvening)).toBe(true);
    expect(matchesDateFilter(sat, "today", kcWedEvening)).toBe(false);
  });
});
