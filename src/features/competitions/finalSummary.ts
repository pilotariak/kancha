import type { TFunction } from "i18next";

import { lineupLicence } from "@/features/rankings/ranking";
import { formatCardDate, teamNames } from "@/features/share/share-card";
import type { Player, Result } from "@/types/competition";

import { poolSummaryLabel, summarizePool } from "./bracket";
import { parsePlainDate, type PlainDate } from "./matchDate";
import { parsePhase } from "./matchPhase";
import { matchProgress } from "./matchProgress";
import { parseMatchScore, type Side } from "./matchScore";

export interface SummaryPlayer {
  name: string;
  /** The licence digits of the lineup's `number`; null when it has none, and the name is no link. */
  licence: string | null;
}

export interface SummaryTeam {
  /** The lineup's players; none when Frontis has no lineup. */
  players: SummaryPlayer[];
  /** As the match cards name the team: the players, or the club without a lineup. */
  name: string;
  club: string;
}

/** A set of the final, from the winners' side. */
export interface SummarySet {
  winners: number;
  runnerUp: number;
}

export interface FinalSummary {
  winners: SummaryTeam;
  /** The team the winners beat in the final. */
  runnerUp: SummaryTeam;
  /** The final's sets, the winners' points first. */
  sets: SummarySet[];
  /** The day of the final; null when Frontis sends none that reads as a date. */
  date: PlainDate | null;
  /** The semi-final losers, in semi-final order: third place. None without semi-finals. */
  thirdPlace: SummaryTeam[];
  /** The teams that played: distinct lineups by licence, or clubs for sides without one. */
  teams: number;
  matches: number;
  /** The days with at least one match, and the first and last of them. */
  days: number;
  first: PlainDate | null;
  last: PlainDate | null;
}

const OTHER: Record<Side, Side> = { A: "B", B: "A" };

function sideOf(result: Result, side: Side) {
  return side === "A"
    ? { club: result.clubA, lineup: result.clubALineup }
    : { club: result.clubB, lineup: result.clubBLineup };
}

function team(result: Result, side: Side): SummaryTeam {
  const { club, lineup } = sideOf(result, side);
  const players = [lineup?.player1, lineup?.player2]
    .filter((player): player is Player => !!player?.name)
    .map((player) => ({ name: player.name, licence: lineupLicence(player.number) }));
  const [nameA, nameB] = teamNames(result);
  return { players, name: side === "A" ? nameA : nameB, club: club.name };
}

/**
 * Who played a side: its licences, as the ranking matches teams. Names are never compared, as
 * they carry suffixes ("(E)"). Two teams of one club meet in the pools, so the club alone stands
 * only for a side without licences.
 */
function teamKey(result: Result, side: Side): string {
  const { club, lineup } = sideOf(result, side);
  const licences = [lineup?.player1, lineup?.player2]
    .map((player) => lineupLicence(player?.number))
    .filter((licence): licence is string => licence !== null)
    .sort();
  return licences.length > 0 ? licences.join("+") : `club:${club.id}`;
}

/**
 * What a finished competition comes down to: its winners, the final, third place and a few
 * facts. Null while a match has no score, and without one final whose score names a winner:
 * pools only, a tied final, or two matches that both read as the final.
 */
export function finalSummary(results: readonly Result[]): FinalSummary | null {
  if (!matchProgress(results).finished) return null;
  const finals = results.filter((r) => parsePhase(r.phase).type === "F");
  if (finals.length !== 1) return null;
  const [final] = finals;
  const score = parseMatchScore(final.scores);
  if (!score?.winner) return null;
  const won = score.winner;

  const thirdPlace = results
    .filter((r) => parsePhase(r.phase).type === "D")
    .sort((a, b) => parsePhase(a.phase).number - parsePhase(b.phase).number)
    .flatMap((r) => {
      const winner = parseMatchScore(r.scores)?.winner;
      return winner ? [team(r, OTHER[winner])] : [];
    });
  const teams = new Set(results.flatMap((r) => [teamKey(r, "A"), teamKey(r, "B")]));
  const { matches, days, first, last } = summarizePool(results);

  return {
    winners: team(final, won),
    runnerUp: team(final, OTHER[won]),
    sets: score.sets.map((set) =>
      won === "A" ? { winners: set.a, runnerUp: set.b } : { winners: set.b, runnerUp: set.a }
    ),
    date: final.dateMatch ? parsePlainDate(final.dateMatch) : null,
    thirdPlace,
    teams: teams.size,
    matches,
    days,
    first,
    last,
  };
}

// ─── Labels ───────────────────────────────────────────────────────────────────

/** The final's score as the card prints it: "35–20", one per set ("15–11 12–15 10–9"). */
export function scoreText(sets: readonly SummarySet[]): string {
  return sets.map((set) => `${set.winners}–${set.runnerUp}`).join("  ");
}

/** The day of the final in full, with the year: "Samedi 31 octobre 2026". */
export function finalDateText(summary: FinalSummary, locale: string): string | null {
  return summary.date ? formatCardDate(summary.date, locale) : null;
}

/**
 * The facts line: "6 équipes, 18 parties en 7 journées, du 6 septembre au 31 octobre". It reads
 * as a sentence, so screen readers say it as printed.
 */
export function factsText(summary: FinalSummary, t: TFunction, locale: string): string {
  return t("final_summary.facts", {
    teams: t("ranking.teams_count", { count: summary.teams }),
    matches: poolSummaryLabel(summary, t, locale),
  });
}

/** A team in words: "LABROUCHE Jessica et CHAUMEIL Clemence, US BAZAS PELOTE BASQUE". */
export function teamLabel(team: SummaryTeam, t: TFunction): string {
  const players = team.players.map((player) => player.name);
  if (players.length === 0) return team.club;
  return t("final_summary.team_a11y", {
    players: players.join(` ${t("final_summary.and")} `),
    club: team.club,
  });
}

/**
 * The final as a screen reader says it, the score in words and not with the dash: "Finale,
 * Samedi 31 octobre 2026 : gagnée 35 à 20 contre BOUDY Anais et COLAQUY Jennifer (E), PELOTARI
 * CHANTECLER BX LAC".
 */
export function finalLabel(summary: FinalSummary, t: TFunction, locale: string): string {
  const date = finalDateText(summary, locale);
  return t("final_summary.final_a11y", {
    round: date ? `${t("rounds.F")}, ${date}` : t("rounds.F"),
    score: summary.sets
      .map((set) => t("final_summary.set_a11y", { winners: set.winners, runnerUp: set.runnerUp }))
      .join(", "),
    team: teamLabel(summary.runnerUp, t),
  });
}

/** Third place in one sentence: "Troisième place : MOREL Perrine et MARTIN Alizee, CANCHA…". */
export function thirdPlaceLabel(summary: FinalSummary, t: TFunction): string {
  return t("final_summary.third_place_a11y", {
    teams: summary.thirdPlace.map((team) => teamLabel(team, t)).join("; "),
  });
}
