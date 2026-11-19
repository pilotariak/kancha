import { useQuery } from "@tanstack/react-query";

import { playersApi } from "@/api/players";
import { searchWords } from "@/features/players/name-match";

export function usePlayerRankings(licence: string) {
  return useQuery({
    queryKey: ["playerRankings", { licence }],
    queryFn: () => playersApi.rankingsByLicence(licence),
    enabled: !!licence,
  });
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
