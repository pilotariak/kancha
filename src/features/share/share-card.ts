import type { TFunction } from "i18next";

import { parsePlainDate, type PlainDate } from "@/features/competitions/matchDate";
import { matchPhaseLabel, parsePhase } from "@/features/competitions/matchPhase";
import { parseMatchScore } from "@/features/competitions/matchScore";
import { shareUrl } from "@/features/links/share-url";
import type { ScoreState } from "@/features/score/scoreMachine";
import type { ClubLineup, Result } from "@/types/competition";

/** The shared image, in pixels: 4:5, the portrait size of an Instagram post. */
export const CARD_SIZE = { width: 1080, height: 1350 } as const;

export interface ShareCardTeam {
  /** The players, or the club when Frontis has no lineup. */
  name: string;
  /** The club under the players; null when `name` is already the club. */
  club: string | null;
  /** The points of each set; in match mode, the final points. */
  points: number[];
  winner: boolean;
}

export interface ShareCardData {
  /** Above the title: the competition, or the match mode. */
  eyebrow: string;
  /** The specialty, or the target in match mode. */
  title: string;
  /** The category. */
  subtitle: string | null;
  /** The round of the match ("Final 1"). The final gets the amber pill. */
  round: { label: string; final: boolean } | null;
  /** The long date, with the year. */
  date: string | null;
  teams: [ShareCardTeam, ShareCardTeam];
  /** The words above the link. */
  linkLabel: string;
  /** The public web address the card prints. */
  link: string;
  /** The image's file name, without its extension. */
  fileName: string;
}

function lineupName(lineup?: ClubLineup): string {
  return [lineup?.player1?.name, lineup?.player2?.name].filter(Boolean).join(" / ");
}

/** Both teams as the results screen names them: the players, or the club without a lineup. */
export function teamNames(result: Result): [string, string] {
  return [
    lineupName(result.clubALineup) || result.clubA.name,
    lineupName(result.clubBLineup) || result.clubB.name,
  ];
}

/** A match gets a card, and its Share action, once it has a score. */
export function canShareResult(result: Result): boolean {
  return parseMatchScore(result.scores) != null;
}

/** The public link of the results screen, on the match's specialty and category. */
export function resultLink(result: Result): string {
  const params: [string, string | undefined][] = [
    ["id", result.competition.id],
    ["specialtyId", result.specialty.id],
    ["categoryId", result.category?.id],
  ];
  const query = params
    .filter((param): param is [string, string] => !!param[1])
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return shareUrl(`/(tabs)/competitions/details?${query}`);
}

/**
 * The link as the card prints it: no scheme, and a line may break after "?" and "&" (a zero
 * width space), so a long query wraps between its parameters.
 */
export function displayLink(link: string): string {
  return link.replace(/^https?:\/\//, "").replace(/([?&])/g, "$1​");
}

/**
 * Weekday, day, month and year in full, in `locale`, with a capital ("Samedi 28 février 2026").
 * Unlike the day headers of the results, the year stays: a shared image outlives the season.
 */
export function formatCardDate(date: PlainDate, locale: string): string {
  // Local midnight, so the calendar day never shifts with the time zone.
  const local = new Date(date.year, date.month - 1, date.day);
  const text = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(local);
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** The card of a match on the results screen; null for a match without a score. */
export function resultCardData(result: Result, t: TFunction, locale: string): ShareCardData | null {
  const score = parseMatchScore(result.scores);
  if (!score) return null;
  const [nameA, nameB] = teamNames(result);
  const date = result.dateMatch ? parsePlainDate(result.dateMatch) : null;
  const team = (side: "A" | "B"): ShareCardTeam => {
    const a = side === "A";
    return {
      name: a ? nameA : nameB,
      club: lineupName(a ? result.clubALineup : result.clubBLineup)
        ? (a ? result.clubA : result.clubB).name
        : null,
      points: score.sets.map((set) => (a ? set.a : set.b)),
      winner: score.winner === side,
    };
  };

  return {
    eyebrow: result.competition.name,
    title: result.specialty.name,
    subtitle: result.category?.name ?? null,
    round: result.phase
      ? { label: matchPhaseLabel(result.phase, t), final: parsePhase(result.phase).type === "F" }
      : null,
    date: date ? formatCardDate(date, locale) : null,
    teams: [team("A"), team("B")],
    linkLabel: t("share.results_link"),
    link: resultLink(result),
    fileName: `kancha-result-${result.id}`,
  };
}

type FinishedMatch = Pick<
  ScoreState,
  "teamA" | "teamB" | "scoreA" | "scoreB" | "target" | "winner"
>;

/** The card of a match kept in match mode: both teams, their points and the target. */
export function scoreCardData(
  match: FinishedMatch,
  t: TFunction,
  locale: string,
  now: Date = new Date(),
): ShareCardData {
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  return {
    eyebrow: t("share.score_eyebrow"),
    title: t("share.score_target", { count: match.target }),
    subtitle: null,
    round: null,
    date: formatCardDate(today, locale),
    teams: [
      { name: match.teamA, club: null, points: [match.scoreA], winner: match.winner === "a" },
      { name: match.teamB, club: null, points: [match.scoreB], winner: match.winner === "b" },
    ],
    linkLabel: t("share.score_link"),
    link: shareUrl("/(tabs)/score"),
    fileName: "kancha-match",
  };
}
