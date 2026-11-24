import { lineupLicence } from "@/features/rankings/ranking";
import type { ClubLineup, Result } from "@/types/competition";

import type { MatchDay } from "./matchDays";
import { parsePhase } from "./matchPhase";

/** What pool grouping reads from a match: its day and score, its number, and who played it. */
export type PoolMatch = Pick<
  Result,
  "dateMatch" | "scores" | "phase" | "clubA" | "clubB" | "clubALineup" | "clubBLineup"
>;

export interface MatchPool<T extends PoolMatch = Result> {
  /** "pool-1": unique among the pools of a round. */
  key: string;
  /** From 1, in the order of the pools' lowest match number. */
  number: number;
  /** One of its matches is today, in local time. */
  today: boolean;
  /** One of its matches falls on a day that starts open (see `MatchDay.open`). */
  open: boolean;
  /** By date, then by match number; the matches whose date is to come last. */
  results: T[];
}

function sideLicences(lineup?: ClubLineup | null): string[] {
  return [lineup?.player1, lineup?.player2]
    .map((player) => lineupLicence(player?.number))
    .filter((licence): licence is string => licence !== null);
}

/** Union-find over licences, with path halving. */
class Teams {
  private parent = new Map<string, string>();

  find(licence: string): string {
    let node = licence;
    if (!this.parent.has(node)) this.parent.set(node, node);
    while (this.parent.get(node) !== node) {
      const grandparent = this.parent.get(this.parent.get(node)!)!;
      this.parent.set(node, grandparent);
      node = grandparent;
    }
    return node;
  }

  union(a: string, b: string): void {
    this.parent.set(this.find(a), this.find(b));
  }
}

/**
 * Splits the matches of a pool round into its pools. Frontis does not say which pool a match
 * belongs to: its phase ("P 10") numbers the match within the round, not the pool. In a pool
 * every team meets every other one, so the pools are the groups of players linked by the
 * matches they played: the licences of both sides of a match join one group.
 *
 * A match without a lineup on either side goes to the pool of its clubs, when the teams of
 * that club play in one pool only. A club never links two groups: it may enter a team in
 * several pools.
 *
 * Returns null when the matches form a single pool, or when a match cannot be placed: the
 * caller then keeps the days. Takes the round's days from `groupByDay`, so a pool opens and
 * shows today as its days do.
 */
export function groupByPool<T extends PoolMatch>(
  days: readonly MatchDay<T>[],
): MatchPool<T>[] | null {
  const teams = new Teams();
  const licences = new Map<T, string[]>();
  for (const day of days) {
    for (const result of day.results) {
      const players = [
        ...sideLicences(result.clubALineup),
        ...sideLicences(result.clubBLineup),
      ];
      licences.set(result, players);
      for (const licence of players) teams.union(players[0], licence);
    }
  }

  // The groups each club's teams play in, from the sides that list their players.
  const clubGroups = new Map<string, Set<string>>();
  for (const [result, players] of licences) {
    if (players.length === 0) continue;
    const group = teams.find(players[0]);
    for (const club of [result.clubA, result.clubB]) {
      if (!club?.id) continue;
      const groups = clubGroups.get(club.id) ?? new Set<string>();
      groups.add(group);
      clubGroups.set(club.id, groups);
    }
  }

  const pools = new Map<string, { lowest: number; open: boolean; today: boolean; results: T[] }>();
  for (const day of days) {
    for (const result of day.results) {
      const players = licences.get(result)!;
      let group: string | undefined;
      if (players.length > 0) {
        group = teams.find(players[0]);
      } else {
        const candidates = new Set<string>();
        for (const club of [result.clubA, result.clubB]) {
          const groups = club?.id ? clubGroups.get(club.id) : undefined;
          if (groups?.size === 1) candidates.add([...groups][0]);
        }
        if (candidates.size === 1) group = [...candidates][0];
      }
      if (group === undefined) return null;

      const pool = pools.get(group) ?? { lowest: Infinity, open: false, today: false, results: [] };
      pool.lowest = Math.min(pool.lowest, parsePhase(result.phase).number || Infinity);
      pool.open ||= day.open;
      pool.today ||= day.today;
      pool.results.push(result);
      pools.set(group, pool);
    }
  }
  if (pools.size < 2) return null;

  // Map order is the order of the first match of each pool: it breaks ties on `lowest`.
  return [...pools.values()]
    .sort((a, b) => (a.lowest === b.lowest ? 0 : a.lowest < b.lowest ? -1 : 1))
    .map((pool, i) => ({
      key: `pool-${i + 1}`,
      number: i + 1,
      today: pool.today,
      open: pool.open,
      results: pool.results,
    }));
}
