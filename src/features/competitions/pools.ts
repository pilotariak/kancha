import { lineupLicence } from "@/features/rankings/ranking";
import type { ClubLineup, Result } from "@/types/competition";

import type { MatchDay } from "./matchDays";
import { parsePhase } from "./matchPhase";

/** What pool grouping reads from a match: its day, score, number and pool, and who played it. */
export type PoolMatch = Pick<
  Result,
  | "dateMatch"
  | "scores"
  | "phase"
  | "pool"
  | "poolPhase"
  | "clubA"
  | "clubB"
  | "clubALineup"
  | "clubBLineup"
>;

export interface MatchPool<T extends PoolMatch = Result> {
  /** "pool-1", or "phase-2-pool-1" in a round of several pool phases: unique among its pools. */
  key: string;
  /**
   * The league site's number when Frontis sends the pools; else from 1, in the order of the pools'
   * lowest match number.
   */
  number: number;
  /** The pool phase when the round has several, from `Result.poolPhase`; else null. */
  poolPhase: number | null;
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
 * The pools Frontis sends: one per pool phase and pool, in the order of those numbers. The pool
 * phase splits the round only when it takes several values: a pair whose league site names a
 * single pool phase may still number it.
 */
function sourcePools<T extends PoolMatch>(days: readonly MatchDay<T>[]): MatchPool<T>[] | null {
  const phases = new Set(days.flatMap((day) => day.results.map((r) => r.poolPhase ?? null)));
  const pools = new Map<string, MatchPool<T>>();
  for (const day of days) {
    for (const result of day.results) {
      const number = result.pool!;
      const poolPhase = phases.size > 1 ? result.poolPhase ?? null : null;
      const key = poolPhase === null ? `pool-${number}` : `phase-${poolPhase}-pool-${number}`;
      const pool = pools.get(key)
        ?? { key, number, poolPhase, today: false, open: false, results: [] };
      pool.open ||= day.open;
      pool.today ||= day.today;
      pool.results.push(result);
      pools.set(key, pool);
    }
  }
  if (pools.size < 2) return null;
  return [...pools.values()].sort((a, b) =>
    (a.poolPhase ?? 0) - (b.poolPhase ?? 0) || a.number - b.number
  );
}

/**
 * Splits the matches of a pool round into its pools. When Frontis sends the pool of every match
 * (`Result.pool`, `Result.poolPhase`), the pools are the league site's, split by pool phase
 * first when there are several. A round where a match has none, as on the rows Frontis stored
 * before it read the pool, keeps the inference below for every match.
 *
 * Otherwise the pools are inferred, as the phase ("P 10") numbers the match within the round,
 * not the pool. In a pool every team meets every other one, so the pools are the groups of
 * players linked by the matches they played: the licences of both sides of a match join one
 * group.
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
  const matches = days.flatMap((day) => day.results);
  if (matches.length > 0 && matches.every((result) => result.pool != null)) {
    return sourcePools(days);
  }

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
      poolPhase: null,
      today: pool.today,
      open: pool.open,
      results: pool.results,
    }));
}
