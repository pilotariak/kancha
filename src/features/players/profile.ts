import { matchesByDate } from "@/features/clubs/club";
import { parsePhase } from "@/features/competitions/matchPhase";
import { formatSeason, parseSeason } from "@/features/competitions/seasons";
import { isForfeit } from "@/features/rankings/ranking";
import type { Category, Club, Competition, PlayerRanking, Specialty } from "@/types/competition";

import {
  type MatchRecord,
  type MatchTotals,
  matchTotals,
  type OpponentRecord,
  opponentRecords,
  type PartnerRecord,
  type PlayerMatch,
  type PlayerSet,
  specialtyRecords,
} from "./matches";
import type { Partner, SpecialtyBest } from "./stats";

// The player page reads two sources: the rankings, which load first (header, Honours), and the
// matches, undefined until they load. Neither function below cares where the matches come from.

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const PLAYER_TABS = ["overview", "matches", "honours"] as const;
export type PlayerTab = (typeof PLAYER_TABS)[number];

/** The tab of the route's `tab` param: the overview when it is missing or unknown. */
export function parsePlayerTab(param: string | string[] | undefined): PlayerTab {
  const value = Array.isArray(param) ? param[0] : param;
  return PLAYER_TABS.find((tab) => tab === value) ?? "overview";
}

// ─── Header ───────────────────────────────────────────────────────────────────

/**
 * Two initials, of the first and the last word, the suffixes Frontis adds left out: "PUCHEUX
 * Theo" and "PUCHEUX Theo (E)" give "PT". Null without a name.
 */
export function playerInitials(name: string | null): string | null {
  const words = (name ?? "").replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const last = words.length > 1 ? words[words.length - 1] : "";
  return `${words[0].charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** The club of the most recent ranking: Frontis sends the most recent season first. */
export function currentClub(rankings: readonly Pick<PlayerRanking, "club">[]): Club | null {
  return rankings[0]?.club ?? null;
}

/** The win rate as a whole percentage, 29 of 36 as 81; null before a match is played. */
export function winPercent(totals: Pick<MatchTotals, "winRate">): number | null {
  return totals.winRate === null ? null : Math.round(totals.winRate * 100);
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

/** The season of a competition, "2025-2026", or its name when the name holds none. */
export function seasonLabel(competition: Pick<Competition, "name">): string {
  const parsed = parseSeason(competition.name);
  return parsed ? formatSeason(parsed.season) : competition.name;
}

type EntryKeyed = Pick<PlayerRanking, "competition" | "specialty"> & { category?: Category };

/** A competition, specialty and category: one ranking, and the matches it was played with. */
function entryKey({ competition, specialty, category }: EntryKeyed): string {
  return [competition.id, specialty.id, category?.id ?? ""].join("/");
}

export interface SeasonEntry {
  key: string;
  specialty: Specialty;
  category: Category;
  club: Club;
  rank: number;
  /** Raw league-site text, shown as is. */
  phase: string;
  final: boolean;
  isTitle: boolean;
  isForfeit: boolean;
  /** Its matches with a score and their sets; null until the matches load. */
  record: MatchTotals | null;
}

export interface LatestSeason {
  competition: Competition;
  entries: SeasonEntry[];
}

/**
 * The rankings of the most recent season, each with the record of its matches: the same
 * competition, specialty and category. Null without a ranking.
 */
export function latestSeason(
  rankings: readonly PlayerRanking[],
  matches: readonly PlayerMatch[] | undefined,
): LatestSeason | null {
  const competition = rankings[0]?.competition;
  if (!competition) return null;
  return {
    competition,
    entries: rankings
      .filter((r) => r.competition.id === competition.id)
      .map((r) => {
        const key = entryKey(r);
        return {
          key,
          specialty: r.specialty,
          category: r.category,
          club: r.club,
          rank: r.rank,
          phase: r.phase,
          final: r.final,
          isTitle: r.final && r.rank === 1,
          isForfeit: isForfeit(r.phase),
          record: matches
            ? matchTotals(matches.filter((m) => entryKey(m.result) === key))
            : null,
        };
      }),
  };
}

// ─── Specialties ──────────────────────────────────────────────────────────────

export interface SpecialtyRow {
  specialty: Specialty;
  /** The matches with a score; null until the matches load. */
  record: MatchRecord | null;
  /** The best final ranking; null when every ranking of the specialty is provisional. */
  best: Omit<SpecialtyBest, "specialty"> | null;
}

/**
 * One row per specialty the player was ranked or played in. Once the matches load, the most
 * played first, then the specialties ranked without a match; before, in the rankings' order.
 */
export function specialtyTable(
  rankings: readonly PlayerRanking[],
  best: readonly SpecialtyBest[],
  matches: readonly PlayerMatch[] | undefined,
): SpecialtyRow[] {
  const bestOf = (id: string) => {
    const found = best.find((b) => b.specialty.id === id);
    return found ? { bestRank: found.bestRank, phase: found.phase, titles: found.titles } : null;
  };
  const rows = new Map<string, SpecialtyRow>();
  for (const record of matches ? specialtyRecords(matches) : []) {
    const { specialty, played, won, lost } = record;
    rows.set(specialty.id, {
      specialty,
      record: { played, won, lost },
      best: bestOf(specialty.id),
    });
  }
  for (const { specialty } of rankings) {
    if (!rows.has(specialty.id)) {
      rows.set(specialty.id, {
        specialty,
        record: matches ? { played: 0, won: 0, lost: 0 } : null,
        best: bestOf(specialty.id),
      });
    }
  }
  return [...rows.values()];
}

/** What a specialty's best result reads: "Champion", "2 titres", or the league's phase text. */
export type BestResult =
  | { kind: "champion" }
  | { kind: "titles"; count: number }
  | { kind: "phase"; phase: string };

export function bestResult(best: SpecialtyRow["best"]): BestResult | null {
  if (!best) return null;
  if (best.titles > 1) return { kind: "titles", count: best.titles };
  if (best.titles === 1) return { kind: "champion" };
  return { kind: "phase", phase: best.phase };
}

// ─── Partners and opponents ───────────────────────────────────────────────────

/**
 * The ranking teammates the player has no match with: a team lists a third or fourth player who
 * may never have played beside them. In the order of `teammates`.
 */
export function teammatesWithoutMatch(
  teammates: readonly Partner[],
  partners: readonly Pick<PartnerRecord, "licence">[],
): Partner[] {
  const played = new Set(partners.map((p) => p.licence));
  return teammates.filter((t) => !played.has(t.licence));
}

/** The opponents the overview lists: the most met, then the latest met. */
export const TOP_OPPONENTS = 5;

export function topOpponents(
  matches: readonly PlayerMatch[],
  count = TOP_OPPONENTS,
): OpponentRecord[] {
  return opponentRecords(matches).slice(0, count);
}

// ─── Scores ───────────────────────────────────────────────────────────────────

/** Each set from the player's side, "15-8"; none for a match without a score. */
export function setScores(sets: readonly PlayerSet[] | null): string[] {
  return sets?.map((s) => `${s.player}-${s.opponent}`) ?? [];
}

/**
 * The sets for a line of text that wraps: word joiners (U+2060) around each dash and no-break
 * spaces between sets, so "15-8 15-3" never splits, as `keepSeasonTogether` does for seasons.
 */
export function unbreakableScore(sets: readonly string[]): string {
  return sets.map((set) => set.replace("-", "\u2060-\u2060")).join("\u00a0");
}

// ─── Honours ──────────────────────────────────────────────────────────────────

export interface PlayerTitle {
  ranking: PlayerRanking;
  /** The final won in its competition, specialty and category; null when none is found. */
  final: PlayerMatch | null;
}

/** The final rankings won, the most recent first, each with its final once the matches load. */
export function playerTitles(
  rankings: readonly PlayerRanking[],
  matches: readonly PlayerMatch[] | undefined,
): PlayerTitle[] {
  return rankings
    .filter((r) => r.final && r.rank === 1)
    .map((ranking) => {
      const key = entryKey(ranking);
      const final = matches?.find((m) =>
        m.outcome === "won" && parsePhase(m.result.phase).type === "F"
        && entryKey(m.result) === key
      );
      return { ranking, final: final ?? null };
    });
}

export interface SeasonClubs {
  competition: Competition;
  clubs: Club[];
}

/** The clubs of each season's rankings, once each, the most recent season first. */
export function clubsBySeason(rankings: readonly PlayerRanking[]): SeasonClubs[] {
  const seasons = new Map<string, SeasonClubs>();
  for (const { competition, club } of rankings) {
    const season = seasons.get(competition.id) ?? { competition, clubs: [] };
    if (!season.clubs.some((c) => c.id === club.id)) season.clubs.push(club);
    seasons.set(competition.id, season);
  }
  return [...seasons.values()];
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export interface MatchGroup {
  key: string;
  specialty: Specialty;
  category?: Category;
  record: MatchTotals;
  /** The latest first, matches to come included. */
  matches: PlayerMatch[];
}

export interface SeasonMatches {
  competition: Competition;
  record: MatchTotals;
  /** By specialty and category, the latest played first. */
  groups: MatchGroup[];
}

/**
 * The matches by season, then by specialty and category, the latest first at each level. The
 * records count the matches with a score only, as everywhere on the page.
 */
export function matchSeasons(matches: readonly PlayerMatch[]): SeasonMatches[] {
  const seasons = new Map<string, { competition: Competition; groups: Map<string, MatchGroup> }>();
  for (const match of matchesByDate(matches)) {
    const { competition, specialty, category } = match.result;
    let season = seasons.get(competition.id);
    if (!season) {
      season = { competition, groups: new Map() };
      seasons.set(competition.id, season);
    }
    const key = entryKey(match.result);
    const group = season.groups.get(key)
      ?? { key, specialty, category, record: matchTotals([]), matches: [] };
    group.matches.push(match);
    season.groups.set(key, group);
  }
  return [...seasons.values()].map(({ competition, groups }) => {
    const list = [...groups.values()].map((g) => ({ ...g, record: matchTotals(g.matches) }));
    return {
      competition,
      record: matchTotals(list.flatMap((g) => g.matches)),
      groups: list,
    };
  });
}

/** The competition id of the route's `season` param when the player has matches in it, else null. */
export function pickSeason(
  seasons: readonly Pick<SeasonMatches, "competition">[],
  param: string | string[] | undefined,
): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  return seasons.find((s) => s.competition.id === value)?.competition.id ?? null;
}
