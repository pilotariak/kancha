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

/** Past matches are red, today's green, future and unreadable dates dark. */
export function dateTone(dateStr?: string, now: Date = new Date()): "red" | "green" | "dark" {
  if (!dateStr) return "dark";
  const date = parsePlainDate(dateStr);
  if (!date) return "dark";
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const cmp = comparePlainDates(date, today);
  if (cmp < 0) return "red";
  if (cmp > 0) return "dark";
  return "green";
}
