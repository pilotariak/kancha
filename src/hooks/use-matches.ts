import { useQuery } from "@tanstack/react-query";

import { matchesApi } from "@/api/matches";

export function useResultsByCompetition(
  competitionId: string,
  specialtyId?: string,
  categoryId?: string,
) {
  return useQuery({
    queryKey: ["results", { competitionId, specialtyId, categoryId }],
    queryFn: () => matchesApi.list({ competitionId, specialtyId, categoryId }),
    enabled: !!competitionId,
  });
}
