import type { TFunction } from "i18next";

import { comparePlainDates, parsePlainDate } from "@/features/competitions/matchDate";
import { parsePhase, ROUND_ORDER } from "@/features/competitions/matchPhase";
import { parseMatchScore, type Side } from "@/features/competitions/matchScore";
import type { ClubLineup, RankedPlayer, Result, TeamRanking } from "@/types/competition";

export type RankingStatus = "empty" | "provisional" | "final";

export interface RankingRow {
  id: string;
  rank: number;
  clubName: string;
  teamNumber: number;
  /** Raw league-site text, shown as is. */
  phase: string;
  isChampion: boolean;
  isForfeit: boolean;
  /** `name` is null when the site lists the licence alone, never an empty string. */
  players: RankedPlayer[];
}

export interface RankingView {
  status: RankingStatus;
  rows: RankingRow[];
}

/** The phase text is free-form French ("FORFAIT"), so match it loosely. */
export function isForfeit(phase: string): boolean {
  return phase.trim().toLowerCase().startsWith("forfait");
}

/**
 * Maps the `rankings` query result to screen rows. `final` is a ranking-level
 * flag repeated on every row: the ranking counts as final only when every row
 * says so, and only then is its rank-1 team the champion.
 */
export function buildRanking(rankings: TeamRanking[]): RankingView {
  if (rankings.length === 0) return { status: "empty", rows: [] };

  const final = rankings.every((r) => r.final);
  const rows = [...rankings]
    .sort((a, b) => a.rank - b.rank)
    .map((r) => ({
      id: r.id,
      rank: r.rank,
      clubName: r.club.name,
      teamNumber: r.teamNumber,
      phase: r.phase,
      isChampion: final && r.rank === 1,
      isForfeit: isForfeit(r.phase),
      players: r.players.map((p) => ({ licence: p.licence, name: p.name?.trim() || null })),
    }));

  return { status: final ? "final" : "provisional", rows };
}

// ─── Record and form ──────────────────────────────────────────────────────────

/** A won or lost match, in the form chips. */
export type FormResult = "W" | "L";

export interface TeamRecord {
  wins: number;
  losses: number;
  /** The last five results, oldest first. */
  form: FormResult[];
}

/** What the record reads from a match. */
export type RecordMatch = Pick<
  Result,
  "dateMatch" | "phase" | "scores" | "clubALineup" | "clubBLineup"
>;

export const FORM_LENGTH = 5;

/**
 * The licence in a lineup player's `number`: the digits it starts with, as Frontis at times
 * adds a second code ("097866 - 01-641-015").
 */
export function lineupLicence(number?: string | null): string | null {
  return number?.trim().match(/^\d+/)?.[0] ?? null;
}

function sideLicences(lineup?: ClubLineup): string[] {
  return [lineup?.player1, lineup?.player2]
    .map((player) => lineupLicence(player?.number))
    .filter((licence): licence is string => licence !== null);
}

/**
 * The team that played a side: the one whose licences are exactly the side's, or else the one
 * team that holds every licence of the side, as a team may list a third or fourth player.
 * Names are never compared: they carry suffixes ("(D)") and namesakes share them.
 */
function teamOfSide(lineup: ClubLineup | undefined, teams: Map<string, Set<string>>) {
  const licences = sideLicences(lineup);
  if (licences.length === 0) return null;
  const holders = [...teams].filter(([, team]) => licences.every((l) => team.has(l)));
  const exact = holders.filter(([, team]) => team.size === new Set(licences).size);
  const match = exact.length > 0 ? exact : holders;
  return match.length === 1 ? match[0][0] : null;
}

/** Date first, unreadable dates last; on the same day, by round, then as Frontis sent them. */
function compareMatches(
  a: { match: RecordMatch; index: number },
  b: { match: RecordMatch; index: number },
): number {
  const da = a.match.dateMatch ? parsePlainDate(a.match.dateMatch) : null;
  const db = b.match.dateMatch ? parsePlainDate(b.match.dateMatch) : null;
  if (da && db) {
    const byDate = comparePlainDates(da, db);
    if (byDate !== 0) return byDate;
  } else if (da || db) {
    return da ? -1 : 1;
  }
  const pa = parsePhase(a.match.phase);
  const pb = parsePhase(b.match.phase);
  return ROUND_ORDER[pa.type] - ROUND_ORDER[pb.type] || pa.number - pb.number
    || a.index - b.index;
}

/**
 * Each ranked team's wins, losses and last five results, by team id, over the matches of its
 * specialty and category. A match counts once it has a score with a winner; a team with none
 * gets 0-0 and no form.
 */
export function buildTeamRecords(
  teams: readonly Pick<TeamRanking, "id" | "players">[],
  matches: readonly RecordMatch[],
): Map<string, TeamRecord> {
  const licences = new Map(
    teams.map((team) => [team.id, new Set(team.players.map((p) => p.licence.trim()))]),
  );
  const played = new Map<string, FormResult[]>(teams.map((team) => [team.id, []]));

  const scored = matches
    .map((match, index) => ({ match, index, winner: parseMatchScore(match.scores)?.winner }))
    .filter((m): m is typeof m & { winner: Side } => !!m.winner)
    .sort(compareMatches);

  for (const { match, winner } of scored) {
    const sides: [Side, ClubLineup | undefined][] = [
      ["A", match.clubALineup],
      ["B", match.clubBLineup],
    ];
    for (const [side, lineup] of sides) {
      const team = teamOfSide(lineup, licences);
      if (team) played.get(team)?.push(side === winner ? "W" : "L");
    }
  }

  return new Map(
    [...played].map(([id, results]) => [
      id,
      {
        wins: results.filter((r) => r === "W").length,
        losses: results.filter((r) => r === "L").length,
        form: results.slice(-FORM_LENGTH),
      },
    ]),
  );
}

// ─── Labels ───────────────────────────────────────────────────────────────────

/** A player's name, or their licence when the league site lists it alone. */
export function playerName(player: RankedPlayer, t: TFunction): string {
  return player.name ?? t("ranking.licence", { licence: player.licence });
}

/** The phase a team reached: "Champion" in the app's language, else the league's own text. */
export function phaseLabel(row: Pick<RankingRow, "isChampion" | "phase">, t: TFunction): string {
  return row.isChampion ? t("ranking.champion") : row.phase;
}

/** The form in words, as a screen reader says it: "last results: win, win, loss". */
export function formLabel(form: readonly FormResult[], t: TFunction): string {
  const results = form.map((r) =>
    t(r === "W" ? "ranking.form_win_a11y" : "ranking.form_loss_a11y")
  );
  return t("ranking.form_a11y", { results: results.join(", ") });
}

/**
 * What a screen reader says for a ranking row, in one sentence: rank, players, club, team number,
 * phase, then wins, losses and form. `record` is undefined while the results load: the sentence
 * stops at the phase.
 */
export function rowLabel(row: RankingRow, record: TeamRecord | undefined, t: TFunction): string {
  const parts = [
    t("ranking.rank_a11y", { rank: row.rank }),
    ...row.players.map((p) => playerName(p, t)),
    row.clubName,
    t("ranking.team", { number: row.teamNumber }),
    phaseLabel(row, t),
  ];
  if (record && record.wins + record.losses === 0) {
    parts.push(t("ranking.no_results_a11y"));
  } else if (record) {
    parts.push(
      t("ranking.wins_a11y", { count: record.wins }),
      t("ranking.losses_a11y", { count: record.losses }),
      formLabel(record.form, t),
    );
  }
  return parts.join(", ");
}
