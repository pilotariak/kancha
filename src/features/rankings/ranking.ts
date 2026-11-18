import type { RankedPlayer, TeamRanking } from "@/types/competition";

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
