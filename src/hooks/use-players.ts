import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { playersApi } from "@/api/players";
import { matchesByDate } from "@/features/clubs/club";
import {
  type PlayerMatch,
  playerMatches,
  rankingClubCompetitions,
} from "@/features/players/matches";
import { searchWords } from "@/features/players/name-match";

import { type ClubResults, useClubResults } from "./use-matches";

export function usePlayerRankings(licence: string) {
  return useQuery({
    queryKey: ["playerRankings", { licence }],
    queryFn: () => playersApi.rankingsByLicence(licence),
    enabled: !!licence,
  });
}

export interface PlayerMatches extends Omit<ClubResults, "data"> {
  /** The player's matches, the latest first; undefined until the rankings and results are in. */
  data: PlayerMatch[] | undefined;
}

/**
 * A player's matches. Frontis results have no player filter (frontis#106 will add one), so this
 * loads the results of each club and competition of the player's rankings, one query each in
 * parallel under the club page's key, and keeps those whose lineups hold the licence.
 *
 * Known limit: a season the player played without being ranked is missed, as no ranking names the
 * club they played for that season.
 */
export function usePlayerMatches(licence: string): PlayerMatches {
  const rankings = usePlayerRankings(licence);
  const pairs = useMemo(() => rankingClubCompetitions(rankings.data ?? []), [rankings.data]);
  const results = useClubResults(pairs);
  // Until the rankings load there is no pair, and useClubResults([]) reads as done with no result.
  const data = useMemo(
    () =>
      rankings.data && results.data
        ? matchesByDate(playerMatches(results.data, licence))
        : undefined,
    [rankings.data, results.data, licence],
  );
  return {
    data,
    isPending: rankings.isPending || results.isPending,
    isError: rankings.isError || results.isError,
    error: rankings.error ?? results.error,
    isRefetching: rankings.isRefetching || results.isRefetching,
    refetch: () => {
      if (rankings.isError) rankings.refetch();
      results.refetch();
    },
  };
}

/**
 * Searches rankings by player name. Sends only the words Frontis searches for,
 * so "Ane  Etxeberri" and "ane etxeberri" share a cache entry, and stays idle
 * until the query has a word of two characters or more (Frontis rejects it otherwise).
 */
export function usePlayerSearch(query: string) {
  const name = searchWords(query).join(" ");
  return useQuery({
    queryKey: ["playerRankings", { name }],
    queryFn: () => playersApi.rankingsByName(name),
    enabled: name.length > 0,
  });
}
