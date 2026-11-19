import type { Club, TeamRanking } from "@/types/competition";

/**
 * Frontis's name normalisation (rankings subgraph): no accents, upper case,
 * punctuation turned into spaces. "D'Arcangues" becomes "D ARCANGUES".
 */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/**
 * The words Frontis searches for: words shorter than two characters are
 * dropped. An empty result means the server would reject the query with
 * BAD_USER_INPUT, so don't send it.
 */
export function searchWords(query: string): string[] {
  return nameKey(query).split(" ").filter((word) => word.length >= 2);
}

/** Frontis's rule: every word is a substring of the name, in any order. */
export function matchesName(name: string | null, words: readonly string[]): boolean {
  if (!name || words.length === 0) return false;
  const key = nameKey(name);
  return words.every((word) => key.includes(word));
}

export interface PlayerMatch {
  licence: string;
  name: string;
  /** Club of the player's most recent ranking. */
  club: Club;
}

/**
 * `playerRankings(name:)` returns team rankings, most recent season first, and
 * a team's other players don't have to match. Keeps the players whose name
 * matches `query`, one per licence with their latest club, sorted by name.
 */
export function findPlayers(rankings: TeamRanking[], query: string): PlayerMatch[] {
  const words = searchWords(query);
  const latestClubs = new Map<string, Club>();
  const names = new Map<string, string>();

  for (const ranking of rankings) {
    for (const { licence, name } of ranking.players) {
      if (!latestClubs.has(licence)) latestClubs.set(licence, ranking.club);
      const trimmed = name?.trim();
      if (trimmed && !names.has(licence) && matchesName(trimmed, words)) {
        names.set(licence, trimmed);
      }
    }
  }

  return [...names]
    .map(([licence, name]) => ({ licence, name, club: latestClubs.get(licence)! }))
    .sort((a, b) => nameKey(a.name).localeCompare(nameKey(b.name)));
}
