/**
 * Calendar dates of the slots screens. pik sends and takes local dates in Europe/Paris as
 * "YYYY-MM-DD" and computes the sessions, deadlines and states itself (kancha ADR-0001): Kancha
 * only reads those dates, builds the wizard's, and names them.
 *
 * The math runs on year, month and day: `new Date("2026-09-01")` is midnight UTC, which is the
 * day before in a time zone west of UTC.
 */
export interface CivilDate {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
}

/** ISO weekday: 1 for Monday to 7 for Sunday, as pik's `Schedule.weekday`. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ISO_WEEKDAYS: readonly IsoWeekday[] = [1, 2, 3, 4, 5, 6, 7];

const DAY_MS = 24 * 60 * 60 * 1000;

const utc = ({ year, month, day }: CivilDate) => Date.UTC(year, month - 1, day);

function fromUtc(ms: number): CivilDate {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** The date, or null when the parts do not make a calendar date (31/02, month 13). */
function civilDate(year: number, month: number, day: number): CivilDate | null {
  if (![year, month, day].every(Number.isInteger) || year < 1000 || year > 9999) return null;
  const date = fromUtc(Date.UTC(year, month - 1, day));
  return date.year === year && date.month === month && date.day === day ? date : null;
}

/** "YYYY-MM-DD" only, as pik writes it. */
export function parseIsoDate(text: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  return match ? civilDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const toIsoDate = ({ year, month, day }: CivilDate) => `${year}-${pad(month)}-${pad(day)}`;

/** "DD/MM/YYYY", the form the wizard's date fields show. */
export const toDateInput = ({ year, month, day }: CivilDate) => `${pad(day)}/${pad(month)}/${year}`;

/**
 * A date typed in a wizard field: day first ("1/9/2026", "01-09-2026", "01.09.2026") or year
 * first ("2026-09-01", "2026/09/01", as Basque writes it). Null when it is not a calendar date.
 */
export function parseDateInput(text: string): CivilDate | null {
  const parts = text.trim().split(/\s*[/.-]\s*/);
  if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part))) return null;
  const [a, b, c] = parts;
  if (a.length === 4) return civilDate(Number(a), Number(b), Number(c));
  if (c.length === 4 && a.length <= 2 && b.length <= 2) {
    return civilDate(Number(c), Number(b), Number(a));
  }
  return null;
}

export const compareDates = (a: CivilDate, b: CivilDate) => utc(a) - utc(b);

export const addDays = (date: CivilDate, days: number) => fromUtc(utc(date) + days * DAY_MS);

/** Whole days from `from` to `to`: negative when `to` comes first. */
export const daysBetween = (from: CivilDate, to: CivilDate) =>
  Math.round((utc(to) - utc(from)) / DAY_MS);

export function isoWeekday(date: CivilDate): IsoWeekday {
  const day = new Date(utc(date)).getUTCDay(); // 0 for Sunday
  return (day === 0 ? 7 : day) as IsoWeekday;
}

/** The device's date today. pik counts in Europe/Paris; the wizard only uses it for defaults. */
export function localToday(now: Date = new Date()): CivilDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** The first `count` dates on `weekday`, from `from` on, one week apart. */
export function weekdayDates(from: CivilDate, weekday: IsoWeekday, count: number): CivilDate[] {
  const first = addDays(from, (weekday - isoWeekday(from) + 7) % 7);
  return Array.from({ length: count }, (_, week) => addDays(first, week * 7));
}

/**
 * The season the wizard proposes: from today to the next 30 June, when pelota seasons end. A
 * season created from July on runs to June of the next year, at most 364 days: pik allows 366.
 */
export function defaultSeason(today: CivilDate): { start: CivilDate; end: CivilDate } {
  return {
    start: today,
    end: { year: today.month >= 7 ? today.year + 1 : today.year, month: 6, day: 30 },
  };
}

/**
 * Weekday and month names, from the locale files: Chrome's Intl has no Basque names, and shows
 * English ones for "eu". Weekdays start on Monday, as ISO weekdays do.
 */
export interface DateNames {
  weekdays: readonly string[];
  weekdaysShort: readonly string[];
  months: readonly string[];
  monthsShort: readonly string[];
}

/** The name at `index` (1-based), or the number itself when a locale file lacks it. */
const nameAt = (names: readonly string[], index: number) => names[index - 1] ?? String(index);

export const weekdayName = (weekday: IsoWeekday, names: readonly string[]) =>
  nameAt(names, weekday);

export const monthName = (month: number, names: readonly string[]) => nameAt(names, month);
