/**
 * Match dates come from Frontis as "dd/mm/yyyy". These helpers replaced the
 * @js-temporal/polyfill and keep the result of `Temporal.PlainDate.from` with
 * its default "constrain" overflow: a day or month past its range is clamped
 * (31/02/2026 reads as 28/02/2026), and a part that is not a finite number or
 * is below 1 rejects the date.
 */
export interface PlainDate {
  year: number;
  month: number;
  day: number;
}

// Range supported by Temporal.PlainDate.
const MIN_DATE: PlainDate = { year: -271821, month: 4, day: 19 };
const MAX_DATE: PlainDate = { year: 275760, month: 9, day: 13 };

function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function comparePlainDates(a: PlainDate, b: PlainDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/** Returns null wherever `Temporal.PlainDate.from` threw. */
export function parsePlainDate(dateStr: string): PlainDate | null {
  const [d, m, y] = dateStr.split("/");
  if (!d || !m || !y) return null;
  const [day, month, year] = [d, m, y].map((part) => Math.trunc(Number(part)));
  if (![day, month, year].every(Number.isFinite) || day < 1 || month < 1) return null;
  const clampedMonth = Math.min(month, 12);
  const date = {
    year,
    month: clampedMonth,
    day: Math.min(day, daysInMonth(year, clampedMonth)),
  };
  if (comparePlainDates(date, MIN_DATE) < 0 || comparePlainDates(date, MAX_DATE) > 0) return null;
  return date;
}

/**
 * A match played today gets a green pill. Past, future and unreadable dates get
 * none: a past date is not a warning.
 */
export function dateTone(dateStr?: string, now: Date = new Date()): "green" | null {
  if (!dateStr) return null;
  const date = parsePlainDate(dateStr);
  if (!date) return null;
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  return comparePlainDates(date, today) === 0 ? "green" : null;
}

/**
 * Short weekday, day and month in `locale` ("sam. 17 janv." in French). An
 * unreadable date is returned as Frontis sent it, a missing one as null.
 */
export function formatMatchDate(dateStr: string | undefined, locale: string): string | null {
  const raw = dateStr?.trim();
  if (!raw) return null;
  const date = parsePlainDate(raw);
  if (!date) return raw;
  // Local midnight, so the calendar day never shifts with the time zone.
  const local = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" })
    .format(local);
}
