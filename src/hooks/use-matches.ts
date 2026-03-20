import { useQuery } from "@tanstack/react-query";

import { matchesApi } from "@/api/matches";

export function useResultsByCompetition(competitionId: string) {
  return useQuery({
    queryKey: ["results", { competitionId }],
    queryFn: () => matchesApi.list({ competitionId }),
    enabled: !!competitionId,
  });
}
