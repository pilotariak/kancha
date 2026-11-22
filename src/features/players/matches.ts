import { matchesByDate } from "@/features/clubs/club";
import { parsePhase } from "@/features/competitions/matchPhase";
import { parseMatchScore, type Side } from "@/features/competitions/matchScore";
import { type FormResult, lineupLicence } from "@/features/rankings/ranking";
import type {
  Club,
  ClubLineup,
  Competition,
  Player,
  PlayerRanking,
  Result,
  Specialty,
} from "@/types/competition";

/**
 * A match from the player's side. `unscored` has no score `parseMatchScore` reads, as a match to
 * come; `even` has as many sets won by each side.
 */
export type PlayerOutcome = "won" | "lost" | "even" | "unscored";

export interface LineupPlayer {
  /** As Frontis sends it, suffix included: "PUCHEUX Kevin (E)". */
  name: string;
  /** The licence digits of the lineup's `number`; null when it has none. */
  licence: string | null;
}

export interface PlayerSet {
  player: number;
  opponent: number;
}

export interface PlayerMatch {
  result: Result;
  /** The side whose lineup holds the licence. */
  side: Side;
  club: Club;
  opponentClub: Club;
  /** The player's side without them: none in singles. */
  partners: LineupPlayer[];
  opponents: LineupPlayer[];
  /** The sets, the player's points first; null when the match has no score. */
  sets: PlayerSet[] | null;
  outcome: PlayerOutcome;
}

/**
 * The clubs and competitions of a player's rankings, once each: the results of a club in a
 * competition hold the player's matches of that season. Two rankings of one club in one season,
 * in two specialties, make one pair.
 */
export function rankingClubCompetitions(
  rankings: readonly Pick<PlayerRanking, "club" | "competition">[],
): { clubId: string; competitionId: string }[] {
  const pairs = new Map<string, { clubId: string; competitionId: string }>();
  for (const { club, competition } of rankings) {
    const key = `${club.id}/${competition.id}`;
    if (!pairs.has(key)) pairs.set(key, { clubId: club.id, competitionId: competition.id });
  }
  return [...pairs.values()];
}

function lineupPlayers(lineup?: ClubLineup): LineupPlayer[] {
  return [lineup?.player1, lineup?.player2]
    .filter((player): player is Player => !!player)
    .map((player) => ({ name: player.name, licence: lineupLicence(player.number) }));
}

/**
 * The player's matches among `results`, each from their side: the side whose lineup holds the
 * licence, read with `lineupLicence` as Frontis at times adds a club code ("066629 -
 * 01-330-055"). Names are never compared: they carry suffixes ("(E)") and namesakes share them.
 * Results the licence is not in are left out, whatever the source of `results`.
 */
export function playerMatches(results: readonly Result[], licence: string): PlayerMatch[] {
  const own = licence.trim();
  const matches: PlayerMatch[] = [];
  for (const result of results) {
    const a = lineupPlayers(result.clubALineup);
    const b = lineupPlayers(result.clubBLineup);
    const side: Side | null = a.some((p) => p.licence === own)
      ? "A"
      : b.some((p) => p.licence === own)
      ? "B"
      : null;
    if (!side) continue;
    const [mine, theirs] = side === "A" ? [a, b] : [b, a];
    const score = parseMatchScore(result.scores);
    matches.push({
      result,
      side,
      club: side === "A" ? result.clubA : result.clubB,
      opponentClub: side === "A" ? result.clubB : result.clubA,
      partners: mine.filter((p) => p.licence !== own),
      opponents: theirs,
      sets: score
        ? score.sets.map((s) =>
          side === "A" ? { player: s.a, opponent: s.b } : { player: s.b, opponent: s.a }
        )
        : null,
      outcome: !score
        ? "unscored"
        : !score.winner
        ? "even"
        : score.winner === side
        ? "won"
        : "lost",
    });
  }
  return matches;
}

// ─── Records ──────────────────────────────────────────────────────────────────
// Every record counts the matches with a score, level ones included: a match to come is in none.

export interface MatchRecord {
  played: number;
  won: number;
  lost: number;
}

const NO_MATCH: Readonly<MatchRecord> = { played: 0, won: 0, lost: 0 };

function tally(record: MatchRecord, match: PlayerMatch) {
  record.played++;
  if (match.outcome === "won") record.won++;
  if (match.outcome === "lost") record.lost++;
}

/** The matches with a score, the latest first. */
function playedByDate(matches: readonly PlayerMatch[]): PlayerMatch[] {
  return matchesByDate(matches.filter((m) => m.outcome !== "unscored"));
}

/** Adds the match to the record under `key`, created on first sight. */
function tallyBy<T extends MatchRecord>(
  records: Map<string, T>,
  key: string,
  match: PlayerMatch,
  create: () => T,
) {
  let record = records.get(key);
  if (!record) {
    record = create();
    records.set(key, record);
  }
  tally(record, match);
}

export interface MatchTotals extends MatchRecord {
  /** Won over played, from 0 to 1; null before a match is played. */
  winRate: number | null;
  setsWon: number;
  setsLost: number;
}

/** A tied set counts for nobody, as in `parseMatchScore`. */
export function matchTotals(matches: readonly PlayerMatch[]): MatchTotals {
  const record = { ...NO_MATCH };
  let setsWon = 0;
  let setsLost = 0;
  for (const match of matches) {
    if (match.outcome === "unscored") continue;
    tally(record, match);
    for (const set of match.sets ?? []) {
      if (set.player > set.opponent) setsWon++;
      if (set.opponent > set.player) setsLost++;
    }
  }
  return {
    ...record,
    winRate: record.played > 0 ? record.won / record.played : null,
    setsWon,
    setsLost,
  };
}

/** The finals with a score: the phase `parsePhase` reads as "F". */
export function finalsRecord(matches: readonly PlayerMatch[]): MatchRecord {
  const finals = { ...NO_MATCH };
  for (const match of matches) {
    if (match.outcome !== "unscored" && parsePhase(match.result.phase).type === "F") {
      tally(finals, match);
    }
  }
  return finals;
}

// ─── Form ─────────────────────────────────────────────────────────────────────
// Form and streak read the matches with a winner only: a level match is neither W nor L.

export const PLAYER_FORM_LENGTH = 10;

/** The matches with a winner, the latest first, as W and L. */
function decidedByDate(matches: readonly PlayerMatch[]): FormResult[] {
  return matchesByDate(matches.filter((m) => m.outcome === "won" || m.outcome === "lost"))
    .map((m) => (m.outcome === "won" ? "W" : "L"));
}

/**
 * The latest results, oldest first, as the form chips read them. On one day, the later round
 * comes later: a semi-final before the final.
 */
export function playerForm(
  matches: readonly PlayerMatch[],
  length = PLAYER_FORM_LENGTH,
): FormResult[] {
  return decidedByDate(matches).slice(0, length).reverse();
}

export interface Streak {
  result: FormResult;
  count: number;
}

/** The run of wins or losses that ends with the latest result; null before any. */
export function currentStreak(matches: readonly PlayerMatch[]): Streak | null {
  const [latest, ...earlier] = decidedByDate(matches);
  if (!latest) return null;
  const broken = earlier.findIndex((result) => result !== latest);
  return { result: latest, count: 1 + (broken === -1 ? earlier.length : broken) };
}

// ─── Seasons and specialties ──────────────────────────────────────────────────

export interface SeasonRecord extends MatchRecord {
  competition: Competition;
}

/**
 * One record per competition, as Frontis has one competition per season; the season of the
 * latest match first, as competition ids are not chronological.
 */
export function seasonRecords(matches: readonly PlayerMatch[]): SeasonRecord[] {
  const seasons = new Map<string, SeasonRecord>();
  for (const match of playedByDate(matches)) {
    const { competition } = match.result;
    tallyBy(seasons, competition.id, match, () => ({ competition, ...NO_MATCH }));
  }
  return [...seasons.values()];
}

export interface SpecialtyRecord extends MatchRecord {
  specialty: Specialty;
}

/** One record per specialty, the most played first; on a tie, the latest played first. */
export function specialtyRecords(matches: readonly PlayerMatch[]): SpecialtyRecord[] {
  const specialties = new Map<string, SpecialtyRecord>();
  for (const match of playedByDate(matches)) {
    const { specialty } = match.result;
    tallyBy(specialties, specialty.id, match, () => ({ specialty, ...NO_MATCH }));
  }
  // Array.prototype.sort is stable: ties keep their latest-first order.
  return [...specialties.values()].sort((a, b) => b.played - a.played);
}

// ─── Partners and opponents ───────────────────────────────────────────────────
// By licence: a lineup player without one is in no record, as names are never compared.

export interface PartnerRecord extends MatchRecord {
  licence: string;
  /** From the latest match together, as Frontis sends it. */
  name: string;
}

/** The players who played on the player's side, the most matches together first. */
export function partnerRecords(matches: readonly PlayerMatch[]): PartnerRecord[] {
  const partners = new Map<string, PartnerRecord>();
  for (const match of playedByDate(matches)) {
    for (const { licence, name } of match.partners) {
      if (licence) tallyBy(partners, licence, match, () => ({ licence, name, ...NO_MATCH }));
    }
  }
  return [...partners.values()].sort((a, b) => b.played - a.played);
}

export interface OpponentRecord extends MatchRecord {
  licence: string;
  /** From the last meeting, as Frontis sends it. */
  name: string;
  /** The latest match against them with a score. */
  last: PlayerMatch;
}

/**
 * Each player met on the other side, with the player's record against them: the most met first,
 * then the latest met first.
 */
export function opponentRecords(matches: readonly PlayerMatch[]): OpponentRecord[] {
  const opponents = new Map<string, OpponentRecord>();
  for (const match of playedByDate(matches)) {
    for (const { licence, name } of match.opponents) {
      if (licence) {
        tallyBy(opponents, licence, match, () => ({ licence, name, last: match, ...NO_MATCH }));
      }
    }
  }
  return [...opponents.values()].sort((a, b) => b.played - a.played);
}
