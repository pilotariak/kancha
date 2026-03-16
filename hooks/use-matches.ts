import { matchesApi } from "@/api/matches";
import type { MatchStatus } from "@/types/match";
import { useQuery } from "@tanstack/react-query";

interface MatchListParams {
  tournamentId?: string;
  status?: MatchStatus;
  modality?: string;
  competitionId?: string;
  specialty?: string;
  category?: string;
  phase?: string;
  ville?: string;
  club?: string;
}

export const matchKeys = {
  all: ["matches"] as const,
  list: (params?: MatchListParams) => [...matchKeys.all, "list", params] as const,
  detail: (id: string) => [...matchKeys.all, "detail", id] as const,
};

export function useMatches(params?: MatchListParams) {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => matchesApi.list(params),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchesApi.get(id),
    enabled: !!id,
  });
}
