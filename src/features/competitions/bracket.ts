import type { TFunction } from "i18next";

import type { PhaseType } from "@/components/BracketView";
import { CARD_WIDTH, GUTTER } from "@/features/layout/breakpoints";
import type { Result } from "@/types/competition";

import { comparePlainDates, parsePlainDate, type PlainDate } from "./matchDate";
import { ROUND_ORDER } from "./matchPhase";

/** Rounds played as groups, not knockout: pools, and phases the parser does not know. */
export const GROUP_ROUNDS: ReadonlySet<PhaseType> = new Set(["P", "other"]);

/**
 * The knockout rounds (barrages, 16ths to the final) and the group rounds, each in the order they
 * are played. The bracket shows the knockout rounds first: they are what a reader looks for.
 */
export function splitRounds<T extends { type: PhaseType }>(
  rounds: readonly T[],
): { knockout: T[]; groups: T[] } {
  const ordered = [...rounds].sort((a, b) => ROUND_ORDER[a.type] - ROUND_ORDER[b.type]);
  return {
    knockout: ordered.filter((round) => !GROUP_ROUNDS.has(round.type)),
    groups: ordered.filter((round) => GROUP_ROUNDS.has(round.type)),
  };
}

// ─── Knockout row (phone) ─────────────────────────────────────────────────────

/** The chevron between two round columns. */
export const CONNECTOR_WIDTH = 32;
/** How much of the next round column the first screen shows, so the row reads as more. */
export const KNOCKOUT_PEEK = 40;
/** The narrowest a round column gets while names stay readable. */
export const MIN_COLUMN_WIDTH = 220;

/**
 * The width of a knockout column in a row `frameWidth` wide, that bleeds over the gutters: one
 * card at most, and narrow enough for the next column to show beside the first. A lone round
 * fills the width between the gutters. Before the frame is measured, one card.
 */
export function knockoutColumnWidth(frameWidth: number, rounds: number): number {
  if (frameWidth <= 0) return CARD_WIDTH;
  const room = rounds > 1
    ? frameWidth - GUTTER - CONNECTOR_WIDTH - KNOCKOUT_PEEK
    : frameWidth - 2 * GUTTER;
  return Math.max(MIN_COLUMN_WIDTH, Math.min(CARD_WIDTH, room));
}

/** The width of the knockout row's content: its columns, chevrons and both gutters. */
export function knockoutRowWidth(columnWidth: number, rounds: number): number {
  return 2 * GUTTER + rounds * columnWidth + Math.max(0, rounds - 1) * CONNECTOR_WIDTH;
}

/**
 * The round the page indicator marks for a sideways scroll `offset`: the column nearest the left
 * edge, one column and chevron (`pageWidth`) per page. Columns narrower than the screen never all
 * reach the left edge, so the end of the scroll (`maxOffset`) marks the last round.
 */
export function activePage(
  offset: number,
  pageWidth: number,
  rounds: number,
  maxOffset: number,
): number {
  if (rounds <= 1 || pageWidth <= 0) return 0;
  if (offset >= maxOffset - 1) return rounds - 1;
  return Math.min(rounds - 1, Math.max(0, Math.round(offset / pageWidth)));
}

// ─── Pool summary ─────────────────────────────────────────────────────────────

export interface PoolSummary {
  matches: number;
  /** The days with at least one match; matches without a readable date count for none. */
  days: number;
  /** The first and the last of those days, null when no match has a readable date. */
  first: PlainDate | null;
  last: PlainDate | null;
}

/** What the collapsed pools say: how many matches, on how many days, from when to when. */
export function summarizePool(results: readonly Pick<Result, "dateMatch">[]): PoolSummary {
  const days = new Map<string, PlainDate>();
  for (const result of results) {
    const date = result.dateMatch ? parsePlainDate(result.dateMatch) : null;
    if (date) days.set(`${date.year}-${date.month}-${date.day}`, date);
  }
  const sorted = [...days.values()].sort(comparePlainDates);
  return {
    matches: results.length,
    days: sorted.length,
    first: sorted[0] ?? null,
    last: sorted[sorted.length - 1] ?? null,
  };
}

/** Day and month in full, in `locale` ("6 septembre" in French). */
export function formatDayMonth(date: PlainDate, locale: string): string {
  // Local midnight, so the calendar day never shifts with the time zone.
  const local = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(local);
}

/**
 * The summary line of collapsed pools: "15 parties en 5 journées, du 6 septembre au 4 octobre",
 * "3 parties le 6 septembre" on a single day, the match count alone with no date.
 */
export function poolSummaryLabel(summary: PoolSummary, t: TFunction, locale: string): string {
  const matches = t("details.matches_count", { count: summary.matches });
  if (!summary.first || !summary.last) return matches;
  if (summary.days === 1) {
    return t("bracket.pool_day", { matches, date: formatDayMonth(summary.first, locale) });
  }
  return t("bracket.pool_range", {
    matches,
    days: t("bracket.days_count", { count: summary.days }),
    first: formatDayMonth(summary.first, locale),
    last: formatDayMonth(summary.last, locale),
  });
}
