// Date helpers for filtering sales by when they happen.
//
// All comparisons are done on "YYYY-MM-DD" strings anchored to the Kansas City
// timezone (see KC_TIME_ZONE). The site serves one metro, so "today" and "this
// weekend" mean today/this weekend in KC for everyone — not on the server's
// clock (Vercel runs in UTC) nor on an out-of-town visitor's device. Sale dates
// are stored as plain calendar dates, and "YYYY-MM-DD" strings sort
// chronologically, so every comparison here is a simple string compare.

export type DateFilter = "all" | "today" | "weekend";

// The whole site serves the Kansas City metro, so "today" means today in KC —
// not on the server's clock (Vercel runs in UTC). Anchoring to this zone keeps
// a sale that's still happening today from dropping off the site in the evening.
export const KC_TIME_ZONE = "America/Chicago";

/** Today's date as a "YYYY-MM-DD" string in the Kansas City timezone. */
export function kcTodayStr(now: Date = new Date()): string {
  // en-CA renders as YYYY-MM-DD; timeZone anchors it to KC regardless of where
  // the code runs.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** A sale's date span. end_date is optional; it falls back to start_date. */
export interface DatedSale {
  start_date: string;
  end_date?: string | null;
}

/** Format a Date as a local "YYYY-MM-DD" string (not UTC). */
export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Weekday (0 = Sun ... 6 = Sat) of a "YYYY-MM-DD" calendar date. */
function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Add `n` days to a "YYYY-MM-DD" date, returning a "YYYY-MM-DD" string. */
function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDateStr(dt);
}

/** The sale's effective end date (end_date, or start_date when absent). */
function endOf(sale: DatedSale): string {
  return sale.end_date || sale.start_date;
}

/**
 * Does [sale.start_date, sale.end_date] overlap the inclusive window
 * [from, to]? All four values are "YYYY-MM-DD" strings, which sort
 * lexicographically in true chronological order.
 */
export function overlaps(sale: DatedSale, from: string, to: string): boolean {
  return sale.start_date <= to && endOf(sale) >= from;
}

/**
 * The current-or-upcoming weekend (in KC) as "YYYY-MM-DD" strings.
 *
 * Saturday returns today + tomorrow. Any other day returns the NEXT Saturday
 * and Sunday (on a Sunday, the current weekend is effectively over, so this
 * points at the coming one). The badge logic in SaleCard uses the same helper,
 * so the "This Weekend" chip and badge never disagree.
 */
export function weekendRange(now: Date = new Date()): { sat: string; sun: string } {
  const today = kcTodayStr(now);
  const day = weekdayOf(today); // 0 = Sun ... 6 = Sat
  const daysUntilSat = (6 - day + 7) % 7; // Sat -> 0, Sun -> 6, Mon -> 5 ...
  const sat = addDaysStr(today, daysUntilSat);
  const sun = addDaysStr(sat, 1);
  return { sat, sun };
}

/** Is the sale happening today (in KC)? */
export function isToday(sale: DatedSale, now: Date = new Date()): boolean {
  const today = kcTodayStr(now);
  return overlaps(sale, today, today);
}

/** Is the sale happening on the current-or-upcoming KC weekend (and not today)? */
export function isThisWeekend(sale: DatedSale, now: Date = new Date()): boolean {
  if (isToday(sale, now)) return false;
  const { sat, sun } = weekendRange(now);
  return overlaps(sale, sat, sun);
}

/** Does a sale pass the selected date filter (all dates anchored to KC)? */
export function matchesDateFilter(
  sale: DatedSale,
  filter: DateFilter,
  now: Date = new Date(),
): boolean {
  if (filter === "all") return true;
  if (filter === "today") {
    const today = kcTodayStr(now);
    return overlaps(sale, today, today);
  }
  // "weekend" — include sales happening today if today is part of the weekend.
  const { sat, sun } = weekendRange(now);
  return overlaps(sale, sat, sun);
}
