import type { Result } from "@/types/competition";

import { comparePlainDates, parsePlainDate, type PlainDate } from "./matchDate";
import { parseMatchScore } from "./matchScore";

/** What grouping reads from a match: its day, and whether it has a score. */
export type DatedMatch = Pick<Result, "dateMatch" | "scores">;

export interface MatchDay<T extends DatedMatch = Result> {
  /** The day as "2026-09-13", or "later" for the matches without a readable date. */
  key: string;
  /** Null for the last group of a round, the matches whose date is to come. */
  date: PlainDate | null;
  /** The day is today, in local time. */
  today: boolean;
  /**
   * Open when the screen shows: the most recent day with a score, today, every later day and
   * the matches whose date is to come. Days before the most recent one with a score collapse.
   * With no score yet, every day is open.
   */
  open: boolean;
  /** In the order they came in. */
  results: T[];
}

const LATER = "later";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Splits the matches of each round into match days, in date order. Matches without a date, or
 * with one that does not read as a date, form a last group. Takes one list per round and
 * returns one list of days per round, in the same order: which days start open depends on the
 * most recent day with a score across every round.
 */
export function groupByDay<T extends DatedMatch>(
  rounds: readonly (readonly T[])[],
  now: Date = new Date(),
): MatchDay<T>[][] {
  const grouped = rounds.map((results) => {
    const days = new Map<string, { date: PlainDate | null; results: T[] }>();
    for (const result of results) {
      const date = result.dateMatch ? parsePlainDate(result.dateMatch) : null;
      const key = date ? `${date.year}-${pad(date.month)}-${pad(date.day)}` : LATER;
      const day = days.get(key) ?? { date, results: [] };
      day.results.push(result);
      days.set(key, day);
    }
    return [...days].sort(([, a], [, b]) =>
      a.date && b.date ? comparePlainDates(a.date, b.date) : a.date ? -1 : b.date ? 1 : 0
    );
  });

  let lastPlayed: PlainDate | null = null;
  for (const [, { date, results }] of grouped.flat()) {
    if (!date || !results.some((r) => parseMatchScore(r.scores) != null)) continue;
    if (!lastPlayed || comparePlainDates(date, lastPlayed) > 0) lastPlayed = date;
  }

  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  return grouped.map((days) =>
    days.map(([key, { date, results }]) => {
      const isToday = date != null && comparePlainDates(date, today) === 0;
      return {
        key,
        date,
        today: isToday,
        open: !date || !lastPlayed || isToday || comparePlainDates(date, lastPlayed) >= 0,
        results,
      };
    })
  );
}

/**
 * The day header: weekday, day and month in full, in `locale`, with a capital as it starts the
 * line ("Dimanche 13 septembre" in French).
 */
export function formatMatchDay(date: PlainDate, locale: string): string {
  // Local midnight, so the calendar day never shifts with the time zone.
  const local = new Date(date.year, date.month - 1, date.day);
  const text = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" })
    .format(local);
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
