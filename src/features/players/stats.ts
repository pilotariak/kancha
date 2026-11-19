import { isForfeit } from "@/features/rankings/ranking";
import type {
  Club,
  Competition,
  PlayerRanking,
  RankedPlayer,
  Specialty,
} from "@/types/competition";

export interface PlayerTotals {
  /** Final rankings won (rank 1). */
  titles: number;
  /** Final rankings finished second. */
  runnerUps: number;
  /** Distinct competitions: Frontis has one competition per season. */
  seasons: number;
  rankings: number;
}

export interface SpecialtyBest {
  specialty: Specialty;
  bestRank: number;
  titles: number;
}

export interface Partner {
  licence: string;
  /** Null when no ranking names this player. */
  name: string | null;
  /** Rankings played together. */
  count: number;
}

export interface HistoryEntry {
  id: string;
  specialtyName: string;
  categoryName: string;
  clubName: string;
  rank: number;
  /** Raw league-site text, shown as is. */
  phase: string;
  /** False while the championship is still running: rank and phase are provisional. */
  final: boolean;
  isTitle: boolean;
  isForfeit: boolean;
  /** The team's other players. */
  partners: RankedPlayer[];
}

export interface SeasonHistory {
  competition: Competition;
  rankings: HistoryEntry[];
}

export interface PlayerStats {
  /** Null when no ranking names the player: the screen shows the licence. */
  name: string | null;
  /** Clubs played for, most recent first. */
  clubs: Club[];
  totals: PlayerTotals;
  /** Best final rank per specialty, best first. Provisional rankings don't count. */
  specialties: SpecialtyBest[];
  /** Most frequent first, then most recent first. */
  partners: Partner[];
  /** Most recent season first. */
  seasons: SeasonHistory[];
}

function cleanName(name: string | null): string | null {
  return name?.trim() || null;
}

/**
 * Derives a player's statistics from `playerRankings(licence:)`. Frontis returns
 * the most recent season first and exposes no season order of its own (a
 * competition id is not chronological), so every "most recent" below is the
 * API order. Stats come from `rank` and `final`, never from the `phase` text.
 */
export function buildPlayerStats(licence: string, rankings: PlayerRanking[]): PlayerStats {
  const own = licence.trim();
  let name: string | null = null;
  let titles = 0;
  let runnerUps = 0;
  const clubs = new Map<string, Club>();
  const specialties = new Map<string, SpecialtyBest>();
  const partners = new Map<string, Partner>();
  const seasons = new Map<string, SeasonHistory>();

  for (const r of rankings) {
    const players = r.players.map((p) => ({ licence: p.licence, name: cleanName(p.name) }));
    const others = players.filter((p) => p.licence !== own);
    const isTitle = r.final && r.rank === 1;

    name ??= players.find((p) => p.licence === own)?.name ?? null;
    if (!clubs.has(r.club.id)) clubs.set(r.club.id, r.club);

    if (isTitle) titles++;
    if (r.final && r.rank === 2) runnerUps++;

    if (r.final) {
      const best = specialties.get(r.specialty.id);
      if (best) {
        best.bestRank = Math.min(best.bestRank, r.rank);
        if (isTitle) best.titles++;
      } else {
        specialties.set(r.specialty.id, {
          specialty: r.specialty,
          bestRank: r.rank,
          titles: isTitle ? 1 : 0,
        });
      }
    }

    for (const p of others) {
      const partner = partners.get(p.licence);
      if (partner) {
        partner.count++;
        partner.name ??= p.name;
      } else {
        partners.set(p.licence, { licence: p.licence, name: p.name, count: 1 });
      }
    }

    let season = seasons.get(r.competition.id);
    if (!season) {
      season = { competition: r.competition, rankings: [] };
      seasons.set(r.competition.id, season);
    }
    season.rankings.push({
      id: r.id,
      specialtyName: r.specialty.name,
      categoryName: r.category.name,
      clubName: r.club.name,
      rank: r.rank,
      phase: r.phase,
      final: r.final,
      isTitle,
      isForfeit: isForfeit(r.phase),
      partners: others,
    });
  }

  return {
    name,
    clubs: [...clubs.values()],
    totals: { titles, runnerUps, seasons: seasons.size, rankings: rankings.length },
    // Array.prototype.sort is stable: ties keep their first-seen order.
    specialties: [...specialties.values()].sort(
      (a, b) => a.bestRank - b.bestRank || b.titles - a.titles,
    ),
    partners: [...partners.values()].sort((a, b) => b.count - a.count),
    seasons: [...seasons.values()],
  };
}
