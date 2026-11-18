import { useQuery } from "@tanstack/react-query";

import { rankingsApi } from "@/api/rankings";

export function useRankings(competitionId: string, specialtyId: string, categoryId: string) {
  return useQuery({
    queryKey: ["rankings", { competitionId, specialtyId, categoryId }],
    queryFn: () => rankingsApi.list({ competitionId, specialtyId, categoryId }),
    enabled: !!competitionId && !!specialtyId && !!categoryId,
  });
}
