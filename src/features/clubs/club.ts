import type { PhaseType } from "@/components/BracketView";
import { comparePlainDates, parsePlainDate } from "@/features/competitions/matchDate";
import { parsePhase, ROUND_ORDER } from "@/features/competitions/matchPhase";
import { parseMatchScore, type Side } from "@/features/competitions/matchScore";
import type { Club, Result } from "@/types/competition";

/**
 * A match from the club's side. `unplayed` has no score `parseMatchScore` reads; `even` has
 * sets level; `internal` is between two teams of the club, which wins and loses it at once.
 */
export type ClubOutcome = "won" | "lost" | "internal" | "even" | "unplayed";

export interface ClubSet {
  club: number;
  opponent: number;
}

export interface ClubMatch {
  result: Result;
  /** The club's side; for a match between two of its teams, the side that won, else A. */
  side: Side;
  outcome: ClubOutcome;
  /** The other side's club: the club itself for an internal match. */
  opponent: Club;
  /** The sets, the club's points first; null when the match has no score. */
  sets: ClubSet[] | null;
}

/** The club's matches among `results`, each from its side. Results it is not in are left out. */
export function clubMatches(results: readonly Result[], clubId: string): ClubMatch[] {
  const matches: ClubMatch[] = [];
  for (const result of results) {
    const inA = result.clubA.id === clubId;
    const inB = result.clubB.id === clubId;
    if (!inA && !inB) continue;
    const score = parseMatchScore(result.scores);
    // Between two of its teams, the club takes the winner's side: its sets read 35-33, not 33-35.
    const side: Side = inA && inB ? score?.winner ?? "A" : inA ? "A" : "B";
    const outcome: ClubOutcome = !score
      ? "unplayed"
      : !score.winner
      ? "even"
      : inA && inB
      ? "internal"
      : score.winner === side
      ? "won"
      : "lost";
    matches.push({
      result,
      side,
      outcome,
      opponent: side === "A" ? result.clubB : result.clubA,
      sets: score
        ? score.sets.map((s) =>
          side === "A" ? { club: s.a, opponent: s.b } : { club: s.b, opponent: s.a }
        )
        : null,
    });
  }
  return matches;
}

// ─── Season summary ───────────────────────────────────────────────────────────

export interface SeasonSummary {
  /** The matches with a score. */
  played: number;
  won: number;
  lost: number;
  /** Played between two teams of the club: neither won nor lost. */
  internal: number;
}

export function seasonSummary(matches: readonly ClubMatch[]): SeasonSummary {
  const count = (outcome: ClubOutcome) => matches.filter((m) => m.outcome === outcome).length;
  return {
    played: matches.length - count("unplayed"),
    won: count("won"),
    lost: count("lost"),
    internal: count("internal"),
  };
}

// ─── Titles and entries ───────────────────────────────────────────────────────

/**
 * A final the club won: against another club, or between two of its teams, which makes one
 * title. A final without a score, or with level sets, is no title.
 */
export function isTitle(match: ClubMatch): boolean {
  return parsePhase(match.result.phase).type === "F"
    && (match.outcome === "won" || match.outcome === "internal");
}

type EntryFields = Pick<Result, "competition" | "specialty" | "category">;

const byName = (a?: { name: string }, b?: { name: string }) =>
  (a?.name ?? "").localeCompare(b?.name ?? "", undefined, { numeric: true });

/** By competition, then specialty, then category: "1ère Série" before "2ème Série". */
function byEntry(a: EntryFields, b: EntryFields): number {
  return byName(a.competition, b.competition) || byName(a.specialty, b.specialty)
    || byName(a.category, b.category);
}

/** The finals the club won, in the order of the entries. */
export function clubTitles(matches: readonly ClubMatch[]): ClubMatch[] {
  return matches.filter(isTitle).sort((a, b) => byEntry(a.result, b.result));
}

/** A specialty and category the club played in, in one competition. */
export interface ClubEntry extends EntryFields {
  key: string;
  matches: number;
  /** The furthest round of its matches, played or not; null when no phase is a known round. */
  furthest: PhaseType | null;
  /** The club won its final. */
  title: boolean;
}

/** One entry per competition, specialty and category. */
export function clubEntries(matches: readonly ClubMatch[]): ClubEntry[] {
  const entries = new Map<string, ClubEntry>();
  for (const match of matches) {
    const { competition, specialty, category } = match.result;
    const key = [competition.id, specialty.id, category?.id ?? ""].join("/");
    const entry = entries.get(key)
      ?? { key, competition, specialty, category, matches: 0, furthest: null, title: false };
    entry.matches += 1;
    // "other" sorts after the final in ROUND_ORDER: a phase the parser does not know is no round.
    const { type } = parsePhase(match.result.phase);
    if (type !== "other" && (!entry.furthest || ROUND_ORDER[type] > ROUND_ORDER[entry.furthest])) {
      entry.furthest = type;
    }
    if (isTitle(match)) entry.title = true;
    entries.set(key, entry);
  }
  return [...entries.values()].sort(byEntry);
}

// ─── Results by date ──────────────────────────────────────────────────────────

/** The latest date first, unreadable dates last; on one day, the later round first. */
function newestFirst(a: ClubMatch, b: ClubMatch): number {
  const da = a.result.dateMatch ? parsePlainDate(a.result.dateMatch) : null;
  const db = b.result.dateMatch ? parsePlainDate(b.result.dateMatch) : null;
  if (da && db) {
    const byDate = comparePlainDates(db, da);
    if (byDate !== 0) return byDate;
  } else if (da || db) {
    return da ? -1 : 1;
  }
  const pa = parsePhase(a.result.phase);
  const pb = parsePhase(b.result.phase);
  return ROUND_ORDER[pb.type] - ROUND_ORDER[pa.type] || pb.number - pa.number;
}

/** Every match of the season, the latest first, matches to come included. */
export function matchesByDate(matches: readonly ClubMatch[]): ClubMatch[] {
  return [...matches].sort(newestFirst);
}

export const LATEST_RESULTS = 5;

/** The latest matches with a score. */
export function latestResults(matches: readonly ClubMatch[], count = LATEST_RESULTS): ClubMatch[] {
  return matchesByDate(matches.filter((m) => m.outcome !== "unplayed")).slice(0, count);
}
