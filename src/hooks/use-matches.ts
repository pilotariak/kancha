import { queryOptions, useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query";

import { matchesApi } from "@/api/matches";
import type { Result } from "@/types/competition";

/**
 * Every result of one specialty and category. Asks for the 500 Frontis allows:
 * the largest pair holds 473 results (ctpb, 2025/2026), the default 100 would
 * cut it short.
 */
export function useResultsByCompetition(
  competitionId: string,
  specialtyId?: string,
  categoryId?: string,
) {
  return useQuery({
    queryKey: ["results", { competitionId, specialtyId, categoryId }],
    queryFn: () => matchesApi.list({ competitionId, specialtyId, categoryId, limit: 500 }),
    enabled: !!competitionId && !!specialtyId && !!categoryId,
  });
}

/** A club in a competition: the unit the club results load by, one request each. */
export interface ClubCompetition {
  clubId: string;
  competitionId: string;
}

/** Every result of one club in one competition, paged past 500 if need be. */
export function clubResultsQuery({ clubId, competitionId }: ClubCompetition) {
  return queryOptions({
    queryKey: ["results", { clubId, competitionId }],
    queryFn: () => matchesApi.listAll({ clubId, competitionId }),
    enabled: !!clubId && !!competitionId,
  });
}

export interface ClubResults {
  /** Every result once, when every query succeeded; undefined until then. */
  data: Result[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  refetch: () => void;
}

// Outside the hook, so useQueries runs it only when a query changes.
function combineClubResults(queries: UseQueryResult<Result[]>[]): ClubResults {
  const failed = queries.find((q) => q.isError);
  const data = queries.every((q) => q.isSuccess)
    ? [...new Map(queries.flatMap((q) => q.data ?? []).map((r) => [r.id, r])).values()]
    : undefined;
  return {
    data,
    isPending: queries.some((q) => q.isPending),
    isError: !!failed,
    error: failed?.error ?? null,
    isRefetching: queries.some((q) => q.isRefetching),
    refetch: () => {
      for (const q of queries) if (q.isError) q.refetch();
    },
  };
}

/**
 * The results of clubs in competitions, one request per club and competition: a club's season
 * (each competition of the season), or a player's matches (each club and season they played
 * for). A match found twice, between two of the clubs, counts once.
 */
export function useClubResults(pairs: readonly ClubCompetition[]): ClubResults {
  return useQueries({
    queries: pairs.map(clubResultsQuery),
    combine: combineClubResults,
  });
}
